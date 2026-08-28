const fs = require('fs');
const path = './src/components/households/HouseholdTable.tsx';
let text = fs.readFileSync(path, 'utf8');

// 1. Fix Checkbox <th>
text = text.replace(/<th className="([^"]*)"([^>]*)><input type="checkbox"/g, (match, p1, p2) => {
    let cls = p1.replace(/sticky left-0 z-20/g, '').replace(/shadow-\[[^\]]+\]/g, '');
    cls = cls.trim() + ' sticky left-0 z-20 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)]';
    if (!cls.includes('bg-')) {
        cls += ' bg-slate-100 dark:bg-slate-950';
    }
    return `<th className="${cls}"${p2}><input type="checkbox"`;
});

// 2. Fix Checkbox <td>
text = text.replace(/<td className="([^"]*)"([^>]*)><input type="checkbox"/g, (match, p1, p2) => {
    let cls = p1.replace(/sticky left-0 z-10/g, '').replace(/shadow-\[[^\]]+\]/g, '').replace(/group-hover:[^\s]+/g, '').replace(/bg-[^\s]+/g, '').replace(/transition-colors/g, '');
    cls = cls.trim() + ' sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-emerald-50/70 dark:group-hover:bg-slate-800 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)] transition-colors';
    return `<td className="${cls}"${p2}><input type="checkbox"`;
});

// 3. Fix Thao Tác <th>
text = text.replace(/<th className="([^"]*)"([^>]*)>Thao T.*?c<\/th>/g, (match, p1, p2) => {
    let cls = p1.replace(/sticky right-0 z-20/g, '').replace(/shadow-\[[^\]]+\]/g, '');
    cls = cls.trim() + ' sticky right-0 z-20 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]';
    return `<th className="${cls}"${p2}>Thao Tác</th>`;
});

// 4. Fix Thao Tác <td>
text = text.replace(/<td className="([^"]*)"([^>]*)><button type="button"/g, (match, p1, p2) => {
    let cls = p1.replace(/sticky right-0 z-10/g, '').replace(/shadow-\[[^\]]+\]/g, '').replace(/group-hover:[^\s]+/g, '').replace(/bg-[^\s]+/g, '').replace(/transition-colors/g, '');
    cls = cls.trim() + ' sticky right-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-emerald-50/70 dark:group-hover:bg-slate-800 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] transition-colors';
    return `<td className="${cls}"${p2}><button type="button"`;
});

fs.writeFileSync(path, text);
console.log('Done');
