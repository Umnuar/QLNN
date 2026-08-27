import sys
import re

with open('src/pages/VillagesPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """const handleDelete = (id: string, name: string) => {
    showModal({
      title: 'Xác nhận xóa thôn',
      message: `Bạn có chắc muốn xóa "${name}" không?\nThao tác này không thể hoàn tác.`,
      type: 'danger',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      onConfirm: async () => {
        try {
          await villageApi.delete(id);
          await refreshVillages();
          showModal({
            title: 'Thành công',
            message: 'Đã xóa thôn thành công',
            type: 'success',
          });
        } catch (err: any) {
          if (err.response?.data?.requireForce) {
            showModal({
              title: 'CẢNH BÁO MẤT DỮ LIỆU',
              message: err.response.data.error,
              type: 'danger',
              confirmText: 'Xóa tất cả',
              cancelText: 'Hủy',
              onConfirm: async () => {
                try {
                  await villageApi.delete(id, true);
                  await refreshVillages();
                  showModal({ title: 'Thành công', message: 'Đã xóa thôn và toàn bộ dữ liệu', type: 'success' });
                } catch (forceErr: any) {
                  showModal({ title: 'Lỗi', message: forceErr.response?.data?.error || 'Không thể xóa', type: 'danger' });
                }
              }
            });
          } else {
            showModal({
              title: 'Lỗi',
              message: err.response?.data?.error || 'Không thể xóa thôn',
              type: 'danger',
            });
          }
        }
      }
    });
  };"""

content = re.sub(r'const handleDelete = \(id: string, name: string\) => \{.*?^  };' , replacement, content, flags=re.DOTALL | re.MULTILINE)

with open('src/pages/VillagesPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated VillagesPage.tsx")
