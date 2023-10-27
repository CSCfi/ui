const events = require('events');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const consola = require('consola');

module.exports = async (component, filename) => {
  try {
    const writeStream = fs.createWriteStream(filename);

    const writeline = (line, lineChange = true) => {
      if (lineChange) {
        writeStream.write('\n');
      }

      writeStream.write(line.replace(/^\s{2}/, ''));
    };

    let hasInfo = false;
    let isExample = false;
    let exampleName = '';
    let isInStartTag = false;
    let row = 0;

    const infoText = `/**
 * Examples for ${component}.
 * Automatically generated at ${new Date().toLocaleString()}.
 *
 * ⚠️ DO NOT EDIT THESE MANUALLY AS THEY WILL BE OVERWRITTEN IN THE NEXT BUILD!
 */
`;

    const rl = readline.createInterface({
      input: fs.createReadStream(
        path.resolve(__dirname, `../../src/app/examples/${component}/${component}.component.html`),
      ),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      if (!hasInfo) {
        writeline(infoText);

        hasInfo = true;
      }

      if (isInStartTag && line.endsWith('>')) {
        isInStartTag = false;
        return;
      }

      if (line.replace(/^\s+/g, '').startsWith('<app-example') || isInStartTag) {
        isInStartTag = !line.endsWith('>');
        exampleName = line.match(/name="([^"]+)"/);

        if (!exampleName) return;

        isExample = true;

        writeline(`export const ${exampleName.pop()} = \``);

        return;
      }

      if (line.replace(/^\s+/g, '').startsWith('</app-example>') && isExample) {
        isExample = false;
        exampleName = '';
        row = 0;

        writeline('`;', false);
        writeline('');

        return;
      }

      if (isExample) {
        row += 1;
        writeline(line, row > 1);
      }
    });

    writeStream.on('finish', () => {
      consola.success(filename);
    });

    await events.once(rl, 'close');

    writeStream.end();
  } catch (err) {
    console.error(err);
  }
};
