import sys

with open('src/controllers/user.controller.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "import { AuthRequest } from '../middlewares/auth.middleware';",
    "import { AuthRequest } from '../middlewares/auth.middleware';\nimport { isUserOnline } from '../services/userActivity.service';"
)

content = content.replace(
    "res.json(users);",
    "const result = users.map(u => ({ ...u, is_online: isUserOnline(u.id) }));\n      res.json(result);"
)

with open('src/controllers/user.controller.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated user.controller.ts")
