/**
 * Input masks (CONTEXT.md "Input mask"; ADR-0059): conform typed text to a
 * pattern as it is typed. One engine behind `c-text-field`'s `mask` and
 * `c-date-picker`'s `format`.
 *
 * A mask compiles to a list of slots. A **token** slot takes one to `max`
 * characters its `accepts` predicate allows — a `c-text-field` token takes
 * exactly one; a date part takes one or two digits, and closes early on a
 * typed separator or a first digit no longer value can start. A **literal**
 * slot is a fixed character, inserted lazily: only when a later token
 * character arrives, so an empty field stays `''` and Backspace behaves like
 * plain text. A typed character that is the next literal (or one of its
 * `aliases`) is consumed as that literal.
 *
 * A **word** slot takes one of a few words — a time's AM/PM period — typed
 * by its first letters: once they name one word, the slot shows the whole
 * word and closes. Its characters all count as typed, and a deleting edit
 * that leaves a word partial clears it, so one Backspace removes it.
 *
 * An **optional section** (`[…]`, trailing only) holds optional slots: its
 * tokens take zero or one character (`min: 0`) and its literals are marked
 * `optional`. Completeness and the mask guide count required slots only.
 */

export interface MaskResult {
  /** The caret position in `text`. */
  caret: number;

  /** Whether every required token slot is filled. */
  complete: boolean;

  /**
   * What the mask still asks for after `text` — the **mask guide**: each
   * unfilled required token drawn as `_`, literals as themselves; optional
   * slots are never drawn. `''` once complete.
   */
  rest: string;

  /** The conformed text. */
  text: string;

  /** Per character of `text`: whether it fills a token slot (not a literal). */
  tokenAt: boolean[];

  /** Only the characters filling token slots. */
  unmasked: string;
}

export type MaskSlot =
  | {
      /** Other typed characters that stand for this literal. */
      aliases?: string;
      kind: 'literal';

      /** Part of an optional section: never drawn in the guide, never appended. */
      optional?: boolean;
      text: string;
    }
  | {
      accepts: (ch: string) => boolean;

      /** Closes the slot early once its characters so far are `value`. */
      closesAfter?: (value: string) => boolean;
      kind: 'token';
      max: number;

      /** `0` for an optional token. */
      min: number;
    }
  | {
      kind: 'word';

      /** The words the slot takes, matched case-insensitively and shown as written here. */
      words: string[];
    };

const DIGIT = /^\d$/;

const LETTER = /^\p{L}$/u;

const ALNUM = /^[\p{L}\d]$/u;

const TOKENS: Partial<Record<string, (ch: string) => boolean>> = {
  '*': (ch) => ALNUM.test(ch),
  '#': (ch) => DIGIT.test(ch),
  A: (ch) => LETTER.test(ch),
};

const isOptional = (slot: MaskSlot): boolean => {
  if (slot.kind === 'literal') return !!slot.optional;

  return slot.kind === 'token' && slot.min === 0;
};

/**
 * Compile a `c-text-field` mask: `#` a digit, `A` a letter, `*` a letter or
 * a digit, `\` escapes the next character, `[…]` wraps a trailing optional
 * section; everything else is a literal. Returns `null` for a mask that
 * breaks the section rules: a nested, unclosed or stray bracket, or anything
 * but another section after the first one.
 */
export const compileMask = (pattern: string): MaskSlot[] | null => {
  const slots: MaskSlot[] = [];

  let inSection = false;

  let sectionsBegun = false;

  for (let i = 0; i < pattern.length; i++) {
    let ch = pattern[i];

    if (ch === '[') {
      if (inSection) return null;
      inSection = sectionsBegun = true;
      continue;
    }

    if (ch === ']') {
      if (!inSection) return null;
      inSection = false;
      continue;
    }

    // Optional sections end the mask: nothing required may follow one.
    if (sectionsBegun && !inSection) return null;

    const escaped = ch === '\\' && i + 1 < pattern.length;

    if (escaped) ch = pattern[++i];

    const accepts = escaped ? undefined : TOKENS[ch];

    if (accepts) {
      slots.push({ accepts, kind: 'token', max: 1, min: inSection ? 0 : 1 });
    } else {
      slots.push(
        inSection
          ? { kind: 'literal', optional: true, text: ch }
          : { kind: 'literal', text: ch },
      );
    }
  }

  return inSection ? null : slots;
};

