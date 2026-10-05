<template>
  <!-- The editable value field (ADR-0058): `src/shared/TypedField.vue`. -->
  <typed-field
    :anchor-style
    :clear-label="t.clearSelection"
    :clearable
    :disabled
    :error-message
    :field="typed"
    :hide-details="hideDetailsResolved"
    :hint
    :input-id
    :inputmode="twelve ? 'text' : 'numeric'"
    :label
    :label-on-top="labelOnTopResolved"
    :name
    :open="isOpen"
    :required
    :shadow="shadowResolved"
    :size="sizeResolved"
    :valid
  >
    <template #trigger="{ buttonSize, iconSize }">
      <c-icon-button
        :aria-label="t.openClock"
        :disabled
        :size="buttonSize"
        aria-haspopup="dialog"
        text
        @click="onClockClick"
      >
        <c-icon :path="mdiClockOutline" :size="iconSize" />
      </c-icon-button>
    </template>
  </typed-field>

  <!-- Manual popover in the top layer; light dismiss, positioning and the
       fullscreen layout come from `useAnchoredPanel`. -->
  <div
    ref="panelRef"
    :class="ui.panel()"
    :style="panelStyle"
    part="panel"
    popover="manual"
    @toggle="onToggle"
  >
    <!-- A dialog (ADR-0058, ADR-0062): real DOM focus moves onto a time
         column and Tab cycles inside the card. -->
    <div
      ref="cardRef"
      :aria-label="label || t.chooseTime"
      :class="ui.card()"
      :style="cardStyle"
      aria-modal="true"
      part="card"
      role="dialog"
      @keydown="onPanelKeyDown"
    >
      <panel-heading-row
        v-if="layout === 'fullscreen'"
        :close-label="t.closePanel"
        :heading="label || t.chooseTime"
        @close="closePanel(true)"
      />

      <!-- The end switch (CONTEXT.md): which end of a range the columns
           edit. Each end commits on its own; there is no pending state. -->
      <div
        v-if="rangeOn"
        :class="ui.endSwitch()"
        part="end-switch"
        role="tablist"
      >
        <button
          v-for="end in ENDS"
          :key="end"
          :aria-selected="editing === end"
          :class="ui.endTab()"
          :data-end="end"
          :tabindex="editing === end ? 0 : -1"
          part="end-tab"
          role="tab"
          type="button"
          @click="switchEnd(end)"
          @keydown="onEndKeyDown"
        >
          {{ end === 'end' ? t.end : t.start }}
        </button>
      </div>

      <!-- The time columns (CONTEXT.md): one listbox per part, one tab stop
           each; selection follows focus. Transient lists: hidden scrollbar
           and a peek (ADR-0043). -->
      <div
        :aria-label="
          rangeOn ? (editing === 'end' ? t.end : t.start) : undefined
        "
        :class="ui.columns()"
        :role="rangeOn ? 'tabpanel' : undefined"
        part="columns"
      >
        <ul
          v-for="column in columns"
          :key="column.kind"
          :aria-label="column.name"
          :class="ui.column()"
          :data-column="column.kind"
          part="column"
          role="listbox"
        >
          <li
            v-for="row in column.rows"
            :key="row.key"
            :aria-disabled="row.disabled || undefined"
            :aria-selected="row.selected"
            :class="ui.option({ disabled: row.disabled })"
            :data-key="row.key"
            :tabindex="row.focus ? 0 : -1"
            part="option"
            role="option"
            @click="onRowClick(column.kind, row)"
            @keydown="onColumnKeyDown(column.kind, $event)"
          >
            {{ row.label }}
          </li>
        </ul>
      </div>

      <!-- The Now button (ADR-0065) commits the current time and closes; the
           fullscreen panel's Done button (ADR-0066) commits the pending value.
           Outside the tabpanel: they act on whichever end is being edited. -->
      <div
        v-if="showNowResolved || confirming"
        :class="ui.actions()"
        part="actions"
      >
        <button
          v-if="showNowResolved"
          :class="ui.now()"
          :disabled="nowDisabled"
          part="now"
          type="button"
          @click="pickNow"
        >
          {{ t.now }}
        </button>

        <button
          v-if="confirming"
          :class="ui.done()"
          part="done"
          type="button"
          @click="pickDone"
        >
          {{ t.done }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { CFieldSize } from '../../types';

export interface CTimePickerProps {
  /**
   * Make the value clearable
   */
  clearable?: boolean;
  /**
   * Disable the field
   */
  disabled?: boolean;
  /**
   * Error message shown in place of the hint while the field is invalid
   *
   * @freeform
   */
  errorMessage?: string;
  /**
   * How times are shown and read from typing: a pattern of the tokens `H`,
   * `HH` (24-hour), `h`, `hh` (12-hour, with the period `a`) and `mm` with
   * any separators, e.g. `HH:mm` or `h:mm a`
   *
   * @defaultable 'HH.mm'
   * @freeform
   */
  format?: string;
  /**
   * Hide the hint and error messages
   *
   * @defaultable false
   */
  hideDetails?: boolean;
  /**
   * Hint text for the field
   *
   * @freeform
   */
  hint?: string;
  /**
   * Id of the element
   *
   * @freeform
   */
  hostId?: string;
  /**
   * Element label
   *
   * @freeform
   */
  label?: string;
  /**
   * Label on top of the field
   *
   * @defaultable false
   */
  labelOnTop?: boolean;
  /**
   * The latest time that can be picked or typed, as an ISO `HH:mm` time
   *
   * @freeform
   */
  max?: string;
  /**
   * The earliest time that can be picked or typed, as an ISO `HH:mm` time;
   * a `min` after `max` is invalid and both are ignored
   *
   * @freeform
   */
  min?: string;
  /**
   * Minutes between the minute column's rows; typed times need not fall on
   * the step
   */
  minuteStep?: number;
  /**
   * Input field name
   *
   * @freeform
   */
  name?: string;
  /**
   * Placeholder of the input; the `format` pattern when empty
   *
   * @freeform
   */
  placeholder?: string;
  /**
   * Pick a range: the value becomes `{ start, end }` and the field holds two
   * inputs
   */
  range?: boolean;
  /**
   * Set the field as required
   */
  required?: boolean;
  /**
   * Shadow variant
   *
   * @defaultable false
   */
  shadow?: boolean;
  /**
   * Show a Now button under the columns that commits the current time
   *
   * @defaultable false
   */
  showNow?: boolean;
  /**
   * Field height: the 52px default (the shared control height) or the 36px `small` box
   *
   * @defaultable 'default'
   */
  size?: CFieldSize;
  /**
   * UI text overrides (i18n), merged over the AM/PM texts `Intl` gives for
   * the page's `lang` and the English defaults. Objects have no attribute
   * form — bind as a DOM property
   *
   * @defaultable {}
   */
  texts?: CTimePickerTexts;
  /**
   * Set the validity of the field
   */
  valid?: boolean;
  /**
   * The time as an ISO `HH:mm` string on a 24-hour clock, or `{ start, end }`
   * under `range`; `null` when empty
   */
  value?: CTimePickerValue;
}

/** A time range: ISO `HH:mm` ends, either of which may be `null` while only one is typed; an end before the start spans midnight. */
export interface CTimePickerRange {
  /** The end of the range; earlier than the start for an overnight range. */
  end: null | string;
  /** The start of the range. */
  start: null | string;
}

/**
 * The text committed from the field, as typed: a string, or both ends'
 * texts under `range`.
 */
export type CTimePickerText = { end: string; start: string } | string;

/**
 * UI texts of `c-time-picker`, merged key by key over the AM/PM texts
 * `Intl` gives for the page's `lang` and the English defaults.
 */
export interface CTimePickerTexts {
  /** The period before noon in a 12-hour `format`. */
  am?: string;
  /** Accessible name of the dialog when the field has no label. */
  chooseTime?: string;
  /** Accessible label of the clear button. */
  clearSelection?: string;
  /** Accessible label of the close button in the fullscreen panel (narrow viewports). */
  closePanel?: string;
  /** Label of the Done button in the fullscreen panel (narrow viewports). */
  done?: string;
  /** Name of the end input and the end tab under `range`. */
  end?: string;
  /** Accessible name of the hour column. */
  hours?: string;
  /** Accessible name of the minute column. */
  minutes?: string;
  /** Label of the Now button (`show-now`). */
  now?: string;
  /** Accessible label of the clock button. */
  openClock?: string;
  /** Accessible name of the AM/PM column. */
  period?: string;
  /** The period from noon in a 12-hour `format`. */
  pm?: string;
  /** Name of the start input and the start tab under `range`. */
  start?: string;
}

/**
 * Value of `c-time-picker`: an ISO `HH:mm` string, a
 * {@link CTimePickerRange} under `range`, or `null` when empty.
 */
export type CTimePickerValue = CTimePickerRange | null | string;
</script>

<script setup lang="ts">
/**
 * @csspart input - The text input; under `range` both the start and the end input
 * @csspart separator - The dash between the start and end inputs under `range`
 * @csspart panel - The top-layer popover container anchored below the field
 * @csspart card - The dialog surface inside the panel holding the columns
 * @csspart heading-row - The top row of the fullscreen panel (narrow viewports): the field label as heading and the close button
 * @csspart heading - The field label naming the fullscreen panel
 * @csspart close - The close button of the fullscreen panel
 * @csspart end-switch - The Start | End switch above the columns under `range`
 * @csspart end-tab - One end's button in the end switch
 * @csspart columns - The row of time columns
 * @csspart column - One time column: hours, minutes or AM/PM
 * @csspart option - One row of a time column
 * @csspart actions - The row under the columns holding the Now button (`show-now`) and, in the fullscreen panel, the Done button
 * @csspart now - The Now button: commits the current time
 * @csspart done - The Done button of the fullscreen panel (narrow viewports): commits what the panel holds and closes
 *
 * @cssstate bad-input - Present while committed text names no time that can be picked
 */
import { mdiClockOutline } from '@mdi/js';
import { tv } from 'tailwind-variants';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  useHost,
  useId,
  useTemplateRef,
  watch,
} from 'vue';

