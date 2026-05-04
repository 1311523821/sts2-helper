import os, re

base = r'D:\Agent\sts2-helper\src\data\archetypes'
for fname in os.listdir(base):
    if not fname.endswith('.json'):
        continue
    fpath = os.path.join(base, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = re.sub(
        r'"idealCostCurve":\s*\[([0-9.]+),\s*([0-9.]+),\s*([0-9.]+),\s*([0-9.]+)\]',
        r'"idealCostCurve": [\1, \2, \3, \4, 0.00]',
        content
    )
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'Updated {fname}')
