import sys

with open('src/controllers/analytics.controller.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("v.householdCount,", "v.household_count,")

with open('src/controllers/analytics.controller.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed variable name")
