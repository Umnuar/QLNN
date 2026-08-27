import os

file_path = "src/routes/backup.routes.ts"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# Replace the import
text = text.replace("import { exportDatabase } from '../controllers/backup.controller';", "import { exportDatabase, restoreDatabase } from '../controllers/backup.controller';")

# Add the route
route_to_add = "\nrouter.post('/restore', authenticateToken, restoreDatabase);\n"
if "router.post('/restore'" not in text:
    text = text.replace("export default router;", f"{route_to_add}\nexport default router;")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)
print("Done")
