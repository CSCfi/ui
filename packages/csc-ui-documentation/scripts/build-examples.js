import path from 'path';
import { fileURLToPath } from 'url';
import components from './utils/getComponents.js';
import getExampleScripts from './utils/getExampleScripts.js';
import getExampleTemplates from './utils/getExampleTemplates.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const dataFolder = path.resolve(__dirname, '../example-data');

if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
}

components.forEach((component) => {
  getExampleScripts(component, `${dataFolder}/${component}.script.js`);
  getExampleTemplates(component, `${dataFolder}/${component}.template.js`);
});
