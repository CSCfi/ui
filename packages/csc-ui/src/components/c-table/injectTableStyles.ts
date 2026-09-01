import tableStyles from './table.css?inline';

/**
 * c-table's table styling targets the consumer's slotted light-DOM <table>,
 * so it must live in a DOCUMENT stylesheet, not a shadow sheet (ADR-0037).
 * Injected as a real <style> in <head> — a sheet in document.adoptedStyleSheets
 * would sort after every linked/embedded page sheet, so consumer CSS could
 * never win cascade ties against these defaults. Same pattern as
 * `ensureTwPropsRegistered` in shared/defineElement.ts (SSR-guarded, once per
 * document, data-attribute probe against a second library copy).
 */
let injected = false;

export const ensureTableStyles = (): void => {
  if (injected) return;
  injected = true;

  if (typeof document === 'undefined' || !document.head) return;
  if (document.querySelector('style[data-csc-ui-c-table]')) return;

  const style = document.createElement('style');
  style.setAttribute('data-csc-ui-c-table', '');
  style.textContent = tableStyles;
  document.head.appendChild(style);
};
