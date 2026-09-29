<template>
  <!-- Anchor wrapper: a shadow-DOM box around the value field. CSS anchor
       names are tree-scoped, so the anchor must live in the same shadow root
       as the panel (`useAnchoredPanel`). -->
  <span ref="anchorRef" :style="anchorStyle" class="block w-full">
    <c-input
      ref="cInputRef"
      :active="focused || isOpen"
      :data-hide-details="String(hideDetailsResolved)"
      :disabled
      :error-message
      :filled="hasText"
      :hint
      :input-id
      :label
      :label-on-top="labelOnTopResolved"
      :required
      :shadow="shadowResolved"
      :size="sizeResolved"
      :valid
    >
      <!-- The editable field (ADR-0058): typing never opens the panel. Under
           `range` a second input holds the end, both in one field box. -->
      <div
        :class="ui.content()"
        class="c-input__content"
        @focusin="focused = true"
        @focusout="onFocusOut"
      >
        <input
          :id="inputId"
          ref="startRef"
          :aria-invalid="!valid || badStart || undefined"
          :aria-label="inputLabel('start')"
          :class="ui.input({ start: rangeOn })"
          :disabled
          :name="name || undefined"
          :placeholder="effectivePlaceholder"
          :required
          :style="startWidth"
          :value="startText"
          autocomplete="off"
          inputmode="numeric"
          part="input"
          type="text"
          @blur="commitText('start')"
          @input="onTextInput('start', $event)"
          @keydown="onInputKeyDown('start', $event)"
        />

        <template v-if="rangeOn">
          <span
            :class="ui.separator({ hidden: !showSeparator })"
            aria-hidden="true"
            part="separator"
          >
            –
          </span>

          <input
            ref="endRef"
            :aria-invalid="!valid || badEnd || undefined"
            :aria-label="inputLabel('end')"
            :class="ui.input()"
            :disabled
            :placeholder="effectivePlaceholder"
            :value="endText"
            autocomplete="off"
            inputmode="numeric"
            part="input"
            type="text"
            @blur="commitText('end')"
            @input="onTextInput('end', $event)"
            @keydown="onInputKeyDown('end', $event)"
          />
        </template>
      </div>

      <span slot="post" :class="ui.post()">
        <c-icon-button
          v-if="clearable && hasContent"
          :aria-label="t.clearSelection"
          :disabled
          size="x-small"
          text
          @click="onClear"
        >
          <c-icon :path="mdiClose" :size="20" />
        </c-icon-button>

        <c-icon-button
          ref="calendarButtonRef"
          :aria-label="t.openCalendar"
          :disabled
          aria-haspopup="dialog"
          size="x-small"
          text
          @click="onCalendarClick"
        >
          <c-icon :path="mdiCalendar" :size="20" />
        </c-icon-button>
      </span>
    </c-input>
  </span>

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
    <!-- A dialog (ADR-0058): real DOM focus moves onto the day grid and Tab
         cycles inside the card. -->
    <div
      ref="cardRef"
      :aria-label="label || t.chooseDate"
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
        :heading="label || t.chooseDate"
        @close="closePanel(true)"
      />

      <div :class="ui.visuallyHidden()" aria-atomic="true" aria-live="polite">
        {{ statusText }}
      </div>

      <div :class="ui.calendar()">
        <!-- MD3 docked anatomy: a month control and a year control, each
             with its own arrows; the ▾ buttons swap in the month or year
             list. While a list is open the other control and the arrows fade
             out but keep their space, so the open ▾ button stays put. -->
        <div :class="ui.header()" part="header">
          <div :class="ui.control({ hidden: view === 'years' })">
            <button
              :aria-label="t.previousMonth"
              :class="ui.arrow({ hidden: view !== 'days' })"
              :disabled="!canStep(-1)"
              part="previous-month"
              type="button"
              @click="stepMonth(-1)"
            >
              <svg :class="ui.icon()" aria-hidden="true" viewBox="0 0 24 24">
                <path :d="mdiChevronLeft" />
              </svg>
            </button>

            <button
              :aria-expanded="view === 'months'"
              :aria-label="`${t.selectMonth}: ${names.monthsShort[displayed.m - 1]}`"
              :class="ui.viewButton()"
              aria-haspopup="listbox"
              part="month-button"
              type="button"
              @click="toggleView('months')"
            >
              <!-- Every name in one cell, only the displayed one visible: the
                   button keeps the widest name's width, so the arrows never
                   shift from month to month. -->
              <span :class="ui.monthNames()">
                <span
                  v-for="(short, i) in names.monthsShort"
                  :key="i"
                  :aria-hidden="i !== displayed.m - 1 || undefined"
                  :class="ui.monthName({ hidden: i !== displayed.m - 1 })"
                >
                  {{ short }}
                </span>
              </span>

              <svg
                :class="ui.caret({ open: view === 'months' })"
                aria-hidden="true"
                viewBox="0 0 24 24"
              >
                <path :d="mdiMenuDown" />
              </svg>
            </button>

            <button
              :aria-label="t.nextMonth"
              :class="ui.arrow({ hidden: view !== 'days' })"
              :disabled="!canStep(1)"
              part="next-month"
              type="button"
              @click="stepMonth(1)"
            >
              <svg :class="ui.icon()" aria-hidden="true" viewBox="0 0 24 24">
                <path :d="mdiChevronRight" />
              </svg>
            </button>
          </div>

          <div :class="ui.control({ hidden: view === 'months' })">
            <button
              :aria-label="t.previousYear"
              :class="ui.arrow({ hidden: view !== 'days' })"
              :disabled="!canStep(-12)"
              part="previous-year"
              type="button"
              @click="stepMonth(-12)"
            >
              <svg :class="ui.icon()" aria-hidden="true" viewBox="0 0 24 24">
                <path :d="mdiChevronLeft" />
              </svg>
            </button>

            <button
              :aria-expanded="view === 'years'"
              :aria-label="`${t.selectYear}: ${displayed.y}`"
              :class="ui.viewButton()"
              aria-haspopup="listbox"
              part="year-button"
              type="button"
              @click="toggleView('years')"
            >
              {{ displayed.y }}
              <svg
                :class="ui.caret({ open: view === 'years' })"
                aria-hidden="true"
                viewBox="0 0 24 24"
              >
                <path :d="mdiMenuDown" />
              </svg>
            </button>

            <button
              :aria-label="t.nextYear"
              :class="ui.arrow({ hidden: view !== 'days' })"
              :disabled="!canStep(12)"
              part="next-year"
              type="button"
              @click="stepMonth(12)"
            >
              <svg :class="ui.icon()" aria-hidden="true" viewBox="0 0 24 24">
                <path :d="mdiChevronRight" />
              </svg>
            </button>
          </div>
        </div>

        <div ref="bodyRef" :class="ui.body()">
          <!-- One transition for every body swap: the day grid slides to a
               neighbouring month, and the month / year list drops in over
               it. The outgoing element is inert while it animates out. -->
          <transition :css="false" @enter="onBodyEnter" @leave="onBodyLeave">
            <!-- The day grid: one roving tab stop, real DOM focus. -->
            <table
              v-if="view === 'days'"
              :key="displayedMonth"
              ref="gridRef"
              :aria-label="`${names.months[displayed.m - 1]} ${displayed.y}`"
              :class="ui.grid()"
              part="grid"
              role="grid"
              @pointerleave="hoverDate = null"
            >
              <thead>
                <tr>
                  <th
                    v-if="showWeekNumbersResolved"
                    :class="ui.weekHead()"
                    scope="col"
                  >
                    <span :class="ui.visuallyHidden()">{{ t.weekNumber }}</span>
                  </th>

                  <th
                    v-for="day in weekdayOrder"
                    :key="day"
                    :abbr="names.weekdays[day]"
                    :class="ui.weekday()"
                    part="weekday"
                    scope="col"
                  >
                    {{ names.weekdaysShort[day] }}
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(week, r) in weeks" :key="r">
                  <th
                    v-if="showWeekNumbersResolved"
                    :class="ui.weekNumber()"
                    part="week-number"
                    scope="row"
                  >
                    {{ weekNumbers[r] }}
                  </th>

                  <template v-for="(iso, c) in week" :key="c">
                    <td v-if="!iso" :class="ui.blank()" role="gridcell" />

                    <td
                      v-else
                      :aria-current="iso === today ? 'date' : undefined"
                      :aria-disabled="isDisabled(iso) || undefined"
                      :aria-label="cellLabel(iso)"
                      :aria-selected="isSelected(iso)"
                      :class="cellUi(iso).cell()"
                      :data-date="iso"
                      :tabindex="iso === focusedDate ? 0 : -1"
                      part="cell"
                      role="gridcell"
                      @click="onCellClick(iso)"
                      @keydown="onGridKeyDown"
                      @pointerenter="hoverDate = iso"
                    >
                      <span
                        v-if="band(iso)"
                        :class="cellUi(iso).band()"
                        aria-hidden="true"
                        part="range-band"
                      />

                      <span :class="cellUi(iso).day()" part="day">
                        {{ Number(iso.slice(8)) }}
                      </span>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>

            <!-- The month or year list: swapped in for the grid, never a nested
               popover (ADR-0058). A transient list panel: hidden scrollbar and
               a peek (ADR-0043). -->
            <ul
              v-else
              :key="view"
              ref="listRef"
              :aria-label="view === 'months' ? t.selectMonth : t.selectYear"
              :class="ui.list()"
              part="list"
              role="listbox"
            >
              <li
                v-for="(option, i) in listOptions"
                :key="option.key"
                :aria-disabled="option.disabled || undefined"
                :aria-selected="option.selected"
                :class="ui.option({ disabled: option.disabled })"
                :data-index="i"
                :tabindex="i === listIndex ? 0 : -1"
                part="option"
                role="option"
                @click="pickOption(i)"
                @keydown="onListKeyDown"
              >
                <svg
                  :class="ui.check({ hidden: !option.selected })"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path :d="mdiCheck" />
                </svg>
                {{ option.name }}
              </li>
            </ul>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { CFieldSize } from '../../types';

