/**
 * IDE completion data (ADR-0015), generated from the CEM manifest by the
 * ecosystem generators — the reason ADR-0012 chose CEM over a bespoke schema.
 *
 *   dist/vscode.html-custom-data.json  VS Code / Volar tag + attribute data
 *                                      (attribute value sets come from the
 *                                      expanded unions in `type.text`)
 *   dist/vscode.css-custom-data.json   ::part() / custom-property data
 *   dist/web-types.json                JetBrains web-types, auto-discovered
 *                                      via the package.json `web-types` field
 *
 * VS Code does not auto-discover custom data: consumers add
 *   "html.customData": ["node_modules/@cscfi/csc-ui-next/dist/vscode.html-custom-data.json"]
 * to their workspace settings (Volar reads the same setting for Vue
 * templates).
 */

import { generateJetBrainsWebTypes } from 'custom-element-jet-brains-integration';
import { generateVsCodeCustomElementData } from 'custom-element-vs-code-integration';

export const emitIdeData = (manifest, outdir) => {
  generateVsCodeCustomElementData(manifest, {
    cssFileName: 'vscode.css-custom-data.json',
    hideLogs: true,
    htmlFileName: 'vscode.html-custom-data.json',
    outdir,
  });

  generateJetBrainsWebTypes(manifest, {
    hideLogs: true,
    outdir,
    // The `web-types` package.json field is committed by hand (stable path);
    // letting the generator rewrite package.json on every docs build would
    // churn an authored file.
    packageJson: false,
    webTypesFileName: 'web-types.json',
  });
};
