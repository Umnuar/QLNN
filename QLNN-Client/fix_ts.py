import re

with open("src/components/households/HouseholdTable.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace hh.id with hh.id! in my added code
content = content.replace("selectedIds.includes(hh.id)", "selectedIds.includes(hh.id!)")
content = content.replace("onToggleSelect(hh.id)", "onToggleSelect(hh.id!)")

with open("src/components/households/HouseholdTable.tsx", "w", encoding="utf-8") as f:
    f.write(content)

with open("src/components/layout/Sidebar.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remove FileSpreadsheet import
content = re.sub(r'\s*FileSpreadsheet,', '', content)

with open("src/components/layout/Sidebar.tsx", "w", encoding="utf-8") as f:
    f.write(content)
