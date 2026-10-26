#!/usr/bin/env python3
"""
Les captures telles que l'App Store les montre : l'écran, et au-dessus la phrase qui dit
pourquoi on le regarde.

Une capture brute se suffit à elle-même dans une revue technique, pas dans une liste où elle
défile à côté de vingt autres. La phrase fait le travail que l'image ne peut pas faire seule.

    python3 scripts/store-shots.py fr
    python3 scripts/store-shots.py en

Lit store/screenshots/ios-6.9-<lang>/, écrit store/screenshots/appstore-<lang>/, en 1320x2868 —
la seule taille qu'Apple demande, les autres en étant déduites.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
W, H = 1320, 2868

# La palette de l'app, pour que la fiche et l'écran soient le même objet.
BG = (232, 244, 240)      # sage100
INK = (18, 59, 51)        # primary900
INK2 = (86, 112, 106)     # ink2

FONT = "/System/Library/Fonts/SFNS.ttf"

LEGENDS = {
    "fr": [
        ("1-planning", "Ta semaine, à ton rythme",
         "Regain place les activités dans tes disponibilités,\nà la bonne heure, selon ton énergie du moment."),
        ("2-seance", "Des séances guidées, à la voix",
         "De une à neuf minutes, les yeux ouverts.\nRien à préparer."),
        ("3-bien-etre", "Respiration, méditation, sommeil",
         "Dix-huit séances gratuites, sans limite de durée,\net un journal qui te regarde avancer."),
        ("4-forme", "Un coach forme qui s'ajuste",
         "Programme, menus et liste de courses,\nrevus chaque semaine. Avec Premium."),
    ],
    "en": [
        ("1-planning", "Your week, at your pace",
         "Regain places activities into the time you have,\nat the right hour, around today's energy."),
        ("2-seance", "Guided sessions, with a voice",
         "One to nine minutes, eyes open.\nNothing to prepare."),
        ("3-bien-etre", "Breathing, meditation, sleep",
         "Eighteen free sessions with no time limit,\nand a journal that watches you get on."),
        ("4-forme", "A fitness coach that adapts",
         "A programme, meals and a shopping list,\nreviewed every week. With Premium."),
    ],
}


def centred(draw, text, font, y, fill, line_gap):
    """Chaque ligne centrée sur la largeur de la toile ; renvoie le bas du bloc."""
    for line in text.split("\n"):
        box = draw.textbbox((0, 0), line, font=font)
        draw.text(((W - (box[2] - box[0])) / 2 - box[0], y), line, font=font, fill=fill)
        y += (box[3] - box[1]) + line_gap
    return y


def compose(shot_path, headline, subtitle, out_path):
    canvas = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(canvas)

    title_font = ImageFont.truetype(FONT, 86)
    sub_font = ImageFont.truetype(FONT, 46)

    y = centred(draw, headline, title_font, 150, INK, 26)
    centred(draw, subtitle, sub_font, y + 40, INK2, 18)

    # L'écran entier, et non débordant du bas : une barre d'onglets tranchée en plein milieu de
    # ses libellés se lit comme un défaut de fabrication, pas comme un cadrage.
    shot = Image.open(shot_path).convert("RGB")
    target_w = int(W * 0.74)
    shot = shot.resize((target_w, int(shot.height * target_w / shot.width)), Image.LANCZOS)

    # Coins arrondis, comme l'appareil.
    radius = 54
    mask = Image.new("L", shot.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, shot.width, shot.height], radius, fill=255)

    x = (W - shot.width) // 2
    top = H - shot.height - 90
    canvas.paste(shot, (x, top), mask)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out_path, "PNG")
    return out_path


def main():
    lang = sys.argv[1] if len(sys.argv) > 1 else "fr"
    if lang not in LEGENDS:
        raise SystemExit(f"langue inconnue : {lang} (fr ou en)")
    src = ROOT / f"store/screenshots/ios-6.9-{lang}"
    out = ROOT / f"store/screenshots/appstore-{lang}"
    missing = [n for n, _, _ in LEGENDS[lang] if not (src / f"{n}.png").exists()]
    if missing:
        raise SystemExit(f"captures absentes dans {src.relative_to(ROOT)} : {', '.join(missing)}")
    for name, headline, subtitle in LEGENDS[lang]:
        path = compose(src / f"{name}.png", headline, subtitle, out / f"{name}.png")
        with Image.open(path) as im:
            assert im.size == (W, H), f"{path.name} fait {im.size}, Apple attend {(W, H)}"
        print(f"  {path.relative_to(ROOT)}  {im.size[0]}x{im.size[1]}")
    print(f"\n{len(LEGENDS[lang])} captures App Store en « {lang} ».")


if __name__ == "__main__":
    main()
