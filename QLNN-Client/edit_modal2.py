import re

with open("src/components/excel/ExportSettingsModal.tsx", "r", encoding="utf-8") as f:
    content = f.read()

props_old = '''interface ExportSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (excludeEmpty: boolean) => void;
  exporting: boolean;
  isAdmin: boolean;
}'''
props_new = '''interface ExportSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (scope: 'all' | 'selected') => void;
  exporting: boolean;
  isAdmin: boolean;
  selectedCount?: number;
}'''
content = content.replace(props_old, props_new)

comp_old = '''export const ExportSettingsModal: React.FC<ExportSettingsModalProps> = ({
  isOpen, onClose, onExport, exporting, isAdmin
}) => {
  const [excludeEmpty, setExcludeEmpty] = useState(false);'''
comp_new = '''export const ExportSettingsModal: React.FC<ExportSettingsModalProps> = ({
  isOpen, onClose, onExport, exporting, isAdmin, selectedCount = 0
}) => {
  const [exportScope, setExportScope] = useState<'all' | 'selected'>('all');'''
content = content.replace(comp_old, comp_new)

new_options = '''<div className=\"space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800\">
            <label className=\"flex items-start gap-3 cursor-pointer group\">
              <div className=\"relative flex items-start\">
                <input
                  type=\"radio\"
                  name=\"exportScope\"
                  checked={exportScope === 'all'}
                  onChange={() => setExportScope('all')}
                  className=\"peer w-5 h-5 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-full checked:border-sky-500 checked:border-[6px] transition-all\"
                />
              </div>
              <div>
                <p className=\"text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors\">Toàn bộ hộ trong phạm vi</p>
                <p className=\"text-xs text-slate-500\">Xuất toàn bộ các hộ hiện thị.</p>
              </div>
            </label>
            <label className={`flex items-start gap-3 ${selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'}`}>
              <div className=\"relative flex items-start\">
                <input
                  type=\"radio\"
                  name=\"exportScope\"
                  disabled={selectedCount === 0}
                  checked={exportScope === 'selected'}
                  onChange={() => setExportScope('selected')}
                  className=\"peer w-5 h-5 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-full checked:border-sky-500 checked:border-[6px] transition-all disabled:cursor-not-allowed\"
                />
              </div>
              <div>
                <p className=\"text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors\">Chỉ xuất {selectedCount} hộ đã chọn</p>
                <p className=\"text-xs text-slate-500\">Chỉ xuất các hộ đã được tích chọn trong bảng.</p>
              </div>
            </label>
          </div>'''

content = re.sub(r'<div className=\"space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800\">[\s\S]*?</div>\s*</div>\s*<div className=\"p-5 border-t', new_options + '\n        </div>\n\n        <div className=\"p-5 border-t', content)

content = content.replace('onClick={() => onExport(excludeEmpty)}', 'onClick={() => onExport(exportScope)}')

with open("src/components/excel/ExportSettingsModal.tsx", "w", encoding="utf-8") as f:
    f.write(content)
