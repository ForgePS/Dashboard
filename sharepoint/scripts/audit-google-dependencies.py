#!/usr/bin/env python3
"""Detect runtime Google/Firebase dependencies in SharePoint application source.

This audit deliberately permits URL rejection lists in src/playlist.ts.
It does not inspect legacy root Firebase code, generated builds, or test fixtures.
"""
from pathlib import Path
import re
root = Path(__file__).resolve().parents[1]
checks = [
    re.compile(r"""(?:from\s*|require\s*\(\s*|import\s*\(\s*)['"](?:firebase|@firebase|firebase-admin|firebase-functions|googleapis)(?:[/.'"])""", re.I),
    re.compile(r"""(?:fetch\s*\(\s*|axios\s*\.\s*(?:get|post)\s*\(\s*)['`"]https?://[^'"`]*(?:docs\.google\.com|firebaseapp\.com|web\.app|googleapis\.com)""", re.I),
]
violations = []
for folder in (root / 'src',):
    for file in folder.rglob('*'):
        if file.suffix not in ('.ts', '.tsx', '.js', '.jsx'):
            continue
        source = file.read_text(encoding='utf-8')
        for index, line in enumerate(source.splitlines(), 1):
            if any(pattern.search(line) for pattern in checks):
                violations.append(f'{file.relative_to(root)}:{index}: runtime Google dependency')
if violations:
    print('\n'.join(violations))
    raise SystemExit(1)
print('SharePoint application source contains no detected runtime Google/Firebase imports or requests.')
