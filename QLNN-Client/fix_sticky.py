import re

with open('src/components/households/HouseholdTable.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# For Checkbox th:
text = re.sub(
    r'<th className="([^"]*text-center w-10[^"]*)"([^>]*)><input type="checkbox"',
    lambda m: f'<th className="{m.group(1)} sticky left-0 z-20 bg-slate-100 dark:bg-slate-950 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)]"{m.group(2)}><input type="checkbox"',
    text
)

# For Checkbox td:
text = re.sub(
    r'<td className="([^"]*px-2[^"]*text-center)"([^>]*)><input type="checkbox"',
    lambda m: f'<td className="{m.group(1)} sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)] transition-colors"{m.group(2)}><input type="checkbox"',
    text
)

# For Thao Tac td:
text = re.sub(
    r'(<td className="[^"]*sticky right-0 z-10[^"]*bg-white dark:bg-slate-900)( whitespace-nowrap)("><button type="button")',
    r'\1 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors\2\3',
    text
)

with open('src/components/households/HouseholdTable.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Done")
