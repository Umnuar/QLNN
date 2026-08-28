import re

with open("src/components/households/HouseholdTable.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("interface HouseholdTableProps {", "interface HouseholdTableProps {\n  selectedIds?: string[];\n  onToggleSelect?: (id: string) => void;\n  onToggleSelectAll?: () => void;")
content = content.replace("export const HouseholdTable: React.FC<HouseholdTableProps> = ({", "export const HouseholdTable: React.FC<HouseholdTableProps> = ({\n  selectedIds = [],\n  onToggleSelect,\n  onToggleSelectAll,")

def replace_th(m):
    original_th = m.group(0)
    rowspan = "rowSpan={2} " if "rowSpan={2}" in original_th else ""
    border_class = [cls for cls in original_th.split() if cls.startswith("border-") and not cls == "border-r"]
    border_classes = " ".join(border_class) if border_class else "border-slate-200/60 dark:border-slate-800"
    checkbox_th = f'<th {rowspan}className="py-3 px-2 text-center w-10 border-r {border_classes}"><input type="checkbox" className="w-4 h-4 cursor-pointer accent-emerald-600 rounded" checked={{households.length > 0 && selectedIds.length === households.length}} onChange={{() => onToggleSelectAll && onToggleSelectAll()}} /></th>'
    return checkbox_th + "\n                  " + original_th

content = re.sub(r'<th[^>]*>STT</th>', replace_th, content)

def replace_td(m):
    original_td = m.group(0)
    checkbox_td = '<td className="py-3 px-2 border-r border-slate-100 dark:border-slate-800/60 text-center"><input type="checkbox" className="w-4 h-4 cursor-pointer accent-emerald-600 rounded" checked={selectedIds.includes(hh.id)} onChange={() => onToggleSelect && onToggleSelect(hh.id)} onClick={(e) => e.stopPropagation()} /></td>'
    return checkbox_td + "\n                    " + original_td

content = re.sub(r'<td[^>]*>\{\(page - 1\) \* limit \+ idx \+ 1\}</td>', replace_td, content)

with open("src/components/households/HouseholdTable.tsx", "w", encoding="utf-8") as f:
    f.write(content)
