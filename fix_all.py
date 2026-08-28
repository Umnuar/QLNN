import os
import re

# 1. HouseholdTable.tsx
file_table = r"C:\Projects\QLNN\QLNN-Client\src\components\households\HouseholdTable.tsx"
with open(file_table, 'r', encoding='utf-8') as f:
    table_code = f.read()

# Update colSpan to 9 for empty/loading rows
table_code = table_code.replace('colSpan={8}', 'colSpan={9}')

# Add checkbox cell to overview viewMode
stt_td = '<td className="py-3.5 px-3.5 border-r border-slate-100 dark:border-slate-800/60 text-center font-mono font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">\n                          {stt}\n                        </td>'
checkbox_td = '<td className="py-3 px-2 border-r border-slate-100 dark:border-slate-800/60 text-center"><input type="checkbox" className="w-4 h-4 cursor-pointer accent-emerald-600 rounded" checked={selectedIds.includes(hh.id!)} onChange={() => onToggleSelect && onToggleSelect(hh.id!)} onClick={(e) => e.stopPropagation()} /></td>'

# Wait, we need to add the checkbox cell only in overview. The overview map starts at line 237.
# Let's replace the stt_td. But wait, stt_td is unique enough for overview map?
# Let's use re.sub for the overview table row.
old_overview_row_start = """                      <tr
                        key={hh.id}
                        onDoubleClick={() => !readOnly && onEdit(hh)}
                        className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 transition-colors group text-[13.5px] cursor-pointer"
                        title="Bấm đúp để sửa số liệu hộ này"
                      >
                        <td className="py-3.5 px-3.5 border-r border-slate-100 dark:border-slate-800/60 text-center font-mono font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {stt}
                        </td>"""
new_overview_row_start = """                      <tr
                        key={hh.id}
                        onDoubleClick={() => !readOnly && onEdit(hh)}
                        className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 transition-colors group text-[13.5px] cursor-pointer"
                        title="Bấm đúp để sửa số liệu hộ này"
                      >
                        <td className="py-3 px-2 border-r border-slate-100 dark:border-slate-800/60 text-center"><input type="checkbox" className="w-4 h-4 cursor-pointer accent-emerald-600 rounded" checked={selectedIds.includes(hh.id!)} onChange={() => onToggleSelect && onToggleSelect(hh.id!)} onClick={(e) => e.stopPropagation()} /></td>
                        <td className="py-3.5 px-3.5 border-r border-slate-100 dark:border-slate-800/60 text-center font-mono font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {stt}
                        </td>"""
table_code = table_code.replace(old_overview_row_start, new_overview_row_start)

# Update Thủy Sản cell logic in overview
old_aqua_cell = "{hh.fish_pond ? cryptoHelper.formatArea(hh.fish_pond) : hh.fish_cage ? `${hh.fish_cage} lồng` : '-'}"
new_aqua_cell = "{hh.fish_pond && hh.fish_cage ? `${cryptoHelper.formatArea(hh.fish_pond)} • ${hh.fish_cage} lồng` : hh.fish_pond ? cryptoHelper.formatArea(hh.fish_pond) : hh.fish_cage ? `${hh.fish_cage} lồng` : '-'}"
table_code = table_code.replace(old_aqua_cell, new_aqua_cell)

with open(file_table, 'w', encoding='utf-8') as f:
    f.write(table_code)

# 2. householdApi.ts
file_api = r"C:\Projects\QLNN\QLNN-Client\src\api\householdApi.ts"
with open(file_api, 'r', encoding='utf-8') as f:
    api_code = f.read()

api_code = api_code.replace("const res = await apiClient.post('/households/bulk-delete', { ids });", "const res = await apiClient.delete('/households', { data: { ids } });")

with open(file_api, 'w', encoding='utf-8') as f:
    f.write(api_code)

# 3. HouseholdsPage.tsx
file_page = r"C:\Projects\QLNN\QLNN-Client\src\pages\HouseholdsPage.tsx"
with open(file_page, 'r', encoding='utf-8') as f:
    page_code = f.read()

# Add useEffect to clear selections
page_code = page_code.replace(
    "  useEffect(() => {\n    fetchHouseholds();\n  }, [fetchHouseholds]);",
    "  useEffect(() => {\n    fetchHouseholds();\n  }, [fetchHouseholds]);\n\n  useEffect(() => {\n    setSelectedHouseholdIds([]);\n  }, [page, limit, search, selectedVillageId]);"
)

