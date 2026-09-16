import type { Locator, ScreenshotMatcherOptions } from 'vitest/browser';

/**
 * Spec harness (ADR-0049): mounts registered custom elements into the test
 * document and reads them back through their shadow roots. Everything here
 * talks to the element the way a consumer's page does — properties,
 * attributes, light-DOM children, host events — never to Vue internals.
 */
import { expect } from 'vitest';
import { page, server, userEvent } from 'vitest/browser';

import type { ThemeMode } from '../theme/themeMode';

import { defineCustomElements } from '../index';

/** Register every tag (idempotent). `mount()` calls it; hand-built DOM must. */
export const defineAll = defineCustomElements;

/** Longer than the longest `duration-300` transition in the components. */
export const TRANSITION_MS = 350;

export const nextFrame = (): Promise<void> =>
  new Promise((resolve) => requestAnimationFrame(() => resolve()));

/** Two animation frames (component opens and focus moves are rAF-deferred), then an optional wait. */
export async function settle(ms = 0): Promise<void> {
  await nextFrame();
  await nextFrame();

  if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
}

/** `settle()` plus the colour-transition window — use before colour reads and screenshots. */
export const settled = (): Promise<void> => settle(TRANSITION_MS);

export interface Mounted<T extends HTMLElement = HTMLElement> {
  /** Walk nested shadow roots: `deep('c-input', 'input')` finds the inner field. */
  deep<E extends Element = HTMLElement>(...selectors: string[]): E;
  host: T;
  /** `shadow('[part~="<name>"]')`. */
  part(name: string): HTMLElement;
  /** First match inside the host's shadow root; throws when absent. */
  shadow<E extends Element = HTMLElement>(selector: string): E;
  shadowAll<E extends Element = HTMLElement>(selector: string): E[];
  /** The wrapper element (the host itself when `stage: false`). */
  stage: HTMLElement;
  unmount(): void;
}

export interface MountOptions {
  /** Host attributes. `true` sets the bare attribute, `false` omits it. */
  attrs?: Record<string, boolean | number | string>;
  /** Light-DOM children, i.e. slotted content. */
  html?: string;
  /** Host properties, assigned before the element connects (arrays, objects, numbers). */
  props?: Record<string, unknown>;
  /**
   * Wrap the host in an inline-block stage. Hosts are `display: contents`
   * (zero rect), so the stage is the screenshot target. Default `true`;
   * pass `false` for top-layer surfaces that should sit directly in `body`.
   */
  stage?: boolean;
}

/**
 * Pin the theme mode for the whole page. `tokens.css` keys its mode blocks on a
 * bare `[data-theme]`, so any element opens a **mode scope** (ADR-0053) — set
 * the attribute on a wrapper instead to scope one to part of a spec.
 */
export function setThemeMode(mode: ThemeMode): void {
  document.documentElement.setAttribute('data-theme', mode);
}

const missing = (what: string, where: string): Error =>
  new Error(`harness: no element matches "${what}" inside ${where}`);

/**
 * Browser notices that are not component faults. Chromium reports a
 * ResizeObserver callback that changed layout in the same frame through the
 * window `error` event; it is delivered as an error but is not one.
 */
export const BENIGN_BROWSER_NOTICES: readonly RegExp[] = [
  /ResizeObserver loop completed with undelivered notifications/,
];

export interface ConsoleRecord {
  level: 'error' | 'warn';
  text: string;
}

export interface EventRecord {
  bubbles: boolean;
  composed: boolean;
  detail: unknown;
  /** `event.target.value` at dispatch time — proves the host was updated before it emitted. */
  targetValue: unknown;
  type: string;
}

/** `document.activeElement` followed through open shadow roots. */
export function deepActiveElement(): Element | null {
  let active: Element | null = document.activeElement;
  while (active?.shadowRoot?.activeElement)
    active = active.shadowRoot.activeElement;

  return active;
}

export async function mount<T extends HTMLElement = HTMLElement>(
  tag: string,
  options: MountOptions = {},
): Promise<Mounted<T>> {
  defineAll();

  const host = document.createElement(tag) as T;

  for (const [name, value] of Object.entries(options.attrs ?? {})) {
    if (value === false) continue;
    host.setAttribute(name, value === true ? '' : String(value));
  }

  if (options.html) host.innerHTML = options.html;
  Object.assign(host, options.props ?? {});

  let stage: HTMLElement = host;

  if (options.stage !== false) {
    stage = document.createElement('div');
    stage.dataset.stage = '';
    stage.style.cssText = 'display:inline-block;padding:8px';
    stage.append(host);
  }

  document.body.append(stage);

  await customElements.whenDefined(tag);
  await settle();

  return wrap(host, stage);
}

/** Record host events. Attach `input` recorders to `document.body`: it bubbles. */
export function recordEvents(target: EventTarget, names: readonly string[]) {
  const records: EventRecord[] = [];

  const handler = (event: Event): void => {
    records.push({
      bubbles: event.bubbles,
      composed: event.composed,
      detail: (event as CustomEvent).detail,
      targetValue: (event.target as { value?: unknown } | null)?.value,
      type: event.type,
    });
  };

  for (const name of names) target.addEventListener(name, handler);

  return {
    clear: (): void => {
      records.length = 0;
    },
    details: <D>(): D[] => records.map((r) => r.detail as D),
    last: (): EventRecord | undefined => records.at(-1),
    names: (): string[] => records.map((r) => r.type),
    of: (
      type: string,
      filter?: (record: EventRecord) => boolean,
    ): EventRecord[] =>
      records.filter((r) => r.type === type && (!filter || filter(r))),
    records,
    stop: (): void => {
      for (const name of names) target.removeEventListener(name, handler);
    },
  };
}

