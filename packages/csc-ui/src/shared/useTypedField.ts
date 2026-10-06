/**
 * The typed half of a picker whose value field holds editable text
 * (ADR-0057, ADR-0058, ADR-0059): one input, or a start and an end input in
 * one field box under `range`. Text is masked while typed and read by the
 * codec only on Enter or blur; text that names no usable value is kept as
 * typed and flags **bad input** (CONTEXT.md). Programmatic values re-sync the
 * text and never emit; commits emit through `emitModelChange`.
 *
 * Generic over the value's codec, so `c-date-picker` and `c-time-picker`
 * share one commit model. The anatomy lives in `TypedField.vue`, which binds
 * the element refs returned here.
 */
import { computed, type Ref, ref, shallowRef, watch } from 'vue';

import { emitModelChange } from './emitModelValue';
import { applyMask, type MaskSlot } from './inputMask';

export interface TypedFieldCodec {
  /** The committed value shown as text under `pattern`. */
  format(value: string, pattern: string): string;

  /** A parsed value that can still not be committed (disabled, out of range) — bad input. */
  isUsable(value: string): boolean;

  /** Whether a value set from outside is one this field holds (anything else is "no value"). */
  isValue(value: unknown): value is string;

  /** Typed text read under `pattern`; `null` when it names no value. */
  parse(text: string, pattern: string): null | string;
}

export type TypedFieldEnd = 'end' | 'start';

export interface TypedFieldEnds {
  end: null | string;
  start: null | string;
}

/** The text committed from the field, as typed: both ends' texts under `range`. */
export type TypedFieldText = { end: string; start: string } | string;

export interface UseTypedFieldOptions {
  codec: TypedFieldCodec;

  /** The custom element host: the model events dispatch from it. */
  host: HTMLElement | null;

  /** The field label (props.label). */
  label: () => string;

  /** Whether the label rests on top of the field (the resolved app default). */
  labelOnTop: Readonly<Ref<boolean>>;

  /** The typing mask derived from `pattern`. */
  mask: Readonly<Ref<MaskSlot[]>>;

  /** The end inputs' accessible names under `range`. */
  names: () => { end: string; start: string };

  /** Alt+↓ in an input, after committing its text: open the panel. */
  onOpenRequest: () => void;

  /** Fired on every commit of typed text, as typed — the host's `change:text`. */
  onTextCommit: (text: TypedFieldText) => void;

  /** The display and parse pattern. */
  pattern: Readonly<Ref<string>>;

  /** The consumer's placeholder (props.placeholder). */
  placeholder: () => string;

  /** Whether the field holds a start and an end. */
  range: Readonly<Ref<boolean>>;

  /** What a committed range with its start after its end becomes: swapped, or kept as typed. */
  reversed: 'keep' | 'swap';

  /** The host's `value` prop. */
  value: () => unknown;
}

