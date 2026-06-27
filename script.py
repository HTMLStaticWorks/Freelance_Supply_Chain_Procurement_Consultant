import glob, re

files = glob.glob('*.html')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 1. Target inner page banners: <div class="container reveal-up">
    new_content = re.sub(
        r'<div class="container reveal-up">', 
        r'<div class="container reveal-up text-center text-lg-start">', 
        content
    )
    
    # 2. Target <div class="col-lg-X reveal-up"> (ignoring already centered ones)
    new_content = re.sub(
        r'<div class="col-lg-(\d+) reveal-up">', 
        r'<div class="col-lg-\1 reveal-up text-center text-lg-start">', 
        new_content
    )
    
    # 3. Target d-flex flex-sm-row flex-column gap-3 without align-items-center
    new_content = re.sub(
        r'(<div class="d-flex flex-sm-row flex-column gap-3( justify-content-center justify-content-lg-start)?)">', 
        r'\1 align-items-center">', 
        new_content
    )
    
    # 4. Same for d-flex flex-column flex-sm-row if order is reversed
    new_content = re.sub(
        r'(<div class="d-flex flex-column flex-sm-row gap-3( justify-content-center justify-content-lg-start)?)">', 
        r'\1 align-items-center">', 
        new_content
    )

    # 5. Fix Section 2 Analytics bug from earlier if applicable
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f'Updated {f}')
