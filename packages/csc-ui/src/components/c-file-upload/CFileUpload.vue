<template>
  <div
    :aria-labelledby="label ? labelId : undefined"
    :aria-required="isRequired || undefined"
    :class="ui.root()"
    part="root"
    role="group"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <form-label
      v-if="label"
      :class="ui.label()"
      :label
      :label-id
      :required="isRequired"
      part="label"
      tag="span"
    />

    <!-- The dialog's input. Its own composed `input` stops here, so the
         host's `input` always means the value changed. -->
    <input
      ref="inputRef"
      :accept="accept || undefined"
      :disabled="isDisabled"
      :multiple="isMultiple"
      tabindex="-1"
      type="file"
      hidden
      @change="onInputChange"
      @input.stop
    />

    <!-- The drop zone (CONTEXT.md): the large layout is one native button;
         the compact row keeps a button inside a row that opens the dialog
         too. Either way the whole component takes a drop. -->
    <button
      v-if="!compactResolved"
      ref="zoneRef"
      :class="ui.zone()"
      :disabled="isDisabled"
      part="drop-zone"
      type="button"
      @click="openDialog"
    >
      <svg :class="ui.zoneIcon()" aria-hidden="true" viewBox="0 0 24 24">
        <path :d="mdiTrayArrowUp" />
      </svg>

      <span v-if="dragOver">{{ t.dropActive(isMultiple) }}</span>

      <template v-else>
        <span :class="ui.promptFine()">
          {{ t.dragPrompt(isMultiple) }}
          <span :class="ui.link()">{{ t.choose(isMultiple) }}</span>
        </span>

        <span :class="ui.promptCoarse()">
          {{ t.chooseButton(isMultiple) }}
        </span>
      </template>
    </button>

    <div v-else :class="ui.zone()" part="drop-zone" @click="openDialog">
      <button
        ref="zoneRef"
        :class="ui.choose()"
        :disabled="isDisabled"
        type="button"
        @click.stop="openDialog"
      >
        <svg :class="ui.chooseIcon()" aria-hidden="true" viewBox="0 0 24 24">
          <path :d="mdiTrayArrowUp" />
        </svg>
        {{ t.chooseButton(isMultiple) }}
      </button>

      <span :class="ui.compactPrompt()">
        {{ dragOver ? t.dropActive(isMultiple) : t.compactPrompt(isMultiple) }}
      </span>
    </div>

    <field-message
      :error-message
      :hide-details="hideDetailsResolved"
      :hint
      :valid
      part="message"
    />

    <ul
      v-if="entryRows.length > 0 || rejectedRowsView.length > 0"
      ref="listRef"
      :class="ui.list()"
      part="list"
    >
      <li
        v-for="row in entryRows"
        :key="row.key"
        :class="ui.row({ tone: row.tone })"
        part="entry"
        data-row
      >
        <svg
          :class="ui.fileIcon({ tone: row.tone })"
          aria-hidden="true"
          viewBox="0 0 24 24"
        >
          <path :d="row.icon" />
        </svg>

        <span :class="ui.text()">
          <span :class="ui.name()">
            <span :class="ui.stem()">{{ row.stem }}</span>

            <span :class="ui.extension()">{{ row.extension }}</span>
          </span>

          <span :class="ui.status({ tone: row.tone })">{{ row.status }}</span>
        </span>

        <svg
          v-if="row.done"
          :aria-label="t.uploaded"
          :class="ui.done()"
          role="img"
          viewBox="0 0 24 24"
        >
          <path :d="mdiCheckCircle" />
        </svg>

        <span :class="ui.actions()">
          <button
            v-for="action in row.actions"
            :key="action.kind"
            :aria-label="action.label"
            :class="ui.action()"
            :disabled="isDisabled"
            type="button"
            @click="action.run"
          >
            <svg
              :class="ui.actionIcon()"
              aria-hidden="true"
              viewBox="0 0 24 24"
            >
              <path :d="action.icon" />
            </svg>
          </button>
        </span>

        <span
          v-if="row.progress !== undefined"
          :aria-label="row.name"
          :aria-valuenow="row.progress === null ? undefined : row.progress"
          :aria-valuetext="row.progress === null ? t.uploading : undefined"
          :class="ui.progress()"
          aria-valuemax="100"
          aria-valuemin="0"
          part="progress"
          role="progressbar"
        >
          <span
            :class="ui.bar({ indeterminate: row.progress === null })"
            :style="
              row.progress === null ? undefined : { width: `${row.progress}%` }
            "
          />
        </span>
      </li>

      <li
        v-for="row in rejectedRowsView"
        :key="row.key"
        :class="ui.row({ tone: 'error' })"
        part="rejected"
        data-row
      >
        <svg
          :class="ui.fileIcon({ tone: 'error' })"
          aria-hidden="true"
          viewBox="0 0 24 24"
        >
          <path :d="row.icon" />
        </svg>

        <span :class="ui.text()">
          <span :class="ui.name()">
            <span :class="ui.stem()">{{ row.stem }}</span>

            <span :class="ui.extension()">{{ row.extension }}</span>
          </span>

          <span :class="ui.status({ tone: 'error' })">{{ row.status }}</span>
        </span>

        <span :class="ui.actions()">
          <button
            :aria-label="t.dismiss(row.name)"
            :class="ui.action()"
            type="button"
            @click="dismissRejected(row.key)"
          >
            <svg
              :class="ui.actionIcon()"
              aria-hidden="true"
              viewBox="0 0 24 24"
            >
              <path :d="mdiClose" />
            </svg>
          </button>
        </span>
      </li>
    </ul>

    <span :class="ui.visuallyHidden()" aria-atomic="true" aria-live="polite">
      {{ announcer.text.value }}
    </span>
  </div>
