import {
  onBeforeUnmount,
  readonly,
  type Ref,
  ref,
  useHost,
  watchEffect,
} from 'vue';

import { useElementInternals } from './useElementInternals';

/**
 * Form association (ADR-0084): a value control takes part in a native
 * `<form>` the way a built-in control does — its value submits under its
 * `name`, `form.reset()` returns it to its authored default, a disabled
 * `<fieldset>` disables it, and a validating form checks it.
 *
 * The element class is form-associated (`defineElement`'s `formAssociated`);
 * the browser calls its form callbacks, which land here through
 * `formCallbacks`. Everything degrades to a silent no-op where the element is
 * not form-associated or internals are unavailable (SSR).
 */

/** The `value` and `checked` attributes as authored, before any upgrade. */
export interface AuthoredDefaults {
  checked: boolean;
  value: null | string;
}

export interface FormAssociation {
  /** The form owner, or `null`. */
  form(): HTMLFormElement | null;

  /**
   * Whether the element is disabled from outside: a disabled `<fieldset>`
   * around it, or a `disabled` attribute on the host.
   */
  formDisabled: Readonly<Ref<boolean>>;
}

export interface FormAssociationOptions {
  /** The entry name; nothing submits without one. */
  name(): string | undefined;

  /**
   * Return the control to `authored` on `form.reset()`, through the model
   * path (`emitModelInput`), so a bound model follows (ADR-0084).
   */
  reset(authored: AuthoredDefaults): void;

  /** The failed check now, or `null` when the control passes. */
  validity?(): FormValidity | null;

  /** The entry value now; read only while the control has a name. */
  value(): FormEntryValue;
}

/** What a control submits: one entry, one per value, or nothing. */
export type FormEntryValue = null | readonly string[] | string;

/** A failed check: the flags, the bubble's text and the control it points at. */
export interface FormValidity {
  anchor?: HTMLElement | null;
  flags: ValidityStateFlags;
  message: string;
}

interface FormHandlers {
  disabled(on: boolean): void;
  reset(): void;
}

const handlersOf = new WeakMap<HTMLElement, FormHandlers>();

const disabledOf = new WeakMap<HTMLElement, boolean>();

const authoredOf = new WeakMap<HTMLElement, AuthoredDefaults>();

/**
 * The browser's form callbacks, as `defineElement` forwards them, and the
 * authored-default capture it runs on connect.
 */
export const formCallbacks = {
  /**
   * Keep the authored `value` and `checked` before the element first
   * upgrades: Vue's custom element writes every string, number or `true` prop
   * back to its attribute (`_setProp`), so after that the attribute follows
   * the value and no longer says what the markup — or a server render — set.
   * A value bound as a property is not an attribute yet at this point.
   */
  captureAuthored(host: HTMLElement): void {
    if (authoredOf.has(host)) return;

    const checked = host.getAttribute('checked');

    authoredOf.set(host, {
      checked: checked !== null && checked !== 'false',
      value: host.getAttribute('value'),
    });
  },
  disabled(host: HTMLElement, on: boolean): void {
    disabledOf.set(host, on);
    handlersOf.get(host)?.disabled(on);
  },
  reset(host: HTMLElement): void {
    handlersOf.get(host)?.reset();
  },
};

/** A constraint as a detached native control would hold it. */
export type NativeConstraint =
  | 'select'
  | Partial<
      Pick<
        HTMLInputElement,
        'max' | 'min' | 'name' | 'pattern' | 'required' | 'type' | 'value'
      >
    >;

/**
 * The browser's own wording for a failed check, in its UI language, read off
 * a detached native control holding the same constraint — so a csc-ui field's
 * bubble reads as a native field's would: `{ required: true }` for a missing
 * value, `{ pattern: 'a', value: 'b' }` for a format, `{ type: 'number', min:
 * '5', value: '3' }` for a range, `'select'` for a list.
 */
export const nativeMessage = (constraint: NativeConstraint): string => {
  let control: HTMLInputElement | HTMLSelectElement;

  if (constraint === 'select') {
    control = document.createElement('select');
    control.required = true;
  } else {
    control = document.createElement('input');

    // The type first: it decides how the value is read.
    if (constraint.type) control.type = constraint.type;
    Object.assign(control, { ...constraint, type: control.type });
  }

  // `setValidity()` throws on an empty message for a failed check.
  return control.validationMessage || 'Please check this field.';
};

/** The wording of a malformed value: a mask, a code, an unreadable date. */
export const formatMessage = (): string =>
  nativeMessage({ pattern: 'a', value: 'b' });

const VALIDITY_FLAGS = [
  'badInput',
  'customError',
  'patternMismatch',
  'rangeOverflow',
  'rangeUnderflow',
  'stepMismatch',
  'tooLong',
  'tooShort',
  'typeMismatch',
  'valueMissing',
] as const;

/**
 * A native control's own failed check — `required`, a `type="email"`, `min` /
 * `max` / `step` — as the host reports it, pointing at that control. `null`
 * while it passes.
 */
export const validityOf = (
  control: HTMLInputElement | HTMLTextAreaElement | null | undefined,
): FormValidity | null => {
  if (!control || control.validity.valid) return null;

  const flags: ValidityStateFlags = {};

  for (const key of VALIDITY_FLAGS)
    if (control.validity[key]) flags[key] = true;

  return { anchor: control, flags, message: control.validationMessage };
};

/**
 * The form side of a value control. Call once from the component's setup;
 * it hands the form what `value()` returns under `name()`, reports
 * `validity()` (the browser skips a disabled element's), and runs `reset` on
 * a form reset.
 */
export const useFormAssociation = (
  options: FormAssociationOptions,
): FormAssociation => {
  const host = useHost();

  const internals = useElementInternals();

  const formDisabled = ref(host ? (disabledOf.get(host) ?? false) : false);

  const associated =
    !!host &&
    !!internals &&
    (host.constructor as { formAssociated?: boolean }).formAssociated ===
      true &&
    typeof internals.setFormValue === 'function';

  if (!associated) {
    return { form: () => null, formDisabled: readonly(formDisabled) };
  }

  const handlers: FormHandlers = {
    disabled: (on) => {
      formDisabled.value = on;
    },
    reset: () =>
      options.reset(authoredOf.get(host) ?? { checked: false, value: null }),
  };

  handlersOf.set(host, handlers);
  onBeforeUnmount(() => {
    if (handlersOf.get(host) === handlers) handlersOf.delete(host);
  });

  watchEffect(() => {
    const name = options.name();

    const value = name ? options.value() : null;

    if (!name || value === null) {
      internals.setFormValue(null);

      return;
    }

    const data = new FormData();

    for (const entry of typeof value === 'string' ? [value] : value) {
      data.append(name, entry);
    }

    internals.setFormValue(data);
  });

  // After the render: the anchor is an element of this render's tree.
  watchEffect(
    () => {
      const failed = options.validity?.() ?? null;

      if (!failed) {
        internals.setValidity({});

        return;
      }

      const message = failed.message || formatMessage();

      try {
        internals.setValidity(
          failed.flags,
          message,
          failed.anchor ?? undefined,
        );
      } catch {
        // An anchor no longer inside the element (a re-render replaced it):
        // the bubble points at the element itself.
        internals.setValidity(failed.flags, message);
      }
    },
    { flush: 'post' },
  );

  return { form: () => internals.form, formDisabled: readonly(formDisabled) };
};
