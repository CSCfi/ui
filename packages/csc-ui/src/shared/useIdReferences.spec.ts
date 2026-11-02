import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { defineAll, mount, settle } from '../test/harness';

type GroupHost = { label: string } & HTMLElement;

type Reflecting = {
  ariaDescribedByElements: null | readonly Element[];
  ariaLabelledByElements: null | readonly Element[];
} & Element;

const page: Element[] = [];

/** An element in the page, as the page's own markup would hold it. */
const pageElement = (id: string, text = id): HTMLElement => {
  const el = Object.assign(document.createElement('span'), {
    id,
    textContent: text,
  });

  document.body.append(el);
  page.push(el);

  return el;
};

const radiogroup = (host: Element): Reflecting =>
  host.shadowRoot!.querySelector('[role="radiogroup"]') as Reflecting;

afterEach(() => {
  for (const el of page.splice(0)) el.remove();
});

describe('useIdReferences', () => {
  it('names the control with the page’s elements, after its own', async () => {
    const extra = pageElement('id-ref-extra', 'Billing plan');

    const m = await mount<GroupHost>('c-radio-group', {
      attrs: { 'aria-labelledby': 'id-ref-extra' },
      props: { label: 'Plan' },
    });

    await settle();

    const group = radiogroup(m.host);

    const own = m.host.shadowRoot!.getElementById(
      group.ariaLabelledByElements![0]!.id,
    );

    expect(own?.textContent).toContain('Plan');
    expect(group.ariaLabelledByElements).toEqual([own, extra]);
    // No id from the page is left inside the shadow root.
    expect(group.getAttribute('aria-labelledby')).toBe('');
  });

  it('follows the host attribute, and gives the control its own ids back when it goes', async () => {
    const first = pageElement('id-ref-first');

    const second = pageElement('id-ref-second');

    const m = await mount<GroupHost>('c-radio-group', {
      attrs: { 'aria-labelledby': 'id-ref-first' },
      props: { label: 'Plan' },
    });

    await settle();

    const group = radiogroup(m.host);

    const own = group.ariaLabelledByElements![0]!;

    expect(group.ariaLabelledByElements).toEqual([own, first]);

    m.host.setAttribute('aria-labelledby', 'id-ref-second id-ref-first');
    await settle();

    expect(group.ariaLabelledByElements).toEqual([own, second, first]);

    m.host.removeAttribute('aria-labelledby');
    await settle();

    expect(group.getAttribute('aria-labelledby')).toBe(own.id);
    expect(group.ariaLabelledByElements).toEqual([own]);
  });

  it('keeps the page’s elements when the component rewrites its own ids', async () => {
    const extra = pageElement('id-ref-rewrite');

    const m = await mount<GroupHost>('c-radio-group', {
      attrs: { 'aria-labelledby': 'id-ref-rewrite' },
      props: { label: 'Plan' },
    });

    await settle();

    // Without a label the group's own aria-labelledby goes, and with one it
    // comes back: each is an attribute write that clears reflected elements.
    m.host.label = '';
    await settle();

    expect(radiogroup(m.host).ariaLabelledByElements).toEqual([extra]);

    m.host.label = 'Plan';
    await settle();

    const group = radiogroup(m.host);

    expect(group.ariaLabelledByElements).toHaveLength(2);
    expect(group.ariaLabelledByElements![1]).toBe(extra);
  });

  it('finds an element the page renders later, once the control takes focus', async () => {
    const m = await mount('c-button', {
      attrs: { 'aria-describedby': 'id-ref-late' },
      html: 'Save',
    });

    await settle();

    const button = m.host.shadowRoot!.querySelector('button') as Reflecting;

    expect(button.ariaDescribedByElements).toEqual([]);

    const late = pageElement('id-ref-late', 'Saves a draft');

    await userEvent.click(button);
    await settle();

    expect(button.ariaDescribedByElements).toEqual([late]);
  });

  it('resolves the ids in the tree the element is written in', async () => {
    defineAll();

    const outer = document.createElement('div');

    document.body.append(outer);
    page.push(outer);

    const root = outer.attachShadow({ mode: 'open' });

    root.innerHTML =
      '<span id="id-ref-inner">Inner</span>' +
      '<c-button aria-labelledby="id-ref-inner">Go</c-button>';

    pageElement('id-ref-inner', 'Outer namesake');

    await settle();

    const host = root.querySelector('c-button')!;

    const button = host.shadowRoot!.querySelector('button') as Reflecting;

    expect(button.ariaLabelledByElements).toEqual([
      root.getElementById('id-ref-inner'),
    ]);
  });
});