import { useAppDefault } from '../../shared/appDefaults';
import { coerceBoolean } from '../../shared/coerceBoolean';
import PanelHeadingRow from '../../shared/PanelHeadingRow.vue';
import { applyPeekCap } from '../../shared/peekCap';
import { prefersReducedMotion } from '../../shared/reducedMotion';
import TypedField from '../../shared/TypedField.vue';
import { useAnchoredPanel } from '../../shared/useAnchoredPanel';
import { useHostEmit } from '../../shared/useHostEmit';
import { useHostStates } from '../../shared/useHostStates';
import { useKeyboardModality } from '../../shared/useKeyboardModality';
import { useNarrowViewport } from '../../shared/useNarrowViewport';
import {
  type TypedFieldEnd,
  type TypedFieldEnds,
  useTypedField,
} from '../../shared/useTypedField';
import {
  clampToBounds,
  compileTimeMask,
  type CTimePickerBounds,
  formatTime,
  fromMinutes,
  hourDisabled,
  hourLabel,
  hourRows,
  inBounds,
  intlPeriods,
  isTime,
  isTwelveHour,
  isValidPattern,
  minuteRows,
  nowTime,
  parseTime,
  periodDisabled,
  readBounds,
  roundToStep,
  toMinutes,
} from './times';

type CTimePickerColumn = {
  kind: CTimePickerColumnKind;
  name: string;
  rows: CTimePickerRow[];
};

