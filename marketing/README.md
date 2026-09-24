# Producing Regain's content

Edit `content.json` to change the text and pick a photo from `assets/images/`. Then run, from the project root:

```bash
python3 scripts/marketing.py
```

The script creates three 1080 × 1350 images and two vertical 1080 × 1920 videos, 12 seconds each, in `marketing/output/`. It uses Pillow; the videos need `ffmpeg` or the `imageio-ffmpeg` Python package. The videos are **silent**: add a recorded voice and music licensed for advertising before publishing. The visuals are brand hooks; add real captures of the app for any ad that demonstrates what it does. Check the text and the destination link before publishing.

Generation is reproducible: the same text and photos give the same files. Automating publishing and ad spend is still to be set up in the platforms' own accounts, once the creatives are signed off.
