import os

file_path = "src/components/settings/BackupRestoreTab.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# Replace React import
text = text.replace("import React from 'react';", "import React, { useRef } from 'react';")

# Replace icons import if needed (no change for lucide-react)
# Add useModal import
text = text.replace("import { secureStorage } from '../../utils/secureStorage';", "import { secureStorage } from '../../utils/secureStorage';\nimport { useModal } from '../../hooks/useModal';")

# Add hooks inside component
hook_decl = """export const BackupRestoreTab: React.FC = () => {
  const { showModal } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);"""
text = text.replace("export const BackupRestoreTab: React.FC = () => {", hook_decl)

# Replace handleRestore
old_handle_restore = """  const handleRestore = () => {
    alert('TA-nh nng khA'i phc `ang `c phAt trin.');
  };"""

new_handle_restore = """  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showModal({
      title: 'Cảnh báo khôi phục dữ liệu',
      content: 'Bạn có chắc chắn muốn khôi phục? Toàn bộ dữ liệu hiện tại sẽ bị xóa sạch và thay thế bằng dữ liệu từ tệp backup.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const text = await file.text();
          const parsedJSON = JSON.parse(text);

          const token = await secureStorage.getItem('accessToken');
          if (!token) {
            alert('Phiên đăng nhập đã hết hạn.');
            return;
          }

          const response = await fetch('http://localhost:5001/api/backup/restore', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(parsedJSON)
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Lỗi khi khôi phục dữ liệu');
          }

          alert('Phục hồi dữ liệu thành công. Vui lòng đăng nhập lại.');
          window.dispatchEvent(new CustomEvent('auth:expired'));
        } catch (err: any) {
          console.error(err);
          alert(`Lỗi khôi phục: ${err.message}`);
        }
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };"""

# Sometimes encoding issues make exact string match fail, let's use regex or split.
import re
text = re.sub(r'const handleRestore = \(\) => {[^}]+};', new_handle_restore, text, flags=re.MULTILINE)

# Replace handleRestore button onClick
text = text.replace("onClick={handleRestore}", "onClick={handleRestoreClick}")

# Add hidden input before closing div or after restore section. Let's add it before </div></div>
# Wait, just add it next to the button.
text = text.replace(
    '<button',
    '<input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleFileChange} />\n            <button',
    1 # Replace first match? No, we want the restore button match.
)
# Actually, the best place is just before the last </div>
text = text.replace("</div>\n    </div>\n  );\n};", "  <input type=\"file\" accept=\".json\" ref={fileInputRef} className=\"hidden\" onChange={handleFileChange} />\n      </div>\n    </div>\n  );\n};")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)
print("Done")