type CTimePickerColumnKind = 'hour' | 'minute' | 'period';

/** Events dispatched by `<c-time-picker>`. */
interface CTimePickerEvents {
  /**
   * Fired when the value changes — a row is picked or moved to in a column,
   * typed text is committed, or the field is cleared — carrying the new
   * value: an ISO `HH:mm` time, `{ start, end }` under `range`, or `null`.
   */
  change: CTimePickerValue;
  /**
   * Fired on every commit of typed text (Enter or leaving the input) with the
   * text as typed — `{ start, end }` under `range`. Read `badInput` to tell
   * whether it named a time that can be picked.
   */
  'change:text': CTimePickerText;
  /**
   * Native bubbling input event dispatched alongside every value change so a
   * plain `v-model` stays in sync. Carries no detail.
   */
  input: void;
  /**
   * Fired alongside `change` with the same detail — the `v-model` contract.
   */
  'update:value': CTimePickerValue;
}

type CTimePickerRow = {
  disabled: boolean;
  focus: boolean;
  key: string;
  label: string;
  selected: boolean;
  /** Hour 0–23, minute 0–59, or 0 (AM) / 12 (PM). */
  value: number;
};

/**
 * c-time-picker is a typeable time field with a panel of time columns
 * (CONTEXT.md "Time picker", ADR-0061, ADR-0062). Consumer customization is
 * via `::part()` and `:state(bad-input)`.
 */