# Add Sticky Action Bar
action_bar_code = """
      {/* Sticky Action Bar */}
      {selectedHouseholdIds.length > 0 && (
        <div className="sticky top-4 z-50 bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-3 flex items-center justify-between shadow-lg">
          <div className="text-emerald-800 dark:text-emerald-300 font-bold text-sm">
            Đã chọn {selectedHouseholdIds.length} hộ
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedHouseholdIds([])}
              className="px-4 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold shadow-sm"
            >
              Bỏ chọn
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Xuất Excel
            </button>
            <button
              onClick={() => {
                showModal({
                  title: 'Xóa hàng loạt',
                  message: `Bạn có chắc chắn muốn xóa ${selectedHouseholdIds.length} hộ đã chọn?`,
                  type: 'danger',
                  confirmText: 'Xóa',
                  cancelText: 'Hủy',
                  onConfirm: async () => {
                    try {
                      await householdApi.bulkDelete(selectedHouseholdIds);
                      setSelectedHouseholdIds([]);
                      fetchHouseholds();
                    } catch (err) {
                      showModal({ title: 'Lỗi', message: 'Không thể xóa hàng loạt.', type: 'danger' });
                    }
                  }
                });
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              Xóa
            </button>
          </div>
        </div>
      )}
"""
page_code = page_code.replace(
    "      <HouseholdFilterBar",
    action_bar_code + "\n      <HouseholdFilterBar"
)

with open(file_page, 'w', encoding='utf-8') as f:
    f.write(page_code)

# 4. household.routes.ts
file_routes = r"C:\Projects\QLNN\QLNN-Backend\src\routes\household.routes.ts"
with open(file_routes, 'r', encoding='utf-8') as f:
    routes_code = f.read()

routes_code = routes_code.replace(
    "  deleteHousehold,\n} from '../controllers/household.controller';",
    "  deleteHousehold,\n  bulkDeleteHouseholds\n} from '../controllers/household.controller';"
)

routes_code = routes_code.replace(
    "router.delete('/:id', deleteHousehold);",
    "router.delete('/', bulkDeleteHouseholds);\nrouter.delete('/:id', deleteHousehold);"
)

with open(file_routes, 'w', encoding='utf-8') as f:
    f.write(routes_code)

# 5. household.controller.ts
file_controller = r"C:\Projects\QLNN\QLNN-Backend\src\controllers\household.controller.ts"
with open(file_controller, 'r', encoding='utf-8') as f:
    controller_code = f.read()

bulk_delete_code = """
export const bulkDeleteHouseholds = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'Danh sách ID không hợp lệ' });
      return;
    }

    const households = await prisma.households.findMany({
      where: { id: { in: ids }, is_deleted: false },
    });

    if (households.length === 0) {
      res.status(404).json({ error: 'Không tìm thấy hộ nông nghiệp nào để xóa' });
      return;
    }

    // RBAC Check
    if (req.user?.role === 'user' && req.user.village_id) {
      const invalid = households.some(hh => hh.village_id !== req.user!.village_id);
      if (invalid) {
        res.status(403).json({ error: 'Không có quyền xóa dữ liệu thôn khác' });
        return;
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.households.updateMany({
        where: { id: { in: ids } },
        data: { is_deleted: true, deleted_at: new Date() },
      });

      // Group by village to record audit logs appropriately
      const byVillage: Record<string, string[]> = {};
      households.forEach(hh => {
        if (!byVillage[hh.village_id]) byVillage[hh.village_id] = [];
        byVillage[hh.village_id].push(hh.full_name);
      });

      for (const [village_id, names] of Object.entries(byVillage)) {
        await tx.audit_logs.create({
          data: {
            user_id: req.user?.id || null,
            username: req.user?.username || 'System',
            village_id,
            action: 'DELETE',
            entity_type: 'households',
            entity_id: 'BULK',
            details: JSON.stringify({ message: `Xóa hàng loạt ${names.length} hộ dân`, names }),
          },
        });
      }
    });

    res.json({ count: households.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi xóa hàng loạt' });
  }
};
"""

controller_code = controller_code + "\n" + bulk_delete_code

with open(file_controller, 'w', encoding='utf-8') as f:
    f.write(controller_code)
