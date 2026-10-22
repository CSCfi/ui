/**
 * The pure half of the file upload (ADR-0071, CONTEXT.md "File upload"):
 * `accept` matching, decimal sizes in the page language, icon categories,
 * the stem / extension split, the failed-row wording and add screening.
 */
import { describe, expect, it } from 'vitest';

import {
  createEntryId,
  fileCategory,
  formatBytes,
  isSameFile,
  matchesAccept,
  screenFiles,
  splitName,
  uploadErrorText,
} from './files';

const file = (name: string, type = '', size = 100) => ({ name, size, type });

describe('matchesAccept', () => {
  it('accepts everything with an empty list', () => {
    expect(matchesAccept(file('setup.exe'), '')).toBe(true);
    expect(matchesAccept(file('setup.exe'), ' , ')).toBe(true);
  });

  it('matches extensions case-insensitively, compound ones included', () => {
    expect(matchesAccept(file('Report.PDF'), '.pdf')).toBe(true);
    expect(matchesAccept(file('bundle.tar.gz'), '.tar.gz')).toBe(true);
    expect(matchesAccept(file('report.pdf.exe'), '.pdf')).toBe(false);
  });

  it('matches a family wildcard and an exact media type', () => {
    expect(matchesAccept(file('a.png', 'image/png'), 'image/*')).toBe(true);
    expect(matchesAccept(file('a.mp4', 'video/mp4'), 'image/*')).toBe(false);
    expect(
      matchesAccept(file('a', 'application/json'), 'application/json'),
    ).toBe(true);
  });

  it('falls back to the extension when the browser reports no type', () => {
    expect(matchesAccept(file('data.csv'), 'text/csv')).toBe(true);
    expect(matchesAccept(file('photo.JPG'), 'image/*')).toBe(true);
    expect(matchesAccept(file('blob'), 'image/*')).toBe(false);
  });

  it('takes any token of a comma list', () => {
    expect(matchesAccept(file('a.png', 'image/png'), '.pdf, image/*')).toBe(
      true,
    );
    expect(matchesAccept(file('a.txt', 'text/plain'), '.pdf,image/*')).toBe(
      false,
    );
  });
});

describe('formatBytes', () => {
  it('spells out bytes under a kilobyte', () => {
    expect(formatBytes(0, 'en')).toBe('0 bytes');
    expect(formatBytes(1, 'en')).toBe('1 byte');
    expect(formatBytes(512, 'en')).toBe('512 bytes');
    expect(formatBytes(512, 'fi')).toBe('512 tavua');
  });

  it('uses decimal units — whole kilobytes, one decimal above', () => {
    expect(formatBytes(482_113, 'en')).toBe('482 kB');
    expect(formatBytes(1_200_000, 'en')).toBe('1.2 MB');
    expect(formatBytes(9_120_044, 'en')).toBe('9.1 MB');
    expect(formatBytes(3_400_000_000, 'en')).toBe('3.4 GB');
  });

  it('steps up a unit when rounding reaches 1000', () => {
    expect(formatBytes(999_600, 'en')).toBe('1 MB');
    expect(formatBytes(999_960_000, 'en')).toBe('1 GB');
  });

  it('follows the page language', () => {
    expect(formatBytes(1_200_000, 'fi')).toBe('1,2 Mt');
    expect(formatBytes(1_200_000, 'sv')).toBe('1,2 MB');
  });

  it('reads an unknown language tag as English', () => {
    expect(formatBytes(1_200_000, 'not a tag!')).toBe('1.2 MB');
  });

  it('treats a negative or non-finite count as zero', () => {
    expect(formatBytes(-5, 'en')).toBe('0 bytes');
    expect(formatBytes(Number.NaN, 'en')).toBe('0 bytes');
  });
});

describe('fileCategory', () => {
  it.each([
    ['photo.png', 'image/png', 'image'],
    ['clip.mp4', 'video/mp4', 'video'],
    ['rec.wav', 'audio/wav', 'audio'],
    ['report.pdf', 'application/pdf', 'document'],
    [
      'letter.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'document',
    ],
    ['notes.txt', 'text/plain', 'document'],
    ['data.csv', 'text/csv', 'spreadsheet'],
    [
      'sheet.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'spreadsheet',
    ],
    ['bundle.zip', 'application/zip', 'archive'],
    ['conf.json', 'application/json', 'code'],
    ['feed.atom', 'application/atom+xml', 'code'],
    ['blob.bin', 'application/octet-stream', 'generic'],
  ])('%s (%s) is %s', (name, type, category) => {
    expect(fileCategory({ name, type })).toBe(category);
  });

  it('reads the extension when the type is empty', () => {
    expect(fileCategory(file('data.csv'))).toBe('spreadsheet');
    expect(fileCategory(file('bundle.tar.gz'))).toBe('archive');
    expect(fileCategory(file('script.py'))).toBe('code');
    expect(fileCategory(file('conf.yaml'))).toBe('code');
    expect(fileCategory(file('README'))).toBe('generic');
  });
});

describe('splitName', () => {
  it('splits off a plain extension', () => {
    expect(splitName('quarterly-report.pdf')).toEqual([
      'quarterly-report',
      '.pdf',
    ]);
  });

  it('keeps a compound archive extension whole', () => {
    expect(splitName('bundle.tar.gz')).toEqual(['bundle', '.tar.gz']);
  });

  it('keeps the whole name without a real extension', () => {
    expect(splitName('README')).toEqual(['README', '']);
    expect(splitName('.env')).toEqual(['.env', '']);
    expect(splitName('trailing.')).toEqual(['trailing.', '']);
    expect(splitName('notes.final draft')).toEqual(['notes.final draft', '']);
    expect(splitName('a.verylongext')).toEqual(['a.verylongext', '']);
  });
});

