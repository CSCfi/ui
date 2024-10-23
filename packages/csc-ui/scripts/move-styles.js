const fs = require('fs');

const dirs = [
  '../csc-ui-for-react/dist/styles',
  '../csc-ui-for-vue/dist/styles',
];

for (const dir of dirs) {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.cp('./dist/components/styles', dir, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
    }
  });
}
