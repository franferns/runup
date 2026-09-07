#!/usr/bin/env python3
"""Generate 1200x630 Open Graph images matching the Runup void atmosphere."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "og"
BACKGROUNDS = ROOT / "public" / "backgrounds"

WIDTH = 1200
HEIGHT = 630
MARGIN = 72

VOID = (11, 12, 16)
TEXT = (244, 241, 234)
AMBER = (232, 165, 75)
MUTED = (138, 141, 150)
CREAM = (248, 226, 184)

FONT_REGULAR = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_BOLD = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_INDEX_REGULAR = 0
FONT_INDEX_MEDIUM = 10
FONT_INDEX_BOLD = 1


def load_font(size: int, weight: str = "regular") -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    index = {
        "regular": FONT_INDEX_REGULAR,
        "medium": FONT_INDEX_MEDIUM,
        "bold": FONT_INDEX_BOLD,
    }.get(weight, FONT_INDEX_REGULAR)
    font_path = Path(FONT_REGULAR)
    if font_path.exists():
        return ImageFont.truetype(str(font_path), size=size, index=index)
    return ImageFont.load_default()


def crop_cover(
    img: Image.Image,
    target_w: int,
    target_h: int,
    focus_x: float = 0.5,
    focus_y: float = 0.3,
) -> Image.Image:
    iw, ih = img.size
    scale = max(target_w / iw, target_h / ih)
    nw, nh = int(iw * scale), int(ih * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = int((nw - target_w) * focus_x)
    top = int((nh - target_h) * focus_y)
    return resized.crop((left, top, left + target_w, top + target_h))


def radial_gradient(
    size: tuple[int, int],
    center: tuple[float, float],
    inner_rgb: tuple[int, int, int],
    outer_rgb: tuple[int, int, int],
    radius: float,
    max_alpha: int = 255,
) -> Image.Image:
    w, h = size
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    cx, cy = int(w * center[0]), int(h * center[1])
    r = int(min(w, h) * radius)
    for step in range(r, 0, -2):
        t = step / r
        alpha = int(max_alpha * t**1.6)
        color = tuple(int(inner_rgb[i] * (1 - t) + outer_rgb[i] * t) for i in range(3))
        draw = ImageDraw.Draw(layer, "RGBA")
        draw.ellipse((cx - step, cy - step, cx + step, cy + step), fill=color + (alpha,))
    return layer


def linear_gradient(
    size: tuple[int, int],
    stops: list[tuple[float, tuple[int, int, int, int]]],
    vertical: bool = True,
) -> Image.Image:
    w, h = size
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    pixels = layer.load()
    for y in range(h):
        for x in range(w):
            t = y / max(h - 1, 1) if vertical else x / max(w - 1, 1)
            color = stops[-1][1]
            for idx in range(1, len(stops)):
                prev_pos, prev_color = stops[idx - 1]
                pos, stop_color = stops[idx]
                if t <= pos:
                    span = pos - prev_pos
                    blend = (t - prev_pos) / span if span > 0 else 0
                    color = tuple(
                        int(prev_color[i] + (stop_color[i] - prev_color[i]) * blend)
                        for i in range(4)
                    )
                    break
            pixels[x, y] = color
    return layer


def build_veil() -> Image.Image:
    layer = linear_gradient(
        (WIDTH, HEIGHT),
        [
            (0.0, (4, 6, 8, 12)),
            (0.42, (4, 8, 10, 107)),
            (1.0, (3, 5, 6, 235)),
        ],
    )
    cosmic = radial_gradient(
        (WIDTH, HEIGHT),
        (0.2, 0.3),
        (255, 140, 60),
        (4, 6, 8),
        0.42,
        max_alpha=36,
    )
    doom = radial_gradient(
        (WIDTH, HEIGHT),
        (0.8, 0.28),
        (34, 168, 92),
        (4, 6, 8),
        0.44,
        max_alpha=46,
    )
    floor = radial_gradient(
        (WIDTH, HEIGHT),
        (0.5, 1.0),
        (2, 4, 5),
        (2, 4, 5),
        0.72,
        max_alpha=230,
    )
    return Image.alpha_composite(
        Image.alpha_composite(Image.alpha_composite(layer, cosmic), doom),
        floor,
    )


def build_shimmer(center: tuple[float, float], colors: list[tuple[int, int, int]], strength: int) -> Image.Image:
    layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")
    cx, cy = int(WIDTH * center[0]), int(HEIGHT * center[1])
    radius = int(min(WIDTH, HEIGHT) * 0.58)
    for step in range(radius, 0, -3):
        t = step / radius
        alpha = int(strength * t**1.5)
        if t > 0.32:
            color = colors[1]
        else:
            color = colors[0]
        draw.ellipse((cx - step, cy - step, cx + step, cy + step), fill=color + (alpha,))
    return layer.filter(ImageFilter.GaussianBlur(8))


def build_stars() -> Image.Image:
    layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")
    positions = [
        (0.12, 0.22, 1, 36),
        (0.78, 0.18, 1, 28),
        (0.44, 0.12, 1, 22),
        (0.88, 0.42, 1, 28),
        (0.24, 0.58, 1, 20),
        (0.62, 0.08, 1, 18),
        (0.08, 0.44, 1, 16),
        (0.92, 0.24, 1, 20),
        (0.35, 0.34, 1, 14),
        (0.55, 0.52, 1, 12),
    ]
    for nx, ny, radius, alpha in positions:
        x, y = int(WIDTH * nx), int(HEIGHT * ny)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=TEXT + (alpha,))
    return layer


def sample_bezier(points: list[tuple[float, float]], steps: int = 80) -> list[tuple[int, int]]:
    if len(points) < 2:
        return [(int(points[0][0]), int(points[0][1]))]

    sampled: list[tuple[int, int]] = []
    segments = len(points) - 1
    for seg in range(segments):
        p0 = points[seg]
        p1 = points[seg + 1]
        mid = ((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2)
        for i in range(steps // segments):
            t = i / (steps // segments)
            x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * mid[0] + t**2 * p1[0]
            y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * mid[1] + t**2 * p1[1]
            sampled.append((int(x), int(y)))
    sampled.append((int(points[-1][0]), int(points[-1][1])))
    return sampled


def build_strand() -> Image.Image:
    layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")

    y_base = int(HEIGHT * 0.72)
    primary = sample_bezier(
        [
            (0, y_base + 20),
            (WIDTH * 0.28, y_base - 40),
            (WIDTH * 0.52, y_base - 24),
            (WIDTH * 0.82, y_base - 80),
            (WIDTH, y_base - 120),
        ]
    )
    secondary = sample_bezier(
        [
            (0, y_base + 40),
            (WIDTH * 0.32, y_base + 10),
            (WIDTH * 0.6, y_base + 22),
            (WIDTH * 0.92, y_base - 30),
        ]
    )

    draw.line(primary, fill=(34, 168, 92, 72), width=3, joint="curve")
    draw.line(secondary, fill=(148, 108, 58, 46), width=2, joint="curve")

    bead_positions = [primary[0], primary[len(primary) // 3], primary[(2 * len(primary)) // 3], primary[-1]]
    bead_alphas = [255, 190, 150, 120]
    bead_radii = [12, 9, 9, 8]
    for (x, y), alpha, radius in zip(bead_positions, bead_alphas, bead_radii, strict=True):
        draw.ellipse(
            (x - radius, y - radius, x + radius, y + radius),
            fill=AMBER + (alpha,),
            outline=CREAM + (200 if alpha == 255 else 110,),
            width=2,
        )

    return layer


def build_text_scrim() -> Image.Image:
    return linear_gradient(
        (WIDTH, HEIGHT),
        [
            (0.0, (2, 4, 6, 235)),
            (0.5, (2, 4, 6, 175)),
            (0.78, (2, 4, 6, 55)),
            (1.0, (2, 4, 6, 0)),
        ],
        vertical=False,
    )


def place_emblem(path: Path, anchor: tuple[float, float], height: int, opacity: float) -> Image.Image:
    emblem = Image.open(path).convert("RGBA")
    scale = height / emblem.height
    width = int(emblem.width * scale)
    emblem = emblem.resize((width, height), Image.Resampling.LANCZOS)
    alpha = emblem.split()[3].point(lambda px: int(px * opacity))
    emblem.putalpha(alpha)
    layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    x = int(WIDTH * anchor[0] - width / 2)
    y = int(HEIGHT * anchor[1] - height / 2)
    layer.paste(emblem, (x, y), emblem)
    return layer.filter(ImageFilter.GaussianBlur(0.4))


def draw_tracking(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.ImageFont,
    fill: tuple[int, ...],
    tracking: float,
) -> tuple[int, int]:
    """Draw text with em-based letter-spacing; returns (width, height)."""
    x, y = xy
    top = bottom = 0
    start_x = x
    for char in text:
        draw.text((x, y), char, fill=fill, font=font)
        bbox = draw.textbbox((x, y), char, font=font)
        top = min(top, bbox[1])
        bottom = max(bottom, bbox[3])
        x = bbox[2] + int(font.size * tracking)
    return x - start_x, bottom - top


def draw_pill_cta(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    label: str,
    font: ImageFont.ImageFont,
    accent: tuple[int, int, int] = AMBER,
) -> int:
    pad_x, pad_y = 22, 13
    # Measure tracked label
    probe = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    lx, ly = x + pad_x, y
    for char in label:
        bbox = probe.textbbox((lx, ly), char, font=font)
        lx = bbox[2] + int(font.size * 0.04)
    text_w = lx - (x + pad_x)
    bbox = draw.textbbox((0, 0), label, font=font)
    pill_bg = tuple(int(VOID[i] * 0.84 + accent[i] * 0.16) for i in range(3)) + (220,)
    pill = (
        x,
        y + bbox[1] - pad_y,
        x + text_w + pad_x * 2,
        y + bbox[3] + pad_y,
    )
    draw.rounded_rectangle(pill, radius=999, fill=pill_bg, outline=accent + (180,), width=1)
    draw_tracking(draw, (x + pad_x, y), label, font, TEXT, 0.04)
    return pill[3] + 4


def wrap_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.ImageFont,
    max_width: int,
) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        bbox = draw.textbbox((0, 0), candidate, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current = candidate
        elif current:
            lines.append(current)
            current = word
        else:
            lines.append(word)
            current = ""
    if current:
        lines.append(current)
    return lines


def draw_text_block(
    img: Image.Image,
    eyebrow: str,
    title: str,
    subtitle: str,
    cta: str | None = None,
    cta_style: str = "button",
) -> None:
    x = MARGIN
    max_width = int(WIDTH * 0.5)
    y = 96

    brand_font = load_font(15, "bold")
    eyebrow_font = load_font(14, "bold")
    title_font = load_font(56, "medium")
    subtitle_font = load_font(24, "regular")
    cta_font = load_font(16, "regular")
    footer_font = load_font(13, "regular")

    draw = ImageDraw.Draw(img)

    _, brand_h = draw_tracking(draw, (x, y), "RUNUP", brand_font, AMBER, 0.42)
    y += brand_h + 22

    draw_tracking(draw, (x, y), eyebrow.upper(), eyebrow_font, AMBER, 0.12)
    y += 36

    for line in wrap_text(draw, title, title_font, max_width):
        draw.text((x, y), line, fill=TEXT, font=title_font)
        y += 64

    y += 14
    for line in wrap_text(draw, subtitle, subtitle_font, max_width):
        draw.text((x, y), line, fill=MUTED, font=subtitle_font)
        y += 36

    if cta:
        y += 20
        if cta_style == "button":
            draw_pill_cta(draw, x, y, cta, cta_font)
        else:
            draw.text((x, y), cta, fill=MUTED, font=cta_font)

    footer = "Unofficial fan project"
    footer_bbox = draw.textbbox((0, 0), footer, font=footer_font)
    footer_w = footer_bbox[2] - footer_bbox[0]
    draw.text(
        (WIDTH - MARGIN - footer_w, HEIGHT - 40),
        footer,
        fill=MUTED,
        font=footer_font,
    )


def build_base() -> Image.Image:
    backdrop_path = BACKGROUNDS / "void-atmosphere.jpg"
    if backdrop_path.exists():
        base = crop_cover(Image.open(backdrop_path).convert("RGBA"), WIDTH, HEIGHT)
    else:
        base = Image.new("RGBA", (WIDTH, HEIGHT), VOID + (255,))

    layers = [
        base,
        place_emblem(BACKGROUNDS / "emblem-cosmic.png", (0.18, 0.34), 260, 0.42),
        place_emblem(BACKGROUNDS / "emblem-doom.png", (0.84, 0.32), 280, 0.38),
        build_veil(),
        build_shimmer((0.2, 0.3), [(255, 196, 96), (120, 168, 255)], 36),
        build_shimmer((0.8, 0.28), [(88, 220, 140), (34, 168, 92)], 42),
        build_stars(),
        build_strand(),
        build_text_scrim(),
    ]

    img = Image.new("RGBA", (WIDTH, HEIGHT), VOID + (255,))
    for layer in layers:
        img = Image.alpha_composite(img, layer)
    return img


def draw_og_image(
    filename: str,
    eyebrow: str,
    title: str,
    subtitle: str,
    cta: str | None = None,
    cta_style: str = "button",
) -> None:
    img = build_base()
    draw_text_block(img, eyebrow, title, subtitle, cta, cta_style)

    OUT.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(OUT / filename, optimize=True, quality=92)
    print(f"Wrote {OUT / filename}")


def main() -> None:
    draw_og_image(
        "runup-home.png",
        eyebrow="Spoiler-safe MCU catch-up",
        title="Runup",
        subtitle="Spoiler-safe catch-up for Avengers: Doomsday",
        cta="Start your path",
    )
    draw_og_image(
        "runup-official-15.png",
        eyebrow="Disney+ Official 15",
        title="Official 15 homework list",
        subtitle="Full watch order · spoiler-safe blurbs",
        cta="15 titles · ~36h",
        cta_style="meta",
    )


if __name__ == "__main__":
    main()
