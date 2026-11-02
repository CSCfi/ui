/**
 * Behaviour spec for c-file-upload (CONTEXT.md "File upload", "File entry",
 * "Upload status", "Upload function", "Drop zone", "Rejected file";
 * ADR-0071).
 */
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { reactive } from 'vue';

import type { Mounted } from '../../test/harness';
import type {
  CFileUploadContext,
  CFileUploadEntry,
  CFileUploadRejection,
} from './CFileUpload.vue';

import { resetDefaults } from '../../shared/appDefaults';
import {
  deepActiveElement,
  matchScreenshotInBothModes,
  mount,
  recordEvents,
  settle,
} from '../../test/harness';

type UploadHost = {
  manual: boolean;
  startUploads: () => void;
  upload: unknown;
  value: CFileUploadEntry[] | null | string;
} & HTMLElement;

const EVENTS = ['change', 'update:value', 'reject'];

/** A file of `size` bytes without allocating them. */
const fileOf = (name: string, size = 1000, type = ''): File => {
  const file = new File(['x'], name, { type });

  Object.defineProperty(file, 'size', { value: size });

  return file;
};

const mountField = (props: Record<string, unknown> = {}, attrs = {}) =>
  mount<UploadHost>('c-file-upload', {
    attrs: { style: 'display:block;width:420px', ...attrs },
    props: { label: 'Attachments', ...props },
  });

const input = (m: Mounted): HTMLInputElement => m.shadow('input[type="file"]');

/** Choose files through the dialog's input, as the browser does after a pick. */
const pick = async (m: Mounted, files: File[]): Promise<void> => {
  const data = new DataTransfer();

  for (const file of files) data.items.add(file);
  input(m).files = data.files;
  input(m).dispatchEvent(new Event('change', { bubbles: true }));
  await settle();
};

const dragEvent = (type: string, data: DataTransfer): DragEvent =>
  new DragEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
    dataTransfer: data,
  });

/** Drag files in over `target` and drop them there. */
const drop = async (target: Element, files: File[]): Promise<boolean> => {
  const data = new DataTransfer();

  for (const file of files) data.items.add(file);
  target.dispatchEvent(dragEvent('dragenter', data));
  target.dispatchEvent(dragEvent('dragover', data));

  const event = dragEvent('drop', data);

  target.dispatchEvent(event);
  await settle();

  return event.defaultPrevented;
};

/** An upload function whose calls the test settles by hand. */
const controlledUpload = () => {
  const calls: {
    context: CFileUploadContext;
    file: File;
    reject: (reason: unknown) => void;
    resolve: (result: unknown) => void;
  }[] = [];

  const upload = (file: File, context: CFileUploadContext) =>
    new Promise((resolve, reject) => {
      calls.push({ context, file, reject, resolve });
    });

  return { calls, upload };
};

const value = (m: Mounted<UploadHost>): CFileUploadEntry[] =>
  m.host.value as CFileUploadEntry[];

const rows = (m: Mounted): HTMLElement[] =>
  m.shadowAll<HTMLElement>('[part="entry"], [part="rejected"]');

/** A row's second line: its size, status or reason. */
const statusOf = (row: HTMLElement): string =>
  (row.children[1]?.lastElementChild?.textContent ?? '').trim();

const button = (row: HTMLElement, label: RegExp): HTMLButtonElement => {
  const found = Array.from(row.querySelectorAll('button')).find((b) =>
    label.test(b.getAttribute('aria-label') ?? ''),
  );

  if (!found) throw new Error(`no button matching ${label}`);

  return found;
};

afterEach(() => {
  resetDefaults();
  document.documentElement.removeAttribute('lang');
});

