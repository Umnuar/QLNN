import os

file_path = "src/components/settings/BackupRestoreTab.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("content: 'Bạn có", "message: 'Bạn có")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)
print("Done")