/** One entry of `disabled-dates`: an ISO date, or an inclusive `{ start, end }` span of them. */
export type CDatePickerDisabledDate = { end: string; start: string } | string;

export interface CDatePickerProps {
  /**
   * Make the value clearable
   */
  clearable?: boolean;
  /**
   * Disable the field
   */
  disabled?: boolean;
  /**
   * Dates that cannot be picked: ISO dates and inclusive `{ start, end }`
   * spans. Arrays have no attribute form — bind as a DOM property
   */
  disabledDates?: CDatePickerDisabledDate[];
  /**
   * Error message shown in place of the hint while the field is invalid
   *
   * @freeform
   */
  errorMessage?: string;
  /**
   * First day of the week in the calendar, numbered like `Date.getDay()`:
   * 0 = Sunday, 1 = Monday … 6 = Saturday
   *
   * @defaultable 1
   */
  firstDayOfWeek?: CDatePickerWeekday;
  /**
   * How dates are shown and read from typing: a pattern of the tokens `d`,
   * `dd`, `M`, `MM` and `yyyy` with any separators, e.g. `yyyy-MM-dd`
   *
   * @defaultable 'dd.MM.yyyy'
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
   * Predicate for dates that cannot be picked (weekends, say); receives an
   * ISO date. Functions have no attribute form — bind as a DOM property
   */
  isDateDisabled?: (iso: string) => boolean;
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
   * The latest date that can be picked or typed, as an ISO date; also bounds
   * the calendar's navigation
   *
   * @freeform
   */
  max?: string;
  /**
   * The earliest date that can be picked or typed, as an ISO date; also
   * bounds the calendar's navigation
   *
   * @freeform
   */
  min?: string;
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
   * Show ISO 8601 week numbers beside the calendar rows (meaningful with a
   * Monday week start)
   *
   * @defaultable false
   */
  showWeekNumbers?: boolean;
  /**
   * Field height: the 52px default (the shared control height) or the 36px `small` box
   *
   * @defaultable 'default'
   */
  size?: CFieldSize;
  /**
   * UI text overrides (i18n), merged over the names `Intl` gives for the
   * page's `lang` and the English defaults. Objects have no attribute form —
   * bind as a DOM property
   *
   * @defaultable {}
   */
  texts?: CDatePickerTexts;
  /**
   * Set the validity of the field
   */
  valid?: boolean;
  /**
   * The date as an ISO `YYYY-MM-DD` string, or `{ start, end }` under
   * `range`; `null` when empty
   */
  value?: CDatePickerValue;
}

/** A date range: ISO `YYYY-MM-DD` ends, either of which may be `null` while only one is typed. */
export interface CDatePickerRange {
  /** The last day of the range, inclusive. */
  end: null | string;
  /** The first day of the range. */
  start: null | string;
}

/**
 * The text committed from the field, as typed: a string, or both ends'
 * texts under `range`.
 */
export type CDatePickerText = { end: string; start: string } | string;

/**
 * UI texts of `c-date-picker`, merged key by key over the names `Intl`
 * gives for the page's `lang` and the English defaults. Weekday arrays are
 * indexed like `Date.getDay()`: Sunday first.
 */