describe('adding files', () => {
  it('holds a picked file as a local entry and emits once', async () => {
    const m = await mountField();

    const events = recordEvents(m.host, EVENTS);

    const file = fileOf('report.pdf', 482_113, 'application/pdf');

    await pick(m, [file]);

    expect(value(m)).toHaveLength(1);
    expect(value(m)[0]).toMatchObject({
      file,
      name: 'report.pdf',
      size: 482_113,
      status: 'local',
      type: 'application/pdf',
    });
    expect(value(m)[0].id).toMatch(/^c-file-upload-/);
    expect(events.of('change')).toHaveLength(1);
    expect(events.of('update:value')).toHaveLength(1);
    expect(events.of('change')[0].targetValue).toBe(
      events.of('change')[0].detail,
    );
  });

  it('replaces the one entry without multiple', async () => {
    const m = await mountField();

    await pick(m, [fileOf('a.pdf')]);

    const first = value(m)[0].id;

    await pick(m, [fileOf('b.pdf')]);

    expect(value(m).map((e) => e.name)).toEqual(['b.pdf']);
    expect(value(m)[0].id).not.toBe(first);
  });

  it('appends under multiple', async () => {
    const m = await mountField({ multiple: true });

    await pick(m, [fileOf('a.pdf'), fileOf('b.pdf')]);
    await pick(m, [fileOf('c.pdf')]);

    expect(value(m).map((e) => e.name)).toEqual(['a.pdf', 'b.pdf', 'c.pdf']);
    expect(input(m).multiple).toBe(true);
  });

  it('takes a drop anywhere on the field, a row included', async () => {
    const m = await mountField({ multiple: true });

    expect(await drop(m.part('drop-zone'), [fileOf('a.txt')])).toBe(true);

    const row = rows(m)[0];

    expect(await drop(row, [fileOf('b.txt')])).toBe(true);
    expect(value(m).map((e) => e.name)).toEqual(['a.txt', 'b.txt']);
  });

  it('shows the drag-over state while files are over the field', async () => {
    const m = await mountField();

    const data = new DataTransfer();

    data.items.add(fileOf('a.txt'));
    m.part('drop-zone').dispatchEvent(dragEvent('dragenter', data));
    await settle();

    expect(m.host.matches(':state(drag-over)')).toBe(true);
    expect(m.part('drop-zone').textContent).toContain(
      'Drop the file to add it',
    );

    m.part('drop-zone').dispatchEvent(dragEvent('dragleave', data));
    await settle();

    expect(m.host.matches(':state(drag-over)')).toBe(false);
  });

  it('ignores a drag that carries no files', async () => {
    const m = await mountField();

    const data = new DataTransfer();

    data.setData('text/plain', 'hello');

    const event = dragEvent('drop', data);

    m.part('drop-zone').dispatchEvent(event);
    await settle();

    expect(event.defaultPrevented).toBe(false);
    expect(m.host.value).toBeNull();
  });

  it('opens the file dialog from the drop zone', async () => {
    const m = await mountField();

    let opened = 0;

    input(m).addEventListener('click', (e) => {
      e.preventDefault();
      opened += 1;
    });
    await userEvent.click(m.part('drop-zone'));

    expect(opened).toBe(1);
  });
});

