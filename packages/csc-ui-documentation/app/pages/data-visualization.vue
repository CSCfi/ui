<template>
  <div class="flex items-start gap-10">
    <article class="min-w-0 max-w-[52rem] flex-1">
      <h1 class="mb-[0.67em] text-[2rem] font-bold">Data visualization</h1>

      <p class="my-[1em] max-w-[45rem] text-[1.0625rem] text-on-surface-muted">
        The library ships a validated categorical palette for bar and line
        charts — twelve series slots plus the chart anatomy roles — as
        semantic tokens that re-theme with light and dark mode like every
        other token. The set is machine-checked per mode for color-vision
        deficiency separation, lightness, chroma, and contrast against the
        chart surface, so a chart built on these tokens is accessible by
        construction.
      </p>

      <section class="mt-10">
        <h2 :id="'series-colors'" :class="H2">Series colors</h2>

        <p :class="INTRO">
          One slot per series, assigned in slot order — the order is the
          accessibility mechanism. Never cycle back to slot 1, never skip
          slots, and never re-assign colors when a filter changes the series
          count: color follows the entity, not its rank. The slots are frozen
          values owned by the chart palette (ADR-0030) — re-branding with
          theme seeds re-themes components but deliberately never charts, so
          the validated guarantees cannot be silently broken.
        </p>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr>
                <th :class="TH">Token</th>
                <th :class="TH"><span class="sr-only">Swatch</span></th>
                <th :class="TH">Hue</th>
                <th :class="TH">Light</th>
                <th :class="TH">Dark</th>
                <th :class="TH">Origin</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="slot in SLOTS" :key="slot.n">
                <td :class="TD">
                  <code class="whitespace-nowrap">--c-chart-{{ slot.n }}</code>
                </td>

                <td :class="TD">
                  <span
                    :class="SWATCH"
                    :style="{ background: `var(--c-chart-${slot.n})` }"
                  />
                </td>

                <td :class="TD">{{ slot.hue }}</td>

                <td :class="TD">
                  <code class="whitespace-nowrap">{{ slot.light }}</code>
                </td>

                <td :class="TD">
                  <code class="whitespace-nowrap">{{ slot.dark }}</code>
                </td>

                <td :class="TD">{{ slot.origin }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p :class="INTRO" class="mt-4">
          Slots 1–6 are six distinct hues; slots 7–12 revisit five of them as
          lighter partners plus a cyan. A chart with more than six series is
          usually better served by folding the tail into an “Other” series or
          by small multiples — the extra slots exist so a stable entity keeps
          its color across a dashboard, not to encourage twelve-line charts.
        </p>
      </section>

      <section class="mt-10">
        <h2 :id="'chart-anatomy'" :class="H2">Chart anatomy</h2>

        <p :class="INTRO">
          The plot background, gridlines, and axis labels have their own
          roles. The chart surface equals the raised card surface in both
          modes, so a chart sits flush on a card — the series slots are
          validated against exactly this background. Author charts entirely
          in chart roles; don’t mix in palette steps or component roles.
        </p>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr>
                <th :class="TH">Token</th>
                <th :class="TH"><span class="sr-only">Swatch</span></th>
                <th :class="TH">Light</th>
                <th :class="TH">Dark</th>
                <th :class="TH">Purpose</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="row in ANATOMY" :key="row.token">
                <td :class="TD">
                  <code class="whitespace-nowrap">--c-{{ row.token }}</code>
                </td>

                <td :class="TD">
                  <span
                    :class="SWATCH"
                    :style="{ background: `var(--c-${row.token})` }"
                  />
                </td>

                <td :class="TD">
                  <code class="whitespace-nowrap">{{ row.light }}</code>
                </td>

                <td :class="TD">
                  <code class="whitespace-nowrap">{{ row.dark }}</code>
                </td>

                <td :class="TD">{{ row.purpose }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="mt-10">
        <h2 :id="'example'" :class="H2">Example</h2>

        <p :class="INTRO">
          A grouped bar chart and a line chart on a card, drawn as plain SVG
          with the chart tokens as CSS custom properties — no charting
          library. Because the colors are semantic tokens, both charts flip
          with the theme toggle above with no per-chart work. Marks carry
          native tooltips; the line series are direct-labeled at their ends.
        </p>

        <c-card class="my-6">
          <c-card-title>Compute usage by service</c-card-title>

          <c-card-content>
            <div class="flex flex-wrap gap-x-5 gap-y-1 pb-2 text-sm">
              <span
                v-for="(name, i) in BAR_SERIES"
                :key="name"
                class="inline-flex items-center gap-1.5"
              >
                <span
                  class="inline-block size-2.5 rounded-sm"
                  :style="{ background: `var(--c-chart-${i + 1})` }"
                />
                {{ name }}
              </span>
            </div>

            <svg
              :viewBox="`0 0 ${W} ${H}`"
              class="w-full"
              role="img"
              aria-label="Grouped bar chart: monthly CPU core hours for three services"
            >
              <!-- gridlines + y tick labels -->
              <g v-for="tick in yTicks" :key="tick.value">
                <line
                  :x1="PAD.l"
                  :x2="W - PAD.r"
                  :y1="tick.y"
                  :y2="tick.y"
                  stroke="var(--c-chart-grid)"
                  stroke-width="1"
                />
                <text
                  :x="PAD.l - 6"
                  :y="tick.y + 3"
                  text-anchor="end"
                  class="text-[9px]"
                  fill="var(--c-chart-axis)"
                >
                  {{ tick.label }}
                </text>
              </g>

              <!-- bars: thin marks, rounded data ends, 2px surface gaps -->
              <clipPath id="bar-plot">
                <rect
                  :x="PAD.l"
                  y="0"
                  :width="W - PAD.l - PAD.r"
                  :height="baseY"
                />
              </clipPath>
              <g clip-path="url(#bar-plot)">
                <rect
                  v-for="bar in bars"
                  :key="`${bar.month}-${bar.series}`"
                  :x="bar.x"
                  :y="bar.y"
                  :width="BAR_W"
                  :height="baseY - bar.y + 4"
                  rx="3"
                  :fill="`var(--c-chart-${bar.seriesIndex + 1})`"
                >
                  <title>
                    {{ bar.series }} — {{ bar.month }}: {{ bar.value }}M core
                    hours
                  </title>
                </rect>
              </g>

              <!-- baseline + x labels -->
              <line
                :x1="PAD.l"
                :x2="W - PAD.r"
                :y1="baseY"
                :y2="baseY"
                stroke="var(--c-chart-grid)"
                stroke-width="1"
              />
              <text
                v-for="group in barGroups"
                :key="group.month"
                :x="group.cx"
                :y="baseY + 14"
                text-anchor="middle"
                class="text-[9px]"
                fill="var(--c-chart-axis)"
              >
                {{ group.month }}
              </text>
            </svg>
          </c-card-content>
        </c-card>

        <c-card class="my-6">
          <c-card-title>Active projects</c-card-title>

          <c-card-content>
            <svg
              :viewBox="`0 0 ${W} ${H}`"
              class="w-full"
              role="img"
              aria-label="Line chart: weekly active projects for three services"
            >
              <g v-for="tick in lineTicks" :key="tick.value">
                <line
                  :x1="PAD.l"
                  :x2="W - PAD.r - 56"
                  :y1="tick.y"
                  :y2="tick.y"
                  stroke="var(--c-chart-grid)"
                  stroke-width="1"
                />
                <text
                  :x="PAD.l - 6"
                  :y="tick.y + 3"
                  text-anchor="end"
                  class="text-[9px]"
                  fill="var(--c-chart-axis)"
                >
                  {{ tick.value }}
                </text>
              </g>

              <g v-for="line in lines" :key="line.name">
                <polyline
                  :points="line.points"
                  fill="none"
                  :stroke="`var(--c-chart-${line.seriesIndex + 1})`"
                  stroke-width="2"
                  stroke-linejoin="round"
                  stroke-linecap="round"
                />
                <!-- end marker + direct label; label text wears a text token -->
                <circle
                  :cx="line.endX"
                  :cy="line.endY"
                  r="4"
                  :fill="`var(--c-chart-${line.seriesIndex + 1})`"
                  stroke="var(--c-chart-surface)"
                  stroke-width="2"
                >
                  <title>{{ line.name }}, week 8: {{ line.endValue }}</title>
                </circle>
                <text
                  :x="line.endX + 8"
                  :y="line.endY + 3"
                  class="text-[10px]"
                  fill="var(--c-on-surface)"
                >
                  {{ line.name }}
                </text>
              </g>

              <line
                :x1="PAD.l"
                :x2="W - PAD.r - 56"
                :y1="baseY"
                :y2="baseY"
                stroke="var(--c-chart-grid)"
                stroke-width="1"
              />
              <text
                v-for="(week, i) in WEEKS"
                :key="week"
                :x="lineX(i)"
                :y="baseY + 14"
                text-anchor="middle"
                class="text-[9px]"
                fill="var(--c-chart-axis)"
              >
                {{ week }}
              </text>
            </svg>
          </c-card-content>
        </c-card>

        <figure
          v-for="(block, index) in CODE_BLOCKS"
          :key="index"
          class="my-4 overflow-hidden rounded-lg border border-border"
        >
          <figcaption
            class="border-b border-border bg-surface-muted px-4 py-2 font-mono text-[0.75rem] text-on-surface-faint"
          >
            {{ block.filename }}
          </figcaption>

          <!-- eslint-disable-next-line vue/no-v-html — Shiki output built at prerender from our own snippets -->
          <div
            v-if="blocksHtml[index]"
            class="example-shiki"
            v-html="blocksHtml[index]"
          />

          <pre
            v-else
            class="m-0 overflow-x-auto bg-[#0f172a] px-5 py-4 text-[0.8125rem] text-[#e2e8f0]"
          ><code class="bg-transparent p-0">{{ block.code }}</code></pre>
        </figure>
      </section>

      <section class="mt-10">
        <h2 :id="'rules'" :class="H2">Rules of use</h2>

        <ul
          class="my-[1em] max-w-[45rem] list-disc space-y-2 pl-5 text-on-surface-muted"
        >
          <li>
            <strong class="text-on-surface">Fixed order, never cycled.</strong>
            Series 1 wears slot 1, series 2 slot 2, and so on. A 13th series
            is never a reused color — fold the smallest series into “Other”,
            or split into small multiples. Prefer folding well before that:
            more than ~6 visible series is usually a chart-design problem,
            not a palette problem.
          </li>
          <li>
            <strong class="text-on-surface">Status colors are reserved.</strong>
            When a series <em>means</em> good/bad (error rate, pass/fail), it
            wears the status roles (success, warning, error) — and ships with
            an icon and label. When it is just “series 4”, it wears a chart
            slot. Never both meanings in one chart, and never a status ramp
            as a series color.
          </li>
          <li>
            <strong class="text-on-surface">Legend and labels.</strong> Two or
            more series always get a legend; a single series needs none — the
            title names it. Value and axis text always wears text tokens
            (chart-axis, on-surface), never the series color.
          </li>
          <li>
            <strong class="text-on-surface">Dark mode needs a relief
            channel.</strong> On the dark chart surface, slots 2, 3, 4 and 6
            sit below 3:1 contrast by design (the dark lightness band is
            narrow). That is legal only when values are readable another way:
            tooltips, direct labels, or an accompanying table view. The
            example charts above carry tooltips for exactly this reason.
          </li>
          <li>
            <strong class="text-on-surface">Scatter, bubble, and map forms cap
            at three series.</strong> In those forms any two marks can touch,
            so all pairs must be distinguishable, not just neighbors — and
            only slots 1–3 pass that stricter test. More than three series in
            such a form means faceting, not more colors.
          </li>
          <li>
            <strong class="text-on-surface">Canvas-based chart libraries
            can’t read CSS variables.</strong> SVG charts use
            <code>var(--c-chart-1)</code> directly. Chart.js, ECharts and
            other canvas renderers need resolved values — read them with
            <code>getComputedStyle</code> and re-read on theme change (see
            the snippet above).
          </li>
        </ul>
      </section>
    </article>

    <toc-rail :items="tocItems" />
  </div>
</template>

<script setup lang="ts">
import type { TocItem } from '~/utils/toc';

/**
 * Bespoke guide page (like customization.vue): the chart-token tables and the
 * live SVG examples are hand-written — there is no chart component whose
 * manifest could drive them.
 *
 * The palette below is the frozen chart-token set (ADR-0030). The hex columns
 * are documentation of the shipped values; the swatches and charts render the
 * live tokens so they track theme mode.
 */

const SLOTS = [
  { n: 1, hue: 'blue', light: '#006b9b', dark: '#0082bb', origin: 'info ramp' },
  { n: 2, hue: 'magenta', light: '#a63a71', dark: '#a63a71', origin: 'secondary ramp' },
  { n: 3, hue: 'gold', light: '#866c02', dark: '#896f09', origin: 'viz-only' },
  { n: 4, hue: 'purple', light: '#62488c', dark: '#7555a8', origin: 'viz-only' },
  { n: 5, hue: 'teal', light: '#00a190', dark: '#00a190', origin: 'accent ramp' },
  { n: 6, hue: 'rose', light: '#8b3b3b', dark: '#a74546', origin: 'viz-only' },
  { n: 7, hue: 'cyan', light: '#04a3be', dark: '#0999b2', origin: 'viz-only' },
  { n: 8, hue: 'rose, light', light: '#c06a68', dark: '#b96462', origin: 'viz-only' },
  { n: 9, hue: 'blue, light', light: '#3f9bd1', dark: '#3f9bd1', origin: 'info ramp' },
  { n: 10, hue: 'magenta, light', light: '#c56793', dark: '#c56793', origin: 'secondary ramp' },
  { n: 11, hue: 'gold, light', light: '#af8f15', dark: '#af8f15', origin: 'viz-only' },
  { n: 12, hue: 'purple, light', light: '#9076be', dark: '#8a70b8', origin: 'viz-only' },
];

const ANATOMY = [
  {
    token: 'chart-surface',
    light: 'white',
    dark: 'slate-800',
    purpose:
      'Plot background. Equals the raised card surface, so a chart on a card is flush with it — the series slots are validated against this color.',
  },
  {
    token: 'chart-grid',
    light: 'tertiary-200',
    dark: 'slate-700',
    purpose: 'Gridlines, baselines, and axis lines. Recessive by design.',
  },
  {
    token: 'chart-axis',
    light: 'tertiary-500',
    dark: 'slate-300',
    purpose: 'Axis tick labels and small chart captions.',
  },
];

// ── example chart data & geometry ──────────────────────────────────────────

const W = 560;
const H = 220;
const PAD = { l: 36, r: 8, t: 10, b: 22 };
const baseY = H - PAD.b;

const BAR_SERIES = ['Pouta', 'Mahti', 'LUMI'];
const BAR_MONTHS = ['May', 'June', 'July', 'August'];
// millions of CPU core hours
const BAR_DATA = [
  [3.1, 3.4, 2.9, 3.8],
  [5.2, 4.8, 5.6, 6.1],
  [4.0, 4.4, 4.9, 4.6],
];
const BAR_MAX = 8;
const BAR_W = 26;
const BAR_GAP = 2; // the 2px surface gap between adjacent bars

const yTicks = [0, 2, 4, 6, 8].map((value) => ({
  value,
  label: `${value}M`,
  y: baseY - (value / BAR_MAX) * (baseY - PAD.t),
}));

const barGroups = BAR_MONTHS.map((month, m) => {
  const groupWidth = BAR_SERIES.length * BAR_W + (BAR_SERIES.length - 1) * BAR_GAP;
  const slot = (W - PAD.l - PAD.r) / BAR_MONTHS.length;
  const x0 = PAD.l + slot * m + (slot - groupWidth) / 2;
  return { month, x0, cx: x0 + groupWidth / 2 };
});

const bars = barGroups.flatMap((group, m) =>
  BAR_SERIES.map((series, s) => ({
    month: group.month,
    series,
    seriesIndex: s,
    value: BAR_DATA[s]![m]!,
    x: group.x0 + s * (BAR_W + BAR_GAP),
    y: baseY - (BAR_DATA[s]![m]! / BAR_MAX) * (baseY - PAD.t),
  })),
);

const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
const LINE_DATA: { name: string; values: number[] }[] = [
  { name: 'Pouta', values: [112, 118, 121, 117, 126, 131, 128, 136] },
  { name: 'Mahti', values: [64, 61, 70, 74, 72, 79, 84, 82] },
  { name: 'LUMI', values: [35, 42, 40, 48, 53, 51, 58, 63] },
];
const LINE_MAX = 150;

const lineTicks = [0, 50, 100, 150].map((value) => ({
  value,
  y: baseY - (value / LINE_MAX) * (baseY - PAD.t),
}));

const lineX = (i: number) =>
  PAD.l + (i / (WEEKS.length - 1)) * (W - PAD.l - PAD.r - 56 - PAD.l);

const lineY = (value: number) => baseY - (value / LINE_MAX) * (baseY - PAD.t);

const lines = LINE_DATA.map((series, s) => {
  const coords = series.values.map((v, i) => [lineX(i), lineY(v)] as const);
  const end = coords[coords.length - 1]!;
  return {
    name: series.name,
    seriesIndex: s,
    points: coords.map(([x, y]) => `${x},${y}`).join(' '),
    endX: end[0],
    endY: end[1],
    endValue: series.values[series.values.length - 1]!,
  };
});

// ── code blocks ─────────────────────────────────────────────────────────────

const CODE_BLOCKS = [
  {
    filename: 'chart.svg (excerpt) — SVG reads the tokens directly',
    lang: 'html',
    code: `<c-card>
  <c-card-title>Compute usage by service</c-card-title>
  <c-card-content>
    <svg viewBox="0 0 560 220" role="img" aria-label="...">
      <line x1="36" x2="552" y1="198" y2="198" stroke="var(--c-chart-grid)" />
      <text x="30" y="201" fill="var(--c-chart-axis)">0M</text>
      <rect x="60" y="120" width="26" height="82" rx="3" fill="var(--c-chart-1)" />
      <rect x="88" y="90" width="26" height="112" rx="3" fill="var(--c-chart-2)" />
    </svg>
  </c-card-content>
</c-card>`,
  },
  {
    filename: 'chart-colors.ts — canvas libraries need resolved values',
    lang: 'ts',
    code: `// Chart.js, ECharts & co. render to canvas and cannot read CSS custom
// properties. Resolve the chart tokens once, and again on theme change.
const style = getComputedStyle(document.documentElement);

export const chartColors = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    style.getPropertyValue(\`--c-chart-\${i + 1}\`).trim(),
  );

// Re-read when the theme mode changes:
new MutationObserver(() => rebuildChart(chartColors(4))).observe(
  document.documentElement,
  { attributeFilter: ['data-theme'] },
);`,
  },
];

const tocItems: TocItem[] = [
  { id: 'series-colors', label: 'Series colors' },
  { id: 'chart-anatomy', label: 'Chart anatomy' },
  { id: 'example', label: 'Example' },
  { id: 'rules', label: 'Rules of use' },
];

// Shared table/heading utilities (same shape as customization.vue).
const TH =
  'border-b border-border px-3 py-2 text-left align-top font-semibold whitespace-nowrap text-on-surface-faint';

const TD = 'border-b border-border px-3 py-2 text-left align-top';

const H2 =
  'my-[0.83em] scroll-mt-20 border-b border-border pb-1.5 text-2xl font-bold';

const INTRO = 'my-[1em] max-w-[45rem] text-on-surface-muted';

const SWATCH = 'inline-block size-4 rounded border border-border align-middle';

const { data } = await useAsyncData('data-visualization', async () => {
  const { highlightCode } = await import('~/utils/highlight');

  return Promise.all(
    CODE_BLOCKS.map((block) => highlightCode(block.code, block.lang)),
  );
});

const blocksHtml = computed(() => data.value ?? []);

useHead({ title: 'Data visualization — CSC Design System' });
</script>
