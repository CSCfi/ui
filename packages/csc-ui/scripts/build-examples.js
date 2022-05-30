const fs = require('fs');
const path = require('path');
const components = require('./utils/getComponents');

const getExampleScripts = require('./utils/getExampleScripts');
const getExampleTemplates = require('./utils/getExampleTemplates');

const dataFolder = path.resolve(
  __dirname,
  '../documentation/angular/src/app/examples/example-data',
);

if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
}

components.forEach((component) => {
  getExampleScripts(component, `${dataFolder}/${component}.script.js`);
  getExampleTemplates(component, `${dataFolder}/${component}.template.js`);
});
