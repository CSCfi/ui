import events from 'events';
import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import { consola } from 'consola';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async (filename) => {
  try {
    const writeStream = fs.createWriteStream(filename);

    const writeline = (line, lineChange = true) => {
      if (lineChange) {
        writeStream.write('\n');
      }

      // writeStream.write(line.replace(/^\s{2}/, ''));
      writeStream.write(line);
    };

    let hasInfo = false;
    let isExample = false;

    const infoText = `/**
 * CSC-UI Types.
 * Automatically generated at ${new Date().toLocaleString()}.
 *
 * ⚠️ DO NOT EDIT THESE MANUALLY AS THEY WILL BE OVERWRITTEN IN THE NEXT BUILD!
 */

export default {`;

    const rl = readline.createInterface({
      input: fs.createReadStream(
        path.resolve(__dirname, `../../../csc-ui/src/types/index.ts`),
      ),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      if (!hasInfo) {
        writeline(infoText, false);

        hasInfo = true;
      }

      if (line.startsWith('export')) {
        isExample = true;

        const name = line
          .split(' ')
          .find((part) => part.match(/^C([A-Z][a-zA-Z]*)/g));

        writeline(`${name}: \``);
        writeline(`${line.replace('export ', '').replace('declare ', '')}`);

        if (line.endsWith(';')) {
          isExample = false;

          writeline('`,');
          writeline('');
        }

        return;
      }

      if (line === '}' || line === '};') {
        isExample = false;

        writeline(line);
        writeline('`,');
        writeline('');

        return;
      }

      if (line.trim().startsWith('|') && line.endsWith(';')) {
        writeline(`${line}`);
        writeline('`,');
        writeline('');

        return;
      }

      if (isExample) {
        writeline(`${line}`);
      }
    });

    rl.on('close', () => {
      writeline('};\n', false);
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
