const fs = require('fs');
const path = './src/components/households/HouseholdTable.tsx';
let text = fs.readFileSync(path, 'utf8');

// 1. Fix full mode Checkbox th
// Find: <th rowSpan={2} className="py-3 px-2 text-center w-10 border-r border-slate-200/80 dark:border-slate-800"><input type="checkbox"
text = text.replace(
    /<th rowSpan=\{2\} className="([^"]*text-center w-10[^"]*)"([^>]*)><input type="checkbox"/g,
    (match, p1, p2) => {
        let cls = p1.replace(/sticky left-0 z-20/g, '').replace(/shadow-\[[^\]]+\]/g, '');
        cls = cls.trim() + ' sticky left-0 z-20 bg-slate-100 dark:bg-slate-950 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)]';
        // Note: we remove rowSpan={2}
        return `<th className="${cls}"${p2}><input type="checkbox"`;
    }
);

// 2. Fix full mode Thao Tac th
// Find: <th rowSpan={2} className="py-3 px-3 text-center min-w-[90px] sticky right-0 z-20 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] bg-slate-100 dark:bg-slate-950 shadow-xs whitespace-nowrap">Thao T
text = text.replace(
    /<th rowSpan=\{2\} className="([^"]*sticky right-0 z-20[^"]*)"([^>]*)>Thao T/g,
    (match, p1, p2) => {
        // Just remove rowSpan={2}
        return `<th className="${p1}"${p2}>Thao T`;
    }
);

// 3. Inject empty th into the second row of full mode header
// Find: <tr className="bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-b border-slate-200/90 dark:border-slate-800 text-[11px] font-bold">\n                  <th className="py-2 px-2 text-right
// We need to inject <th className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-900/90 border-r border-slate-200/80 dark:border-slate-800 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)]"></th> at the start
// And inject <th className="sticky right-0 z-20 bg-slate-50 dark:bg-slate-900/90 border-l border-slate-200/80 dark:border-slate-800 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]"></th> at the end.
// Wait, is it better to just keep rowSpan={2} but fix the CSS?
// Is there a known CSS fix for sticky with rowSpan?
// YES! `z-index` is the fix! But we already have `z-20` on the `th`.
// Wait... if `z-20` is there, why does it have a hole in the second row?
// Because the second row cell (which is implicitly covered by rowSpan) does NOT inherit `position: sticky` and `right: 0` in Blink!
// To fix it, you either split the rowSpan, OR ... there is no pure CSS fix for the implicit cell. Splitting is the only robust way!

text = text.replace(
    /(<tr className="bg-slate-50 dark:bg-slate-900\/90 text-slate-700 dark:text-slate-300 border-b border-slate-200\/90 dark:border-slate-800 text-\[11px\] font-bold">\s*)(<th className="py-2 px-2 text-right)/g,
    `$1<th className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-900/90 border-r border-slate-200/80 dark:border-slate-800 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)]"></th>\n                  $2`
);

// To inject the Thao Tac at the end of the second row:
// Find: <th className="py-2 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 whitespace-nowrap">Cá lồng \(lồng\)<\/th>\s*<\/tr>/
// Actually the text doesn't have accents if read literally, but we can match:
// <th className="py-2 px-2 text-right border-r border-slate-200/80 dark:border-slate-800 whitespace-nowrap">[^<]+l.*?ng\)?<\/th>\s*<\/tr>
text = text.replace(
    /(<th className="py-2 px-2 text-right border-r border-slate-200\/80 dark:border-slate-800 whitespace-nowrap">[^<]+l.*?ng\)?<\/th>\s*)(<\/tr>)/g,
    `$1{!readOnly && <th className="sticky right-0 z-20 bg-slate-50 dark:bg-slate-900/90 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] border-l border-slate-200/80 dark:border-slate-800"></th>}\n                $2`
);

fs.writeFileSync(path, text);
console.log('Done');
