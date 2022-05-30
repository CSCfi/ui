const path = require('path');
const fs = require('fs');

const directory = path.resolve(
  __dirname,
  '../../documentation/angular/src/app/examples/',
);

const components = [];

fs.readdirSync(directory).forEach((file) => {
  if (
    fs.lstatSync(path.resolve(directory, file)).isDirectory() &&
    file.startsWith('c-')
  ) {
    components.push(file);
  }
});

module.exports = components;
