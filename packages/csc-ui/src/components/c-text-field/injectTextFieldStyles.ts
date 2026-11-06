import textFieldStyles from './text-field.css?inline';

/**
 * c-text-field's slotted input is the page's own light-DOM <input> (ADR-0083),
 * so its styling lives in a DOCUMENT stylesheet — c-table's pattern
 * (ADR-0037, `injectTableStyles`): a real <style> in <head>, SSR-guarded,
 * once per document, with a data-attribute probe against a second library
 * copy. Injected only when a field adopts a slotted input.
 */
let injected = false;

export const ensureTextFieldStyles = (): void => {
  if (injected) return;
  injected = true;

  if (typeof document === 'undefined' || !document.head) return;

  if (document.querySelector('style[data-csc-ui-c-text-field]')) return;

  const style = document.createElement('style');
  style.setAttribute('data-csc-ui-c-text-field', '');
  style.textContent = textFieldStyles;
  document.head.appendChild(style);
};