const timePicker = tv({
  slots: {
    actions: 'flex shrink-0 justify-end px-2 pb-2',
    card: 'flex flex-col w-max overflow-hidden rounded-csc-md bg-surface-overlay text-on-surface shadow-[2px_4px_10px_#00000029]',
    // Ceiling 7.2 rows; the peek cap ends each column on a half row.
    column:
      'relative list-none m-0 p-1 w-16 max-h-[296px] overflow-y-auto scrollbar-hidden overscroll-contain outline-none',
    columns: 'flex justify-center gap-1 p-2',
    // c-button's filled look on a native button, at the heading row's 44px
    // touch target.
    done: 'ml-auto h-11 min-w-22 px-5 cursor-pointer rounded-csc-md border-0 bg-primary text-sm font-bold text-on-primary [font-family:var(--c-font-family)] outline-none hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-primary',
    endSwitch:
      'flex gap-0.5 mx-3 mt-3 p-0.5 rounded-csc-lg border border-solid border-divider bg-clip-padding bg-surface-sunken',
    // Tab lands on the selected tab, so its ring is on-primary inside the
    // fill: a primary ring would vanish into it.
    endTab:
      'flex-1 h-8 px-3 whitespace-nowrap cursor-pointer rounded-csc-md border-0 bg-transparent text-sm font-medium text-on-surface-muted [font-family:var(--c-font-family)] outline-none hover:bg-primary-subtle-hover focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-primary aria-selected:bg-primary aria-selected:text-on-primary aria-selected:hover:bg-primary-hover aria-selected:focus-visible:-outline-offset-4 aria-selected:focus-visible:outline-on-primary',
    // A text button's look on a native button: the focus trap only sees
    // native buttons in the card.
    now: 'h-9 px-3 whitespace-nowrap cursor-pointer rounded-csc-md border-0 bg-transparent text-sm font-bold text-primary [font-family:var(--c-font-family)] outline-none hover:not-disabled:bg-primary-subtle-hover focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-primary disabled:cursor-default disabled:text-on-surface-disabled',
    option:
      'flex items-center justify-center h-10 rounded-csc-lg text-sm tabular-nums text-on-surface cursor-pointer select-none outline-none hover:bg-primary-subtle-hover focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-primary aria-selected:bg-primary-subtle aria-selected:text-primary aria-selected:font-medium',
    panel:
      'fixed m-0 p-0 border-0 bg-transparent overflow-visible [inset:auto]',
  },
  variants: {
    disabled: {
      true: {
        option: 'cursor-default text-on-surface-disabled hover:bg-transparent',
      },
    },
    fullscreen: {
      true: {
        actions:
          'w-full max-w-[400px] mx-auto justify-between items-center px-3 pb-3',
        card: 'w-auto max-h-none rounded-none shadow-none',
        column: 'max-h-none h-full',
        columns: 'flex-1 min-h-0',
        now: 'h-11',
        panel: 'bg-surface-overlay overflow-hidden',
      },
    },
  },
});

const ENDS: TypedFieldEnd[] = ['start', 'end'];

// Two root nodes (field + panel): keep fallthrough attrs on the host.
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CTimePickerProps>(), {
  clearable: false,
  disabled: false,
  errorMessage: '',
  format: undefined,
  hideDetails: undefined,
  hint: '',
  hostId: '',
  label: '',
  labelOnTop: undefined,
  max: '',
  min: '',
  minuteStep: 1,
  name: '',
  placeholder: '',
  range: false,
  required: false,
  shadow: undefined,
  showNow: undefined,
  size: undefined,
  texts: undefined,
  valid: true,
  value: null,
});

const host = useHost();

// Script focus rings after a keyboard path, an Alt+↓ open included.
const focusOptions = useKeyboardModality(host);

const emit = useHostEmit<CTimePickerEvents>();

const setState = useHostStates();

const appDefault = useAppDefault('c-time-picker', props);

const formatResolved = appDefault('format', 'HH.mm');

const hideDetailsResolved = appDefault('hideDetails', false);

const labelOnTopResolved = appDefault('labelOnTop', false);

const shadowResolved = appDefault('shadow', false);

const showNowResolved = appDefault('showNow', false);

const sizeResolved = appDefault('size', 'default');

// ---- texts: own → app default → Intl for the page's lang → English -------

const DEFAULT_TEXTS: Required<CTimePickerTexts> = {
  am: 'AM',
  chooseTime: 'Choose time',
  clearSelection: 'Clear selection',
  closePanel: 'Close',
  done: 'Done',
  end: 'End time',
  hours: 'Hours',
  minutes: 'Minutes',
  now: 'Now',
  openClock: 'Open time picker',
  period: 'AM/PM',
  pm: 'PM',
  start: 'Start time',
};

// Own texts merged over the app default (the resolver's per-key merge).
const ownTexts = appDefault('texts', {} as Required<CTimePickerTexts>);

// The page's language, read once per open (a `lang` change re-reads).
const pageLang = ref(
  typeof document === 'undefined' ? '' : document.documentElement.lang,
);

const t = computed<Required<CTimePickerTexts>>(() => ({
  ...DEFAULT_TEXTS,
  ...(intlPeriods(pageLang.value) ?? {}),
  ...Object.fromEntries(
    Object.entries(ownTexts.value).filter(([, v]) => v !== undefined),
  ),
}));

const periods = computed(() => ({ am: t.value.am, pm: t.value.pm }));

// ---- refs -----------------------------------------------------------------

const cardRef = useTemplateRef<HTMLElement>('cardRef');

