/**
 * IDE completion data, generated from the CEM manifest by the ecosystem
 * generators — the reason the analyzer chose CEM over a bespoke schema.
 *
 *   dist/vscode.html-custom-data.json  VS Code / Volar tag + attribute data
 *                                      (attribute value sets come from the
 *                                      expanded unions in `type.text`)
 *   dist/vscode.css-custom-data.json   ::part() / custom-property data
 *   dist/web-types.json                JetBrains web-types, auto-discovered
 *                                      via the package.json `web-types` field
 *
 * VS Code does not auto-discover custom data: consumers add
 *   "html.customData": ["node_modules/@cscfi/csc-ui/dist/vscode.html-custom-data.json"]
 * to their workspace settings (Volar reads the same setting for Vue
 * templates).
 */

import { generateJetBrainsWebTypes } from 'custom-element-jet-brains-integration';
import { generateVsCodeCustomElementData } from 'custom-element-vs-code-integration';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/**
 * The generators mark a deprecated tag or method but pass an attribute's
 * `deprecated` through to neither format, so a deprecated attribute's
 * description leads with the note, in the generators' own `@deprecated`
 * wording.
 */
const withAttributeDeprecations = (manifest) => ({
  ...manifest,
  modules: manifest.modules.map((module) => ({
    ...module,
    declarations: module.declarations?.map((declaration) => ({
      ...declaration,
      attributes: declaration.attributes?.map((attribute) =>
        attribute.deprecated
          ? {
              ...attribute,
              description: [
                `@deprecated ${attribute.deprecated}`,
                attribute.description,
              ]
                .filter(Boolean)
                .join('\n\n'),
            }
          : attribute,
      ),
    })),
  })),
});

/** web-types has its own `deprecated` attribute field, which JetBrains IDEs
 *  render as a strikethrough. */
const markWebTypesDeprecations = (manifest, file) => {
  const deprecated = new Map();

  for (const module of manifest.modules) {
    for (const declaration of module.declarations ?? []) {
      for (const attribute of declaration.attributes ?? []) {
        if (attribute.deprecated) {
          deprecated.set(
            `${declaration.tagName} ${attribute.name}`,
            attribute.deprecated,
          );
        }
      }
    }
  }

  if (!deprecated.size) return;

  const webTypes = JSON.parse(readFileSync(file, 'utf8'));

  for (const element of webTypes.contributions?.html?.elements ?? []) {
    for (const attribute of element.attributes ?? []) {
      const message = deprecated.get(`${element.name} ${attribute.name}`);

      if (message) attribute.deprecated = message;
    }
  }

  writeFileSync(file, `${JSON.stringify(webTypes, null, 2)}\n`);
};

export const emitIdeData = (manifest, outdir) => {
  const marked = withAttributeDeprecations(manifest);

  generateVsCodeCustomElementData(marked, {
    cssFileName: 'vscode.css-custom-data.json',
    hideLogs: true,
    htmlFileName: 'vscode.html-custom-data.json',
    outdir,
  });

  generateJetBrainsWebTypes(marked, {
    hideLogs: true,
    outdir,
    // The `web-types` package.json field is committed by hand (stable path);
    // letting the generator rewrite package.json on every docs build would
    // churn an authored file.
    packageJson: false,
    webTypesFileName: 'web-types.json',
  });

  markWebTypesDeprecations(manifest, path.join(outdir, 'web-types.json'));
};
