import re

file_path = 'backend/models/tables.py'
with open(file_path, 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Match lines like:    Client_ID = Column(Integer, ...)
    match = re.match(r'^(\s+)([A-Za-z0-9_]+) = Column\((.+)\)$', line)
    if match:
        indent = match.group(1)
        attr = match.group(2)
        rest = match.group(3)
        # Only rewrite if not already specified (e.g. not starting with quotes)
        if not rest.startswith('"') and not rest.startswith("'"):
            new_line = f'{indent}{attr} = Column("{attr.lower()}", {rest})\n'
            new_lines.append(new_line)
            continue
    new_lines.append(line)

with open(file_path, 'w') as f:
    f.writelines(new_lines)

print("Successfully updated tables.py to map to lowercase column names!")