export const useTypedField = (options: UseTypedFieldOptions) => {
  const { codec, pattern, range } = options;

  // ---- element refs, bound by TypedField.vue ----------------------------------

  const anchor = shallowRef<HTMLElement | null>(null);

  const field = shallowRef<HTMLElement | null>(null);

  const startInput = shallowRef<HTMLInputElement | null>(null);

  const endInput = shallowRef<HTMLInputElement | null>(null);

  // ---- value ------------------------------------------------------------------

  // Vue's `v-model` on a custom element writes `el.value = ''` for a `null`
  // model (vModelText): the empty string, like any non-value, is "no value".
  const normalize = (v: unknown): TypedFieldEnds => {
    if (v && typeof v === 'object') {
      const r = v as Partial<TypedFieldEnds>;

      return {
        end: codec.isValue(r.end) ? r.end : null,
        start: codec.isValue(r.start) ? r.start : null,
      };
    }

    return { end: null, start: codec.isValue(v) ? v : null };
  };

  const ends = ref<TypedFieldEnds>(normalize(options.value()));

  const sameEnds = (a: TypedFieldEnds, b: TypedFieldEnds) =>
    a.start === b.start && a.end === b.end;

  const toValue = (e: TypedFieldEnds): null | string | TypedFieldEnds => {
    if (!range.value) return e.start;

    return e.start === null && e.end === null
      ? null
      : { end: e.end, start: e.start };
  };

  const startText = ref('');

  const endText = ref('');

  // The text last committed per end; a blur without an edit commits nothing.
  const committedText = { end: '', start: '' };

  const badStart = ref(false);

  const badEnd = ref(false);

  /** Whether the committed text names no usable value — the value is then `null` (CONTEXT.md "Bad input"). */
  const badInput = computed<boolean>(() => badStart.value || badEnd.value);

  const syncTexts = () => {
    startText.value = ends.value.start
      ? codec.format(ends.value.start, pattern.value)
      : '';
    endText.value = ends.value.end
      ? codec.format(ends.value.end, pattern.value)
      : '';
    committedText.start = startText.value;
    committedText.end = endText.value;
    badStart.value = false;
    badEnd.value = false;
  };

  syncTexts();

  // External value updates re-sync the field. The mirror `emitModelChange`
  // writes onto `host.value` re-enters here with what we already hold — a
  // no-op, so bad-input text typed by the user survives its own commit. Never
  // emits.
  watch(options.value, (v) => {
    const next = normalize(v);

    if (sameEnds(next, ends.value)) return;

    ends.value = next;
    syncTexts();
  });

  watch(pattern, () => {
    if (!badStart.value && ends.value.start)
      startText.value = codec.format(ends.value.start, pattern.value);

    if (!badEnd.value && ends.value.end)
      endText.value = codec.format(ends.value.end, pattern.value);

    committedText.start = startText.value;
    committedText.end = endText.value;
  });

  const hasText = computed(() => !!(startText.value || endText.value));

  const hasContent = computed(
    () => hasText.value || ends.value.start !== null || ends.value.end !== null,
  );

  const setEnds = (next: TypedFieldEnds) => {
    if (sameEnds(next, ends.value)) return;

    ends.value = next;
    emitModelChange(options.host, toValue(next));
  };

  /** Commit a value picked in the panel: its ends' texts reformat and lose bad input. */
  const commitValue = (next: TypedFieldEnds) => {
    if (next.start !== null) {
      startText.value = codec.format(next.start, pattern.value);
      committedText.start = startText.value;
      badStart.value = false;
    }

    if (next.end !== null) {
      endText.value = codec.format(next.end, pattern.value);
      committedText.end = endText.value;
      badEnd.value = false;
    }

    setEnds(next);
  };

  // ---- the field --------------------------------------------------------------

  const focused = ref(false);

  // The input focus returns to when the panel closes.
  const lastInput = ref<TypedFieldEnd>('start');

  const inputOf = (end: TypedFieldEnd) =>
    end === 'end' ? endInput.value : startInput.value;

  const inputLabel = (end: TypedFieldEnd) => {
    const label = options.label();

    if (!range.value) return label || undefined;

    const names = options.names();

    const which = end === 'end' ? names.end : names.start;

    return label ? `${label}, ${which}` : which;
  };

  const placeholder = computed(() => {
    if (!options.labelOnTop.value && options.label() && !focused.value)
      return undefined;

    return options.placeholder() || pattern.value;
  });

  // The separator shows only beside something: text or the placeholders. An
  // empty field under its floating label shows neither.
  const showSeparator = computed(
    () => !!(startText.value || endText.value || placeholder.value),
  );

  const fieldSizing =
    typeof CSS !== 'undefined' && CSS.supports('field-sizing', 'content');

  // A width for the range start where `field-sizing` cannot give one: while it
  // shows no text at all (the floating label hides the placeholder), and in a
  // browser without `field-sizing` (Firefox 140 ESR).
  const startWidth = computed(() => {
    if (!range.value) return undefined;

    const text = startText.value || placeholder.value;

    if (text && fieldSizing) return undefined;

    return { width: `${(text || pattern.value).length}ch` };
  });

  const onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;

    if (!next || !(event.currentTarget as HTMLElement).contains(next))
      focused.value = false;
  };

  const onTextInput = (end: TypedFieldEnd, event: Event) => {
    const input = event.target as HTMLInputElement;

    // A paste or drop keeps its text for the lenient commit: masking text in
    // another field order would scramble it, possibly into a real but wrong
    // value ("2031-09-01" → "20.3.1090"), where kept it commits as bad input.
    applyMask(
      input,
      event,
      options.mask.value,
      end === 'end' ? endText.value : startText.value,
      { skipPaste: true },
    );

    const text = input.value;

    if (end === 'end') endText.value = text;
    else startText.value = text;
  };

  // Commit typed text (ADR-0057): on Enter or blur, never per keystroke.
  const commitText = (end: TypedFieldEnd) => {
    const text = end === 'end' ? endText.value : startText.value;

    if (text === committedText[end]) return;

    committedText[end] = text;

    const parsed = codec.parse(text, pattern.value);

    const usable = parsed !== null && codec.isUsable(parsed) ? parsed : null;

    const bad = text.trim() !== '' && usable === null;

    if (end === 'end') badEnd.value = bad;
    else badStart.value = bad;

    const next: TypedFieldEnds = { ...ends.value, [end]: usable };

    // A reversed range swaps its ends, texts and all.
    if (
      options.reversed === 'swap' &&
      range.value &&
      next.start &&
      next.end &&
      next.start > next.end
    ) {
      [next.start, next.end] = [next.end, next.start];
    }

    // Reformat what was read ("1.9.2026" → "01.09.2026").
    if (next.start && !badStart.value)
      startText.value = codec.format(next.start, pattern.value);

    if (next.end && !badEnd.value)
      endText.value = codec.format(next.end, pattern.value);

    committedText.start = startText.value;
    committedText.end = endText.value;

    options.onTextCommit(
      range.value ? { end: endText.value, start: startText.value } : text,
    );
    setEnds(next);
  };

  /** Commit both inputs' pending text — before the panel opens. */
  const commitAll = () => {
    commitText('start');

    if (range.value) commitText('end');
  };

  const onKeyDown = (end: TypedFieldEnd, event: KeyboardEvent) => {
    lastInput.value = end;

    if (event.key === 'Enter') {
      commitText(end);

      return;
    }

    if (event.key === 'ArrowDown' && event.altKey) {
      event.preventDefault();
      commitText(end);
      options.onOpenRequest();
    }
  };

  const onClear = (event?: Event) => {
    event?.stopPropagation();

    startText.value = '';
    endText.value = '';
    committedText.start = '';
    committedText.end = '';
    badStart.value = false;
    badEnd.value = false;
    setEnds({ end: null, start: null });
    startInput.value?.focus();
  };

  return {
    anchor,
    badEnd,
    badInput,
    badStart,
    commitAll,
    commitText,
    commitValue,
    endInput,
    ends,
    endText,
    field,
    focused,
    hasContent,
    hasText,
    inputLabel,
    inputOf,
    lastInput,
    onClear,
    onFocusOut,
    onKeyDown,
    onTextInput,
    placeholder,
    range,
    showSeparator,
    startInput,
    startText,
    startWidth,
  };
};

/** The state `TypedField.vue` renders. */
export type TypedField = ReturnType<typeof useTypedField>;