describe('rejected files', () => {
  it('refuses by type, size and count, listing each with its reason', async () => {
    const m = await mountField(
      { maxFiles: 2, maxSize: 1_000_000, multiple: true },
      { accept: '.pdf' },
    );

    const events = recordEvents(m.host, EVENTS);

    const exe = fileOf('setup.exe');

    const big = fileOf('big.pdf', 24_000_000);

    const [a, b, c] = [fileOf('a.pdf'), fileOf('b.pdf'), fileOf('c.pdf')];

    await drop(m.part('drop-zone'), [exe, a, big, b, c]);

    expect(value(m).map((e) => e.name)).toEqual(['a.pdf', 'b.pdf']);

    const rejection = events.of('reject')[0]?.detail as CFileUploadRejection[];

    expect(rejection).toEqual([
      { file: exe, reason: 'type' },
      { file: big, reason: 'size' },
      { file: c, reason: 'count' },
    ]);

    const rejected = m.shadowAll<HTMLElement>('[part="rejected"]');

    expect(rejected.map(statusOf)).toEqual([
      '1 kB · File type not accepted',
      '24 MB · Larger than 1 MB',
      '1 kB · Only 2 files allowed',
    ]);
  });

  it('refuses a dropped folder', async () => {
    const m = await mountField();

    const folder = fileOf('photos', 4096);

    const event = new Event('drop', {
      bubbles: true,
      cancelable: true,
      composed: true,
    });

    Object.defineProperty(event, 'dataTransfer', {
      value: {
        files: [folder],
        items: [
          {
            getAsFile: () => folder,
            kind: 'file',
            webkitGetAsEntry: () => ({ isDirectory: true }),
          },
        ],
        types: ['Files'],
      },
    });
    m.part('drop-zone').dispatchEvent(event);
    await settle();

    expect(value(m) ?? []).toEqual([]);
    expect(statusOf(m.part('rejected'))).toBe("Folders aren't supported");
  });

  it('clears rejected rows on the next add and on close', async () => {
    const m = await mountField({ multiple: true }, { accept: '.pdf' });

    await pick(m, [fileOf('a.exe'), fileOf('b.exe')]);

    expect(m.shadowAll('[part="rejected"]')).toHaveLength(2);

    await userEvent.click(
      button(m.shadowAll<HTMLElement>('[part="rejected"]')[0], /Close a.exe/),
    );
    await settle();

    expect(m.shadowAll('[part="rejected"]')).toHaveLength(1);

    await pick(m, [fileOf('c.pdf')]);

    expect(m.shadowAll('[part="rejected"]')).toHaveLength(0);
  });

  it('rejects the surplus of a multi-file drop without multiple', async () => {
    const m = await mountField();

    await drop(m.part('drop-zone'), [fileOf('a.pdf'), fileOf('b.pdf')]);

    expect(value(m).map((e) => e.name)).toEqual(['a.pdf']);
    expect(statusOf(m.part('rejected'))).toBe('1 kB · Only one file allowed');
  });

  it('refuses a file already in the list', async () => {
    const m = await mountField({ multiple: true });

    const report = fileOf('report.pdf');

    await pick(m, [report]);

    const events = recordEvents(m.host, EVENTS);

    // The same file picked again — the dialog hands back a new File object.
    const again = new File(['x'], 'report.pdf', {
      lastModified: report.lastModified,
    });

    Object.defineProperty(again, 'size', { value: report.size });
    await pick(m, [again, fileOf('notes.txt')]);

    expect(value(m).map((e) => e.name)).toEqual(['report.pdf', 'notes.txt']);
    expect(statusOf(m.part('rejected'))).toBe('1 kB · Already added');
    expect(events.of('reject')[0]?.detail).toEqual([
      { file: again, reason: 'duplicate' },
    ]);
  });

  it('refuses a server file added again, matched on name and size', async () => {
    const m = await mountField({
      multiple: true,
      value: [
        { id: 'f_1', name: 'contract.pdf', size: 120_400, status: 'done' },
      ],
    });

    await pick(m, [fileOf('contract.pdf', 120_400)]);

    expect(value(m)).toHaveLength(1);
    expect(statusOf(m.part('rejected'))).toBe('120 kB · Already added');
  });

  it('refuses re-picking the one file without multiple', async () => {
    const m = await mountField();

    const cv = fileOf('cv.pdf');

    await pick(m, [cv]);

    const id = value(m)[0].id;

    await pick(m, [cv]);

    expect(value(m).map((e) => e.id)).toEqual([id]);
    expect(statusOf(m.part('rejected'))).toBe('1 kB · Already added');
  });

  it('clears rejected rows when the user removes an entry', async () => {
    const m = await mountField({ maxFiles: 2, multiple: true });

    await pick(m, [fileOf('a.txt'), fileOf('b.txt'), fileOf('c.txt')]);

    expect(statusOf(m.part('rejected'))).toBe('1 kB · Only 2 files allowed');

    await userEvent.click(button(rows(m)[0], /Remove a.txt/));
    await settle();

    expect(m.shadowAll('[part="rejected"]')).toHaveLength(0);
  });

  it('clears rejected rows on a value set from outside, not on the v-model echo', async () => {
    const m = await mountField({ maxFiles: 1, multiple: true });

    await pick(m, [fileOf('a.txt'), fileOf('b.txt')]);

    // A v-model hands the emitted array back as a reactive proxy.
    m.host.value = reactive(value(m));
    await settle();

    expect(m.shadowAll('[part="rejected"]')).toHaveLength(1);

    // A form reset.
    m.host.value = [];
    await settle();

    expect(m.shadowAll('[part="rejected"]')).toHaveLength(0);
  });
});

