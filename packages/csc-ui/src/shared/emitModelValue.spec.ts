import { expect, it } from 'vitest';

import { recordEvents } from '../test/harness';
import {
  emitModelChange,
  emitModelInput,
  emitModelSettled,
  emitModelValue,
} from './emitModelValue';

type ValueHost = { value?: unknown } & HTMLElement;

const host = (): ValueHost => {
  const el = document.createElement('div') as ValueHost;

  document.body.append(el);

  return el;
};

it('emitModelValue writes the host value, then dispatches the grandfathered set and a bubbling input', () => {
  const el = host();

  const events = recordEvents(el, [
    'changeValue',
    'change-value',
    'update:value',
    'input',
  ]);

  emitModelValue(el, 'x');

  expect(events.names()).toEqual([
    'changeValue',
    'change-value',
    'update:value',
    'input',
  ]);
  expect(events.records.map((r) => r.targetValue)).toEqual([
    'x',
    'x',
    'x',
    'x',
  ]);
  expect(events.records.slice(0, 3).map((r) => r.detail)).toEqual([
    'x',
    'x',
    'x',
  ]);
  expect(events.of('input')[0].bubbles).toBe(true);
  expect(events.of('input')[0].composed).toBe(false);
});

it('emitModelChange dispatches change, update:value and a bubbling input', () => {
  const el = host();

  const events = recordEvents(el, [
    'changeValue',
    'change-value',
    'change',
    'update:value',
    'input',
  ]);

  emitModelChange(el, 7);

  expect(events.names()).toEqual(['change', 'update:value', 'input']);
  expect(events.records.map((r) => r.targetValue)).toEqual([7, 7, 7]);
  expect(events.of('change')[0].detail).toBe(7);
});

it('emitModelInput writes the host value, then dispatches update:value and a bubbling input without change', () => {
  const el = host();

  const events = recordEvents(el, ['change', 'update:value', 'input']);

  emitModelInput(el, '#ff0000');

  expect(events.names()).toEqual(['update:value', 'input']);
  expect(events.records.map((r) => r.targetValue)).toEqual([
    '#ff0000',
    '#ff0000',
  ]);
  expect(events.of('input')[0].bubbles).toBe(true);
});

it('emitModelSettled dispatches change alone', () => {
  const el = host();

  const events = recordEvents(el, ['change', 'update:value', 'input']);

  emitModelSettled(el, '#ff0000');

  expect(events.names()).toEqual(['change']);
  expect(events.of('change')[0].detail).toBe('#ff0000');
});

it('every helper no-ops on a null host', () => {
  expect(() => emitModelValue(null, 1)).not.toThrow();
  expect(() => emitModelChange(null, 1)).not.toThrow();
  expect(() => emitModelInput(null, 1)).not.toThrow();
  expect(() => emitModelSettled(null, 1)).not.toThrow();
});
