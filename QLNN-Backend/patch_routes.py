import sys

with open('src/routes/analytics.routes.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "import { getOverviewAnalytics, getAnalyticsByVillage } from '../controllers/analytics.controller';",
    "import { getOverviewAnalytics, getAnalyticsByVillage, exportAnalyticsExcel } from '../controllers/analytics.controller';"
)

content = content.replace(
    "// GET /api/analytics/by-village\nrouter.get('/by-village', getAnalyticsByVillage);",
    "// GET /api/analytics/by-village\nrouter.get('/by-village', getAnalyticsByVillage);\n\n// GET /api/analytics/export-comparison\nrouter.get('/export-comparison', exportAnalyticsExcel);"
)

with open('src/routes/analytics.routes.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated routes successfully")