const panelRef = useTemplateRef<HTMLElement>('panelRef');

const autoId = useId();

const inputId = computed(() => props.hostId || autoId);

// Same defineCustomElement Boolean-attribute quirk as `range` in
// c-date-picker: resolve it from the stable host attribute first.
const rangeOn = computed(() =>
  host?.hasAttribute('range')
    ? coerceBoolean(host.getAttribute('range'))
    : coerceBoolean(props.range),
);

const pattern = computed(() =>
  isValidPattern(formatResolved.value) ? formatResolved.value : 'HH.mm',
);

const twelve = computed(() => isTwelveHour(pattern.value));

// Typing follows the pattern (ADR-0061); commit still parses leniently.
const timeMask = computed(() => compileTimeMask(pattern.value, periods.value));

// ---- bounds -----------------------------------------------------------------

const UNBOUNDED: CTimePickerBounds = { max: null, min: null };

const bounds = computed(() => readBounds(props.min, props.max) ?? UNBOUNDED);

watch(
  () => [props.min, props.max],
  ([min, max]) => {
    if (readBounds(min, max) === null)
      console.warn(
        `[c-time-picker] min "${min}" is after max "${max}"; both are ignored.`,
      );
  },
  { immediate: true },
);

// ---- the typed field -------------------------------------------------------

const typed = useTypedField({
  codec: {
    format: (time, p) => formatTime(time, p, periods.value),
    isUsable: (time) => inBounds(toMinutes(time), bounds.value),
    isValue: isTime,
    parse: (text, p) => parseTime(text, p, periods.value),
  },
  host,
  label: () => props.label,
  labelOnTop: labelOnTopResolved,
  mask: timeMask,
  names: () => ({ end: t.value.end, start: t.value.start }),
  onOpenRequest: () => openPanel(),
  onTextCommit: (text) => emit('change:text', text),
  pattern,
  placeholder: () => props.placeholder,
  range: rangeOn,
  // An end before the start is an overnight range (ADR-0061).
  reversed: 'keep',
  value: () => props.value,
});

const { commitValue, ends, inputOf, lastInput } = typed;

// The fullscreen panel's picks wait here for Done; every other way out
// discards them (ADR-0066). The columns show them over the committed value.
const pendingValue = ref<null | TypedFieldEnds>(null);

const panelEnds = computed(() => pendingValue.value ?? ends.value);

/** Whether the committed text names no time that can be picked — the value is then `null` (CONTEXT.md "Bad input"). */
const badInput = computed<boolean>(() => typed.badInput.value);

watch(badInput, (on) => setState('bad-input', on), { immediate: true });

// ---- column state ------------------------------------------------------------

// The end the columns edit; always the start outside `range`.
const editing = ref<TypedFieldEnd>('start');

// Where the columns rest while the edited end is empty: the current time on
// the step, inside the bounds. Resting there commits nothing.
const landing = ref(0);

const resetLanding = () => {
  const now = toMinutes(nowTime());

  const hour = Math.floor(now / 60);

  const minute = roundToStep(now % 60, props.minuteStep);

  landing.value = clampToBounds(hour * 60 + minute, bounds.value);
};

const committed = computed<null | number>(() => {
  const time = panelEnds.value[rangeOn.value ? editing.value : 'start'];

  return time ? toMinutes(time) : null;
});

// The time the columns show: the edited end's, else the landing time.
const shown = computed(() => committed.value ?? landing.value);

const columns = computed<CTimePickerColumn[]>(() => {
  const b = bounds.value;

  const time = shown.value;

  const hour = Math.floor(time / 60);

  const minute = time % 60;

  const pm = hour >= 12;

  const picked = committed.value;

  const hours: CTimePickerColumn = {
    kind: 'hour',
    name: t.value.hours,
    rows: hourRows(twelve.value, pm).map((h) => ({
      disabled: hourDisabled(h, b),
      focus: h === hour,
      key: `h${h}`,
      label: hourLabel(h, pattern.value),
      selected: picked !== null && Math.floor(picked / 60) === h,
      value: h,
    })),
  };

  const minutes: CTimePickerColumn = {
    kind: 'minute',
    name: t.value.minutes,
    rows: minuteRows(props.minuteStep, minute).map((m) => ({
      disabled: !inBounds(hour * 60 + m, b),
      focus: m === minute,
      key: `m${m}`,
      label: String(m).padStart(2, '0'),
      selected: picked !== null && picked % 60 === m,
      value: m,
    })),
  };

  if (!twelve.value) return [hours, minutes];

  const period: CTimePickerColumn = {
    kind: 'period',
    name: t.value.period,
    rows: (['am', 'pm'] as const).map((p) => ({
      disabled: periodDisabled(p, b),
      focus: (p === 'pm') === pm,
      key: p,
      label: periods.value[p],
      selected: picked !== null && picked >= 720 === (p === 'pm'),
      value: p === 'pm' ? 12 : 0,
    })),
  };

  return [hours, minutes, period];
});

