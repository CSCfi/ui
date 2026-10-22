/**
 * The pure half of `c-file-upload` (ADR-0071): `accept` matching, the decimal
 * byte formatter, the file-type icon category, the name split that keeps an
 * extension visible, the upload-error wording rule and the screening of one
 * add into accepted and rejected files. No DOM — `files.node.spec.ts`.
 */

/** The icon family a file belongs to (decision 19 of `_plan/c-file-upload.md`). */
export type FileCategory =
  | 'archive'
  | 'audio'
  | 'code'
  | 'document'
  | 'generic'
  | 'image'
  | 'spreadsheet'
  | 'video';

/** The file facts these helpers read — a `File`, or a plain object in a node spec. */
export interface FileFacts {
  /** Milliseconds since the epoch; a `File` always has it. */
  lastModified?: number;
  name: string;
  size: number;
  type: string;
}

/** Why a file was refused; mirrors the component's `CFileUploadRejectReason`. */
export type RejectReason = 'count' | 'duplicate' | 'folder' | 'size' | 'type';

/**
 * Media types for the extensions a browser often reports with an empty
 * `type` (a `.csv` on Linux, a `.py` anywhere). `.ts` is left out on purpose:
 * it is both TypeScript and an MPEG transport stream.
 */
const EXTENSION_TYPES: Readonly<Record<string, string>> = {
  '7z': 'application/x-7z-compressed',
  avi: 'video/x-msvideo',
  bmp: 'image/bmp',
  bz2: 'application/x-bzip2',
  csv: 'text/csv',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  flac: 'audio/flac',
  gif: 'image/gif',
  gz: 'application/gzip',
  heic: 'image/heic',
  htm: 'text/html',
  html: 'text/html',
  ipynb: 'application/x-ipynb+json',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'text/javascript',
  json: 'application/json',
  m4a: 'audio/mp4',
  md: 'text/markdown',
  mkv: 'video/x-matroska',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  odp: 'application/vnd.oasis.opendocument.presentation',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odt: 'application/vnd.oasis.opendocument.text',
  ogg: 'audio/ogg',
  pdf: 'application/pdf',
  png: 'image/png',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  py: 'text/x-python',
  r: 'text/x-r',
  rar: 'application/vnd.rar',
  rtf: 'application/rtf',
  sh: 'application/x-sh',
  svg: 'image/svg+xml',
  tar: 'application/x-tar',
  tgz: 'application/gzip',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  tsv: 'text/tab-separated-values',
  txt: 'text/plain',
  wav: 'audio/wav',
  webm: 'video/webm',
  webp: 'image/webp',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xml: 'application/xml',
  xz: 'application/x-xz',
  yaml: 'application/yaml',
  yml: 'application/yaml',
  zip: 'application/zip',
  zst: 'application/zstd',
};

const extensionOf = (name: string): string => {
  const dot = name.lastIndexOf('.');

  return dot < 0 ? '' : name.slice(dot + 1).toLowerCase();
};

/** The file's media type, else the one its extension suggests, else `''`; lowercase. */
export const mediaType = (file: Pick<FileFacts, 'name' | 'type'>): string =>
  (file.type || EXTENSION_TYPES[extensionOf(file.name)] || '').toLowerCase();

/**
 * Whether a file passes an `accept` list in the native syntax — `.pdf`,
 * `image/*`, `application/json`, comma separated, case-insensitive. An empty
 * list accepts everything. A drop bypasses the dialog's own filter, so every
 * add is checked here.
 */
export const matchesAccept = (
  file: Pick<FileFacts, 'name' | 'type'>,
  accept: string,
): boolean => {
  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  if (tokens.length === 0) return true;

  const name = file.name.toLowerCase();

  const type = mediaType(file);

  return tokens.some((token) => {
    if (token === '*' || token === '*/*') return true;

    if (token.startsWith('.')) return name.endsWith(token);

    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));

    return type === token;
  });
};

const ARCHIVE_TYPES = new Set([
  'application/gzip',
  'application/vnd.rar',
  'application/x-7z-compressed',
  'application/x-bzip2',
  'application/x-gzip',
  'application/x-rar-compressed',
  'application/x-tar',
  'application/x-xz',
  'application/x-zip-compressed',
  'application/zip',
  'application/zstd',
]);