</template>

<script lang="ts">
/** The second argument of an upload function. */
export interface CFileUploadContext {
  /** The entry's id. */
  id: string;

  /** Report progress as a fraction from 0 to 1; the row stays indeterminate until the first call. */
  onProgress: (fraction: number) => void;

  /** Aborted when the user cancels, the entry is removed, or the field unmounts. */
  signal: AbortSignal;
}

/** One file a `c-file-upload` holds (CONTEXT.md "File entry"). */
export interface CFileUploadEntry {
  /** The rejection text shown for a failed upload. */
  error?: string;

  /** The browser file, for a file the user added. Absent on a server file. */
  file?: File;

  /** Stable identity: generated for an added file, the consumer's own for a server file. */
  id: string;

  /** The file name. */
  name: string;

  /** What the upload function resolved to. */
  result?: unknown;

  /** The size in bytes. */
  size: number;

  /** Where the entry stands. */
  status: CFileUploadStatus;

  /** The media type, as the browser reported it. */
  type?: string;
}

/** Sends one file; resolves to the entry's `result` or rejects to mark it failed. */
export type CFileUploadFunction = (
  file: File,
  context: CFileUploadContext,
) => Promise<unknown>;

export interface CFileUploadProps {
  /**
   * The file types the field takes, in the native `accept` syntax: extensions (`.pdf`) and media types (`image/*`, `application/json`), comma separated. It filters the file dialog and is checked again on a drop
   *
   * @freeform
   */
  accept?: string;

  /**
   * Show the drop zone as a control-height row — a "Choose files" button and a drop prompt — that lines up with the fields beside it
   *
   * @defaultable false
   */
  compact?: boolean;

  /**
   * Disable the field. Uploads already running continue
   */
  disabled?: boolean;

  /**
   * Error message shown in place of the hint while the field is invalid
   *
   * @freeform
   */
  errorMessage?: string;

  /**
   * Hide the hint and error messages
   *
   * @defaultable false
   */
  hideDetails?: boolean;

  /**
   * Hint text under the drop zone — the place to name the accepted types and limits
   *
   * @freeform
   */
  hint?: string;

  /**
   * Label of the field
   *
   * @freeform
   */
  label?: string;

  /**
   * Hold added files as `local` even with an upload function, until `startUploads()` queues them — for a form that uploads on its own button. Files added after the call wait for the next one
   */
  manual?: boolean;

  /**
   * The most file entries a `multiple` field holds; files beyond it are rejected
   */
  maxFiles?: null | number;

  /**
   * The largest file in bytes; a larger one is rejected. Sizes are shown in decimal units, so write the limit in decimal bytes (`10000000` reads "10 MB")
   */
  maxSize?: null | number;

  /**
   * Let a pick or a drop add several files. Without it the field holds one file and a new pick replaces it; the value is a list either way
   */
  multiple?: boolean;

  /**
   * Set the field as required
   */
  required?: boolean;

  /**
   * Height of the `compact` row: the 52px default (the shared control height) or the 36px `small` row. The large drop zone has one size
   *
   * @defaultable 'default'
   */
  size?: CFieldSize;

  /**
   * UI text overrides (i18n), merged over the English defaults. Objects have no attribute form — bind as a DOM property
   *
   * @defaultable {}
   */
  texts?: CFileUploadTexts;

  /**
   * The upload function: called once per added file with an abort signal and a progress callback taking a fraction from 0 to 1; what it resolves to becomes the entry's `result`, an `Error` it rejects with becomes the entry's `error` text. Without one the field only holds the files. A function — bind as a DOM property
   */
  upload?: CFileUploadFunction;

  /**
   * Set the validity of the field
   */
  valid?: boolean;

  /**
   * The file entries — always a list. A picked file's entry carries the browser `File`; a server file's entry is `{ id, name, size, status: 'done' }`. `''` reads as empty — what a plain `v-model` holding `null` writes. An array — bind as a DOM property
   */
  value?: CFileUploadEntry[] | null | string;
}

/** One rejected file, as the `reject` event reports it. */
export interface CFileUploadRejection {
  /** The refused file. */
  file: File;

  /** Why it was refused. */
  reason: CFileUploadRejectReason;
}

/** Why a file was rejected. */
export type CFileUploadRejectReason =
  | 'count'
  | 'duplicate'
  | 'folder'
  | 'size'
  | 'type';

/** Where a file entry stands (CONTEXT.md "Upload status"). */
export type CFileUploadStatus =
  | 'done'
  | 'error'
  | 'local'
  | 'queued'
  | 'uploading';

/** UI texts of `c-file-upload`, merged key by key over the English defaults. */
export interface CFileUploadTexts {
  /** Announced after an add, with the number of files added. */
  announceAdded?: (count: number) => string;

  /** Announced when an upload fails, with the file name and the row's error text. */
  announceFailed?: (name: string, error: string) => string;

  /** Announced for a rejected file, with its name and the reason text. */
  announceRejected?: (name: string, reason: string) => string;