const warnedMasks = new Set<string>();

/** Say once per pattern, page-wide, that a mask was ignored as invalid. */
export const warnInvalidMask = (tag: string, pattern: string): void => {
  if (warnedMasks.has(pattern)) return;
  warnedMasks.add(pattern);
  console.warn(
    `[${tag}] ignoring the invalid mask "${pattern}": optional sections ([…]) must be balanced, unnested and end the mask`,
  );
};

/** Whether every token of a mask takes only digits (a numeric keyboard fits). */
export const isNumericMask = (pattern: string): boolean => {
  const tokens = pattern.replace(/\\./g, '').match(/[#A*]/g);

  return !!tokens && tokens.every((t) => t === '#');
};

/**
 * Conform `text` to `slots`, mapping `caret` (a position in `text`) onto the
 * result. Characters that fit no slot are dropped. `deleting` marks an edit
 * that removed text: trailing literals are then trimmed, so Backspace never
 * sticks on a separator. Otherwise literals that end the mask are appended
 * once the last token is filled.
 */
export const conformMask = (
  slots: MaskSlot[],
  text: string,
  caret = text.length,
  deleting = false,
): MaskResult => {
  let out = '';

  let tokenAt: boolean[] = [];

  let unmasked = '';

  let pending = '';

  let at = 0;

  // Characters in the current token slot.
  let fill = '';

  let outCaret = -1;

  const flush = () => {
    out += pending;
    tokenAt.push(...Array.from(pending, () => false));
    pending = '';
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    const markCaret = i === caret;

    const saved = { at, fill, pending };

    let placed = false;

    while (at < slots.length) {
      const slot = slots[at];

      if (slot.kind === 'literal') {
        // Only the literal right after what is shown can be typed over;
        // a character matching a later one (a digit of a `+358` prefix) is
        // meant for a token.
        if (
          pending === '' &&
          (ch === slot.text || !!slot.aliases?.includes(ch))
        ) {
          if (markCaret) outCaret = out.length;
          out += slot.text;
          tokenAt.push(false);
          at++;
          placed = true;
          break;
        }

        pending += slot.text;
        at++;
        continue;
      }

      if (slot.kind === 'word') {
        const typed = (fill + ch).toLocaleLowerCase();

        const matches = slot.words.filter((w) =>
          w.toLocaleLowerCase().startsWith(typed),
        );

        if (!matches.length) break;

        const whole =
          matches.find((w) => w.toLocaleLowerCase() === typed) ??
          // A deleting edit never completes a word it did not already hold.
          (matches.length === 1 && !deleting ? matches[0] : undefined);

        flush();

        if (markCaret) outCaret = out.length;

        const add = whole
          ? whole.slice(fill.length)
          : matches[0].charAt(fill.length);

        out += add;
        tokenAt.push(...Array.from(add, () => true));
        unmasked += add;

        if (whole) {
          at++;
          fill = '';
        } else {
          fill += add;
        }

        placed = true;
        break;
      }

      if (fill.length < slot.max && slot.accepts(ch)) {
        flush();

        if (markCaret) outCaret = out.length;
        out += ch;
        tokenAt.push(true);
        unmasked += ch;
        fill += ch;

        if (fill.length === slot.max || slot.closesAfter?.(fill)) {
          at++;
          fill = '';
        }

        placed = true;
        break;
      }

      // A satisfied slot of variable width closes, and the character is
      // tried against what follows (a separator closing a one-digit day);
      // an empty optional token is skipped the same way.
      if (fill.length >= slot.min && (fill !== '' || slot.min === 0)) {
        at++;
        fill = '';
        continue;
      }

      break;
    }

    if (!placed) {
      ({ at, fill, pending } = saved);

      if (markCaret && outCaret === -1) outCaret = -2;
    } else if (outCaret === -2) {
      // The caret sat before dropped characters: it lands before this one.
      outCaret = out.length - 1;
    }
  }

  // A deleting edit that broke a word clears what is left of it.
  if (deleting && fill !== '' && slots[at]?.kind === 'word') {
    out = out.slice(0, -fill.length);
    tokenAt = tokenAt.slice(0, -fill.length);
    unmasked = unmasked.slice(0, -fill.length);
    fill = '';
  }

  const rest = slots.slice(at);

  const complete =
    unmasked !== '' &&
    rest.every(
      (s, i) =>
        s.kind === 'literal' ||
        (s.kind === 'token' &&
          (s.min === 0 || (i === 0 && fill.length >= s.min && fill !== ''))),
    );

  // A partly filled slot of variable width is drawn by what fills it; the
  // guide stops where the optional sections begin.
  const ahead = fill === '' ? rest : rest.slice(1);

  const firstOptional = ahead.findIndex(isOptional);

  let guide = (firstOptional === -1 ? ahead : ahead.slice(0, firstOptional))
    .map((s) => (s.kind === 'literal' ? s.text : '_'))
    .join('');

  if (deleting) {
    let end = out.length;

    while (end > 0 && !tokenAt[end - 1]) end--;

    // Trimmed literals rejoin the guide only ahead of a required remainder;
    // with every required token filled they were optional ones.
    if (guide !== '') guide = out.slice(end) + guide;
    out = out.slice(0, end);
    tokenAt = tokenAt.slice(0, end);
  } else if (
    unmasked !== '' &&
    rest.every((s) => s.kind === 'literal' && !s.optional)
  ) {
    pending = guide;
    guide = '';
    flush();
  }

  const mapped = outCaret < 0 ? out.length : Math.min(outCaret, out.length);

  return {
    caret: mapped,
    complete,
    rest: guide,
    text: out,
    tokenAt,
    unmasked,
  };
};

const PASTE = new Set(['insertFromDrop', 'insertFromPaste']);

/** Rewrites text to its conformed form, mapping a caret position onto it. */
export type Conformer<R extends ConformResult = ConformResult> = (
  text: string,
  caret?: number,
  deleting?: boolean,
) => R;

/** The part of a conform result the caret machinery needs. */
export interface ConformResult {
  caret: number;
  text: string;

  /** Per character of `text`: whether it is typed content (not an inserted literal or separator). */
  tokenAt: boolean[];
}

/**
 * Conform an `<input>` after a native `input` event: rewrite its text and
 * caret in place and return the result. `previous` is the text shown before
 * the edit — a Backspace (Delete) that only removed an inserted character (a
 * literal, a group separator) removes the typed character before (after) it
 * instead. Returns `null`, leaving the input untouched, during IME
 * composition, or on a paste or drop when `skipPaste` is set (the date picker
 * reads pasted text leniently instead).
 */
export const applyConform = <R extends ConformResult>(
  input: HTMLInputElement,
  event: Event,
  conform: Conformer<R>,
  previous: string,
  { skipPaste = false } = {},
): null | R => {
  const inputEvent = event as InputEvent;

  if (inputEvent.isComposing) return null;

  const type = inputEvent.inputType ?? '';

  if (skipPaste && PASTE.has(type)) return null;

  const deleting = type.startsWith('delete');

  const text = input.value;

  const caret = input.selectionStart ?? text.length;

  let result = conform(text, caret, deleting);

  const onlyInserted =
    (type === 'deleteContentBackward' || type === 'deleteContentForward') &&
    text.length === previous.length - 1 &&
    conform(text).text === conform(previous).text;

  if (onlyInserted) {
    const { tokenAt } = conform(previous);

    const step = type === 'deleteContentBackward' ? -1 : 1;

    let j = caret;

    while (j >= 0 && j < previous.length && !tokenAt[j]) j += step;

    if (j >= 0 && j < previous.length) {
      result = conform(previous.slice(0, j) + previous.slice(j + 1), j, true);
    }
  }

  if (input.value !== result.text) input.value = result.text;

  if (input.selectionStart !== result.caret)
    input.setSelectionRange(result.caret, result.caret);

  return result;
};

/** `applyConform` over mask slots. */
export const applyMask = (
  input: HTMLInputElement,
  event: Event,
  slots: MaskSlot[],
  previous: string,
  options: { skipPaste?: boolean } = {},
): MaskResult | null =>
  applyConform(
    input,
    event,
    (text, caret, deleting) => conformMask(slots, text, caret, deleting),
    previous,
    options,
  );
