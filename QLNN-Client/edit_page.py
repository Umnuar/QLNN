import re

with open("src/pages/HouseholdsPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add state and toggle functions
state_code = """
  const [selectedHouseholdIds, setSelectedHouseholdIds] = useState<string[]>([]);

  const onToggleSelect = (id: string) => {
    setSelectedHouseholdIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const onToggleSelectAll = () => {
    if (households.length > 0 && selectedHouseholdIds.length === households.length) {
      setSelectedHouseholdIds([]);
    } else {
      setSelectedHouseholdIds(households.map(hh => hh.id as string));
    }
  };
"""

content = content.replace("const [isUsingCachedData, setIsUsingCachedData] = useState(false);", 
                          "const [isUsingCachedData, setIsUsingCachedData] = useState(false);\n" + state_code)

# Modify handleExportConfirm
export_old = """const handleExportConfirm = async (excludeEmpty: boolean) => {
    setExporting(true);
    try {
      const targetVillage = user?.role === 'admin' ? selectedVillageId : undefined;
      const blob = await excelApi.exportExcel(targetVillage, excludeEmpty ? 'true' : undefined);"""
export_new = """const handleExportConfirm = async (exportScope: 'all' | 'selected') => {
    setExporting(true);
    try {
      const targetVillage = user?.role === 'admin' ? selectedVillageId : undefined;
      const selectedIds = exportScope === 'selected' ? selectedHouseholdIds : undefined;
      const blob = await excelApi.exportExcel(targetVillage, selectedIds);"""

content = content.replace(export_old, export_new)

# Add props to HouseholdTable
table_old = "<HouseholdTable\n        households={households}"
table_new = "<HouseholdTable\n        selectedIds={selectedHouseholdIds}\n        onToggleSelect={onToggleSelect}\n        onToggleSelectAll={onToggleSelectAll}\n        households={households}"
content = content.replace(table_old, table_new)

# Add props to ExportSettingsModal
modal_old = "<ExportSettingsModal\n        isOpen={isExportModalOpen}\n        onClose={() => setIsExportModalOpen(false)}\n        onExport={handleExportConfirm}"
modal_new = "<ExportSettingsModal\n        isOpen={isExportModalOpen}\n        onClose={() => setIsExportModalOpen(false)}\n        onExport={handleExportConfirm}\n        selectedCount={selectedHouseholdIds.length}"
content = content.replace(modal_old, modal_new)

with open("src/pages/HouseholdsPage.tsx", "w", encoding="utf-8") as f:
    f.write(content)