  /** Announced when an upload is done, with the file name. */
  announceUploaded?: (name: string) => string;

  /** Accessible label of a queued or uploading row's cancel button. */
  cancel?: (name: string) => string;

  /** The link-styled end of the large drop zone's prompt. */
  choose?: (multiple: boolean) => string;

  /** The compact row's button, and the large drop zone's prompt on a touch screen. */
  chooseButton?: (multiple: boolean) => string;

  /** The compact row's prompt beside its button. */
  compactPrompt?: (multiple: boolean) => string;

  /** Accessible label of a rejected row's dismiss button. */
  dismiss?: (name: string) => string;

  /** The large drop zone's prompt before the choose link. */
  dragPrompt?: (multiple: boolean) => string;

  /** The drop zone's prompt while files are dragged over the field. */
  dropActive?: (multiple: boolean) => string;

  /** An uploading row's status: bytes sent, file size (both formatted) and the whole percentage. */
  progress?: (loaded: string, total: string, percent: number) => string;

  /** Rejection reason: a file beyond the count the field holds. */
  rejectedCount?: (max: number) => string;

  /** Rejection reason: a file the field already holds. */
  rejectedDuplicate?: string;

  /** Rejection reason: a dropped folder. */
  rejectedFolder?: string;

  /** Rejection reason: a file over `max-size`, with the formatted limit. */
  rejectedSize?: (max: string) => string;

  /** Rejection reason: a type outside `accept`. */
  rejectedType?: string;

  /** Accessible label of a row's remove button. */
  remove?: (name: string) => string;

  /** Accessible label of a failed row's retry button. */
  retry?: (name: string) => string;

  /** Accessible name of a done row's check mark. */
  uploaded?: string;

  /** A failed row's status when the upload function gave no message. */
  uploadFailed?: string;

  /** An uploading row's status before the first progress report. */
  uploading?: string;

  /** A queued row's status. */
  waiting?: string;
}
</script>

<script setup lang="ts">
/**
 * @csspart root - The field: label, drop zone, message line and file list. The whole of it takes a drop
 * @csspart label - The label above the drop zone
 * @csspart drop-zone - The dashed drop zone — the large button, or the `compact` row
 * @csspart message - The hint/error message area under the drop zone (always reserved unless `hide-details`)
 * @csspart list - The list of file entries and rejected files
 * @csspart entry - One file entry's row
 * @csspart rejected - One rejected file's row
 * @csspart progress - The progress bar along an uploading row's bottom edge
 * @cssstate drag-over - Present while files are dragged over the field
 */
import {
  mdiAlertCircleOutline,
  mdiCheckCircle,
  mdiClose,
  mdiFileAlertOutline,
  mdiFileCodeOutline,
  mdiFileDocumentOutline,
  mdiFileImageOutline,
  mdiFileMusicOutline,
  mdiFileOutline,
  mdiFileTableOutline,
  mdiFileVideoOutline,
  mdiRefresh,
  mdiTrayArrowUp,
  mdiZipBoxOutline,
} from '@mdi/js';
import { tv } from 'tailwind-variants';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowReactive,
  shallowRef,
  toRaw,
  useHost,
  useId,
  useTemplateRef,
  watch,
} from 'vue';

import type { CFieldSize } from '../../types';
import type { Candidate, FileCategory } from './files';

import { useAppDefault } from '../../shared/appDefaults';
import { coerceBoolean } from '../../shared/coerceBoolean';
import { emitModelChange } from '../../shared/emitModelValue';
import FieldMessage from '../../shared/FieldMessage.vue';
import FormLabel from '../../shared/FormLabel.vue';
import { useHostEmit } from '../../shared/useHostEmit';
import { useHostStates } from '../../shared/useHostStates';
import { useKeyboardModality } from '../../shared/useKeyboardModality';
import { useStatusAnnouncer } from '../../shared/useStatusAnnouncer';
import {
  createEntryId,
  fileCategory,
  formatBytes,
  screenFiles,
  splitName,
  uploadErrorText,
} from './files';

/**
 * Events dispatched by `<c-file-upload>`. The value events fire together,
 * through `emitModelChange`, when the user adds, removes or retries a file
 * and once when an upload settles — never on a progress tick, and never when
 * `value` is set (ADR-0071).
 */
interface CFileUploadEvents {
  /**
   * Fired with the new list of file entries.
   */
  change: CFileUploadEntry[];

  /**
   * Native bubbling input event fired with every value change so a plain Vue
   * `v-model` works. No detail.
   */
  input: void;

  /**
   * Fired after an add that refused files, listing each with its reason —
   * a type outside `accept`, a file over `max-size`, a file already held,
   * one beyond `max-files`, or a folder. The refused files never join the
   * value.
   */
  reject: CFileUploadRejection[];

  /**
   * v-model contract event, fired with `change`.
   */
  'update:value': CFileUploadEntry[];
}

/**
 * Styling lives in this `tailwind-variants` config; `::part()` is the
 * customization surface. The drop zone is an operable control, so its dashed
 * edge takes the field outline's `border-strong` ink (3:1 against the page);
 * a row's edge is a load-bearing hairline (ADR-0042). Disabled controls take
 * no pointer events: a disabled button may swallow a drag, and a drop must
 * still reach the root, or the browser opens the file in the tab. The
 * `<style>` block is the escape hatch for the indeterminate bar's keyframes.
 */
