#!/usr/bin/env python3
"""Generate PWA icons from the Runup title image."""

import base64
from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "public" / "icons"
SOURCE = ROOT / "title-source.jpg"
VOID = (11, 12, 16)
FOCUS = (0.72, 0.34)


def cover_crop(img: Image.Image, size: int, focus: tuple[float, float]) -> Image.Image:
    src_w, src_h = img.size
    scale = max(size / src_w, size / src_h)
    new_w = round(src_w * scale)
    new_h = round(src_h * scale)
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = round(new_w * focus[0] - size / 2)
    top = round(new_h * focus[1] - size / 2)
    left = max(0, min(left, new_w - size))
    top = max(0, min(top, new_h - size))
    return resized.crop((left, top, left + size, top + size))


def maskable_icon(img: Image.Image, size: int) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), VOID + (255,))
    inset = int(size * 0.12)
    inner = size - inset * 2
    cropped = cover_crop(img, inner, FOCUS)
    canvas.paste(cropped, (inset, inset))
    return canvas


def write_svg(icon: Image.Image, path: Path, embed_size: int = 256) -> None:
    embedded = icon.resize((embed_size, embed_size), Image.Resampling.LANCZOS)
    buffer = BytesIO()
    embedded.save(buffer, format="PNG", optimize=True)
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    path.write_text(
        "\n".join(
            [
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">',
                f'  <image width="512" height="512" href="data:image/png;base64,{encoded}"/>',
                "</svg>",
                "",
            ]
        ),
        encoding="utf-8",
    )


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing title image: {SOURCE}")

    ROOT.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE).convert("RGB")

    icon_192 = cover_crop(source, 192, FOCUS)
    icon_512 = cover_crop(source, 512, FOCUS)
    icon_maskable = maskable_icon(source, 512)

    icon_192.save(ROOT / "icon-192.png", optimize=True)
    icon_512.save(ROOT / "icon-512.png", optimize=True)
    icon_maskable.save(ROOT / "icon-maskable-512.png", optimize=True)
    write_svg(icon_512, ROOT / "icon.svg")

    print("Wrote icons to", ROOT)


if __name__ == "__main__":
    main()
