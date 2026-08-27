const fs = require('fs');
const path = require('path');
const file = path.join('src', 'index.ts');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('backup.routes')) {
  // Add imports
  content = content.replace(
    /import userRoutes from '\.\/routes\/user\.routes';/,
    "import userRoutes from './routes/user.routes';\nimport backupRoutes from './routes/backup.routes';\nimport { initBackupCron } from './crons/backup.cron';"
  );
  
  // Add route mounting
  content = content.replace(
    /app\.use\('\/api\/users', userRoutes\);/,
    "app.use('/api/users', userRoutes);\napp.use('/api/backup', backupRoutes);"
  );

  // Initialize cron before server start
  content = content.replace(
    /app\.listen\(PORT, \(\) => {/,
    "// Khởi chạy các tác vụ nền\ninitBackupCron();\n\napp.listen(PORT, () => {"
  );

  fs.writeFileSync(file, content);
  console.log('index.ts updated.');
} else {
  console.log('Already updated');
}