describe('uploading', () => {
  it('runs at most three uploads at once and starts the next on a settle', async () => {
    const { calls, upload } = controlledUpload();

    const m = await mountField({ multiple: true, upload });

    const events = recordEvents(m.host, EVENTS);

    await pick(
      m,
      ['a', 'b', 'c', 'd', 'e'].map((n) => fileOf(`${n}.txt`)),
    );

    expect(calls.map((c) => c.file.name)).toEqual(['a.txt', 'b.txt', 'c.txt']);
    expect(value(m).map((e) => e.status)).toEqual([
      'uploading',
      'uploading',
      'uploading',
      'queued',
      'queued',
    ]);

    calls[1].resolve({ id: 'f_2' });
    await settle();

    expect(calls.map((c) => c.file.name)).toEqual([
      'a.txt',
      'b.txt',
      'c.txt',
      'd.txt',
    ]);
    expect(value(m)[1]).toMatchObject({
      result: { id: 'f_2' },
      status: 'done',
    });
    // One emission for the add, one for the settle.
    expect(events.of('change')).toHaveLength(2);
  });

  it('shows progress without emitting it', async () => {
    const { calls, upload } = controlledUpload();

    document.documentElement.lang = 'en';

    const m = await mountField({ upload });

    const events = recordEvents(m.host, EVENTS);

    await pick(m, [fileOf('data.csv', 9_100_000)]);

    const bar = m.part('progress');

    expect(bar.getAttribute('aria-valuenow')).toBeNull();
    expect(bar.getAttribute('aria-valuetext')).toBe('Uploading');
    expect(bar.getAttribute('aria-label')).toBe('data.csv');
    expect(statusOf(rows(m)[0])).toBe('9.1 MB · Uploading');

    calls[0].context.onProgress(0.13);
    calls[0].context.onProgress(0.5);
    await settle();

    expect(m.part('progress').getAttribute('aria-valuenow')).toBe('50');
    expect(statusOf(rows(m)[0])).toBe('4.6 MB of 9.1 MB · 50%');
    expect(events.of('change')).toHaveLength(1);
  });

  it("shows a thrown Error's message, else the fallback", async () => {
    const { calls, upload } = controlledUpload();

    const m = await mountField({ multiple: true, upload });

    await pick(m, [fileOf('a.txt'), fileOf('b.txt')]);
    calls[0].reject(new Error('File exceeds your quota'));
    calls[1].reject(new TypeError('Failed to fetch'));
    await settle();

    expect(value(m).map((e) => [e.status, e.error])).toEqual([
      ['error', 'File exceeds your quota'],
      ['error', 'Upload failed'],
    ]);
    expect(statusOf(rows(m)[0])).toBe('1 kB · File exceeds your quota');
  });

  it('retries a failed upload', async () => {
    const { calls, upload } = controlledUpload();

    const m = await mountField({ upload });

    await pick(m, [fileOf('a.txt')]);
    calls[0].reject(new Error('Busy'));
    await settle();

    const events = recordEvents(m.host, EVENTS);

    await userEvent.click(button(rows(m)[0], /Retry a.txt/));
    await settle();

    expect(calls).toHaveLength(2);
    expect(value(m)[0]).toMatchObject({ status: 'uploading' });
    expect(value(m)[0].error).toBeUndefined();
    expect(events.of('change')).toHaveLength(1);
  });

  it('cancels: aborts the signal, removes the entry, emits once', async () => {
    const { calls, upload } = controlledUpload();

    const m = await mountField({ upload });

    await pick(m, [fileOf('a.txt')]);

    const events = recordEvents(m.host, EVENTS);

    await userEvent.click(button(rows(m)[0], /Cancel upload of a.txt/));
    await settle();

    expect(calls[0].context.signal.aborted).toBe(true);
    expect(value(m)).toEqual([]);

    // A late settle of the aborted request changes nothing.
    calls[0].resolve({ id: 'late' });
    await settle();

    expect(events.of('change')).toHaveLength(1);
  });

  it('queues local files when an upload function arrives, emitting only on settle', async () => {
    const m = await mountField({ multiple: true });

    await pick(m, [fileOf('a.txt'), fileOf('b.txt')]);

    expect(value(m).map((e) => e.status)).toEqual(['local', 'local']);

    const events = recordEvents(m.host, EVENTS);

    const { calls, upload } = controlledUpload();

    m.host.upload = upload;
    await settle();

    expect(calls).toHaveLength(2);
    expect(events.of('change')).toHaveLength(0);

    calls[0].resolve('ok');
    await settle();

    expect(events.of('change')).toHaveLength(1);
    expect(value(m).map((e) => e.status)).toEqual(['done', 'uploading']);
  });

  it('holds files under manual until startUploads, and files added after it wait again', async () => {
    const { calls, upload } = controlledUpload();

    const m = await mountField({ manual: true, multiple: true, upload });

    await pick(
      m,
      ['a', 'b', 'c', 'd'].map((n) => fileOf(`${n}.txt`)),
    );

    expect(calls).toHaveLength(0);
    expect(value(m).map((e) => e.status)).toEqual([
      'local',
      'local',
      'local',
      'local',
    ]);

    const events = recordEvents(m.host, EVENTS);

    m.host.startUploads();
    await settle();

    expect(calls.map((c) => c.file.name)).toEqual(['a.txt', 'b.txt', 'c.txt']);
    // One emission, reporting the started files.
    expect(events.of('change')).toHaveLength(1);
    expect(value(m).map((e) => e.status)).toEqual([
      'uploading',
      'uploading',
      'uploading',
      'queued',
    ]);

    await pick(m, [fileOf('e.txt')]);
    calls[0].resolve('ok');
    await settle();

    // The queued file still runs; the one added after the call waits.
    expect(calls.map((c) => c.file.name)).toEqual([
      'a.txt',
      'b.txt',
      'c.txt',
      'd.txt',
    ]);
    expect(value(m)[4]).toMatchObject({ name: 'e.txt', status: 'local' });

    m.host.startUploads();
    await settle();

    expect(value(m)[4]).toMatchObject({ status: 'queued' });

    calls[1].resolve('ok');
    await settle();

    expect(calls.map((c) => c.file.name).at(-1)).toBe('e.txt');
  });

  it('starts nothing without an upload function, and queues held files when manual goes', async () => {
    const m = await mountField({ manual: true, multiple: true });

    await pick(m, [fileOf('a.txt')]);

    const events = recordEvents(m.host, EVENTS);

    m.host.startUploads();
    await settle();

    expect(value(m)[0]).toMatchObject({ status: 'local' });
    expect(events.of('change')).toHaveLength(0);

    const { calls, upload } = controlledUpload();

    m.host.upload = upload;
    await settle();

    expect(calls).toHaveLength(0);

    m.host.manual = false;
    await settle();

    expect(calls).toHaveLength(1);
    expect(events.of('change')).toHaveLength(0);
  });

  it('retries a failed upload at once under manual', async () => {
    const { calls, upload } = controlledUpload();

    const m = await mountField({ manual: true, upload });

    await pick(m, [fileOf('a.txt')]);
    m.host.startUploads();
    await settle();
    calls[0].reject(new Error('Busy'));
    await settle();

    await userEvent.click(button(rows(m)[0], /Retry a.txt/));
    await settle();

    expect(calls).toHaveLength(2);
    expect(value(m)[0]).toMatchObject({ status: 'uploading' });
  });

  it('keeps uploading while disabled, and ignores drops', async () => {
    const { calls, upload } = controlledUpload();

    const m = await mountField({ multiple: true, upload });

    await pick(m, [fileOf('a.txt')]);
    m.host.setAttribute('disabled', '');
    await settle();

    expect(calls[0].context.signal.aborted).toBe(false);
    expect(m.part('drop-zone').hasAttribute('disabled')).toBe(true);
    // A drop is still taken, so a near miss never navigates away.
    expect(await drop(m.part('drop-zone'), [fileOf('b.txt')])).toBe(true);
    expect(value(m)).toHaveLength(1);
  });
});

