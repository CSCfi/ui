import buttonStyles from './button.css?inline';

/**
 * c-button's slotted button is the page's own light-DOM <button> (ADR-0085),
 * so its styling lives in a DOCUMENT stylesheet — the slotted input's
 * pattern (`injectTextFieldStyles`, ADR-0083): a real <style> in <head>,
 * SSR-guarded, once per document, with a data-attribute probe against a
 * second library copy. Injected only when a button adopts a slotted button.
 */
let injected = false;

export const ensureButtonStyles = (): void => {
  if (injected) return;
  injected = true;

  if (typeof document === 'undefined' || !document.head) return;

  if (document.querySelector('style[data-csc-ui-c-button]')) return;

  const style = document.createElement('style');
  style.setAttribute('data-csc-ui-c-button', '');
  style.textContent = buttonStyles;
  document.head.appendChild(style);
};