const SPREADSHEET_TYPES = new Set([
  'application/vnd.ms-excel',
  'application/vnd.oasis.opendocument.spreadsheet',
  'text/csv',
  'text/tab-separated-values',
]);

const DOCUMENT_TYPES = new Set([
  'application/msword',
  'application/pdf',
  'application/rtf',
  'application/vnd.ms-powerpoint',
  'application/vnd.oasis.opendocument.presentation',
  'application/vnd.oasis.opendocument.text',
  'text/markdown',
  'text/plain',
  'text/rtf',
]);

const CODE_TYPES = new Set([
  'application/javascript',
  'application/json',
  'application/x-sh',
  'application/xml',
  'application/yaml',
  'text/css',
  'text/html',
  'text/javascript',
  'text/xml',
  'text/yaml',
]);

/** The icon family of a file, by media type and then by extension. */
export const fileCategory = (
  file: Pick<FileFacts, 'name' | 'type'>,
): FileCategory => {
  const type = mediaType(file);

  if (type.startsWith('image/')) return 'image';

  if (type.startsWith('video/')) return 'video';

  if (type.startsWith('audio/')) return 'audio';

  if (
    SPREADSHEET_TYPES.has(type) ||
    type.startsWith(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.',
    )
  ) {
    return 'spreadsheet';
  }

  if (ARCHIVE_TYPES.has(type)) return 'archive';

  if (
    DOCUMENT_TYPES.has(type) ||
    type.startsWith(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.',
    ) ||
    type.startsWith(
      'application/vnd.openxmlformats-officedocument.presentationml.',
    )
  ) {
    return 'document';
  }

  if (
    CODE_TYPES.has(type) ||
    type.endsWith('+json') ||
    type.endsWith('+xml') ||
    type.startsWith('text/x-') ||
    type.startsWith('application/x-')
  ) {
    return 'code';
  }

  if (type.startsWith('text/')) return 'document';

  return 'generic';
};

/** Two-part extensions kept whole, so `bundle.tar.gz` keeps `.tar.gz` visible. */
const COMPOUND_EXTENSIONS = ['.tar.bz2', '.tar.gz', '.tar.xz', '.tar.zst'];

/** A plain extension: up to eight letters or digits after the last dot. */
const EXTENSION = /^\.[a-z0-9]{1,8}$/i;

/**
 * A file name split into the stem that may truncate and the extension that
 * stays visible: `['quarterly-report', '.pdf']`. A dotfile, a name without a
 * dot, or a "extension" that is really a word (`notes.final draft`) keeps the
 * whole name as the stem.
 */
export const splitName = (name: string): [stem: string, extension: string] => {
  const lower = name.toLowerCase();

  for (const compound of COMPOUND_EXTENSIONS) {
    if (lower.endsWith(compound) && name.length > compound.length) {
      return [name.slice(0, -compound.length), name.slice(-compound.length)];
    }
  }

  const dot = name.lastIndexOf('.');

  if (dot <= 0) return [name, ''];

  const extension = name.slice(dot);

  return EXTENSION.test(extension)
    ? [name.slice(0, dot), extension]
    : [name, ''];
};

