import re

with open("src/components/excel/ExportSettingsModal.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Change props
props_old = """interface ExportSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (excludeEmpty: boolean) => void;
  exporting: boolean;
  isAdmin: boolean;
}"""
props_new = """interface ExportSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (scope: 'all' | 'selected') => void;
  exporting: boolean;
  isAdmin: boolean;
  selectedCount?: number;
}"""
content = content.replace(props_old, props_new)

# Component destructuring
comp_old = """export const ExportSettingsModal: React.FC<ExportSettingsModalProps> = ({
  isOpen, onClose, onExport, exporting, isAdmin
}) => {
  const [excludeEmpty, setExcludeEmpty] = useState(false);"""
comp_new = """export const ExportSettingsModal: React.FC<ExportSettingsModalProps> = ({
  isOpen, onClose, onExport, exporting, isAdmin, selectedCount = 0
}) => {
  const [exportScope, setExportScope] = useState<'all' | 'selected'>('all');"""
content = content.replace(comp_old, comp_new)

# Replace the excludeEmpty checkbox section with Radio buttons
old_options = """<div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-start">
                <input
                  type="checkbox"
                  checked={excludeEmpty}
                  onChange={(e) => setExcludeEmpty(e.target.checked)}
                  className="peer w-5 h-5 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-lg checked:border-sky-500 checked:bg-sky-500 transition-all"
                />
                <svg className="absolute inset-0 w-5 h-5 p-1 pointer-events-none opacity-0 peer-checked:opacity-100 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-sky-600 transition-colors">Loi b? hT tr`ng</p>
                <p className="text-xs text-slate-500">Ch% xut nh_ng hT cA3 d_ liu cAy tr"ng, v-t nuA'i hoc th y sn.</p>
              </div>
            </label>
          </div>"""

new_options = """<div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-start">
                <input
                  type="radio"
                  name="exportScope"
                  checked={exportScope === 'all'}
                  onChange={() => setExportScope('all')}
                  className="peer w-5 h-5 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-full checked:border-sky-500 checked:border-[6px] transition-all"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">ToAn bT hT trong phm vi</p>
                <p className="text-xs text-slate-500">Xut toAn bT cAc hT hin th.</p>
              </div>
            </label>
            <label className={`flex items-start gap-3 ${selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'}`}>
              <div className="relative flex items-start">
                <input
                  type="radio"
                  name="exportScope"
                  disabled={selectedCount === 0}
                  checked={exportScope === 'selected'}
                  onChange={() => setExportScope('selected')}
                  className="peer w-5 h-5 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-full checked:border-sky-500 checked:border-[6px] transition-all disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">Ch% xut {selectedCount} hT `A ch?n</p>
                <p className="text-xs text-slate-500">Ch% xut cAc hT `A `?c tA-ch ch?n trong bng.</p>
              </div>
            </label>
          </div>"""
content = content.replace(old_options, new_options)

# Update the button click handler
button_old = "onClick={() => onExport(excludeEmpty)}"
button_new = "onClick={() => onExport(exportScope)}"
content = content.replace(button_old, button_new)

with open("src/components/excel/ExportSettingsModal.tsx", "w", encoding="utf-8") as f:
    f.write(content)
