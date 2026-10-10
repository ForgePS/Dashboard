#!/usr/bin/env python3
"""Audit migrated SPFx source/config for forbidden Google dependencies.
Run: python sharepoint/scripts/audit-google-dependencies.py
This does not scan root legacy Firebase source: it must remain until cutover.
"""
from pathlib import Path
import re
root = Path(__file__).resolve().parents[1]
patterns = [
    r'firebase(?:app|admin|functions)?',
    r'firestore',
    r'googleapis',
    r'docs\.google\.com',
    r'\.web\.app',
    r'\.firebaseapp\.com',
]
excluded = {'README.md', 'GOOGLE-DEPENDENCY-INVENTORY.md', 'MIGRATION-CHECKLIST.md', 'TEST-CASES.md'}
violations = []
for path in root.rglob('*'):
    if not path.is_file() or path.name in excluded or 'scripts' in path.parts or 'docs' in path.parts:
        continue
    if path.suffix.lower() not in {'.ts', '.tsx', '.js', '.jsx', '.json', '.html'}:
        continue
    text = path.read_text(encoding='utf-8')
    for expr in patterns:
        if re.search(expr, text, re.IGNORECASE):
            violations.append(f'{path.relative_to(root)}: {expr}')
if violations:
    print('\n'.join(violations))
    raise SystemExit('Google/Firebase dependencies detected in SharePoint application files.')
print('No forbidden Google/Firebase dependency strings found in SharePoint application files.')
