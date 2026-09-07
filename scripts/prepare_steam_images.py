"""Resize existing Steam artwork only; no generated text or art."""
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
folder = root / 'static/images/planet'
image = Image.open(folder / 'screenshot-02.jpg').convert('RGB')
image.thumbnail((1440, 900))
image.save(folder / 'hero.webp', quality=85)
# Fit the whole gameplay frame inside a standard social canvas; no UI cropping.
card = ImageOps.pad(image, (1200, 630), color='#101412', method=Image.Resampling.LANCZOS)
card.save(folder / 'social.jpg', quality=86)
card.save(root / 'static/images/social-default.jpg', quality=86)
