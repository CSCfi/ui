/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/method-signature-style */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
export {};

declare global {
  interface Array<T> {
    findLastIndex(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any,
    ): number;
  }
}