const fileUpload = tv({
  // The compact row is a field row: the control height, or the small 36px
  // step (CONTEXT.md "Control height"). The large zone has one size.
  compoundVariants: [
    { class: { zone: 'min-h-control' }, compact: true, size: 'default' },
    { class: { zone: 'min-h-9' }, compact: true, size: 'small' },
  ],
  slots: {
    action:
      'm-0 inline-flex size-8 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-on-surface-muted transition-colors duration-200 ease-in-out outline-none hover:not-disabled:bg-primary-subtle-hover hover:not-disabled:text-on-surface focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-solid disabled:pointer-events-none disabled:opacity-50',
    actionIcon: 'size-5 fill-current',
    actions: 'flex shrink-0 items-center',
    bar: 'block h-full bg-primary transition-[width] duration-200 ease-linear',
    choose:
      'm-0 inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-csc-md border border-solid border-primary bg-transparent px-3 [font-family:var(--c-font-family)] text-sm font-bold text-primary transition-colors duration-200 ease-in-out outline-none hover:not-disabled:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline-solid disabled:pointer-events-none disabled:border-on-surface-disabled disabled:text-on-surface-disabled',
    chooseIcon: 'size-5 shrink-0 fill-current',
    compactPrompt: 'min-w-0 truncate',
    done: 'size-5 shrink-0 fill-current text-success',
    extension: 'shrink-0 whitespace-nowrap',
    fileIcon: 'size-6 shrink-0 fill-current text-on-surface-muted',
    label: 'max-w-full truncate text-sm font-medium text-on-surface-muted',
    link: 'font-bold text-link underline',
    list: 'm-0 mt-1 flex list-none flex-col gap-2 p-0',
    name: 'flex min-w-0 text-sm font-medium text-on-surface',
    progress:
      'absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-primary-subtle',
    promptCoarse: 'hidden pointer-coarse:inline',
    promptFine: 'pointer-coarse:hidden',
    root: 'flex w-full max-w-full min-w-0 flex-col gap-1 text-left [font-family:var(--c-font-family)] text-base text-on-surface',
    row: 'relative flex min-w-0 items-center gap-3 overflow-clip rounded-csc-md border border-solid border-divider bg-transparent py-2 pr-1 pl-3',
    status:
      'truncate text-xs text-on-surface-muted [font-variant-numeric:tabular-nums]',
    stem: 'min-w-0 truncate',
    text: 'flex min-w-0 flex-auto flex-col gap-0.5',
    visuallyHidden:
      'absolute m-[-1px] h-px w-px overflow-hidden border-0 p-0 whitespace-nowrap [clip:rect(0_0_0_0)]',
    zone: 'relative m-0 flex w-full min-w-0 cursor-pointer rounded-csc-md border border-dashed border-border-strong bg-transparent [font-family:var(--c-font-family)] text-sm text-on-surface-muted transition-colors duration-200 ease-in-out outline-none hover:bg-primary-subtle-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline-solid',
    zoneIcon: 'size-8 shrink-0 fill-current text-primary',
  },
  variants: {
    compact: {
      false: {
        zone: 'flex-col items-center justify-center gap-2 px-6 py-8 text-center',
      },
      true: { zone: 'items-center gap-3 px-2' },
    },
    disabled: {
      true: {
        root: 'cursor-not-allowed',
        zone: 'pointer-events-none border-on-surface-disabled text-on-surface-disabled',
        zoneIcon: 'text-on-surface-disabled',
      },
    },
    dragOver: {
      true: { zone: 'border-primary bg-primary-subtle text-on-primary-subtle' },
    },
    error: {
      true: { zone: 'border-error' },
    },
    indeterminate: {
      true: { bar: 'c-file-upload__indeterminate w-1/3' },
    },
    size: {
      default: {},
      small: { choose: 'h-7 px-2', chooseIcon: 'size-4' },
    },
    tone: {
      default: {},
      error: {
        fileIcon: 'text-error',
        row: 'border-error',
        status: 'text-error',
      },
    },
  },
});

const props = withDefaults(defineProps<CFileUploadProps>(), {
  accept: '',
  compact: undefined,
  disabled: false,
  errorMessage: '',
  hideDetails: undefined,
  hint: '',
  label: '',
  manual: false,
  maxFiles: null,
  maxSize: null,
  multiple: false,
  required: false,
  size: undefined,
  texts: undefined,
  upload: undefined,
  valid: true,
  value: null,
});

const host = useHost();

const emit = useHostEmit<CFileUploadEvents>();

const setState = useHostStates();

const focusOptions = useKeyboardModality(host);

const appDefault = useAppDefault('c-file-upload', props);

const compactResolved = appDefault('compact', false);

const hideDetailsResolved = appDefault('hideDetails', false);

const sizeResolved = appDefault('size', 'default');

const ownTexts = appDefault('texts', {} as Required<CFileUploadTexts>);

const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

