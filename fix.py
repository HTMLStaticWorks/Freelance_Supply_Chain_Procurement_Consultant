import re
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure we don't duplicate mx-auto if it's already there
content = re.sub(r'class="section-title"', 'class="section-title mx-auto"', content)
# Also fix any existing mx-auto duplication just in case
content = re.sub(r'class="section-title mx-auto mx-auto"', 'class="section-title mx-auto"', content)
# Make sure to catch cases where it has other classes
content = re.sub(r'class="section-title ([^"]*)"', lambda m: f'class="section-title mx-auto {m.group(1)}"' if 'mx-auto' not in m.group(1) else m.group(0), content)


with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
