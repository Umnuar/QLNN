const fs = require('fs');
const path = require('path');
const file = path.join('C:', 'Projects', 'QLNN', 'QLNN-Client', 'src', 'components', 'settings', 'BackupRestoreTab.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add apiClient and secureStorage imports
content = content.replace(
  /import \{ Database, Download, UploadCloud, AlertTriangle, ShieldCheck \} from 'lucide-react';/,
  "import { Database, Download, UploadCloud, AlertTriangle, ShieldCheck } from 'lucide-react';\nimport { secureStorage } from '../../utils/secureStorage';"
);

// 2. Rewrite handleAction
const handleActionOriginal =   const handleAction = () => {
    alert('Chức năng đang được cập nhật ở Backend');
  };;

const handleActionNew =   const handleAction = async () => {
    try {
      const token = await secureStorage.getItem('accessToken');
      if (!token) {
        alert('Phiên đăng nhập đã hết hạn.');
        return;
      }
      
      const response = await fetch('http://localhost:5001/api/backup/export', {
        headers: {
          'Authorization': \Bearer \\
        }
      });
      
      if (!response.ok) {
        throw new Error('Lỗi khi xuất dữ liệu');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \Dakha_Backup_\.json\;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Không thể tải bản sao lưu. Vui lòng kiểm tra quyền Admin hoặc kết nối máy chủ.');
    }
  };;

content = content.replace(
  /const handleAction = \(\) => \{\s+alert\('Ch.*?'\);\s+\};/s,
  handleActionNew
);

fs.writeFileSync(file, content);
console.log('BackupRestoreTab.tsx updated.');
