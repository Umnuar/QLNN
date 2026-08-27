import fs from 'fs';
import path from 'path';

function getAllTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllTsxFiles(filePath, fileList);
    } else if (filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function runThemeTest() {
  const srcDir = path.join(process.cwd(), 'src');
  const tsxFiles = getAllTsxFiles(srcDir);
  let hasError = false;

  const rules = [
    {
      name: 'Missing dark:bg-slate-900/800 for bg-white',
      regex: /className="[^"]*?(?<![:\/])\bbg-white(?!\/)\b(?![^"]*?\bdark:bg-(slate-(800|900|950)|transparent)\b)[^"]*?"/g
    },
    {
      name: 'Missing dark:text-slate-100/200/300/white for text-slate-900',
      regex: /className="[^"]*?(?<![:\/])\btext-slate-900(?!\/)\b(?![^"]*?\bdark:text-(slate-(100|200|300|400)|white)\b)[^"]*?"/g
    },
    {
      name: 'Missing dark:border-slate-700/800 for border-slate-200',
      regex: /className="[^"]*?(?<![:\/])\bborder-slate-200(?!\/)\b(?![^"]*?\bdark:border-slate-(700|800|900)\b)[^"]*?"/g
    },
    {
      name: 'Hardcoded bg-slate-900 without light theme bg',
      regex: /className="[^"]*?(?<![:\/])\bbg-slate-900(?!\/)\b(?![^"]*?\bdark:bg-(slate-\d+|white)\b)[^"]*?"/g
    },
    {
      name: 'Hardcoded bg-slate-950 without light theme bg',
      regex: /className="[^"]*?(?<![:\/])\bbg-slate-950(?!\/)\b(?![^"]*?\bdark:bg-(slate-\d+|white)\b)[^"]*?"/g
    }
  ];

  for (const file of tsxFiles) {
    const content = fs.readFileSync(file, 'utf8');
    
    for (const rule of rules) {
      const matches = content.match(rule.regex);
      if (matches) {
        console.error(`[FAIL] ${rule.name} in ${path.relative(process.cwd(), file)}`);
        matches.forEach(m => console.error(`  Found: ${m}`));
        hasError = true;
      }
    }
  }

  if (hasError) {
    console.error('\n❌ Theme test failed. Please fix the missing dark/light classes.');
    process.exit(1);
  } else {
    console.log('✅ Theme test passed!');
    process.exit(0);
  }
}

runThemeTest();