/** The shadow-root helpers of `mount()` for an element mounted some other way (e.g. by a Vue app). */
export function wrap<T extends HTMLElement = HTMLElement>(
  host: T,
  stage: HTMLElement = host,
): Mounted<T> {
  const tag = host.localName;

  const root = (): ShadowRoot => {
    if (!host.shadowRoot)
      throw new Error(`harness: <${tag}> has no shadow root`);

    return host.shadowRoot;
  };

  const shadow = <E extends Element = HTMLElement>(selector: string): E => {
    const el = root().querySelector<E>(selector);

    if (!el) throw missing(selector, `<${tag}>`);

    return el;
  };

  return {
    deep: <E extends Element = HTMLElement>(...selectors: string[]): E => {
      let current: Element = host;

      for (const selector of selectors) {
        const scope = current.shadowRoot ?? current;

        const next = scope.querySelector(selector);

        if (!next) throw missing(selector, `<${current.localName}>`);
        current = next;
      }

      return current as E;
    },
    host,
    part: (name) => shadow<HTMLElement>(`[part~="${name}"]`),
    shadow,
    shadowAll: <E extends Element = HTMLElement>(selector: string): E[] =>
      Array.from(root().querySelectorAll<E>(selector)),
    stage,
    unmount: () => stage.remove(),
  };
}

/**
 * Records `console.warn` / `console.error` while a test runs. The setup file's
 * `afterEach` fails a test on any `console.error` and any `[Vue warn]`; a spec
 * that expects one consumes it with `consoleSpy.expect(/pattern/)`.
 */
export const consoleSpy = (() => {
  const originals = { error: console.error, warn: console.warn };

  let records: ConsoleRecord[] = [];

  const format = (args: unknown[]): string =>
    args.map((a) => (a instanceof Error ? a.message : String(a))).join(' ');

  return {
    /** Remove and return the first record matching `pattern`; throw when none does. */
    expect(pattern: RegExp): ConsoleRecord {
      const index = records.findIndex((r) => pattern.test(r.text));

      if (index === -1) {
        throw new Error(
          `harness: expected a console message matching ${pattern}`,
        );
      }

      return records.splice(index, 1)[0];
    },
    /** Every record so far (not consumed). */
    records: (): ConsoleRecord[] => [...records],
    start(): void {
      records = [];

      for (const level of ['error', 'warn'] as const) {
        console[level] = (...args: unknown[]) => {
          records.push({ level, text: format(args) });
          originals[level](...args);
        };
      }
    },
    /** Restore the console and return what would fail the test. */
    stop(): ConsoleRecord[] {
      console.error = originals.error;
      console.warn = originals.warn;

      return records.filter(
        (r) =>
          (r.level === 'error' || r.text.startsWith('[Vue warn]')) &&
          !BENIGN_BROWSER_NOTICES.some((pattern) => pattern.test(r.text)),
      );
    },
  };
})();

/**
 * Visual baselines are authored in the devcontainer and compared in CI — both
 * Linux, where `fonts.conf` pins every generic family to the bundled
 * Liberation 2.1.5 files (`src/test/fonts`). No other
 * host renders the same glyphs (macOS ignores fontconfig), so elsewhere the
 * comparison is skipped and only the behaviour assertions around it run.
 * `test:update` therefore never writes a baseline from a non-Linux checkout.
 */
export const VISUAL_BASELINES = server.platform === 'linux';

let skipNoticed = false;

export async function matchScreenshotInBothModes(
  target: Element | Locator,
  name: string,
  options?: ScreenshotMatcherOptions,
): Promise<void> {
  if (!VISUAL_BASELINES) {
    if (!skipNoticed) {
      skipNoticed = true;
      console.log(
        `[csc-ui] visual baselines compare on linux only — skipped on ${server.platform}`,
      );
    }

    return;
  }

  const locator =
    target instanceof Element ? page.elementLocator(target) : target;

  for (const mode of ['light', 'dark'] as const) {
    setThemeMode(mode);
    await settled();
    await expect.element(locator).toMatchScreenshot(`${name}-${mode}`, options);
  }

  setThemeMode('light');
}

/**
 * One visual baseline per theme mode: `<name>-light.png` and `<name>-dark.png`
 * beside the spec. Pass `mounted.stage` for a component, `page` for a
 * top-layer surface.
 */
/**
 * Move the pointer to the top-left corner. Test files share one page, so the
 * pointer left by another file's click would otherwise rest over the element
 * under test and paint its hover state into a baseline. The setup file calls
 * this before every test; call it again after a click when a later screenshot
 * must not show hover — only while nothing modal or inert is open.
 */
export async function parkPointer(): Promise<void> {
  const park = document.createElement('div');

  park.style.cssText = 'position:fixed;top:0;left:0;width:2px;height:2px';
  document.body.append(park);
  await userEvent.hover(park);
  park.remove();
}