const DEFAULT_TEXTS: Required<CFileUploadTexts> = {
  announceAdded: (count) => `${plural(count, 'file', 'files')} added`,
  announceFailed: (name, error) => `${name} failed: ${error}`,
  announceRejected: (name, reason) => `${name}: ${reason}`,
  announceUploaded: (name) => `${name} uploaded`,
  cancel: (name) => `Cancel upload of ${name}`,
  choose: (multiple) => (multiple ? 'choose files' : 'choose a file'),
  chooseButton: (multiple) => (multiple ? 'Choose files' : 'Choose a file'),
  compactPrompt: (multiple) =>
    multiple ? 'or drop files here' : 'or drop a file here',
  dismiss: (name) => `Dismiss ${name}`,
  dragPrompt: (multiple) =>
    multiple ? 'Drag files here or' : 'Drag a file here or',
  dropActive: (multiple) =>
    multiple ? 'Drop files to add them' : 'Drop the file to add it',
  progress: (loaded, total, percent) => `${loaded} of ${total} · ${percent}%`,
  rejectedCount: (max) =>
    max === 1 ? 'Only one file allowed' : `Only ${max} files allowed`,
  rejectedDuplicate: 'Already added',
  rejectedFolder: "Folders aren't supported",
  rejectedSize: (max) => `Larger than ${max}`,
  rejectedType: 'File type not accepted',
  remove: (name) => `Remove ${name}`,
  retry: (name) => `Retry ${name}`,
  uploaded: 'Uploaded',
  uploadFailed: 'Upload failed',
  uploading: 'Uploading',
  waiting: 'Waiting',
};

const t = computed<Required<CFileUploadTexts>>(() => ({
  ...DEFAULT_TEXTS,
  ...Object.fromEntries(
    Object.entries(ownTexts.value).filter(([, v]) => v !== undefined),
  ),
}));

const isDisabled = computed(() => coerceBoolean(props.disabled));

const isMultiple = computed(() => coerceBoolean(props.multiple));

const isRequired = computed(() => coerceBoolean(props.required));

const dragOver = ref(false);

const ui = computed(() =>
  fileUpload({
    compact: compactResolved.value,
    disabled: isDisabled.value,
    dragOver: dragOver.value && !isDisabled.value,
    error: !coerceBoolean(props.valid),
    size: sizeResolved.value,
  }),
);

const autoId = useId();

const labelId = `${autoId}-label`;

const inputRef = useTemplateRef<HTMLInputElement>('inputRef');

const zoneRef = useTemplateRef<HTMLButtonElement>('zoneRef');

const listRef = useTemplateRef<HTMLUListElement>('listRef');

/** A count prop, from a number or an attribute string; `null` when unset or not a count. */
const toCount = (v: unknown): null | number => {
  if (v === null || v === undefined || v === '') return null;

  const n = typeof v === 'number' ? v : Number(v);

  return Number.isFinite(n) && n >= 0 ? n : null;
};

const maxFiles = computed(() => toCount(props.maxFiles));

const maxSize = computed(() => toCount(props.maxSize));

const uploadFunction = computed(() =>
  typeof props.upload === 'function' ? props.upload : null,
);

// The page's language for sizes, re-read on every add.
const pageLang = ref(
  typeof document === 'undefined' ? '' : document.documentElement.lang,
);

const readPageLang = (): void => {
  pageLang.value = document.documentElement.lang;
};

/** At most this many uploads are in flight; the rest wait as `queued`. */
const MAX_IN_FLIGHT = 3;

/**
 * The entries the component tracks — the files it picked, and server-set
 * entries it adopted to upload — keyed by id (ADR-0071). Plain, not reactive:
 * it holds the `File` and the in-flight request's controller.
 */
const tracked = new Map<
  string,
  { controller: AbortController | null; file: File }
>();

interface TrackedState {
  error?: string;

  /** 0–100 once the upload function reported; `null` before. */
  progress: null | number;

  result?: unknown;

  status: CFileUploadStatus;
}

/**
 * The display state of tracked entries. Shallow on purpose: an entry's
 * `result` must reach the value as the object the upload function resolved
 * to, never a reactive proxy — so every change replaces the record.
 */
const live = shallowReactive<Record<string, TrackedState>>({});

const setLive = (id: string, patch: Partial<TrackedState>): void => {
  const current: TrackedState | undefined = live[id];

  live[id] = { ...(current ?? { progress: null, status: 'local' }), ...patch };
};

/** `''`, `null` and anything not a list read as no entries. */
const toEntries = (value: unknown): CFileUploadEntry[] =>
  Array.isArray(value)
    ? (toRaw(value) as unknown[])
        .map((entry) => toRaw(entry))
        .filter(
          (entry): entry is CFileUploadEntry =>
            typeof entry === 'object' && entry !== null,
        )
    : [];

/** The entries as last set or emitted; tracked ones are overlaid by `live`. */
const base = shallowRef<CFileUploadEntry[]>(toEntries(props.value));

const entries = computed<CFileUploadEntry[]>(() =>
  base.value.map((entry) => {
    const state = live[entry.id];

    const record = tracked.get(entry.id);

    if (!state || !record) return entry;

    const { error: _error, result: _result, ...rest } = entry;

    return {
      ...rest,
      file: record.file,
      status: state.status,
      ...(state.result === undefined ? {} : { result: state.result }),
      ...(state.error === undefined ? {} : { error: state.error }),
    };
  }),
);

/** The array last emitted: a value set to anything else came from outside. */
let lastEmitted: CFileUploadEntry[] | null = null;

/** Emit the value as it stands — a new array of new entries. */
const emitValue = (): void => {
  const snapshot = entries.value.map((entry) => ({ ...entry }));

  base.value = snapshot;
  lastEmitted = snapshot;
  emitModelChange(host, snapshot satisfies CFileUploadEvents['change']);
};