describe('uploadErrorText', () => {
  it("shows a consumer Error's message", () => {
    expect(uploadErrorText(new Error('Quota exceeded'), 'Upload failed')).toBe(
      'Quota exceeded',
    );
  });

  it('falls back for browser wording, blank messages and non-errors', () => {
    expect(uploadErrorText(new TypeError('Failed to fetch'), 'F')).toBe('F');
    expect(
      uploadErrorText(new DOMException('aborted', 'AbortError'), 'F'),
    ).toBe('F');
    expect(uploadErrorText(new Error('   '), 'F')).toBe('F');
    expect(uploadErrorText({ status: 500 }, 'F')).toBe('F');
    expect(uploadErrorText(undefined, 'F')).toBe('F');
    expect(uploadErrorText('boom', 'F')).toBe('F');
  });
});

describe('screenFiles', () => {
  const candidates = (...files: ReturnType<typeof file>[]) =>
    files.map((f) => ({ file: f, folder: false }));

  const options = {
    accept: '',
    held: [],
    maxFiles: null,
    maxSize: null,
    multiple: true,
  };

  it('keeps everything without constraints', () => {
    const files = candidates(file('a.txt'), file('b.txt'));

    expect(screenFiles(files, options)).toEqual({
      accepted: [files[0].file, files[1].file],
      rejected: [],
    });
  });

  it('refuses by type, size and folder, in drop order', () => {
    const big = file('big.pdf', 'application/pdf', 2000);

    const exe = file('setup.exe', 'application/x-msdownload');

    const ok = file('ok.pdf', 'application/pdf', 10);

    const dir = file('photos');

    const result = screenFiles(
      [...candidates(big, exe, ok), { file: dir, folder: true }],
      { ...options, accept: '.pdf', maxSize: 1000 },
    );

    expect(result.accepted).toEqual([ok]);
    expect(result.rejected).toEqual([
      { file: big, reason: 'size' },
      { file: exe, reason: 'type' },
      { file: dir, reason: 'folder' },
    ]);
  });

  it('counts held entries against max-files under multiple', () => {
    const [a, b, c] = [file('a.txt'), file('b.txt'), file('c.txt')];

    const result = screenFiles(candidates(a, b, c), {
      ...options,
      held: [file('x.txt'), file('y.txt'), file('z.txt')],
      maxFiles: 5,
    });

    expect(result.accepted).toEqual([a, b]);
    expect(result.rejected).toEqual([{ file: c, reason: 'count' }]);
  });

  it('keeps the first acceptable file without multiple', () => {
    const [exe, a, b] = [file('setup.exe'), file('a.pdf'), file('b.pdf')];

    const result = screenFiles(candidates(exe, a, b), {
      ...options,
      accept: '.pdf',
      held: [file('held.pdf')],
      maxFiles: 1,
      multiple: false,
    });

    expect(result.accepted).toEqual([a]);
    expect(result.rejected).toEqual([
      { file: exe, reason: 'type' },
      { file: b, reason: 'count' },
    ]);
  });
});

describe('duplicates', () => {
  const picked = (name: string, size: number, lastModified: number) => ({
    lastModified,
    name,
    size,
    type: '',
  });

  it('matches a picked file on name, size and last-modified time', () => {
    const held = picked('report.pdf', 100, 1);

    expect(isSameFile(picked('report.pdf', 100, 1), held)).toBe(true);
    expect(isSameFile(picked('report.pdf', 100, 2), held)).toBe(false);
    expect(isSameFile(picked('report.pdf', 101, 1), held)).toBe(false);
    expect(isSameFile(picked('Report.pdf', 100, 1), held)).toBe(false);
  });

  it('matches a server file on name and size', () => {
    const server = { name: 'report.pdf', size: 100 };

    expect(isSameFile(picked('report.pdf', 100, 7), server)).toBe(true);
    expect(isSameFile(picked('report.pdf', 99, 7), server)).toBe(false);
  });

  it('refuses a held file, and the second copy within one add, before counting', () => {
    const a = picked('a.txt', 10, 1);

    const b = picked('b.txt', 10, 1);

    const result = screenFiles(
      [a, b, { ...b }].map((f) => ({ file: f, folder: false })),
      {
        accept: '',
        held: [picked('a.txt', 10, 1)],
        maxFiles: 2,
        maxSize: null,
        multiple: true,
      },
    );

    expect(result.accepted).toEqual([b]);
    expect(result.rejected.map((r) => r.reason)).toEqual([
      'duplicate',
      'duplicate',
    ]);
  });

  it('refuses re-picking the held file without multiple', () => {
    const result = screenFiles(
      [{ file: picked('cv.pdf', 10, 1), folder: false }],
      {
        accept: '',
        held: [picked('cv.pdf', 10, 1)],
        maxFiles: null,
        maxSize: null,
        multiple: false,
      },
    );

    expect(result.rejected.map((r) => r.reason)).toEqual(['duplicate']);
  });
});

describe('createEntryId', () => {
  it('makes distinct, prefixed ids', () => {
    const a = createEntryId();

    const b = createEntryId();

    expect(a).toMatch(/^c-file-upload-/);
    expect(a).not.toBe(b);
  });
});
