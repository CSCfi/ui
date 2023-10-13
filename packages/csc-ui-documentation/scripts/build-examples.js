import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import components from './utils/getComponents.js';
import getExampleScripts from './utils/getExampleScripts.js';
import getExampleTemplates from './utils/getExampleTemplates.js';
import getTypes from './utils/getTypes.js';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const dataFolder = path.resolve(__dirname, '../example-data');

if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
}

getTypes(`${dataFolder}/types.js`);

components.forEach((component) => {
  getExampleScripts(component, `${dataFolder}/${component}.script.js`);
  getExampleTemplates(component, `${dataFolder}/${component}.template.js`);
});
