#!/usr/bin/env python3
"""Build the single-file app: inlines src/ into index.html. Run: python3 build.py"""
import pathlib
root = pathlib.Path(__file__).resolve().parent
src = root / 'src'
html = (src / 'index.template.html').read_text(encoding='utf-8')
for marker, name in [('/*CSS*/', 'style.css'), ('/*FIG*/', 'fig.js'), ('/*DATA*/', 'data.js'), ('/*APP*/', 'app.js')]:
    html = html.replace(marker, (src / name).read_text(encoding='utf-8'))
out = root / 'index.html'
out.write_text(html, encoding='utf-8')
print(f'Built {out.name}: {len(html.encode("utf-8")):,} bytes')