export interface CDatePickerTexts {
  /** Accessible name of the dialog when the field has no label. */
  chooseDate?: string;
  /** Accessible label of the clear button. */
  clearSelection?: string;
  /** Accessible label of the close button in the fullscreen panel (narrow viewports). */
  closePanel?: string;
  /** A day's accessible name in the grid; receives the ISO date. */
  date?: (iso: string) => string;
  /** Accessible name of the end input under `range`. */
  end?: string;
  /** Twelve month names, January first. */
  months?: string[];
  /** Twelve short month names, January first — shown on the month button. */
  monthsShort?: string[];
  /** Accessible label of the next-month arrow. */
  nextMonth?: string;
  /** Accessible label of the next-year arrow. */
  nextYear?: string;
  /** Accessible label of the calendar button. */
  openCalendar?: string;
  /** Announcement once a range's first day is picked; receives that day's name. */
  pendingStart?: (date: string) => string;
  /** Accessible label of the previous-month arrow. */
  previousMonth?: string;
  /** Accessible label of the previous-year arrow. */
  previousYear?: string;
  /** Accessible label of the month button and the month list. */
  selectMonth?: string;
  /** Accessible label of the year button and the year list. */
  selectYear?: string;
  /** Accessible name of the start input under `range`. */
  start?: string;
  /** Appended to the accessible name of a day that cannot be picked. */
  unavailable?: string;
  /** Seven weekday names, Sunday first. */
  weekdays?: string[];
  /** Seven short weekday names, Sunday first — the grid's column heads. */
  weekdaysShort?: string[];
  /** Accessible name of the week-number column. */
  weekNumber?: string;
}

/**
 * Value of `c-date-picker`: an ISO `YYYY-MM-DD` string, a
 * {@link CDatePickerRange} under `range`, or `null` when empty.
 */
export type CDatePickerValue = CDatePickerRange | null | string;

/** A day of the week numbered like `Date.getDay()`: 0 = Sunday … 6 = Saturday. */
export type CDatePickerWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
</script>

<script setup lang="ts">
/**
 * @csspart input - The text input; under `range` both the start and the end input
 * @csspart separator - The dash between the start and end inputs under `range`
 * @csspart panel - The top-layer popover container anchored below the field
 * @csspart card - The dialog surface inside the panel holding the header and the calendar body
 * @csspart heading-row - The top row of the fullscreen panel (narrow viewports): the field label as heading and the close button
 * @csspart heading - The field label naming the fullscreen panel
 * @csspart close - The close button of the fullscreen panel
 * @csspart header - The row of month and year controls above the calendar body
 * @csspart previous-month - The arrow to the previous month
 * @csspart next-month - The arrow to the next month
 * @csspart month-button - The button showing the displayed month that opens the month list
 * @csspart previous-year - The arrow to the same month a year earlier
 * @csspart next-year - The arrow to the same month a year later
 * @csspart year-button - The button showing the displayed year that opens the year list
 * @csspart grid - The day grid of the displayed month
 * @csspart weekday - A weekday column head in the grid
 * @csspart week-number - An ISO week number beside a grid row (`show-week-numbers`)
 * @csspart cell - One day's cell in the grid
 * @csspart day - The circle showing a day's number inside its cell
 * @csspart range-band - The strip joining a range's days behind their circles
 * @csspart list - The month or year list swapped in for the grid
 * @csspart option - One month or year in the list
 *
 * @cssstate bad-input - Present while committed text names no date that can be picked
 */
import {
  mdiCalendar,
  mdiCheck,
  mdiChevronLeft,
  mdiChevronRight,
  mdiClose,
  mdiMenuDown,
} from '@mdi/js';
import { tv } from 'tailwind-variants';
import {
  computed,
  nextTick,
  ref,
  useHost,
  useId,
  useTemplateRef,
  watch,
} from 'vue';

import { useAppDefault } from '../../shared/appDefaults';
import { coerceBoolean } from '../../shared/coerceBoolean';
import { emitModelChange } from '../../shared/emitModelValue';
import PanelHeadingRow from '../../shared/PanelHeadingRow.vue';
import { applyPeekCap } from '../../shared/peekCap';
import { useAnchoredPanel } from '../../shared/useAnchoredPanel';
import { useHostEmit } from '../../shared/useHostEmit';
import { useHostStates } from '../../shared/useHostStates';
import { useNarrowViewport } from '../../shared/useNarrowViewport';
import { useStatusAnnouncer } from '../../shared/useStatusAnnouncer';
import {
  addDays,
  addMonths,
  type CDatePickerDisabling,
  dayOfWeek,
  daysInMonth,
  firstOfMonth,
  formatDate,
  fromIso,
  intlNames,
  isDisabledDate,
  isIso,
  isOutOfRange,
  isValidPattern,
  monthMatrix,
  monthOf,
  parseDate,
  rowWeek,
  todayIso,
  toIso,
} from './dates';

type CDatePickerEnd = 'end' | 'start';

/** Events dispatched by `<c-date-picker>`. */
interface CDatePickerEvents {
  /**
   * Fired when the value changes — a day or range is picked, typed text is
   * committed, or the field is cleared — carrying the new value: an ISO
   * date, `{ start, end }` under `range`, or `null`.
   */
  change: CDatePickerValue;
  /**
   * Fired with the displayed month as `YYYY-MM` whenever it changes, and
   * when the panel opens — the signal to load that month's `disabled-dates`.
   */
  'change:month': string;
  /**
   * Fired on every commit of typed text (Enter or leaving the input) with the
   * text as typed — `{ start, end }` under `range`. Read `badInput` to tell
   * whether it named a date that can be picked.
   */
  'change:text': CDatePickerText;
  /**
   * Native bubbling input event dispatched alongside every value change so a
   * plain `v-model` stays in sync. Carries no detail.
   */
  input: void;
  /**
   * Fired alongside `change` with the same detail — the `v-model` contract.
   */
  'update:value': CDatePickerValue;
}

/** How the calendar body animates its next swap; `null` swaps instantly. */
type CDatePickerMotion = 'list-in' | 'list-out' | 'next' | 'prev' | null;

type CDatePickerView = 'days' | 'months' | 'years';

/**
 * c-date-picker is a typeable date field with a calendar panel (CONTEXT.md
 * "Date picker", ADR-0057, ADR-0058). Consumer customization is via
 * `::part()` and `:state(bad-input)`.
 */
