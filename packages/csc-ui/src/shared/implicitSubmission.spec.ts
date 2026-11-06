/**
 * Behaviour spec for implicit submission (ADR-0084): Enter in a csc-ui text
 * field submits its form by the browser's rule, with `<c-button
 * type="submit">` counted as a submit button and the csc-ui text fields as
 * the fields that block a form without one.
 */
import { expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { defineAll, recordEvents, settle, wrap } from '../test/harness';

/** A form of `html`, its submits recorded and cancelled. */
const formOf = async (html: string) => {
  defineAll();

  const form = document.createElement('form');

  form.innerHTML = html;
  form.addEventListener('submit', (event) => event.preventDefault());
  document.body.append(form);
  await settle();

  return { form, submits: recordEvents(form, ['submit']) };
};

const fieldInput = (form: HTMLFormElement, index = 0): HTMLInputElement =>
  wrap(form.querySelectorAll<HTMLElement>('[name]')[index]).deep('input');

it('Enter submits through the first c-button submit button', async () => {
  const { form, submits } = await formOf(`
    <c-text-field name="user" label="User"></c-text-field>
    <c-text-field name="pass" label="Password" type="password"></c-text-field>
    <c-button type="submit">Log in</c-button>`);

  await userEvent.type(fieldInput(form, 1), 'secret{Enter}');
  await settle();

  expect(submits.records).toHaveLength(1);
  form.remove();
});

it('a loading or disabled submit button stops it', async () => {
  for (const state of ['loading', 'disabled']) {
    const { form, submits } = await formOf(`
      <c-text-field name="user" label="User"></c-text-field>
      <c-button type="submit" ${state}>Log in</c-button>`);

    await userEvent.type(fieldInput(form), 'ada{Enter}');
    await settle();

    expect(submits.records, state).toHaveLength(0);
    form.remove();
  }
});

it('without a submit button, only a form with one text field submits', async () => {
  const one = await formOf(
    '<c-number-field name="n" label="N"></c-number-field>',
  );

  await userEvent.type(fieldInput(one.form), '5{Enter}');
  await settle();

  expect(one.submits.records).toHaveLength(1);
  one.form.remove();

  const two = await formOf(`
    <c-text-field name="a" label="A"></c-text-field>
    <c-date-picker name="b" label="B"></c-date-picker>`);

  await userEvent.type(fieldInput(two.form), 'x{Enter}');
  await settle();

  expect(two.submits.records).toHaveLength(0);
  two.form.remove();
});

it('a page that cancels the Enter keydown stops it', async () => {
  const { form, submits } = await formOf(`
    <c-text-field name="q" label="Search"></c-text-field>
    <c-button type="submit">Search</c-button>`);

  form.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') event.preventDefault();
  });

  await userEvent.type(fieldInput(form), 'x{Enter}');
  await settle();

  expect(submits.records).toHaveLength(0);
  form.remove();
});

it('Enter in a closed picker field submits, and an invalid form stays put', async () => {
  const { form, submits } = await formOf(`
    <c-date-picker name="day" label="Day" required></c-date-picker>
    <c-button type="submit">Go</c-button>`);

  await userEvent.type(fieldInput(form), '{Enter}');
  await settle();

  expect(submits.records).toHaveLength(0);

  await userEvent.type(fieldInput(form), '01.09.2031{Enter}');
  await settle();

  expect(submits.records).toHaveLength(1);
  form.remove();
});
