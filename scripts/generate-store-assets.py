#!/usr/bin/env python3
"""Generate Google Play TV store assets from existing Runup art."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OG = ROOT / "public" / "og"
MOCKS = ROOT / "public" / "mocks"
STORE = ROOT / "public" / "store"

FEATURE_SIZE = (1024, 500)
TV_SCREENSHOT_SIZE = (1920, 1080)
TV_MOCKS = [
    "runup-01-void-landing.png",
    "runup-02-placement.png",
    "runup-03-threadfield.png",
    "runup-04-tonight.png",
]

PHONE_SCREENSHOT_SIZE = (1080, 1920)
PHONE_MOCKS = [
    "runup-05-mobile.png",
]


def cover_crop(img: Image.Image, size: tuple[int, int], focus: tuple[float, float]) -> Image.Image:
    target_w, target_h = size
    src_w, src_h = img.size
    scale = max(target_w / src_w, target_h / src_h)
    new_w = round(src_w * scale)
    new_h = round(src_h * scale)
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = round(new_w * focus[0] - target_w / 2)
    top = round(new_h * focus[1] - target_h / 2)
    left = max(0, min(left, new_w - target_w))
    top = max(0, min(top, new_h - target_h))
    return resized.crop((left, top, left + target_w, top + target_h))


def main() -> None:
    STORE.mkdir(parents=True, exist_ok=True)

    title = Image.open(OG / "title.png").convert("RGB")
    feature = cover_crop(title, FEATURE_SIZE, focus=(0.5, 0.42))
    feature.save(STORE / "feature-graphic.png", optimize=True)

    for index, mock_name in enumerate(TV_MOCKS, start=1):
        mock = Image.open(MOCKS / mock_name).convert("RGB")
        screenshot = cover_crop(mock, TV_SCREENSHOT_SIZE, focus=(0.5, 0.5))
        screenshot.save(STORE / f"tv-screenshot-{index:02d}.png", optimize=True)

    for index, mock_name in enumerate(PHONE_MOCKS, start=1):
        mock = Image.open(MOCKS / mock_name).convert("RGB")
        screenshot = cover_crop(mock, PHONE_SCREENSHOT_SIZE, focus=(0.5, 0.5))
        screenshot.save(STORE / f"phone-screenshot-{index:02d}.png", optimize=True)

    print("Wrote store assets to", STORE)


if __name__ == "__main__":
    main()