describe('the value', () => {
  it('renders server files as given, and removing one emits', async () => {
    const m = await mountField({
      multiple: true,
      value: [
        { id: 'f_12', name: 'contract.pdf', size: 120_400, status: 'done' },
      ],
    });

    expect(rows(m)).toHaveLength(1);
    expect(
      rows(m)[0].querySelector('[role="img"]')?.getAttribute('aria-label'),
    ).toBe('Uploaded');

    const changes = recordEvents(m.host, EVENTS);

    await userEvent.click(button(rows(m)[0], /Remove contract.pdf/));
    await settle();

    expect(changes.of('change')[0].detail).toEqual([]);
  });

  it('keeps an upload going through a cloned value', async () => {
    const { calls, upload } = controlledUpload();

    const m = await mountField({ upload });

    await pick(m, [fileOf('a.txt', 2_000_000)]);
    calls[0].context.onProgress(0.25);

    // A store hands back copies, with a stale status.
    m.host.value = value(m).map((entry) => ({ ...entry, status: 'queued' }));
    await settle();

    expect(calls[0].context.signal.aborted).toBe(false);
    expect(m.part('progress').getAttribute('aria-valuenow')).toBe('25');

    calls[0].resolve('ok');
    await settle();

    expect(value(m)[0].status).toBe('done');
  });

  it('aborts silently when a tracked entry is set away', async () => {
    const { calls, upload } = controlledUpload();

    const m = await mountField({ upload });

    await pick(m, [fileOf('a.txt')]);

    const events = recordEvents(m.host, EVENTS);

    m.host.value = [];
    await settle();

    expect(calls[0].context.signal.aborted).toBe(true);
    expect(rows(m)).toHaveLength(0);
    expect(events.records).toHaveLength(0);
  });

  it("reads '' and null as no entries", async () => {
    const m = await mountField({ value: '' });

    expect(rows(m)).toHaveLength(0);

    m.host.value = null;
    await settle();

    expect(rows(m)).toHaveLength(0);
  });
});

