import path from 'path';
import { fileURLToPath } from 'url';
import components from './utils/getComponents.js';
import getExampleScripts from './utils/getExampleScripts.js';
import getExampleTemplates from './utils/getExampleTemplates.js';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const dataFolder = path.resolve(__dirname, '../example-data');

// console.log(components);

components.forEach((component) => {
  getExampleScripts(component, `${dataFolder}/${component}.script.js`);
  getExampleTemplates(component, `${dataFolder}/${component}.template.js`);
});
