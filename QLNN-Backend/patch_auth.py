import sys

with open('src/middlewares/auth.middleware.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "import { verifyAccessToken, TokenPayload } from '../config/jwt';",
    "import { verifyAccessToken, TokenPayload } from '../config/jwt';\nimport { trackActivity } from '../services/userActivity.service';"
)

content = content.replace(
    "req.user = decoded;\n    next();",
    "req.user = decoded;\n    trackActivity(decoded.id);\n    next();"
)

with open('src/middlewares/auth.middleware.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated auth.middleware.ts")