describe('focus and announcements', () => {
  it('moves focus to the next row, the previous one, then the zone', async () => {
    const m = await mountField({ multiple: true });

    await pick(m, [fileOf('a.txt'), fileOf('b.txt')]);

    button(rows(m)[0], /Remove a.txt/).focus();
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(deepActiveElement()?.getAttribute('aria-label')).toBe(
      'Remove b.txt',
    );

    await userEvent.keyboard('{Enter}');
    await settle();

    expect(deepActiveElement()).toBe(m.part('drop-zone'));
  });

  it('names a done row and announces adds, outcomes and rejections', async () => {
    const { calls, upload } = controlledUpload();

    const m = await mountField({ multiple: true, upload }, { accept: '.txt' });

    await pick(m, [fileOf('a.txt'), fileOf('b.txt'), fileOf('c.exe')]);
    calls[0].resolve('ok');
    calls[1].reject(new Error('Quota exceeded'));
    await settle(1600);

    const live = m.shadow('[aria-live="polite"]').textContent ?? '';

    expect(live).toContain('2 files added');
    expect(live).toContain('c.exe: File type not accepted');
    expect(live).toContain('a.txt uploaded');
    expect(live).toContain('b.txt failed: Quota exceeded');
  });
});

describe('texts and labels', () => {
  it('labels the group and marks it required', async () => {
    const m = await mountField({}, { required: true });

    const root = m.part('root');

    expect(root.getAttribute('role')).toBe('group');
    expect(root.getAttribute('aria-required')).toBe('true');
    expect(
      m.shadow(`#${root.getAttribute('aria-labelledby')}`).textContent,
    ).toContain('Attachments');
  });

  it('takes translated texts', async () => {
    const m = await mountField({
      texts: {
        choose: () => 'valitse tiedosto',
        dragPrompt: () => 'Raahaa tiedosto tähän tai',
      },
    });

    expect(
      m.part('drop-zone').textContent?.replace(/\s+/g, ' ').trim(),
    ).toContain('Raahaa tiedosto tähän tai valitse tiedosto');
  });
});

