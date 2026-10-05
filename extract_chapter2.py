from pypdf import PdfReader
import json

pdf_path = r"C:\Users\Víctor\.gemini\antigravity\scratch\dragonbane-companion\Dragonbane_Reglas.pdf"
reader = PdfReader(pdf_path)

# Extraer páginas del capítulo 2 (páginas 8 a 29 en el PDF, ajustamos índices)
char_creation_text = {}
for p_num in range(8, 30):
    page_text = reader.pages[p_num].extract_text()
    char_creation_text[p_num + 1] = page_text

with open(r"C:\Users\Víctor\.gemini\antigravity\scratch\dragonbane-companion\char_creation_extracted.txt", "w", encoding="utf-8") as f:
    for page, text in char_creation_text.items():
        f.write(f"\n\n=================== PÁGINA {page} ===================\n\n")
        f.write(text)

print("Capítulo 2 extraído con éxito!")