const datePicker = tv({
  slots: {
    arrow:
      'flex size-9 transition-[opacity,visibility] duration-150 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-on-surface-muted outline-none hover:not-disabled:bg-primary-subtle-hover hover:not-disabled:text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary disabled:cursor-default disabled:opacity-40',
    blank: 'p-0',
    // As tall as its content: the day grid's weeks (four to six). An open
    // list holds the height the grid had (`onBodyEnter`).
    body: 'relative overflow-hidden',
    calendar: 'flex flex-col px-3 pb-3',
    card: 'flex flex-col w-[328px] overflow-hidden rounded-csc-md bg-surface-overlay text-on-surface shadow-[2px_4px_10px_#00000029]',
    caret: 'size-5 shrink-0 fill-current transition-transform duration-200',
    check: 'size-4 shrink-0 fill-current text-primary',
    content: 'flex items-center w-full min-w-0 gap-1',
    control: 'flex items-center transition-[opacity,visibility] duration-150',
    grid: 'w-full table-fixed border-collapse',
    header: 'flex items-center justify-between gap-2 min-h-14 px-1',
    icon: 'size-6 fill-current',
    // The value text colour is set explicitly, as in c-text-field: c-input
    // drives an inheritable `color` for its state cascade.
    input:
      'c-date-picker__input bg-transparent border-0 outline-none m-0 [font:inherit] text-base leading-5 text-on-surface disabled:text-on-surface-muted [caret-color:var(--c-primary)] flex-auto min-w-0 w-full py-2 max-h-8 tabular-nums',
    list: 'list-none m-0 p-1 h-full overflow-y-auto scrollbar-hidden overscroll-none outline-none',
    monthName: '[grid-area:1/1]',
    monthNames: 'grid justify-items-center',
    option:
      'flex items-center gap-3 min-h-10 px-3 rounded text-sm text-on-surface cursor-pointer select-none outline-none hover:bg-primary-subtle-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary aria-selected:bg-primary-subtle aria-selected:text-primary aria-selected:font-medium',
    panel:
      'fixed m-0 p-0 border-0 bg-transparent overflow-visible [inset:auto]',
    post: 'inline-flex items-center gap-0.5 -mr-1.5',
    separator: 'shrink-0 mx-1 text-on-surface-muted',
    viewButton:
      'flex items-center gap-0.5 h-9 cursor-pointer rounded-full border-0 bg-transparent pl-3 pr-1.5 text-sm font-medium text-on-surface [font-family:var(--c-font-family)] outline-none hover:bg-primary-subtle-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary tabular-nums',
    visuallyHidden:
      'absolute w-px h-px p-0 overflow-hidden border-0 whitespace-nowrap [clip:rect(0_0_0_0)]',
    weekday: 'h-9 p-0 text-center text-xs font-medium text-on-surface-muted',
    weekHead: 'h-9 w-8',
    weekNumber:
      'h-10 w-8 p-0 text-center text-xs font-normal tabular-nums text-on-surface-faint',
  },
  variants: {
    disabled: {
      true: {
        option: 'cursor-default text-on-surface-faint hover:bg-transparent',
      },
    },
    fullscreen: {
      true: {
        body: 'flex-1 h-auto min-h-[280px]',
        calendar: 'flex-1 min-h-0 w-full max-w-[400px] mx-auto',
        card: 'w-auto max-h-none rounded-none shadow-none',
        list: 'absolute inset-0 h-auto',
        panel: 'bg-surface-overlay overflow-hidden',
      },
    },
    // A header item faded out while a list is open: it keeps its space.
    hidden: {
      true: {
        arrow: 'invisible opacity-0',
        check: 'invisible',
        control: 'invisible opacity-0',
        monthName: 'invisible',
        separator: 'invisible',
      },
    },
    open: { true: { caret: 'rotate-180' } },
    // The range start is as wide as its text, so the separator follows it
    // with even space both sides; the end input fills the rest.
    start: { true: { input: 'flex-none w-auto [field-sizing:content]' } },
  },
});

// One cell's look: MD3 shapes on the semantic tokens.
const dayCell = tv({
  compoundVariants: [
    { class: { day: 'text-primary' }, selected: false, today: true },
  ],
  defaultVariants: {
    band: 'none',
    disabled: false,
    selected: false,
    today: false,
  },
  slots: {
    band: 'absolute inset-y-0 bg-primary-subtle',
    cell: 'group relative h-10 p-0 text-center cursor-pointer outline-none',
    day: 'relative inline-flex size-10 items-center justify-center rounded-full text-sm tabular-nums text-on-surface transition-colors duration-150 group-hover:bg-primary-subtle-hover group-focus-visible:outline-2 group-focus-visible:outline-offset-0 group-focus-visible:outline-primary',
  },
  variants: {
    band: {
      end: { band: 'left-0 right-1/2' },
      middle: { band: 'inset-x-0' },
      none: {},
      start: { band: 'left-1/2 right-0' },
    },
    disabled: {
      true: {
        cell: 'cursor-default',
        day: 'text-on-surface-faint group-hover:bg-transparent',
      },
    },
    selected: {
      true: {
        day: 'bg-primary text-on-primary font-medium group-hover:bg-primary-hover',
      },
    },
    today: { true: { day: 'border border-solid border-primary' } },
  },
});

// Two root nodes (anchor wrapper + panel): keep fallthrough attrs on the host.
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CDatePickerProps>(), {
  clearable: false,
  disabled: false,
  disabledDates: () => [],
  errorMessage: '',
  firstDayOfWeek: undefined,
  format: undefined,
  hideDetails: undefined,
  hint: '',
  hostId: '',
  isDateDisabled: undefined,
  label: '',
  labelOnTop: undefined,
  max: '',
  min: '',
  name: '',
  placeholder: '',
  range: false,
  required: false,
  shadow: undefined,
  showWeekNumbers: undefined,
  size: undefined,
  texts: undefined,
  valid: true,
  value: null,
});

const host = useHost();

const emit = useHostEmit<CDatePickerEvents>();

const setState = useHostStates();

const appDefault = useAppDefault('c-date-picker', props);

const firstDayResolved = appDefault('firstDayOfWeek', 1);

const formatResolved = appDefault('format', 'dd.MM.yyyy');

const hideDetailsResolved = appDefault('hideDetails', false);

const labelOnTopResolved = appDefault('labelOnTop', false);

const shadowResolved = appDefault('shadow', false);

const showWeekNumbersResolved = appDefault('showWeekNumbers', false);

const sizeResolved = appDefault('size', 'default');

// ---- texts: own → app default → Intl for the page's lang → English -------

const ENGLISH_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const ENGLISH_WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const DEFAULT_TEXTS: Required<CDatePickerTexts> = {
  chooseDate: 'Choose date',
  clearSelection: 'Clear selection',
  closePanel: 'Close',
  date: (iso) => {
    const { d, m, y } = fromIso(iso)!;

    return `${ENGLISH_WEEKDAYS[dayOfWeek(iso)]} ${d} ${ENGLISH_MONTHS[m - 1]} ${y}`;
  },
  end: 'End date',
  months: ENGLISH_MONTHS,
  monthsShort: ENGLISH_MONTHS.map((name) => name.slice(0, 3)),
  nextMonth: 'Next month',
  nextYear: 'Next year',
  openCalendar: 'Open calendar',
  pendingStart: (date) => `${date} selected as the start. Choose the end date.`,
  previousMonth: 'Previous month',
  previousYear: 'Previous year',
  selectMonth: 'Choose month',
  selectYear: 'Choose year',
  start: 'Start date',
  unavailable: 'unavailable',
  weekdays: ENGLISH_WEEKDAYS,
  weekdaysShort: ENGLISH_WEEKDAYS.map((name) => name.slice(0, 2)),
  weekNumber: 'Week',
};

// Own texts merged over the app default (the resolver's per-key merge).
const ownTexts = appDefault('texts', {} as Required<CDatePickerTexts>);