interface RejectedRow {
  file: File;
  key: string;
  reason: CFileUploadRejectReason;
}

/**
 * The latest add's rejected files. They describe that add only, so the next
 * change to the list — an add, a removal, a value set from outside — clears
 * them, as does their own dismiss.
 */
const rejectedRows = shallowRef<RejectedRow[]>([]);

// --- Announcements ---------------------------------------------------------

const announcer = useStatusAnnouncer();

const pendingMessages: string[] = [];

let lastAnnouncement = '';

/**
 * Queue a message for the polite live region. Messages landing within the
 * announcer's debounce are read as one; a text equal to the last one gets a
 * trailing no-break space, or the region would not change and say nothing.
 */
const say = (message: string): void => {
  pendingMessages.push(message);
  announcer.announce(() => {
    let text = pendingMessages.splice(0).join('. ');

    if (text === lastAnnouncement) text += ' ';
    lastAnnouncement = text;

    return text;
  });
};

// --- The queue -------------------------------------------------------------

/** Stop tracking an entry, aborting its upload if one runs. Emits nothing. */
const drop = (id: string): void => {
  tracked.get(id)?.controller?.abort();
  tracked.delete(id);
  delete live[id];
};

const nameOf = (id: string): string =>
  base.value.find((entry) => entry.id === id)?.name ?? '';

const settle = (
  id: string,
  controller: AbortController,
  outcome: Partial<TrackedState>,
): void => {
  const record = tracked.get(id);

  if (controller.signal.aborted || record?.controller !== controller) return;

  record.controller = null;
  setLive(id, { ...outcome, progress: null });

  const name = nameOf(id);

  say(
    outcome.status === 'done'
      ? t.value.announceUploaded(name)
      : t.value.announceFailed(name, outcome.error ?? t.value.uploadFailed),
  );
  emitValue();
  pump();
};

const start = (id: string, upload: CFileUploadFunction): void => {
  const record = tracked.get(id);

  if (!record) return;

  const controller = new AbortController();

  record.controller = controller;
  setLive(id, {
    error: undefined,
    progress: null,
    result: undefined,
    status: 'uploading',
  });

  const onProgress = (fraction: number): void => {
    if (controller.signal.aborted || record.controller !== controller) return;

    const f = Number(fraction);

    if (!Number.isFinite(f)) return;

    setLive(id, { progress: Math.round(Math.min(1, Math.max(0, f)) * 100) });
  };

  // The call waits a microtask, so the emission that reports this entry as
  // `uploading` — the add's, or the settle that freed the slot — lands first.
  queueMicrotask(() => {
    if (controller.signal.aborted) return;

    let pending: Promise<unknown>;

    try {
      pending = Promise.resolve(
        upload(record.file, { id, onProgress, signal: controller.signal }),
      );
    } catch (error) {
      pending = Promise.reject(error);
    }

    pending.then(
      (result) => settle(id, controller, { result, status: 'done' }),
      (reason) =>
        settle(id, controller, {
          error: uploadErrorText(reason, t.value.uploadFailed),
          status: 'error',
        }),
    );
  });
};

/** Start queued entries, in list order, while a slot is free. */
const pump = (): void => {
  const upload = uploadFunction.value;

  if (!upload) return;

  let inFlight = Object.values(live).filter(
    (state) => state.status === 'uploading',
  ).length;

  for (const entry of base.value) {
    if (inFlight >= MAX_IN_FLIGHT) break;

    if (live[entry.id]?.status !== 'queued' || !tracked.has(entry.id)) continue;
    start(entry.id, upload);
    inFlight += 1;
  }
};

/**
 * Queue a `local` entry that carries a file — one this component picked, or
 * a server-set one it starts tracking. Returns whether it was queued.
 */
const enqueue = (entry: CFileUploadEntry): boolean => {
  const state = live[entry.id];

  if (state) {
    if (state.status !== 'local') return false;
  } else {
    if (entry.status !== 'local' || !(entry.file instanceof File)) return false;
    tracked.set(entry.id, { controller: null, file: entry.file });
  }

  setLive(entry.id, { status: 'queued' });

  return true;
};

/**
 * With an upload function, queue every `local` entry that carries a file —
 * unless the field is `manual`, which waits for `startUploads()`; without
 * one, send queued entries back to `local`. Emits nothing (ADR-0071).
 */
const adopt = (): void => {
  const upload = uploadFunction.value;

  for (const entry of base.value) {
    if (!upload) {
      if (live[entry.id]?.status === 'queued') {
        setLive(entry.id, { status: 'local' });
      }
    } else if (!props.manual) {
      enqueue(entry);
    }
  }
};

/**
 * Queue every `local` file entry for the upload function — how a `manual`
 * field starts; files added after the call wait for the next one. Fires the
 * value events once when it starts any. Does nothing without an upload function
 */
const startUploads = (): void => {
  if (!uploadFunction.value) return;

  let started = false;

  for (const entry of base.value) {
    if (enqueue(entry)) started = true;
  }

  if (!started) return;
  pump();
  emitValue();
};

defineExpose({ startUploads });

