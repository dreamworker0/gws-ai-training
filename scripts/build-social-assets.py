"""Build deterministic social-preview assets from the generated hero art."""

from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "img" / "dreamwork-archive-hero.png"
OUTPUT = ROOT / "img" / "dreamwork-og.png"


with Image.open(SOURCE) as source:
    artwork = source.convert("RGB")
    artwork = ImageEnhance.Color(artwork).enhance(0.94)
    social = ImageOps.fit(
        artwork,
        (1200, 630),
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.46),
    )
    social.save(OUTPUT, format="PNG", optimize=True)

print(f"wrote {OUTPUT} (1200x630)")
