const fs = require('fs');
const path = require('path');
const file = path.join('C:', 'Projects', 'QLNN', 'QLNN-Backend', 'src', 'controllers', 'backup.controller.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /res\.json\(backupData\);/,
  "res.send(JSON.stringify(backupData, null, 2));"
);

fs.writeFileSync(file, content);
console.log('backup.controller.ts updated for pretty JSON.');
