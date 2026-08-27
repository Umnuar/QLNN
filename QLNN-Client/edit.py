import sys

file_path = "C:/Projects/QLNN/QLNN-Client/src/pages/ExcelPage.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State changes
content = content.replace(
    "const [exportData, setExportData] = useState<HouseholdFlat[]>([]);\n    const [exportPage, setExportPage] = useState(1);\n    const [exportLimit] = useState(20);",
    "const [exportData, setExportData] = useState<HouseholdFlat[]>([]);\n    const [exportPage, setExportPage] = useState(1);\n    const [exportLimit, setExportLimit] = useState(20);\n    const [exportTotal, setExportTotal] = useState(0);\n    const [exportTotalPages, setExportTotalPages] = useState(1);\n\n    const [importPage, setImportPage] = useState(1);\n    const [importLimit, setImportLimit] = useState(20);"
)

# 2. getDisplayData changes
old_getDisplayData = """  const getDisplayData = () => {
    if (previewMode === 'import') {
      return importData;
    }"""
new_getDisplayData = """  const getDisplayData = () => {
    if (previewMode === 'import') {
      return importData.slice((importPage - 1) * importLimit, importPage * importLimit);
    }"""
content = content.replace(old_getDisplayData, new_getDisplayData)

# 3. Handle File Select reset
old_handleFileSelect_end = """        setImportData(parsedRows);
        setPreviewMode('import');"""
new_handleFileSelect_end = """        setImportData(parsedRows);
        setImportPage(1);
        setImportLimit(20);
        setPreviewMode('import');"""
content = content.replace(old_handleFileSelect_end, new_handleFileSelect_end)

# 4. fetchExportPreview changes
old_fetchExportPreview = """      const res = await householdApi.getPage({
        villageId: targetVillage,
        page: exportPage,
        limit: exportLimit,
      });
      setExportData(res.data);"""
new_fetchExportPreview = """      const res = await householdApi.getPage({
        villageId: targetVillage,
        page: exportPage,
        limit: exportLimit,
      });
      setExportData(res.data);
      setExportTotal(res.pagination.total);
      setExportTotalPages(res.pagination.totalPages);"""
content = content.replace(old_fetchExportPreview, new_fetchExportPreview)

# 5. Add Pagination UI
pagination_ui = """
                {/* Pagination Controls */}
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>Hiển thị</span>
                    <select
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/50"
                      value={previewMode === 'export' ? exportLimit : importLimit}
                      onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        if (previewMode === 'export') {
                          setExportLimit(newLimit);
                          setExportPage(1);
                        } else {
                          setImportLimit(newLimit);
                          setImportPage(1);
                        }
                      }}
                    >
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>/ {previewMode === 'export' ? exportTotal : importData.length} bản ghi</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={(previewMode === 'export' ? exportPage : importPage) === 1}
                      onClick={() => {
                        if (previewMode === 'export') setExportPage(p => Math.max(1, p - 1));
                        else setImportPage(p => Math.max(1, p - 1));
                      }}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Trước
                    </button>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 min-w-[3rem] text-center">
                      {(previewMode === 'export' ? exportPage : importPage)} / {previewMode === 'export' ? exportTotalPages : (Math.ceil(importData.length / importLimit) || 1)}
                    </span>
                    <button
                      type="button"
                      disabled={(previewMode === 'export' ? exportPage : importPage) >= (previewMode === 'export' ? exportTotalPages : Math.ceil(importData.length / importLimit))}
                      onClick={() => {
                        if (previewMode === 'export') setExportPage(p => p + 1);
                        else setImportPage(p => p + 1);
                      }}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Sau
                    </button>
                  </div>
                </div>
"""
old_buttons_start = """                <div className="flex justify-end gap-3 mt-2">"""
new_buttons_start = pagination_ui + """                <div className="flex justify-end gap-3 mt-4">"""
content = content.replace(old_buttons_start, new_buttons_start)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