// The page's language, read once per open (a `lang` change re-reads).
const pageLang = ref(
  typeof document === 'undefined' ? '' : document.documentElement.lang,
);

const t = computed<Required<CDatePickerTexts>>(() => ({
  ...DEFAULT_TEXTS,
  ...(intlNames(pageLang.value) ?? {}),
  ...Object.fromEntries(
    Object.entries(ownTexts.value).filter(([, v]) => v !== undefined),
  ),
}));

// Arrays of the wrong length fall back to English rather than render holes.
const names = computed(() => ({
  months: t.value.months.length === 12 ? t.value.months : ENGLISH_MONTHS,
  monthsShort:
    t.value.monthsShort.length === 12
      ? t.value.monthsShort
      : DEFAULT_TEXTS.monthsShort,
  weekdays: t.value.weekdays.length === 7 ? t.value.weekdays : ENGLISH_WEEKDAYS,
  weekdaysShort:
    t.value.weekdaysShort.length === 7
      ? t.value.weekdaysShort
      : DEFAULT_TEXTS.weekdaysShort,
}));

// ---- refs -----------------------------------------------------------------

const anchorRef = useTemplateRef<HTMLElement>('anchorRef');

const bodyRef = useTemplateRef<HTMLElement>('bodyRef');

const cardRef = useTemplateRef<HTMLElement>('cardRef');

const cInputRef = useTemplateRef<HTMLElement>('cInputRef');

const endRef = useTemplateRef<HTMLInputElement>('endRef');

const gridRef = useTemplateRef<HTMLTableElement>('gridRef');

const listRef = useTemplateRef<HTMLUListElement>('listRef');

const panelRef = useTemplateRef<HTMLElement>('panelRef');

const startRef = useTemplateRef<HTMLInputElement>('startRef');

const autoId = useId();

const inputId = computed(() => props.hostId || autoId);

// Same defineCustomElement Boolean-attribute quirk as `allow-branch` in
// c-tree-select: resolve `range` from the stable host attribute first.
const rangeOn = computed(() =>
  host?.hasAttribute('range')
    ? coerceBoolean(host.getAttribute('range'))
    : coerceBoolean(props.range),
);

const pattern = computed(() =>
  isValidPattern(formatResolved.value) ? formatResolved.value : 'dd.MM.yyyy',
);

const effectivePlaceholder = computed(() => {
  if (!labelOnTopResolved.value && props.label && !focused.value)
    return undefined;

  return props.placeholder || pattern.value;
});

// ---- disabling --------------------------------------------------------------

const bounds = computed(() => ({
  max: isIso(props.max) ? props.max : null,
  min: isIso(props.min) ? props.min : null,
}));

const rules = computed<CDatePickerDisabling>(() => ({
  ...bounds.value,
  isDateDisabled: props.isDateDisabled,
  list: props.disabledDates ?? [],
}));

const isDisabled = (iso: string) => isDisabledDate(iso, rules.value);

const clamp = (iso: string): string => {
  const { max, min } = bounds.value;

  if (min && iso < min) return min;

  if (max && iso > max) return max;

  return iso;
};

// ---- value ------------------------------------------------------------------

type Ends = { end: null | string; start: null | string };

// Vue's `v-model` on a custom element writes `el.value = ''` for a `null`
// model (vModelText): the empty string, like any non-date, is "no date".
const normalize = (v: unknown): Ends => {
  if (v && typeof v === 'object') {
    const r = v as Partial<CDatePickerRange>;

    return {
      end: isIso(r.end) ? r.end : null,
      start: isIso(r.start) ? r.start : null,
    };
  }

  return { end: null, start: isIso(v) ? v : null };
};

const ends = ref<Ends>(normalize(props.value));

const sameEnds = (a: Ends, b: Ends) => a.start === b.start && a.end === b.end;

const toValue = (e: Ends): CDatePickerValue => {
  if (!rangeOn.value) return e.start;

  return e.start === null && e.end === null
    ? null
    : { end: e.end, start: e.start };
};

const startText = ref('');

// The separator shows only beside something: text or the placeholders. An
// empty field under its floating label shows neither.
const showSeparator = computed(
  () => !!(startText.value || endText.value || effectivePlaceholder.value),
);

const fieldSizing =
  typeof CSS !== 'undefined' && CSS.supports('field-sizing', 'content');

// A width for the range start where `field-sizing` cannot give one: while it
// shows no text at all (the floating label hides the placeholder), and in a
// browser without `field-sizing` (Firefox 140 ESR).
const startWidth = computed(() => {
  if (!rangeOn.value) return undefined;

  const text = startText.value || effectivePlaceholder.value;

  if (text && fieldSizing) return undefined;

  return { width: `${(text || pattern.value).length}ch` };
});

const endText = ref('');

// The text last committed per end; a blur without an edit commits nothing.
const committedText = { end: '', start: '' };

const badStart = ref(false);

const badEnd = ref(false);

/** Whether the committed text names no date that can be picked — the value is then `null` (CONTEXT.md "Bad input"). */
const badInput = computed<boolean>(() => badStart.value || badEnd.value);

watch(badInput, (on) => setState('bad-input', on), { immediate: true });

const syncTexts = () => {
  startText.value = ends.value.start
    ? formatDate(ends.value.start, pattern.value)
    : '';
  endText.value = ends.value.end
    ? formatDate(ends.value.end, pattern.value)
    : '';
  committedText.start = startText.value;
  committedText.end = endText.value;
  badStart.value = false;
  badEnd.value = false;
};

syncTexts();

// External value updates re-sync the field. The mirror `emitModelChange`
// writes onto `host.value` re-enters here with what we already hold — a
// no-op, so bad-input text typed by the user survives its own commit. Never
// emits.
watch(
  () => props.value,
  (v) => {
    const next = normalize(v);

    if (sameEnds(next, ends.value)) return;

    ends.value = next;
    syncTexts();
  },
);

watch(pattern, () => {
  if (!badStart.value && ends.value.start)
    startText.value = formatDate(ends.value.start, pattern.value);

  if (!badEnd.value && ends.value.end)
    endText.value = formatDate(ends.value.end, pattern.value);

  committedText.start = startText.value;
  committedText.end = endText.value;
});

const hasText = computed(() => !!(startText.value || endText.value));

const hasContent = computed(
  () => hasText.value || ends.value.start !== null || ends.value.end !== null,
);

const setEnds = (next: Ends) => {
  if (sameEnds(next, ends.value)) return;

  ends.value = next;
  emitModelChange(host, toValue(next));
};

// ---- the field --------------------------------------------------------------

const focused = ref(false);

// The input focus returns to when the panel closes.
const lastInput = ref<CDatePickerEnd>('start');

const inputOf = (end: CDatePickerEnd) =>
  end === 'end' ? endRef.value : startRef.value;

