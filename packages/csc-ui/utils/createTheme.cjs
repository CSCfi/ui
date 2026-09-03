// The runtime theming core is ESM; Node ≥ 22.12 loads it synchronously via
// require(esm). Sharing cssColor() keeps tokens.css and applyTheme() output
// byte-identical (checked by scripts/check-ramp-parity.mjs).
const { cssColor } = require('../src/theme/ramp.js');
const getRgbValue = require('./getRgbValue.cjs');
const setValue = require('./setValue.cjs');

const formats = {
  css: {
    fileEnd: '\n}\n',
    fileStart: ':root, :host {',
    postfix: '',
    prefix: '\n\t--c',
  },
  scss: {
    fileEnd: '',
    fileStart: '',
    postfix: '\n',
    prefix: '$c',
  },
};

// The default/brand step. Ramps are anchored here (see scripts/generate-ramps.mjs)
// and the semantic default roles (--c-primary, …) point at it. Tokens ending in
// this step also emit an `--c-<family>-rgb` variant for alpha compositing.
const baseColor = '500';

module.exports = (dictionary, type) => {
  const config = formats[type];

  const cache = new Set();

  let theme = '';

  Object.values(dictionary).forEach((dict) => {
    return Object.values(dict)
      .filter((token) => {
        const [category] = token.path || [];

        return category === 'theme';
      })
      .forEach((token) => {
        if (!cache.has(token.name)) {
          cache.add(token.name);

          const isBaseValue = (name) => {
            const baseValues = [baseColor, 'white', 'black'];

            return baseValues.some((value) => name.endsWith(value));
          };

          const name = token.name.replace('theme-', '');

          // Colours are emitted as oklch() (ADR-0041); non-colour tokens verbatim.
          theme += `${config.prefix}-${name}: `;
          theme += `${cssColor(token.value)};${config.postfix}`;

          if (isBaseValue(name)) {
            theme += `${config.prefix}-${name.replace(
              `-${baseColor}`,
              '',
            )}-rgb: `;
            theme += `${getRgbValue(token.value)};${config.postfix}`;
          }
        }
      });
  });

  return `${config.fileStart}${theme}${config.fileEnd}`;
};
