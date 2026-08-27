import sys

with open('src/controllers/analytics.controller.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "views: [{ showGridLines: false }]",
    "views: [{ showGridLines: false, state: 'frozen', xSplit: 1, ySplit: 5 }]"
)

with open('src/controllers/analytics.controller.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added freeze panes")