const inputLabel = (end: CDatePickerEnd) => {
  if (!rangeOn.value) return props.label || undefined;

  const which = end === 'end' ? t.value.end : t.value.start;

  return props.label ? `${props.label}, ${which}` : which;
};

const onFocusOut = (event: FocusEvent) => {
  const next = event.relatedTarget as Node | null;

  if (!next || !(event.currentTarget as HTMLElement).contains(next))
    focused.value = false;
};

const onTextInput = (end: CDatePickerEnd, event: Event) => {
  const text = (event.target as HTMLInputElement).value;

  if (end === 'end') endText.value = text;
  else startText.value = text;
};

// Commit typed text (ADR-0057): on Enter or blur, never per keystroke.
const commitText = (end: CDatePickerEnd) => {
  const text = end === 'end' ? endText.value : startText.value;

  if (text === committedText[end]) return;

  committedText[end] = text;

  const parsed = parseDate(text, pattern.value);

  const usable = parsed !== null && !isDisabled(parsed) ? parsed : null;

  const bad = text.trim() !== '' && usable === null;

  if (end === 'end') badEnd.value = bad;
  else badStart.value = bad;

  const next: Ends = { ...ends.value, [end]: usable };

  // A reversed range swaps its ends, texts and all.
  if (rangeOn.value && next.start && next.end && next.start > next.end) {
    [next.start, next.end] = [next.end, next.start];
  }

  // Reformat what was read ("1.9.2026" → "01.09.2026").
  if (next.start && !badStart.value)
    startText.value = formatDate(next.start, pattern.value);

  if (next.end && !badEnd.value)
    endText.value = formatDate(next.end, pattern.value);

  committedText.start = startText.value;
  committedText.end = endText.value;

  emit(
    'change:text',
    rangeOn.value ? { end: endText.value, start: startText.value } : text,
  );
  setEnds(next);
};

const onInputKeyDown = (end: CDatePickerEnd, event: KeyboardEvent) => {
  lastInput.value = end;

  if (event.key === 'Enter') {
    commitText(end);

    return;
  }

  if (event.key === 'ArrowDown' && event.altKey) {
    event.preventDefault();
    commitText(end);
    openPanel();
  }
};

const onClear = (event?: Event) => {
  event?.stopPropagation();

  startText.value = '';
  endText.value = '';
  committedText.start = '';
  committedText.end = '';
  badStart.value = false;
  badEnd.value = false;
  setEnds({ end: null, start: null });
  startRef.value?.focus();
};

// ---- calendar state ---------------------------------------------------------

const view = ref<CDatePickerView>('days');

const today = ref(todayIso());

// The roving day: always inside the displayed month.
const focusedDate = ref(today.value);

// The displayed month, `YYYY-MM`.
const displayedMonth = ref(monthOf(today.value));

const displayed = computed(() => fromIso(firstOfMonth(displayedMonth.value))!);

// ---- motion ---------------------------------------------------------------

// Set just before a state change swaps the body's element; the transition
// hooks read it while Vue patches.
const motion = ref<CDatePickerMotion>(null);

const running = new Set<Animation>();

const SLIDE = { duration: 250, easing: 'cubic-bezier(0.2, 0, 0, 1)' };

// The list swap is a fade-through, as in MD3: the outgoing view fades out
// quickly, then the incoming one comes in on the standard curve.
const FADE_OUT = { duration: 70, easing: 'cubic-bezier(0.3, 0, 1, 1)' };

const FADE_IN = {
  delay: 70,
  duration: 250,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
};

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const play = (
  el: Element,
  keyframes: Keyframe[],
  timing: KeyframeAnimationOptions,
  done: () => void,
) => {
  const animation = el.animate(keyframes, { ...timing, fill: 'both' });

  running.add(animation);

  const end = () => {
    running.delete(animation);
    animation.cancel();
    done();
  };

  animation.onfinish = end;
  animation.oncancel = () => running.delete(animation);
};

type CDatePickerBodyMotion = {
  keyframes: Keyframe[];
  timing: KeyframeAnimationOptions;
};

// How one side of a swap animates, or `null` for an instant swap.
const bodyMotion = (entering: boolean): CDatePickerBodyMotion | null => {
  const kind = motion.value;

  if (!kind) return null;

  const reduced = reducedMotion();

  if (kind === 'next' || kind === 'prev') {
    if (reduced)
      return {
        keyframes: entering
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [{ opacity: 1 }, { opacity: 0 }],
        timing: SLIDE,
      };

    // The new month comes in from the side the step points to.
    const side = (kind === 'next') === entering ? '100%' : '-100%';

    return {
      keyframes: entering
        ? [{ transform: `translateX(${side})` }, { transform: 'none' }]
        : [{ transform: 'none' }, { transform: `translateX(${side})` }],
      timing: SLIDE,
    };
  }

  const list = (kind === 'list-in') === entering;

  // Leaving: a quick fade. The grid drifts down as the list takes over; the
  // list fades where it is.
  if (!entering)
    return {
      keyframes: [
        { opacity: 1, transform: 'none' },
        {
          opacity: 0,
          transform: list || reduced ? 'none' : 'translateY(8px)',
        },
      ],
      timing: FADE_OUT,
    };

  if (reduced)
    return { keyframes: [{ opacity: 0 }, { opacity: 1 }], timing: FADE_IN };

  // The list unrolls from the header: a clip opens downward while its rows
  // drop into place, the lower ones from further up.
  if (list)
    return {
      keyframes: [
        {
          clipPath: 'inset(0 0 100% 0)',
          opacity: 0,
          transform: 'translateY(-10px) scaleY(0.95)',
          transformOrigin: 'top',
        },
        {
          clipPath: 'inset(0 0 0 0)',
          opacity: 1,
          transform: 'none',
          transformOrigin: 'top',
        },
      ],
      timing: FADE_IN,
    };

  // The grid comes back rising into place.
  return {
    keyframes: [
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'none' },
    ],
    timing: FADE_IN,
  };
};

// The body's height as the outgoing element leaves it, so the swap can
// animate to the incoming one's.
let bodyFrom = 0;

const animateBodyHeight = (timing: KeyframeAnimationOptions) => {
  const body = bodyRef.value;

  if (!body || layout.value === 'fullscreen') return;

  const to = body.offsetHeight;

  if (to === bodyFrom || reducedMotion()) return;

  const animation = body.animate(
    [{ height: `${bodyFrom}px` }, { height: `${to}px` }],
    { ...timing, fill: 'both' },
  );

  running.add(animation);
  animation.onfinish = () => {
    running.delete(animation);
    animation.cancel();
  };

  animation.oncancel = () => running.delete(animation);
};

// A new swap starts from what is on screen: finish the running one, which
// removes its outgoing element and settles the incoming one in place. Every
// swap is a leave then an enter, so the leave hook does this.
const settleBody = () => {
  for (const animation of [...running]) animation.finish();
};

