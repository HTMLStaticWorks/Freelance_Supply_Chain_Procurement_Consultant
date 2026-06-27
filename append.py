with open('assets/css/style.css', 'a', encoding='utf-8') as f:
    f.write('\n\n/* Accordion Icon Dark Mode Support */\n')
    f.write('.accordion-button::after {\n')
    f.write('  filter: invert(1) brightness(2);\n')
    f.write('}\n\n')
    f.write('[data-theme="light"] .accordion-button::after {\n')
    f.write('  filter: none;\n')
    f.write('}\n')
