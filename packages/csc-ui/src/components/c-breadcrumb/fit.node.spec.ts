/**
 * The breadcrumb's fold arithmetic (CONTEXT.md "Folded crumbs", ADR-0067):
 * middle crumbs fold nearest-the-first first, never the first or the current
 * crumb; past that the current crumb truncates, then the first.
 */
import { describe, expect, it } from 'vitest';

import { fitCrumbs } from './fit';

const crumb = (natural: number, floor = natural) => ({ floor, natural });

const FOLD = 30;

describe('fitCrumbs', () => {
  it('leaves a row that fits alone', () => {
    const crumbs = [crumb(60), crumb(80), crumb(100)];

    expect(fitCrumbs(crumbs, FOLD, 240)).toEqual({
      currentMax: null,
      firstMax: null,
      folded: 0,
    });
  });

  it('treats a sub-pixel overflow as fitting', () => {
    expect(fitCrumbs([crumb(60), crumb(80), crumb(100)], FOLD, 239.6)).toEqual({
      currentMax: null,
      firstMax: null,
      folded: 0,
    });
  });

  it('folds the crumb nearest the first one first, adding the fold button', () => {
    // 60 + 80 + 90 + 100 = 330 > 300: fold the 80 (330 + 30 − 80 = 280).
    const crumbs = [crumb(60), crumb(80), crumb(90), crumb(100)];

    expect(fitCrumbs(crumbs, FOLD, 300).folded).toBe(1);
    // 280 > 250: fold the 90 as well (190).
    expect(fitCrumbs(crumbs, FOLD, 250).folded).toBe(2);
  });

  it('never folds the first or the current crumb', () => {
    const crumbs = [crumb(60), crumb(80), crumb(90), crumb(100)];

    expect(fitCrumbs(crumbs, FOLD, 10).folded).toBe(2);
  });

  it('never folds with only two crumbs — it truncates', () => {
    const fit = fitCrumbs([crumb(100, 60), crumb(100, 60)], FOLD, 170);

    expect(fit.folded).toBe(0);
    expect(fit.currentMax).toBe(70);
    expect(fit.firstMax).toBeNull();
  });

  it('truncates the current crumb to its floor before the first', () => {
    // Folded: 100 + 30 + 120 = 250 in 200 → the current gives 50 of its 60.
    const crumbs = [crumb(100, 60), crumb(80), crumb(120, 60)];

    expect(fitCrumbs(crumbs, FOLD, 200)).toEqual({
      currentMax: 70,
      firstMax: null,
      folded: 1,
    });
    // 250 in 150: the current gives all 60, the first 40.
    expect(fitCrumbs(crumbs, FOLD, 150)).toEqual({
      currentMax: 60,
      firstMax: 60,
      folded: 1,
    });
  });

  it('stops at both floors when even they do not fit', () => {
    const crumbs = [crumb(100, 60), crumb(80), crumb(120, 60)];

    expect(fitCrumbs(crumbs, FOLD, 50)).toEqual({
      currentMax: 60,
      firstMax: 60,
      folded: 1,
    });
  });

  it('truncates a lone crumb as the current one', () => {
    expect(fitCrumbs([crumb(200, 60)], FOLD, 150)).toEqual({
      currentMax: 150,
      firstMax: null,
      folded: 0,
    });
  });

  it('lays out nothing for no crumbs', () => {
    expect(fitCrumbs([], FOLD, 100)).toEqual({
      currentMax: null,
      firstMax: null,
      folded: 0,
    });
  });
});
