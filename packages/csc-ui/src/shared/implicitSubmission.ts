/**
 * Implicit submission (ADR-0084): Enter in a single-line text field submits
 * its form, by the browser's rule — with `<c-button type="submit">` counted as
 * a submit button, which the browser's own rule cannot see (its native button
 * lives in a shadow root), and the csc-ui text fields counted as the fields
 * that block a form without a button from submitting.
 *
 * The browser does none of this for a field whose input lives in a shadow
 * root, so each text-entry field calls `submitOnEnter` from its own keydown.
 */

/** Native input types that block implicit submission when a form has several. */
const TEXT_INPUT_TYPES = new Set([
  'date',
  'datetime-local',
  'email',
  'month',
  'number',
  'password',
  'search',
  'tel',
  'text',
  'time',
  'url',
  'week',
]);

/** The csc-ui fields that count as those inputs. */
const TEXT_FIELD_TAGS = new Set([
  'c-autocomplete',
  'c-color-picker',
  'c-date-picker',
  'c-number-field',
  'c-otp-input',
  'c-text-field',
  'c-time-picker',
]);

const isSubmitButton = (el: Element): boolean => {
  if (el.localName === 'c-button') {
    const button = el as { href?: string; type?: string } & Element;

    return button.type === 'submit' && !button.href;
  }

  return (
    (el instanceof HTMLButtonElement && el.type === 'submit') ||
    (el instanceof HTMLInputElement &&
      (el.type === 'submit' || el.type === 'image'))
  );
};

const blocksImplicitSubmission = (el: Element): boolean => {
  if (TEXT_FIELD_TAGS.has(el.localName))
    return !(Number((el as { rows?: number }).rows) > 1);

  // A text field's slotted input is counted through its field.
  return (
    el instanceof HTMLInputElement &&
    TEXT_INPUT_TYPES.has(el.type) &&
    el.parentElement?.localName !== 'c-text-field'
  );
};

/**
 * Submit `form` as Enter in one of its text fields would: click its first
 * submit button — through the button, so a disabled or loading one does
 * nothing — or, without one, submit when it has only one text field.
 */
export const submitImplicitly = (form: HTMLFormElement): void => {
  const controls = [...form.elements];

  const defaultButton = controls.find(isSubmitButton);

  if (defaultButton) {
    const target =
      defaultButton.localName === 'c-button'
        ? defaultButton.shadowRoot?.querySelector('button')
        : defaultButton;

    (target as HTMLElement | null | undefined)?.click();

    return;
  }

  if (controls.filter(blocksImplicitSubmission).length > 1) return;

  form.requestSubmit();
};

/**
 * A text field's keydown: a plain Enter submits `form` once the event has
 * finished dispatching, unless the page cancelled it, as the browser's own
 * implicit submission is the keydown's default action.
 */
export const submitOnEnter = (
  event: KeyboardEvent,
  form: HTMLFormElement | null,
): void => {
  if (
    !form ||
    event.key !== 'Enter' ||
    event.isComposing ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  )
    return;

  setTimeout(() => {
    if (!event.defaultPrevented) submitImplicitly(form);
  });
};

/**
 * The keydown of a page's own input inside a csc-ui field (c-text-field's
 * slotted input, ADR-0083): the browser runs its own implicit submission
 * there, blind to `<c-button type="submit">`, so a plain Enter that the page
 * has not cancelled by the end of its dispatch is cancelled here and
 * submitted by this rule instead. A listener that stops the event first
 * leaves the browser's own submission in place.
 */
export const submitOnEnterInstead = (
  event: KeyboardEvent,
  form: HTMLFormElement | null,
): void => {
  if (
    !form ||
    event.key !== 'Enter' ||
    event.isComposing ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  )
    return;

  // A listener added to a later target while an event is dispatched hears
  // that same event: `window` is the last.
  window.addEventListener(
    'keydown',
    (last) => {
      if (last !== event || event.defaultPrevented) return;

      event.preventDefault();
      submitImplicitly(form);
    },
    { once: true },
  );
};
