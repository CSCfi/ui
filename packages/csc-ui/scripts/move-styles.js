const fs = require('fs');

const dirs = [
  '../csc-ui-react/dist/styles',
];

for (const dir of dirs) {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.cp('./dist/styles', dir, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
    }
  });
}