// ---- committing -------------------------------------------------------------

// Every pick commits (ADR-0062), or in the fullscreen panel becomes the
// pending value (ADR-0066). An empty end fills in its other parts: the hour
// column's resting hour, minute 00, that hour's period.
const pickPart = (kind: CTimePickerColumnKind, value: number) => {
  const base = committed.value;

  const hour = Math.floor((base ?? landing.value) / 60);

  const minute = base === null ? 0 : base % 60;

  let next: number;

  if (kind === 'hour') next = value * 60 + minute;
  else if (kind === 'minute') next = hour * 60 + value;
  else next = ((hour % 12) + value) * 60 + minute;

  // A pick never leaves the bounds: the minute clamps to the bound.
  const time = fromMinutes(clampToBounds(next, bounds.value));

  setEnd(rangeOn.value ? editing.value : 'start', time);
};

const setEnd = (end: TypedFieldEnd, time: string) => {
  if (confirming.value)
    pendingValue.value = { ...panelEnds.value, [end]: time };
  else commitValue({ ...ends.value, [end]: time });
};

const columnEl = (kind: CTimePickerColumnKind) =>
  cardRef.value?.querySelector<HTMLUListElement>(`ul[data-column="${kind}"]`) ??
  null;

const rowEl = (kind: CTimePickerColumnKind) =>
  columnEl(kind)?.querySelector<HTMLElement>('li[tabindex="0"]') ?? null;

// Each column's tab stop, selected row and row count, before a pick changes
// them. A filled-in minute can keep its tab stop: on the hour, the empty
// column already rests on 00.
const snapshotColumns = () =>
  new Map(
    columns.value.map((c) => [
      c.kind,
      {
        count: c.rows.length,
        key: c.rows.find((r) => r.focus)?.key,
        selected: c.rows.find((r) => r.selected)?.key,
      },
    ]),
  );

// After a commit re-renders the rows: focus the picked column's new tab stop
// without the browser's own scroll, and rest every column whose selection the
// pick changed, including a minute filled in or clamped (ADR-0062). A column
// that gained or lost a row (an off-step bound) is measured again first.
const afterPick = (
  kind: CTimePickerColumnKind,
  before: ReturnType<typeof snapshotColumns>,
) =>
  nextTick(() =>
    requestAnimationFrame(() => {
      rowEl(kind)?.focus(focusOptions({ preventScroll: true }));
      restColumnsMoved(before);
    }),
  );

// Rest every column the change moved, once the rows re-render.
const restMoved = (before: ReturnType<typeof snapshotColumns>) =>
  nextTick(() => requestAnimationFrame(() => restColumnsMoved(before)));

const restColumnsMoved = (before: ReturnType<typeof snapshotColumns>) => {
  const behavior = prefersReducedMotion() ? 'instant' : 'smooth';

  for (const column of columns.value) {
    const was = before.get(column.kind);

    const key = column.rows.find((r) => r.focus)?.key;

    const selected = column.rows.find((r) => r.selected)?.key;

    if (
      was &&
      was.key === key &&
      was.selected === selected &&
      was.count === column.rows.length
    )
      continue;

    const list = columnEl(column.kind);

    if (list && was?.count !== column.rows.length) fitColumn(list);

    restColumn(column.kind, behavior);
  }
};

const pick = (kind: CTimePickerColumnKind, value: number) => {
  const before = snapshotColumns();

  pickPart(kind, value);
  afterPick(kind, before);
};

const onRowClick = (kind: CTimePickerColumnKind, row: CTimePickerRow) => {
  if (row.disabled) return;

  pick(kind, row.value);
};

const PAGE = 5;

