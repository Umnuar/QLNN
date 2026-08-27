import os

file_path = "src/components/settings/BackupRestoreTab.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# Remove the one inside the export section
text = text.replace('<input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleFileChange} />\n            <button\n              type="button"\n              onClick={handleExport}', '<button\n              type="button"\n              onClick={handleExport}')

# Let's write back
with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)
print("Done")