// A value set from outside: tracked ids it leaves out are aborted silently;
// for the rest the component's own state wins, so a stale snapshot never
// rewinds an upload. Our own emission echoes back here and changes nothing —
// a v-model hands it back as a proxy of the very array we emitted.
watch(
  () => props.value,
  (value) => {
    if (toRaw(value) !== lastEmitted) rejectedRows.value = [];

    const next = toEntries(value);

    const ids = new Set(next.map((entry) => entry.id));

    for (const id of tracked.keys()) {
      if (!ids.has(id)) drop(id);
    }

    base.value = next;
    adopt();
    pump();
  },
);

watch([uploadFunction, () => props.manual], () => {
  adopt();
  pump();
});

// --- Adding files ----------------------------------------------------------

const reasonText = (reason: CFileUploadRejectReason): string => {
  switch (reason) {
    case 'count':
      return t.value.rejectedCount(
        isMultiple.value ? (maxFiles.value ?? 1) : 1,
      );
    case 'duplicate':
      return t.value.rejectedDuplicate;
    case 'folder':
      return t.value.rejectedFolder;
    case 'size':
      return t.value.rejectedSize(
        formatBytes(maxSize.value ?? 0, pageLang.value),
      );
    default:
      return t.value.rejectedType;
  }
};

const addFiles = (candidates: Candidate<File>[]): void => {
  if (isDisabled.value || candidates.length === 0) return;
  readPageLang();

  const multiple = isMultiple.value;

  const { accepted, rejected } = screenFiles(candidates, {
    accept: props.accept ?? '',
    // Without `multiple` the new file replaces the entry, but the same file
    // picked again is still refused rather than sent a second time.
    held: entries.value.map((entry) => ({
      lastModified: entry.file?.lastModified,
      name: entry.name,
      size: entry.size,
    })),
    maxFiles: maxFiles.value,
    maxSize: maxSize.value,
    multiple,
  });

  rejectedRows.value = rejected.map(({ file, reason }) => ({
    file,
    key: createEntryId(),
    reason,
  }));

  if (accepted.length > 0) {
    // Without `multiple` the one new file replaces whatever the field held.
    if (!multiple) for (const entry of base.value) drop(entry.id);

    const status = uploadFunction.value && !props.manual ? 'queued' : 'local';

    const added = accepted.map((file): CFileUploadEntry => {
      const id = createEntryId();

      tracked.set(id, { controller: null, file });
      setLive(id, { status });

      return {
        file,
        id,
        name: file.name,
        size: file.size,
        status,
        type: file.type,
      };
    });

    base.value = multiple ? [...base.value, ...added] : added;
    pump();
    emitValue();
    say(t.value.announceAdded(added.length));
  }

  for (const { file, reason } of rejected) {
    say(t.value.announceRejected(file.name, reasonText(reason)));
  }

  if (rejected.length > 0) {
    emit(
      'reject',
      rejected.map(({ file, reason }) => ({ file, reason })),
    );
  }
};

const openDialog = (): void => {
  if (isDisabled.value) return;
  inputRef.value?.click();
};

const onInputChange = (): void => {
  const input = inputRef.value;

  if (!input?.files) return;

  const files = Array.from(input.files);

  // Cleared, so picking the same file again still fires `change`.
  input.value = '';
  addFiles(files.map((file) => ({ file, folder: false })));
};

// --- Dragging --------------------------------------------------------------

/** Nested enter/leave pairs: the drag is over the field while this is above 0. */
let dragDepth = 0;

const carriesFiles = (event: DragEvent): boolean =>
  Array.from(event.dataTransfer?.types ?? []).includes('Files');

const onDragEnter = (event: DragEvent): void => {
  if (!carriesFiles(event)) return;
  event.preventDefault();
  dragDepth += 1;
  dragOver.value = !isDisabled.value;
};

// Taking every drag of files — a disabled field included — keeps a near
// miss from opening the file in the tab and navigating the form away.
const onDragOver = (event: DragEvent): void => {
  if (!carriesFiles(event)) return;
  event.preventDefault();

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = isDisabled.value ? 'none' : 'copy';
  }
};

const onDragLeave = (event: DragEvent): void => {
  if (!carriesFiles(event)) return;
  dragDepth = Math.max(0, dragDepth - 1);

  if (dragDepth === 0) dragOver.value = false;
};

/** The dropped files, each flagged when the drop says it is a folder. */
const candidatesOf = (data: DataTransfer): Candidate<File>[] => {
  const items = Array.from(data.items ?? []).filter(
    (item) => item.kind === 'file',
  );

  if (items.length === 0) {
    return Array.from(data.files).map((file) => ({ file, folder: false }));
  }

  const candidates: Candidate<File>[] = [];

  for (const item of items) {
    const file = item.getAsFile();

    if (!file) continue;

    const entry =
      typeof item.webkitGetAsEntry === 'function'
        ? item.webkitGetAsEntry()
        : null;

    candidates.push({ file, folder: entry?.isDirectory === true });
  }

  return candidates;
};

const onDrop = (event: DragEvent): void => {
  if (!carriesFiles(event) || !event.dataTransfer) return;
  event.preventDefault();
  dragDepth = 0;
  dragOver.value = false;
  addFiles(candidatesOf(event.dataTransfer));
};

watch(dragOver, (on) => setState('drag-over', on), { immediate: true });

// --- Rows ------------------------------------------------------------------

const CATEGORY_ICONS: Record<FileCategory, string> = {
  archive: mdiZipBoxOutline,
  audio: mdiFileMusicOutline,
  code: mdiFileCodeOutline,
  document: mdiFileDocumentOutline,
  generic: mdiFileOutline,
  image: mdiFileImageOutline,
  spreadsheet: mdiFileTableOutline,
  video: mdiFileVideoOutline,
};