const onBodyEnter = (el: Element, done: () => void) => {
  if (el.localName === 'ul') {
    // The body holds the height the grid had while the list is open, so
    // opening it never resizes the card (the list's peek cap may end it
    // short). The fullscreen body is sized by the viewport instead.
    if (layout.value !== 'fullscreen' && bodyRef.value)
      bodyRef.value.style.height = `${bodyFrom}px`;

    // Measure the list's rows before its entrance transforms them.
    applyListCap(el as HTMLUListElement);
  }

  const side = bodyMotion(true);

  if (!side) return done();

  // The card resizes to the incoming month's weeks as it slides in.
  animateBodyHeight(side.timing);
  play(el, side.keyframes, side.timing, done);
};

const onBodyLeave = (el: Element, done: () => void) => {
  settleBody();
  bodyFrom = bodyRef.value?.offsetHeight ?? 0;

  // Leaving the list releases the height it held.
  if (el.localName === 'ul' && bodyRef.value) bodyRef.value.style.height = '';

  const side = bodyMotion(false);

  if (!side) return done();

  // The outgoing element overlays the incoming one and is out of reach.
  const box = el as HTMLElement;

  box.inert = true;
  box.setAttribute('aria-hidden', 'true');
  Object.assign(box.style, {
    insetInline: '0',
    position: 'absolute',
    top: '0',
  });
  play(el, side.keyframes, side.timing, done);
};

const setMonth = (month: string, force = false, animate = false) => {
  if (month === displayedMonth.value && !force) return;

  if (month !== displayedMonth.value)
    motion.value = animate
      ? month > displayedMonth.value
        ? 'next'
        : 'prev'
      : null;

  displayedMonth.value = month;
  emit('change:month', month);
};

const weeks = computed(() =>
  monthMatrix(displayedMonth.value, firstDayResolved.value),
);

const weekNumbers = computed(() =>
  weeks.value.map((week) => rowWeek(week, firstDayResolved.value)),
);

const weekdayOrder = computed(() =>
  Array.from({ length: 7 }, (_, i) => (firstDayResolved.value + i) % 7),
);

// Range picking: the first pick is pending — shown, announced, not emitted.
const pendingStart = ref<null | string>(null);

const hoverDate = ref<null | string>(null);

const { announce, set: setStatus, text: statusText } = useStatusAnnouncer();

const cellLabel = (iso: string) =>
  isDisabled(iso)
    ? `${t.value.date(iso)}, ${t.value.unavailable}`
    : t.value.date(iso);

// The span the band covers: the pending preview, else the committed range.
const bandSpan = computed<[string, string] | null>(() => {
  if (!rangeOn.value) return null;

  if (pendingStart.value) {
    const other = hoverDate.value ?? focusedDate.value;

    return other < pendingStart.value
      ? [other, pendingStart.value]
      : [pendingStart.value, other];
  }

  const { end, start } = ends.value;

  return start && end ? [start, end] : null;
});

const band = (iso: string): 'end' | 'middle' | 'start' | null => {
  const span = bandSpan.value;

  if (!span || span[0] === span[1] || iso < span[0] || iso > span[1])
    return null;

  if (iso === span[0]) return 'start';

  if (iso === span[1]) return 'end';

  return 'middle';
};

const isSelected = (iso: string) => {
  if (rangeOn.value && pendingStart.value) return iso === pendingStart.value;

  return iso === ends.value.start || iso === ends.value.end;
};

const cellUi = (iso: string) =>
  dayCell({
    band: band(iso) ?? 'none',
    disabled: isDisabled(iso),
    selected: isSelected(iso),
    today: iso === today.value,
  });

// ---- navigation -------------------------------------------------------------

const focusCell = () =>
  nextTick(() =>
    requestAnimationFrame(() => {
      // The live grid only: an outgoing one may hold the same date.
      gridRef.value
        ?.querySelector<HTMLElement>(`td[data-date="${focusedDate.value}"]`)
        ?.focus();
    }),
  );

// Move the roving day, stopping at `min` / `max`.
const moveTo = (iso: string) => {
  focusedDate.value = clamp(iso);
  setMonth(monthOf(focusedDate.value), false, true);
  focusCell();
};

const canStep = (months: number) => {
  const target = monthOf(addMonths(firstOfMonth(displayedMonth.value), months));

  const { max, min } = bounds.value;

  return !((min && target < monthOf(min)) || (max && target > monthOf(max)));
};

// The arrows page the month; the roving day follows to the same date.
const stepMonth = (months: number) => {
  if (!canStep(months)) return;

  focusedDate.value = clamp(addMonths(focusedDate.value, months));
  setMonth(monthOf(focusedDate.value), false, true);
  announce(
    () => `${names.value.months[displayed.value.m - 1]} ${displayed.value.y}`,
  );
};

// Where focus lands on open: the value, else today, else the nearest day
// that can be picked.
const initialDate = () => {
  const committed = ends.value.start ?? ends.value.end;

  if (committed) return clamp(committed);

  const base = clamp(today.value);

  for (let i = 0; i <= 366; i++) {
    for (const candidate of [addDays(base, i), addDays(base, -i)]) {
      if (!isOutOfRange(candidate, rules.value) && !isDisabled(candidate))
        return candidate;
    }
  }

  return base;
};

const onGridKeyDown = (event: KeyboardEvent) => {
  const day = focusedDate.value;

  const offset = (dayOfWeek(day) - firstDayResolved.value + 7) % 7;

  const moves: Record<string, () => string> = {
    ArrowDown: () => addDays(day, 7),
    ArrowLeft: () => addDays(day, -1),
    ArrowRight: () => addDays(day, 1),
    ArrowUp: () => addDays(day, -7),
    End: () => addDays(day, 6 - offset),
    Home: () => addDays(day, -offset),
    PageDown: () => addMonths(day, event.shiftKey ? 12 : 1),
    PageUp: () => addMonths(day, event.shiftKey ? -12 : -1),
  };

  if (moves[event.key]) {
    event.preventDefault();
    moveTo(moves[event.key]());

    return;
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    pick(day);
  }
};

// ---- picking ------------------------------------------------------------------

const pick = (iso: string) => {
  if (isDisabled(iso)) return;

  if (!rangeOn.value) {
    startText.value = formatDate(iso, pattern.value);
    committedText.start = startText.value;
    badStart.value = false;
    setEnds({ end: null, start: iso });
    closePanel(true);

    return;
  }

  if (!pendingStart.value) {
    pendingStart.value = iso;
    setStatus(t.value.pendingStart(t.value.date(iso)));

    return;
  }

  const [start, end] =
    iso < pendingStart.value
      ? [iso, pendingStart.value]
      : [pendingStart.value, iso];

  pendingStart.value = null;
  startText.value = formatDate(start, pattern.value);
  endText.value = formatDate(end, pattern.value);
  committedText.start = startText.value;
  committedText.end = endText.value;
  badStart.value = false;
  badEnd.value = false;
  setEnds({ end, start });
  closePanel(true);
};