const onColumnKeyDown = (kind: CTimePickerColumnKind, event: KeyboardEvent) => {
  const rows = columns.value.find((c) => c.kind === kind)?.rows ?? [];

  const at = rows.findIndex((r) => r.focus);

  const enabled = rows
    .map((r, i) => (r.disabled ? -1 : i))
    .filter((i) => i >= 0);

  if (!enabled.length) return;

  // The nearest enabled row at or past `i` in direction `step`, else back.
  const seek = (i: number, step: -1 | 1) => {
    const ahead =
      step > 0
        ? enabled.filter((e) => e >= i)
        : enabled.filter((e) => e <= i).reverse();

    return ahead[0] ?? (step > 0 ? enabled.at(-1)! : enabled[0]);
  };

  let target: null | number = null;

  switch (event.key) {
    case ' ':
      target = at;
      break;
    case 'ArrowDown':
      target = seek(at + 1, 1);
      break;
    case 'ArrowUp':
      target = seek(at - 1, -1);
      break;
    case 'End':
      target = enabled.at(-1)!;
      break;
    case 'Enter':
      event.preventDefault();

      if (rows[at] && !rows[at].disabled) pickPart(kind, rows[at].value);

      pickDone();

      return;
    case 'Home':
      target = enabled[0];
      break;
    case 'PageDown':
      target = seek(Math.min(at + PAGE, rows.length - 1), 1);
      break;
    case 'PageUp':
      target = seek(Math.max(at - PAGE, 0), -1);
      break;
    default:
      return;
  }

  event.preventDefault();

  if (target === null || !rows[target] || rows[target].disabled) return;

  pick(kind, rows[target].value);
};

// ---- the end switch -----------------------------------------------------------

const switchEnd = (end: TypedFieldEnd) => {
  if (editing.value === end) return;

  editing.value = end;
  resetLanding();
  nextTick(() => requestAnimationFrame(() => scrollColumns()));
};

const onEndKeyDown = (event: KeyboardEvent) => {
  const keys: Record<string, TypedFieldEnd> = {
    ArrowLeft: 'start',
    ArrowRight: 'end',
    End: 'end',
    Home: 'start',
  };

  const end = keys[event.key];

  if (!end) return;

  event.preventDefault();
  switchEnd(end);
  nextTick(() =>
    cardRef.value
      ?.querySelector<HTMLElement>(`button[data-end="${end}"]`)
      ?.focus(focusOptions()),
  );
};

// ---- the Now button (ADR-0065) ------------------------------------------------

// The current time, read on open and again on the press.
const now = ref(nowTime());

// Disabled, never hidden, while now is outside `min` / `max`.
const nowDisabled = computed(
  () => !inBounds(toMinutes(now.value), bounds.value),
);

// The exact minute, whatever the minute step; the one commit that closes. In
// the fullscreen panel it only moves the columns there, for Done.
const pickNow = () => {
  now.value = nowTime();

  if (nowDisabled.value) return;

  if (!confirming.value) {
    setEnd(rangeOn.value ? editing.value : 'start', now.value);
    closePanel(true);

    return;
  }

  const before = snapshotColumns();

  setEnd(rangeOn.value ? editing.value : 'start', now.value);
  restMoved(before);
};

// ---- the Done button (ADR-0066) -----------------------------------------------

// Commits the pending value — nothing when there was no pick — and closes.
// It commits before closing: the panel's layout resets as it closes.
const pickDone = () => {
  if (pendingValue.value) commitValue(pendingValue.value);

  closePanel(true);
};

// ---- the panel ---------------------------------------------------------------

const onPanelKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    closePanel(true);

    return;
  }

  // The focus trap (ADR-0058): Tab cycles inside the card.
  if (event.key !== 'Tab' || !cardRef.value) return;

  const stops = Array.from(
    cardRef.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex="0"]',
    ),
  ).filter((el) => el.getClientRects().length > 0);

  if (!stops.length) return;

  const root = cardRef.value.getRootNode();

  const active =
    root instanceof ShadowRoot ? root.activeElement : document.activeElement;

  const index = stops.indexOf(active as HTMLElement);

  const nextIndex = event.shiftKey
    ? index <= 0
      ? stops.length - 1
      : index - 1
    : index === stops.length - 1
      ? 0
      : index + 1;

  event.preventDefault();
  stops[nextIndex].focus(focusOptions());
};

// The selected row rests at the top of an overflowing column (anchored) or
// in the middle of every column (fullscreen), ADR-0062. The room that lets
// the first and last rows get there is list padding measured from the
// column, never blank rows, so the listbox holds only its options. In the
// anchored panel a column that fits never scrolls; in the fullscreen panel
// it gets the room too, so the selections line up however tall the panel is.
const fitColumn = (list: HTMLElement) => {
  // Measure without our own room: a padded scrollHeight would make a
  // fitting column overflow.
  list.style.paddingBlock = '';

  if (layout.value === 'fullscreen') list.style.maxHeight = '';
  else
    applyPeekCap(list, {
      rows: Array.from(list.querySelectorAll<HTMLElement>('li[role="option"]')),
    });

  const row = list.querySelector<HTMLElement>('li[role="option"]');

  if (!row) return;

  const height = list.clientHeight;

  if (layout.value === 'fullscreen') {
    const room = Math.max(0, (height - row.offsetHeight) / 2);

    list.style.paddingBlock = `${room}px`;

    return;
  }

  if (list.scrollHeight <= height) return;

  const room =
    height - row.offsetHeight - parseFloat(getComputedStyle(list).paddingTop);

  list.style.paddingBlockEnd = `${Math.max(0, room)}px`;
};

