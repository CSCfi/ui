import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { consola } from 'consola';

try {
  const __filename = fileURLToPath(import.meta.url);

  const __dirname = path.dirname(__filename);

  const cscUiPackage = path.resolve(__dirname, '../../csc-ui/package.json');

  const ducumentationPackage = path.resolve(__dirname, '../package.json');

  const data = fs.readFileSync(cscUiPackage);
  const cscUiJson = JSON.parse(data);

  const documentation = fs.readFileSync(ducumentationPackage);
  const documentationJSon = JSON.parse(documentation);

  documentationJSon.version = cscUiJson.version;

  fs.writeFileSync(
    ducumentationPackage,
    JSON.stringify(documentationJSon, null, 2),
    'utf8',
  );
  consola.success(
    'Documentation version successfully updated to',
    cscUiJson.version,
  );
} catch (error) {
  consola.error('An error has occurred ', error);
}
