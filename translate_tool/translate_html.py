from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator
import os

# Sprachen festlegen: Zielsprachen und ISO-Codes
languages = {
    "en": "english",
    "tr": "turkish",
    "ru": "russian",
    "ar": "arabic"
}

# Ausgangsdatei (Deutsch)
INPUT_FILE = "index.html"


def translate_text(text, target_lang):
    try:
        return GoogleTranslator(source='auto', target=target_lang).translate(text)
    except Exception as e:
        print(f"Fehler beim Übersetzen: {e}")
        return text


def translate_html_file(input_file, lang_code, lang_name):
    with open(input_file, "r", encoding="utf-8") as file:
        soup = BeautifulSoup(file, "html.parser")

    # Sprache im HTML-Tag setzen
    if soup.html.has_attr("lang"):
        soup.html["lang"] = lang_code

    for tag in soup.find_all(string=True):
        if tag.parent.name not in ["script", "style", "code"]:
            stripped = tag.strip()
            if stripped and not stripped.startswith("[") and len(stripped) > 1:
                translated = translate_text(stripped, lang_name)
                tag.replace_with(translated)

    # Zielverzeichnis
    out_path = f"lang/{lang_code}.html"
    os.makedirs("lang", exist_ok=True)

    with open(out_path, "w", encoding="utf-8") as output_file:
        output_file.write(str(soup.prettify()))

    print(f"✅ {lang_name.capitalize()} gespeichert unter → {out_path}")


# Alle Zielsprachen durchgehen
for code, name in languages.items():
    translate_html_file(INPUT_FILE, code, name)
