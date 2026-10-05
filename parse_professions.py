import sys, re, json

sys.stdout.reconfigure(encoding='utf-8')
with open('char_creation_extracted.txt', 'r', encoding='utf-8') as f:
    text = f.read()

sections = re.split(r'={10,}\s*P.?GINA\s*(\d+)\s*={10,}', text)
prof_pages = {
    15: 'Artesano',
    16: 'Bardo',
    17: 'Caballero',
    18: 'Cazador',
    19: 'Erudito',
    20: 'Guerrero',
    21: 'Ladrón',
    22: 'Mago',
    23: 'Mercader',
    24: 'Marinero'
}

professions_data = {}
for i in range(1, len(sections), 2):
    p_num = int(sections[i])
    if p_num in prof_pages:
        name = prof_pages[p_num]
        p_text = sections[i+1].strip()
        
        attr_m = re.search(r'✦\s*Atributo clave:\s*([^\n]+)', p_text)
        skills_m = re.search(r'✦\s*Habilidades:\s*([^\n]+(?:\n[^\n✦]+)?)', p_text)
        heroic_m = re.search(r'✦\s*Capacidad heroica:\s*([^\n]+)', p_text)
        
        equip_m = re.search(r'D6\s*EQUIPO([\s\S]*?)(?=D6\s*APODO|\Z)', p_text)
        nick_m = re.search(r'D6\s*APODO([\s\S]*?)(?=\Z)', p_text)
        
        professions_data[name] = {
            'name': name,
            'key_attribute': attr_m.group(1).strip() if attr_m else '',
            'skills': [s.strip() for s in skills_m.group(1).replace('\n', ' ').split(',') if s.strip()] if skills_m else [],
            'heroic_ability': heroic_m.group(1).strip() if heroic_m else '',
            'starter_equipment': equip_m.group(1).strip() if equip_m else '',
            'nicknames': nick_m.group(1).strip() if nick_m else ''
        }

with open('professions_complete.json', 'w', encoding='utf-8') as out:
    json.dump(professions_data, out, ensure_ascii=False, indent=2)

print('¡Extracción de profesiones completada con éxito!')
for k, v in professions_data.items():
    print(f"- {k} ({v['key_attribute']}): Heroica '{v['heroic_ability']}', {len(v['skills'])} habilidades")