const restColumn = (kind: CTimePickerColumnKind, behavior: ScrollBehavior) => {
  const list = columnEl(kind);

  const row = rowEl(kind);

  if (!list || !row || list.scrollHeight <= list.clientHeight) return;

  const top =
    layout.value === 'fullscreen'
      ? row.offsetTop + row.offsetHeight / 2 - list.clientHeight / 2
      : row.offsetTop - parseFloat(getComputedStyle(list).paddingTop);

  list.scrollTo({ behavior, top });
};

// Each column opens with its selected row at its resting place, capped on a
// peek row (ADR-0043; the fullscreen layout has no peek).
const scrollColumns = () => {
  for (const column of columns.value) {
    const list = columnEl(column.kind);

    if (list) fitColumn(list);
  }

  for (const column of columns.value) restColumn(column.kind, 'instant');
};

// A layout switch, a rotation or the visual viewport resizing the fullscreen
// panel changes a column's height: measure and rest again.
let resizeObserver: null | ResizeObserver = null;

const observeCard = (on: boolean) => {
  resizeObserver?.disconnect();
  resizeObserver = null;

  if (!on || !cardRef.value) return;

  let first = true;

  // A rAF keeps the re-fit out of the observer callback (the
  // "ResizeObserver loop" error); the first report is the open itself.
  resizeObserver = new ResizeObserver(() => {
    if (first) {
      first = false;

      return;
    }

    requestAnimationFrame(() => scrollColumns());
  });
  resizeObserver.observe(cardRef.value);
};

onBeforeUnmount(() => observeCard(false));

const narrow = useNarrowViewport();

const {
  anchorStyle,
  cardStyle,
  close: closePanel,
  isOpen,
  layout,
  onToggle,
  open: openPanel,
  panelStyle,
} = useAnchoredPanel({
  anchor: typed.anchor,
  disabled: () => props.disabled,
  field: typed.field,
  fullscreen: narrow,
  host,
  matchWidth: false,
  // A pending value leaves nothing behind on any exit but Done.
  onClosed: () => {
    pendingValue.value = null;
  },
  onOpened: () => {
    pageLang.value = document.documentElement.lang;
    editing.value = rangeOn.value ? lastInput.value : 'start';
    pendingValue.value = null;
    now.value = nowTime();
    resetLanding();
    nextTick(() =>
      requestAnimationFrame(() => {
        scrollColumns();
        rowEl('hour')?.focus(focusOptions({ preventScroll: true }));
        observeCard(true);
      }),
    );
  },
  panel: panelRef,
  returnFocusTo: () => inputOf(lastInput.value),
});

watch(isOpen, (open) => {
  if (!open) observeCard(false);
});

// The fullscreen panel collects picks for its Done button (ADR-0066).
const confirming = computed(() => layout.value === 'fullscreen');

const ui = computed(() =>
  timePicker({ fullscreen: layout.value === 'fullscreen' }),
);

const onClockClick = (event: Event) => {
  event.stopPropagation();

  if (isOpen.value) {
    closePanel(true);

    return;
  }

  typed.commitAll();
  openPanel();
};

defineExpose({ badInput });
</script>

<!--
  Escape-hatch CSS: only constructs Tailwind utilities cannot express.
    - `:host{display:block}` — the field is a real box.
    - `[part='panel'] position-try-fallbacks` and the two `@position-try`
      rules — `useAnchoredPanel`'s per-shadow-root half, identical in every
      consumer (c-autocomplete, c-tree-select, c-date-picker).
    - the popover open animation keyframe.
    - `::placeholder` — a native pseudo-element.
-->
<style>
:host {
  display: block;
}

@position-try --c-field-panel-above {
  position-area: top span-right;
  margin-top: 0;
  margin-bottom: calc(-1 * var(--_c-field-panel-top-offset, 0px));
}

@position-try --c-field-panel-above-left {
  position-area: top span-left;
  margin-top: 0;
  margin-bottom: calc(-1 * var(--_c-field-panel-top-offset, 0px));
}

[part='panel'] {
  position-try-fallbacks:
    --c-field-panel-above, flip-inline, --c-field-panel-above-left;
}

[part='panel']:popover-open {
  animation: c-time-picker-fade-in 0.12s ease-out;
}

.c-typed-field__input::placeholder {
  color: var(--c-on-surface-faint);
  opacity: 1;
}

@keyframes c-time-picker-fade-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