/** What one file entry's row shows. */
interface EntryRow {
  actions: RowAction[];
  done: boolean;
  extension: string;
  icon: string;
  key: string;
  name: string;

  /** 0–100 while uploading, `null` while indeterminate, `undefined` otherwise. */
  progress: null | number | undefined;
  status: string;
  stem: string;
  tone: 'default' | 'error';
}

/** What one rejected file's row shows. */
interface RejectedRowView {
  extension: string;
  icon: string;
  key: string;
  name: string;
  status: string;
  stem: string;
}

interface RowAction {
  icon: string;
  kind: 'cancel' | 'remove' | 'retry';
  label: string;
  run: () => void;
}

/**
 * After a row goes, focus the row now at its place, else the one before,
 * else the drop zone — so a keyboard user never falls to the document.
 */
const restoreFocus = (index: number): void => {
  void nextTick(() => {
    const rowEls = listRef.value?.querySelectorAll<HTMLElement>('[data-row]');

    const target = rowEls?.[index] ?? rowEls?.[index - 1];

    const button = target?.querySelector<HTMLButtonElement>('button');

    (button ?? zoneRef.value)?.focus(focusOptions());
  });
};

const removeEntry = (id: string): void => {
  const index = base.value.findIndex((entry) => entry.id === id);

  drop(id);
  base.value = base.value.filter((entry) => entry.id !== id);
  rejectedRows.value = [];
  emitValue();
  pump();
  restoreFocus(index);
};

const retryEntry = (entry: CFileUploadEntry): void => {
  if (!tracked.has(entry.id)) {
    if (!(entry.file instanceof File)) return;
    tracked.set(entry.id, { controller: null, file: entry.file });
  }

  setLive(entry.id, {
    error: undefined,
    status: uploadFunction.value ? 'queued' : 'local',
  });
  pump();
  emitValue();
};

const dismissRejected = (key: string): void => {
  const index =
    base.value.length + rejectedRows.value.findIndex((row) => row.key === key);

  rejectedRows.value = rejectedRows.value.filter((row) => row.key !== key);
  restoreFocus(index);
};

const entryRows = computed<EntryRow[]>(() => {
  const lang = pageLang.value;

  const text = t.value;

  return entries.value.map((entry): EntryRow => {
    const [stem, extension] = splitName(entry.name ?? '');

    const size = formatBytes(entry.size, lang);

    const status = entry.status;

    const progress =
      status === 'uploading' ? (live[entry.id]?.progress ?? null) : undefined;

    let line = size;

    if (status === 'queued') line = `${size} · ${text.waiting}`;
    else if (status === 'uploading') {
      line =
        progress === null || progress === undefined
          ? `${size} · ${text.uploading}`
          : text.progress(
              formatBytes((entry.size * progress) / 100, lang),
              size,
              progress,
            );
    } else if (status === 'error') {
      line = `${size} · ${entry.error || text.uploadFailed}`;
    }

    const actions: RowAction[] = [];

    const cancelling = status === 'queued' || status === 'uploading';

    if (status === 'error' && entry.file instanceof File) {
      actions.push({
        icon: mdiRefresh,
        kind: 'retry',
        label: text.retry(entry.name),
        run: () => retryEntry(entry),
      });
    }

    actions.push({
      icon: mdiClose,
      kind: cancelling ? 'cancel' : 'remove',
      label: cancelling ? text.cancel(entry.name) : text.remove(entry.name),
      run: () => removeEntry(entry.id),
    });

    return {
      actions,
      done: status === 'done',
      extension,
      icon:
        status === 'error'
          ? mdiFileAlertOutline
          : CATEGORY_ICONS[
              fileCategory({ name: entry.name ?? '', type: entry.type ?? '' })
            ],
      key: entry.id,
      name: entry.name,
      progress,
      status: line,
      stem,
      tone: status === 'error' ? 'error' : 'default',
    };
  });
});

const rejectedRowsView = computed<RejectedRowView[]>(() =>
  rejectedRows.value.map((row): RejectedRowView => {
    const [stem, extension] = splitName(row.file.name);

    const reason = reasonText(row.reason);

    return {
      extension,
      icon:
        row.reason === 'folder' ? mdiAlertCircleOutline : mdiFileAlertOutline,
      key: row.key,
      name: row.file.name,
      // A folder's size is the browser's placeholder, not its content's.
      status:
        row.reason === 'folder'
          ? reason
          : `${formatBytes(row.file.size, pageLang.value)} · ${reason}`,
      stem,
    };
  }),
);

onMounted(() => {
  readPageLang();
  adopt();
  pump();
});

// A field taken out of the page stops its uploads: nothing is left to show
// them, and the signal tells the upload function to clean up.
onBeforeUnmount(() => {
  for (const { controller } of tracked.values()) controller?.abort();
});
</script>

<!--
  Escape-hatch CSS (ADR-0007): the indeterminate bar's keyframes, which no
  utility can declare. An activity indicator keeps moving under reduced
  motion — the motion is the information (CONTEXT.md "Reduced motion").
-->
<style>
.c-file-upload__indeterminate {
  animation: c-file-upload-indeterminate 1.4s ease-in-out infinite;
}

@keyframes c-file-upload-indeterminate {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(300%);
  }
}
</style>
