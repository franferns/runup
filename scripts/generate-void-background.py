#!/usr/bin/env python3
"""Generate Doomsday void art — cosmic vs doom forces, original abstract only."""

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent / "public" / "backgrounds"
WIDTH = 1920
HEIGHT = 1080


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def blend(base: tuple[int, int, int], color: tuple[int, int, int], alpha: float) -> tuple[int, int, int]:
    return tuple(int(lerp(base[i], color[i], alpha)) for i in range(3))


def draw_storm_base(size: tuple[int, int]) -> Image.Image:
    width, height = size
    img = Image.new("RGB", size, (4, 6, 8))
    pixels = img.load()

    for y in range(height):
        ny = y / height
        for x in range(width):
            nx = x / width
            tone = blend((4, 6, 8), (16, 20, 24), ny * 0.5)
            tone = blend(tone, (24, 18, 52), max(0, 0.34 - abs(nx - 0.18) * 0.85 - ny * 0.2))
            tone = blend(tone, (8, 22, 14), max(0, 0.34 - abs(nx - 0.82) * 0.85 - ny * 0.2))
            pixels[x, y] = tone

    return img


def draw_cosmic_burst(draw: ImageDraw.ImageDraw, cx: int, cy: int) -> None:
    for step in range(280, 0, -3):
        t = step / 280
        alpha = int(75 * t**1.5)
        draw.ellipse(
            (cx - step, cy - step, cx + step, cy + step),
            fill=(255, 196, 72, alpha),
        )

    for step in range(200, 0, -3):
        t = step / 200
        alpha = int(65 * t**1.4)
        draw.ellipse(
            (cx - step, cy - step, cx + step, cy + step),
            fill=(255, 88, 58, alpha),
        )

    for step in range(150, 0, -2):
        t = step / 150
        alpha = int(80 * t**1.2)
        draw.ellipse(
            (cx - step, cy - step, cx + step, cy + step),
            fill=(92, 168, 255, alpha),
        )

    for angle in range(0, 360, 28):
        rad = math.radians(angle)
        x2 = cx + math.cos(rad) * 220
        y2 = cy + math.sin(rad) * 220
        draw.line([(cx, cy), (x2, y2)], fill=(255, 230, 180, 45), width=3)

    body = [
        (cx - 36, cy + 120),
        (cx - 58, cy + 20),
        (cx - 28, cy - 40),
        (cx, cy - 78),
        (cx + 28, cy - 40),
        (cx + 58, cy + 20),
        (cx + 36, cy + 120),
    ]
    draw.polygon(body, fill=(255, 240, 220, 70))
    draw.ellipse((cx - 42, cy - 95, cx + 42, cy - 12), fill=(255, 248, 240, 85))


def draw_doom_presence(draw: ImageDraw.ImageDraw, cx: int, cy: int, width: int, height: int) -> None:
    for step in range(300, 0, -3):
        t = step / 300
        alpha = int(70 * t**1.5)
        draw.ellipse(
            (cx - step, cy - step, cx + step, cy + step),
            fill=(34, 168, 92, alpha),
        )

    hood = [
        (cx - 95, cy + 130),
        (cx - 110, cy + 10),
        (cx - 70, cy - 70),
        (cx, cy - 120),
        (cx + 70, cy - 70),
        (cx + 110, cy + 10),
        (cx + 95, cy + 130),
    ]
    draw.polygon(hood, fill=(18, 92, 58, 220))
    draw.polygon(hood, outline=(88, 220, 140, 120))

    draw.ellipse((cx - 48, cy - 35, cx + 48, cy + 55), fill=(2, 6, 5, 240))

    for sx in (-55, 55):
        for sy in (-10, 35, 80):
            draw.ellipse((cx + sx - 5, cy + sy - 5, cx + sx + 5, cy + sy + 5), fill=(148, 108, 58, 180))

    draw_lightning(draw, (cx - 20, cy - 140), seed=4)
    draw_lightning(draw, (cx + 40, cy - 130), seed=8)

    base_y = int(height * 0.72)
    for left, peak, span in [(0.72, 0.5, 0.06), (0.8, 0.44, 0.05), (0.88, 0.48, 0.04)]:
        x0 = int(width * left)
        x1 = int(width * (left + span))
        peak_x = int(width * (left + span * 0.4))
        peak_y = int(height * peak)
        draw.polygon(
            [
                (x0, base_y),
                (x0, int(height * (peak + 0.08))),
                (peak_x, peak_y),
                (x1, int(height * (peak + 0.1))),
                (x1, base_y),
            ],
            fill=(3, 5, 6, 200),
        )


def draw_lightning(draw: ImageDraw.ImageDraw, origin: tuple[int, int], seed: int) -> None:
    random.seed(seed)
    points = [origin]
    x, y = origin
    for _ in range(6):
        x += random.randint(18, 48)
        y += random.randint(22, 58)
        points.append((x, y))
    draw.line(points, fill=(120, 255, 170, 110), width=3)


