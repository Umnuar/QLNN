import sys
import re

file_path = r'C:\Users\umnuar\.gemini\config\rules\universal-subagent-workflow.md'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace description
content = re.sub(
    r'description: >\n.*?Triggers Stage C upon completion.',
    'description: >\n  STAGE B (MANDATORY for ALL code changes, no exceptions). 5-phase code execution\n  via Subagent teams. ALL code changes must go through the FULL VERSION (Stage A -> Stage B). Even a 1-line typo fix must go through this workflow. Triggers Stage C upon completion.',
    content,
    flags=re.DOTALL
)

# Remove TWO MODES section and replace with FULL MODE ONLY
content = re.sub(
    r'- TWO MODES:.*?- Review: Full cross-review.',
    '- ONLY ONE MODE: FULL VERSION.\n  - ALL code changes (even typos, 1-line changes) MUST use the FULL VERSION.\n  - Required Phases: B1 -> B2 -> B3 -> B4 -> B5.\n  - Prerequisite: Stage A Master Prompt approved.\n  - Subagents: Specialized team.\n  - Review: Full cross-review.',
    content,
    flags=re.DOTALL
)

# Remove COMPACT MODE entirely
content = re.sub(
    r'- COMPACT MODE.*?## FULL MODE \(LARGE FEATURES/TASKS\)',
    '## FULL VERSION (MANDATORY FOR ALL CHANGES)',
    content,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated rule file")
