import {
  DEFAULT_SEEDS,
  FAMILIES,
  type Family,
  applyTheme,
  resetTheme,
} from '@cscfi/csc-ui';

// One shared record of the seeds currently applied to this site, so every
// theming control (the header colour switcher, the customization page's
// playground) shows and edits the same state. Seeds are always #rrggbb — the
// value a colour input takes — and never read back off the document: since
// ADR-0041 the `--c-*` tokens are oklch() strings.
const seeds = reactive<Record<Family, string>>({ ...DEFAULT_SEEDS });

export const useThemeSeeds = () => {
  const setSeed = (family: Family, hex: string) => {
    seeds[family] = hex;

    // Merges with earlier calls — other families keep their overrides.
    applyTheme({ [family]: hex });
  };

  const resetSeeds = () => {
    resetTheme();
    Object.assign(seeds, DEFAULT_SEEDS);
  };

  return { families: FAMILIES, resetSeeds, seeds, setSeed };
};
