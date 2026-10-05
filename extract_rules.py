import os
from pypdf import PdfReader

pdf_path = r"C:\Users\Víctor\.gemini\antigravity\scratch\dragonbane-companion\Dragonbane_Reglas.pdf"

if not os.path.exists(pdf_path):
    print("PDF no encontrado")
    exit(1)

reader = PdfReader(pdf_path)
print(f"Total páginas: {len(reader.pages)}")

# Extraer el índice o esquema (outline)
try:
    outline = reader.outline
    def print_outline(entries, depth=0):
        for e in entries:
            if isinstance(e, list):
                print_outline(e, depth + 1)
            else:
                title = getattr(e, 'title', str(e))
                page = reader.get_destination_page_number(e) if hasattr(e, 'page') else '?'
                print(f"{'  ' * depth}- {title} (pág {page})")
    print("\n--- ÍNDICE DEL MANUAL ---")
    print_outline(outline)
except Exception as ex:
    print(f"No se pudo extraer outline: {ex}")

# Buscar páginas con palabras clave
keywords = ["CREACIÓN DE PERSONAJES", "ESTIRPES", "PROFESIONES", "PUNTOS DE GOLPE", "HABILIDADES"]
print("\n--- BUSCANDO PÁGINAS CLAVE ---")
for i in range(min(40, len(reader.pages))):
    text = reader.pages[i].extract_text() or ""
    for kw in keywords:
        if kw in text.upper():
            print(f"Página {i+1}: coincide con '{kw}'")
            break