def draw_castle_line(draw: ImageDraw.ImageDraw, width: int, height: int) -> None:
    base_y = int(height * 0.74)
    spires = [
        (0.05, 0.46, 0.05),
        (0.12, 0.52, 0.06),
        (0.2, 0.42, 0.07),
        (0.3, 0.55, 0.08),
    ]
    for left, peak, span in spires:
        x0 = int(width * left)
        x1 = int(width * (left + span))
        peak_x = int(width * (left + span * 0.42))
        draw.polygon(
            [
                (x0, base_y),
                (x0, int(height * (peak + 0.08))),
                (peak_x, int(height * peak)),
                (x1, int(height * (peak + 0.1))),
                (x1, base_y),
            ],
            fill=(3, 5, 6, 180),
        )


def draw_background(size: tuple[int, int]) -> Image.Image:
    width, height = size
    img = draw_storm_base(size).convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")

    draw_cosmic_burst(draw, int(width * 0.2), int(height * 0.34))
    draw_castle_line(draw, width, height)
    draw_doom_presence(draw, int(width * 0.8), int(height * 0.36), width, height)

    clash = Image.new("RGBA", size, (0, 0, 0, 0))
    clash_draw = ImageDraw.Draw(clash, "RGBA")
    clash_draw.line(
        [(int(width * 0.5), int(height * 0.12)), (int(width * 0.5), int(height * 0.68))],
        fill=(220, 230, 235, 18),
        width=2,
    )
    clash = clash.filter(ImageFilter.GaussianBlur(4))
    img = Image.alpha_composite(img, clash)

    random.seed(31)
    sparks = Image.new("RGBA", size, (0, 0, 0, 0))
    sparks_draw = ImageDraw.Draw(sparks, "RGBA")
    for _ in range(140):
        side = random.choice(["cosmic", "doom"])
        if side == "cosmic":
            x = random.randint(0, int(width * 0.45))
            color = random.choice([(255, 196, 72), (255, 120, 72), (120, 180, 255)])
        else:
            x = random.randint(int(width * 0.55), width)
            color = (88, 220, 140)
        y = random.randint(int(height * 0.1), int(height * 0.62))
        r = random.choice([1, 2, 2])
        sparks_draw.ellipse((x - r, y - r, x + r, y + r), fill=color + (random.randint(30, 90),))
    sparks = sparks.filter(ImageFilter.GaussianBlur(0.6))
    img = Image.alpha_composite(img, sparks)

    vignette = Image.new("L", size, 0)
    vignette_draw = ImageDraw.Draw(vignette)
    vignette_draw.ellipse((-width * 0.08, -height * 0.1, width * 1.08, height * 1.08), fill=220)
    vignette = vignette.filter(ImageFilter.GaussianBlur(80))
    dark = Image.new("RGB", size, (2, 4, 5))
    return Image.composite(dark, img.convert("RGB"), Image.eval(vignette, lambda px: 255 - px)).filter(
        ImageFilter.GaussianBlur(0.35)
    )


def draw_cosmic_emblem(size: tuple[int, int] = (400, 520)) -> Image.Image:
    width, height = size
    img = Image.new("RGBA", size, (6, 8, 18, 0))
    layer = Image.new("RGBA", size, (8, 10, 22, 255))
    draw = ImageDraw.Draw(layer, "RGBA")
    draw.rounded_rectangle((0, 0, width, height), radius=24, fill=(8, 10, 22, 230))
    draw_cosmic_burst(draw, width // 2, int(height * 0.42))

    for y in range(height):
        fade = max(0, (y - height * 0.55) / (height * 0.45))
        for x in range(width):
            r, g, b, a = layer.getpixel((x, y))
            layer.putpixel((x, y), (r, g, b, int(a * (1 - fade * 0.35))))

    img = Image.alpha_composite(img, layer)
    return img.filter(ImageFilter.GaussianBlur(0.3))


def draw_doom_emblem(size: tuple[int, int] = (400, 520)) -> Image.Image:
    width, height = size
    img = Image.new("RGBA", size, (4, 6, 6, 0))
    layer = Image.new("RGBA", size, (4, 8, 8, 255))
    draw = ImageDraw.Draw(layer, "RGBA")
    draw.rounded_rectangle((0, 0, width, height), radius=24, fill=(4, 8, 8, 235))
    draw_doom_presence(draw, width // 2, int(height * 0.4), width, height)

    for y in range(height):
        fade = max(0, (y - height * 0.55) / (height * 0.45))
        for x in range(width):
            r, g, b, a = layer.getpixel((x, y))
            layer.putpixel((x, y), (r, g, b, int(a * (1 - fade * 0.35))))

    img = Image.alpha_composite(img, layer)
    return img.filter(ImageFilter.GaussianBlur(0.3))


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    draw_background((WIDTH, HEIGHT)).save(ROOT / "void-atmosphere.jpg", quality=90, optimize=True)
    draw_background((WIDTH, HEIGHT)).resize((1280, 720), Image.Resampling.LANCZOS).save(
        ROOT / "void-atmosphere-sm.jpg",
        quality=84,
        optimize=True,
    )
    draw_cosmic_emblem().save(ROOT / "emblem-cosmic.png")
    draw_doom_emblem().save(ROOT / "emblem-doom.png")
    print("Wrote backgrounds to", ROOT)


if __name__ == "__main__":
    main()
