import os

file_path = "src/index.ts"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("express.json({ limit: '10mb' })", "express.json({ limit: '50mb' })")
text = text.replace("express.urlencoded({ extended: true, limit: '10mb' })", "express.urlencoded({ extended: true, limit: '50mb' })")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)
print("Done")