const SIZE_UNITS = ['kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const;

const formatters = new Map<string, Intl.NumberFormat>();

const numberFormat = (
  lang: string,
  unit: string,
  unitDisplay: 'long' | 'short',
  digits: number,
): Intl.NumberFormat => {
  const key = `${lang}|${unit}|${unitDisplay}|${digits}`;

  const cached = formatters.get(key);

  if (cached) return cached;

  const options: Intl.NumberFormatOptions = {
    maximumFractionDigits: digits,
    style: 'unit',
    unit,
    unitDisplay,
  };

  let format: Intl.NumberFormat;

  try {
    format = new Intl.NumberFormat(lang || undefined, options);
  } catch {
    // An unknown language tag reads as English.
    format = new Intl.NumberFormat('en', options);
  }

  formatters.set(key, format);

  return format;
};

const round = (value: number, digits: number): number => {
  const scale = 10 ** digits;

  return Math.round(value * scale) / scale;
};

/**
 * A byte count in decimal SI units in the page's language: `482 kB`,
 * `1.2 MB` (`fi`: `482 kt`, `1,2 Mt`). Kilobytes take no decimals, larger
 * units one; a value that rounds to 1000 steps up a unit. Under a kilobyte
 * the unit is spelled out (`512 bytes`, `512 tavua`) — ICU's short English
 * byte is the odd `512 byte`.
 */
export const formatBytes = (bytes: number, lang: string): string => {
  const n = Number.isFinite(bytes) && bytes > 0 ? bytes : 0;

  if (n < 1000) return numberFormat(lang, 'byte', 'long', 0).format(n);

  let value = n / 1000;

  for (let i = 0; ; i++) {
    const digits = i === 0 ? 0 : 1;

    if (round(value, digits) < 1000 || i === SIZE_UNITS.length - 1) {
      return numberFormat(lang, SIZE_UNITS[i], 'short', digits).format(value);
    }

    value /= 1000;
  }
};

/**
 * The text a failed row shows: the rejection's own message when it is an
 * `Error` the consumer threw, else `fallback`. A `TypeError` (fetch's
 * "Failed to fetch") and a `DOMException` (an abort, an XHR failure) carry
 * browser wording, so they fall back too.
 */
export const uploadErrorText = (reason: unknown, fallback: string): string => {
  if (typeof DOMException !== 'undefined' && reason instanceof DOMException) {
    return fallback;
  }

  if (!(reason instanceof Error) || reason instanceof TypeError) {
    return fallback;
  }

  return reason.message.trim() || fallback;
};

/** One dropped or picked file, flagged when the drop says it is a folder. */
export interface Candidate<F extends FileFacts> {
  file: F;
  folder: boolean;
}

/**
 * A file the field already holds: an entry's browser `File`, or a server
 * file's name and size (it has no `lastModified`).
 */
export interface HeldFile {
  lastModified?: number;
  name: string;
  size: number;
}

/**
 * Whether a new file is one the field already holds: the same name, size and
 * last-modified time — a file picked again from the same folder. A server
 * file, which has no last-modified time, matches on name and size.
 */
export const isSameFile = (
  file: Pick<FileFacts, 'lastModified' | 'name' | 'size'>,
  held: HeldFile,
): boolean =>
  file.name === held.name &&
  file.size === held.size &&
  (held.lastModified === undefined || held.lastModified === file.lastModified);

export interface ScreenOptions {
  /** The `accept` list. */
  accept: string;

  /** What the field already holds — checked for duplicates, and counted against `maxFiles`. */
  held: readonly HeldFile[];

  /** The most entries a `multiple` field holds; `null` for no cap. */
  maxFiles: null | number;

  /** The largest file in bytes; `null` for no cap. */
  maxSize: null | number;

  /** Whether a pick adds files; without it, one file replaces the entry. */
  multiple: boolean;
}

/**
 * Sorts one add into the files to keep and the files to refuse, in drop
 * order. A folder, a type outside `accept`, a file over `maxSize` and a file
 * already held — or already kept from this add — are refused for that
 * reason; of the rest, those beyond the room left — one without `multiple`,
 * else `maxFiles` minus the entries held — are refused as `count`.
 */
export const screenFiles = <F extends FileFacts>(
  candidates: readonly Candidate<F>[],
  { accept, held, maxFiles, maxSize, multiple }: ScreenOptions,
): { accepted: F[]; rejected: { file: F; reason: RejectReason }[] } => {
  const accepted: F[] = [];

  const rejected: { file: F; reason: RejectReason }[] = [];

  let room = multiple
    ? maxFiles === null
      ? Number.POSITIVE_INFINITY
      : Math.max(0, maxFiles - held.length)
    : 1;

  const isHeld = (file: F): boolean =>
    held.some((h) => isSameFile(file, h)) ||
    accepted.some((h) => isSameFile(file, h));

  for (const { file, folder } of candidates) {
    let reason: null | RejectReason = null;

    if (folder) reason = 'folder';
    else if (!matchesAccept(file, accept)) reason = 'type';
    else if (maxSize !== null && file.size > maxSize) reason = 'size';
    else if (isHeld(file)) reason = 'duplicate';
    else if (room <= 0) reason = 'count';

    if (reason) {
      rejected.push({ file, reason });
    } else {
      accepted.push(file);
      room -= 1;
    }
  }

  return { accepted, rejected };
};

let entryCount = 0;

const session = Math.random().toString(36).slice(2, 8);

/** A page-unique id for a file entry the component creates. */
export const createEntryId = (): string =>
  `c-file-upload-${session}-${++entryCount}`;
