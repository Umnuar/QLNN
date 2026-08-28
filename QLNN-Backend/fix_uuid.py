import sys

filepath = 'C:/Projects/QLNN/QLNN-Backend/src/controllers/household.controller.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("entity_id: 'BULK',", "entity_id: null,")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement done.")