const onCellClick = (iso: string) => {
  focusedDate.value = iso;
  pick(iso);
};

// ---- month / year lists -----------------------------------------------------

type ListOption = {
  disabled: boolean;
  key: string;
  name: string;
  selected: boolean;
  value: number;
};

const yearSpan = computed(() => {
  const thisYear = fromIso(today.value)!.y;

  const { max, min } = bounds.value;

  const from = min ? fromIso(min)!.y : thisYear - 100;

  const to = max ? fromIso(max)!.y : thisYear + 100;

  const shown = displayed.value.y;

  return [Math.min(from, shown), Math.max(to, shown)];
});

const monthInBounds = (y: number, m: number) => {
  const month = monthOf(toIso({ d: 1, m, y }));

  const { max, min } = bounds.value;

  return !((min && month < monthOf(min)) || (max && month > monthOf(max)));
};

const listOptions = computed<ListOption[]>(() => {
  const { m, y } = displayed.value;

  if (view.value === 'months') {
    return names.value.months.map((name, i) => ({
      disabled: !monthInBounds(y, i + 1),
      key: `m${i}`,
      name,
      selected: i + 1 === m,
      value: i + 1,
    }));
  }

  const [from, to] = yearSpan.value;

  return Array.from({ length: to - from + 1 }, (_, i) => ({
    disabled: false,
    key: `y${from + i}`,
    name: String(from + i),
    selected: from + i === y,
    value: from + i,
  }));
});

const listIndex = ref(0);

const focusOption = (center = false) =>
  nextTick(() =>
    requestAnimationFrame(() => {
      const option = listRef.value?.querySelector<HTMLElement>(
        `li[data-index="${listIndex.value}"]`,
      );

      if (!option) return;

      if (center) {
        // Centre the option by whole rows: the list opens scrolled to a row
        // boundary, so its bottom edge still falls on the peek (ADR-0043).
        const list = listRef.value!;

        const rows = Math.floor(list.clientHeight / option.offsetHeight);

        const top = Math.max(0, listIndex.value - Math.floor(rows / 2));

        list.scrollTop = top * option.offsetHeight;
      }

      option.focus({ preventScroll: center });
    }),
  );

// The list is a transient list panel: its scrollbar is hidden, so an
// overflowing list ends on a half-visible row (ADR-0043) — except in the
// fullscreen panel, which is bounded by the viewport.
const applyListCap = (list = listRef.value) => {
  const body = bodyRef.value;

  if (!list || !body) return;

  if (layout.value === 'fullscreen') {
    list.style.maxHeight = '';

    return;
  }

  applyPeekCap(list, {
    ceiling: body.clientHeight,
    rows: Array.from(list.querySelectorAll<HTMLElement>('li[role="option"]')),
  });
};

const toggleView = (next: 'months' | 'years') => {
  if (view.value === next) {
    motion.value = 'list-out';
    view.value = 'days';
    focusCell();

    return;
  }

  motion.value = 'list-in';
  view.value = next;
  listIndex.value = Math.max(
    0,
    listOptions.value.findIndex((o) => o.selected),
  );
  // The peek cap is set as the list enters (`onBodyEnter`); centring only
  // reads layout sizes, which the entrance transform leaves alone.
  focusOption(true);
};

const pickOption = (i: number) => {
  const option = listOptions.value[i];

  if (!option || option.disabled) return;

  const { d } = fromIso(focusedDate.value)!;

  const { m, y } = displayed.value;

  const [ny, nm] =
    view.value === 'months' ? [y, option.value] : [option.value, m];

  // The same day in the chosen month, clamped to its length, then to min / max.
  focusedDate.value = clamp(
    toIso({ d: Math.min(d, daysInMonth(ny, nm)), m: nm, y: ny }),
  );
  setMonth(monthOf(focusedDate.value));
  // Back to the grid on the picked month: a fade, never a slide.
  motion.value = 'list-out';
  view.value = 'days';
  focusCell();
};

const onListKeyDown = (event: KeyboardEvent) => {
  const last = listOptions.value.length - 1;

  const moves: Record<string, number> = {
    ArrowDown: listIndex.value + 1,
    ArrowUp: listIndex.value - 1,
    End: last,
    Home: 0,
  };

  if (event.key in moves) {
    event.preventDefault();
    listIndex.value = Math.min(last, Math.max(0, moves[event.key]));
    focusOption();

    return;
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    pickOption(listIndex.value);
  }
};

// ---- panel ------------------------------------------------------------------

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
  ).filter(
    (el) =>
      el.getClientRects().length > 0 &&
      // Faded-out header items keep their box; an outgoing body is inert.
      el.checkVisibility({ visibilityProperty: true }) &&
      !el.closest('[inert]'),
  );

  if (!stops.length) return;

  const active =
    cardRef.value.getRootNode() instanceof ShadowRoot
      ? (cardRef.value.getRootNode() as ShadowRoot).activeElement
      : document.activeElement;

  const index = stops.indexOf(active as HTMLElement);

  const nextIndex = event.shiftKey
    ? index <= 0
      ? stops.length - 1
      : index - 1
    : index === stops.length - 1
      ? 0
      : index + 1;

  event.preventDefault();
  stops[nextIndex].focus();
};

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
  anchor: anchorRef,
  disabled: () => props.disabled,
  field: cInputRef,
  fullscreen: narrow,
  host,
  matchWidth: false,
  onClosed: () => {
    // A dismissed range gesture leaves nothing behind.
    pendingStart.value = null;
    hoverDate.value = null;
    motion.value = null;
    view.value = 'days';
  },
  onOpened: () => {
    pageLang.value = document.documentElement.lang;
    today.value = todayIso();
    motion.value = null;
    view.value = 'days';
    pendingStart.value = null;
    focusedDate.value = initialDate();
    setMonth(monthOf(focusedDate.value), true);
    focusCell();
  },
  panel: panelRef,
  returnFocusTo: () => inputOf(lastInput.value),
});

const ui = computed(() =>
  datePicker({ fullscreen: layout.value === 'fullscreen' }),
);

const onCalendarClick = (event: Event) => {
  event.stopPropagation();

  if (isOpen.value) {
    closePanel(true);

    return;
  }

  commitText('start');

  if (rangeOn.value) commitText('end');

  openPanel();
};

defineExpose({ badInput });
</script>

<!--
  Escape-hatch CSS: only constructs Tailwind utilities cannot express.
    - `:host{display:block}` — the field is a real box.
    - `[part='panel'] position-try-fallbacks` and the two `@position-try`
      rules — `useAnchoredPanel`'s per-shadow-root half, identical in every
      consumer (c-autocomplete, c-tree-select).
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
  animation: c-date-picker-fade-in 0.12s ease-out;
}

.c-date-picker__input::placeholder {
  color: var(--c-on-surface-faint);
  opacity: 1;
}

@keyframes c-date-picker-fade-in {
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
