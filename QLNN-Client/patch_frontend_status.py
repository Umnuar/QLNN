import sys
import re

with open('src/pages/SettingsPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """<td className="px-6 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="relative flex h-2.5 w-2.5" title={u.is_online ? 'Đang hoạt động' : 'Ngoại tuyến'}>
                                  {u.is_online && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  )}
                                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${u.is_online ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white">{u.username}</span>
                              </div>
                            </td>"""

content = re.sub(r'<td className="px-6 py-3\.5 font-bold text-slate-900 dark:text-white">\{u\.username\}</td>', replacement, content)

with open('src/pages/SettingsPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated frontend table")
