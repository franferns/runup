#!/usr/bin/env python3
"""Generate PWA icons (original Runup art, not Marvel)."""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent / "public" / "icons"
VOID = (11, 12, 16)
AMBER = (232, 165, 75)
HORIZON = (201, 212, 232)
CREAM = (248, 226, 184)


def draw_icon(size: int, maskable: bool = False) -> Image.Image:
    img = Image.new("RGBA", (size, size), VOID + (255,))
    draw = ImageDraw.Draw(img)

    inset = int(size * 0.12) if maskable else 0
    usable = size - inset * 2
    ox = inset
    oy = inset

    horizon_r = int(usable * 0.29)
    hx = ox + int(usable * 0.84)
    hy = oy + int(usable * 0.23)
    for step in range(horizon_r, 0, -2):
        alpha = int(90 * (step / horizon_r) ** 1.6)
        draw.ellipse(
            (hx - step, hy - step, hx + step, hy + step),
            fill=HORIZON + (alpha,),
        )

    # Amber strand
    points = [
        (ox + int(usable * 0.14), oy + int(usable * 0.72)),
        (ox + int(usable * 0.42), oy + int(usable * 0.58)),
        (ox + int(usable * 0.62), oy + int(usable * 0.64)),
        (ox + int(usable * 0.82), oy + int(usable * 0.5)),
    ]
    draw.line(points, fill=AMBER + (220,), width=max(4, size // 36), joint="curve")

    bead_radii = [
        (points[0], max(8, size // 28), AMBER + (255,), CREAM + (255,)),
        (points[1], max(6, size // 40), AMBER + (190,), None),
        (points[2], max(6, size // 40), AMBER + (150,), None),
        (points[3], max(6, size // 40), AMBER + (120,), None),
    ]
    for (cx, cy), radius, fill, stroke in bead_radii:
        bbox = (cx - radius, cy - radius, cx + radius, cy + radius)
        draw.ellipse(bbox, fill=fill, outline=stroke, width=max(2, size // 128))

    return img


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    draw_icon(192).save(ROOT / "icon-192.png")
    draw_icon(512).save(ROOT / "icon-512.png")
    draw_icon(512, maskable=True).save(ROOT / "icon-maskable-512.png")
    print("Wrote icons to", ROOT)


if __name__ == "__main__":
    main()