describe('visual', () => {
  it('large drop zone, empty', async () => {
    const m = await mountField({}, { hint: 'PDF or images, up to 10 MB' });

    await matchScreenshotInBothModes(m.stage, 'large-empty');
  });

  it('rows in every status', async () => {
    document.documentElement.lang = 'en';

    const { calls, upload } = controlledUpload();

    const m = await mountField(
      {
        multiple: true,
        upload,
        value: [
          {
            id: 'f_1',
            name: 'contract-signed.pdf',
            size: 120_400,
            status: 'done',
          },
        ],
      },
      { accept: '.pdf,.csv,.png,.zip' },
    );

    await pick(m, [
      fileOf(
        'quarterly-report-final-version-2026-with-appendices.pdf',
        9_100_000,
        'application/pdf',
      ),
      fileOf('measurements.csv', 482_000, 'text/csv'),
      fileOf('photo.png', 2_400_000, 'image/png'),
      fileOf('bundle.zip', 12_000_000, 'application/zip'),
      fileOf('setup.exe', 700_000),
    ]);
    calls[0].context.onProgress(0.4);
    calls[1].reject(new Error('The server refused the file'));
    calls[2].resolve('ok');
    await settle();
    // The fourth file took the freed slot; give it a determinate bar too.
    calls[3].context.onProgress(0.1);
    await settle();

    await matchScreenshotInBothModes(m.stage, 'rows');
  });

  it('compact rows at both sizes', async () => {
    const m = await mountField({ compact: true });

    const small = await mountField({ compact: true }, { size: 'small' });

    await pick(small, [fileOf('cv.pdf', 482_000, 'application/pdf')]);

    await matchScreenshotInBothModes(m.stage, 'compact-default');
    await matchScreenshotInBothModes(small.stage, 'compact-small');
  });

  it('drag-over, invalid and disabled zones', async () => {
    const over = await mountField({ multiple: true });

    const data = new DataTransfer();

    data.items.add(fileOf('a.txt'));
    over.part('drop-zone').dispatchEvent(dragEvent('dragenter', data));

    const invalid = await mountField(
      {},
      { 'error-message': 'Attach your CV', invalid: true },
    );

    const disabled = await mountField({ compact: true }, { disabled: true });

    await settle();

    await matchScreenshotInBothModes(over.stage, 'drag-over');
    await matchScreenshotInBothModes(invalid.stage, 'invalid');
    await matchScreenshotInBothModes(disabled.stage, 'disabled');
  });
});
