import os, glob, re

files = glob.glob('*.html')
pattern = re.compile(r'<div class="col-md-6 text-center mb-3 mb-md-0">\s*<span style="font-size: 0\.85rem;" class="text-secondary-custom">(&copy; 2026.*?All rights reserved\.)</span>\s*</div>')

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # We want to change the div to have text-md-start or text-center entirely depending on what the user wants.
    # Given they uploaded an image showing just the copyright text perfectly centered, wait.
    # If the user wants it aligned left like the rest of the site (so it matches the links on the right),
    # then `<div class="col-md-6 text-center text-md-start mb-3 mb-md-0">` is the way to go.
    
    new_content = re.sub(
        r'<div class="col-md-6 text-center mb-3 mb-md-0">(\s*<span.*?&copy; 2026.*?All rights reserved\..*?</span>\s*)</div>',
        r'<div class="col-md-6 text-center text-md-start mb-3 mb-md-0">\1</div>',
        content
    )
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f'Updated {f}')
