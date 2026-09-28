/** Server-side browser commands registered in vitest.browser.shared.ts. */
declare module 'vitest/browser' {
  interface BrowserCommands {
    emulateReducedMotion(value: 'no-preference' | 'reduce'): Promise<void>;
  }
}

export {};
