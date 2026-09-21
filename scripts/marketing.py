"""Generate editable Regain social cards and short vertical videos.

Run: python3 scripts/marketing.py
Requires Pillow. MP4 output also requires ffmpeg or imageio-ffmpeg.
Edit marketing/content.json to change messages and photo selections.
"""

import json
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "marketing" / "content.json"
OUT = ROOT / "marketing" / "output"
FONT_DIR = Path("/System/Library/Fonts/Supplemental")
INK = "#102D27"
GREEN = "#17483E"
CREAM = "#F5FAF8"


def font(size, bold=False):
    name = "Arial Bold.ttf" if bold else "Arial.ttf"
    path = FONT_DIR / name
    return ImageFont.truetype(str(path), size) if path.exists() else ImageFont.load_default()


def wrap(draw, value, face, width):
    lines = []
    for paragraph in value.split("\n"):
        current = ""
        for word in paragraph.split():
            trial = f"{current} {word}".strip()
            if current and draw.textbbox((0, 0), trial, font=face)[2] > width:
                lines.append(current)
                current = word
            else:
                current = trial
        lines.append(current)
    return lines


def photo_canvas(photo, size):
    source = Image.open(ROOT / "assets" / "images" / photo).convert("RGB")
    return ImageOps.fit(source, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def make_card(item, size, destination, video=False):
    width, height = size
    canvas = photo_canvas(item["photo"], size).convert("RGBA")
    veil = Image.new("RGBA", size, (0, 0, 0, 0))
    overlay = ImageDraw.Draw(veil)
    overlay.rectangle((0, int(height * 0.53), width, height), fill=(9, 35, 29, 205))
    overlay.rectangle((0, 0, width, 145), fill=(9, 35, 29, 110))
    canvas = Image.alpha_composite(canvas, veil)
    draw = ImageDraw.Draw(canvas)
    margin = int(width * 0.075)
    draw.text((margin, 58), "regain", font=font(51, True), fill=CREAM)
    title_face = font(84 if video else 78, True)
    body_face = font(45 if video else 42)
    y = int(height * 0.59)
    for line in wrap(draw, item["headline"], title_face, width - 2 * margin):
        draw.text((margin, y), line, font=title_face, fill="#FFFFFF", stroke_width=1)
        y += 100 if video else 92
    y += 25
    for line in wrap(draw, item["subline"], body_face, width - 2 * margin):
        draw.text((margin, y), line, font=body_face, fill="#E8F4F0")
        y += 59
    draw.rounded_rectangle((margin, height - 155, width - margin, height - 65), radius=28, fill=CREAM)
    cta_face = font(38, True)
    cta = item["cta"]
    bbox = draw.textbbox((0, 0), cta, font=cta_face)
    draw.text(((width - (bbox[2] - bbox[0])) / 2, height - 132), cta, font=cta_face, fill=GREEN)
    destination.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(destination, quality=90)


def ffmpeg_exe():
    installed = shutil.which("ffmpeg")
    if installed:
        return installed
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return None


def make_video(item, ffmpeg):
    slides = []
    for index, scene in enumerate(item["scenes"], 1):
        path = OUT / "frames" / f"{item['id']}-{index}.jpg"
        make_card(scene, (1080, 1920), path, video=True)
        slides.append(path)
    command = [ffmpeg, "-y"]
    for slide in slides:
        command += ["-loop", "1", "-t", "4", "-i", str(slide)]
    filters = "".join(f"[{i}:v]fps=24,format=yuv420p[v{i}];" for i in range(len(slides)))
    filters += "".join(f"[v{i}]" for i in range(len(slides)))
    filters += f"concat=n={len(slides)}:v=1:a=0[out]"
    output = OUT / f"{item['id']}.mp4"
    command += ["-filter_complex", filters, "-map", "[out]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "22", "-movflags", "+faststart", str(output)]
    subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    return output


def main():
    content = json.loads(DATA.read_text(encoding="utf-8"))
    for item in content["photos"]:
        make_card(item, (1080, 1350), OUT / f"{item['id']}.jpg")
    encoder = ffmpeg_exe()
    if encoder:
        for item in content["videos"]:
            make_video(item, encoder)
    else:
        for item in content["videos"]:
            for index, scene in enumerate(item["scenes"], 1):
                make_card(scene, (1080, 1920), OUT / "frames" / f"{item['id']}-{index}.jpg", video=True)
        print("MP4 not generated: install ffmpeg or imageio-ffmpeg.", file=sys.stderr)
    print(f"Assets ready in {OUT}")


if __name__ == "__main__":
    main()
