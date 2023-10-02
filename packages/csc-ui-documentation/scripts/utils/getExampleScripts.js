import events from 'events';
import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import { consola } from 'consola';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

export default async (component, filename) => {
  try {
    const writeStream = fs.createWriteStream(filename);

    const writeline = (line, lineChange = true) => {
      if (lineChange) {
        writeStream.write('\n');
      }

      writeStream.write(line);
    };

    let hasInfo = false;
    let isExample = false;
    let isSkipping = false;
    let row = 0;

    const data = {};
    let examples = [];

    const addLine = ({ line, name, lineChange = true, firstLine = false }) => {
      let firstExample = false;

      if (!data[name]) {
        firstExample = true;
        data[name] = [];
      }

      if (lineChange && !firstExample) {
        data[name].push('\n');
      }

      if (firstLine && !firstExample) {
        return;
      }

      data[name].push(line);
    };

    const writeData = () => {
      Object.values(data).forEach((block) => {
        block.forEach((row, index) => {
          const formattedRow =
            index === 0
              ? row
              : row
                  .replace(/`/g, "'")
                  .replace(/'\$\{([^}]+)\}/g, "$1 + '")
                  .replace(/\$\{([^}]+)\}/g, "' + $1 + '");

          writeStream.write(
            `${formattedRow}${index + 1 === block.length ? '`;\n' : ''}`,
          );
        });

        writeStream.write('\n');
      });
    };

    const infoText = `/**
 * Examples for ${component}.
 * Automatically generated at ${new Date().toLocaleString()}.
 *
 * ⚠️ DO NOT EDIT THESE MANUALLY AS THEY WILL BE OVERWRITTEN IN THE NEXT BUILD!
 */
`;

    const rl = readline.createInterface({
      input: fs.createReadStream(
        path.resolve(__dirname, `../../components/examples/${component}`),
      ),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      if (!hasInfo) {
        writeline(infoText);

        hasInfo = true;
      }

      if (line.replace(/^\s+/g, '').startsWith('// @example-skip-end')) {
        isSkipping = false;

        return;
      }

      if (
        line.replace(/^\s+/g, '').startsWith('// @example-skip-start') ||
        isSkipping
      ) {
        isSkipping = true;

        return;
      }

      if (line.replace(/^\s+/g, '').startsWith('// @example-start')) {
        const [, ...names] = line.split('|');
        examples = names;
        isExample = true;

        examples.forEach((e) => {
          addLine({
            line: `export const ${e} = \``,
            name: e,
            firstLine: true,
            lineChange: true,
          });
        });

        return;
      }

      if (line.replace(/^\s+/g, '').startsWith('// @example-end')) {
        examples.forEach((e) => {
          addLine({ line: '', name: e });
        });

        isExample = false;
        examples = [];
        row = 0;

        return;
      }

      if (isExample) {
        row += 1;

        examples.forEach((e) => {
          addLine({ line, name: e, lineChange: row > 1 });
        });
      }
    });

    rl.on('close', () => {
      writeData();
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
