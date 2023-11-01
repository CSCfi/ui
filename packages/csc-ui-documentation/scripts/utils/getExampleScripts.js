import events from 'events';
import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import { consola } from 'consola';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

export default async (component, folder) => {
  try {
    const directory = path.resolve(
      __dirname,
      `../../components/examples/${component}`,
    );

    const examples = fs.readdirSync(directory);

    const dataFolder = `${folder}/${component}`;

    if (!fs.existsSync(dataFolder)) {
      fs.mkdirSync(dataFolder);
    }

    for await (const example of examples) {
      const exampleName = example.split('.')[0].toLowerCase();

      if (exampleName === 'index') continue;

      const filename = `${folder}/${component}/${exampleName}.script.js`;

      const writeStream = fs.createWriteStream(filename);

      const writeline = (line, lineChange = true) => {
        writeStream.write(line);

        if (lineChange) {
          writeStream.write('\n');
        }
      };

      let hasInfo = false;
      let isExample = false;
      let isSkipping = false;
      let row = 0;

      const infoText = `/**
 * Example script for ${component} (${example}).
 * Automatically generated at ${new Date().toLocaleString()}.
 *
 * ⚠️ DO NOT EDIT THIS MANUALLY AS IT WILL BE OVERWRITTEN IN THE NEXT BUILD!
 */
`;

      const rl = readline.createInterface({
        input: fs.createReadStream(
          path.resolve(
            __dirname,
            `../../components/examples/${component}/${example}`,
          ),
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

        if (line.replace(/^\s+/g, '').startsWith('<script ')) {
          isExample = true;

          writeline('export default `');

          return;
        }

        if (line.replace(/^\s+/g, '').startsWith('</script>')) {
          isExample = false;
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
    }
  } catch (err) {
    console.error(err);
  }
};
