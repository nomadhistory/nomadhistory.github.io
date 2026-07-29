#!/usr/bin/env python3
"""Gera og-image.png (1200x630) — o preview que aparece quando o link é
compartilhado no WhatsApp, Telegram ou X.

Uso: python3 dev/make-og.py     (a partir da raiz do repo)

Precisa de Pillow e roda no macOS (usa Georgia do sistema). Se as fontes
não existirem, cai no default do Pillow — feio, mas não quebra.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
PAPER = (250, 247, 242)
INK = (23, 19, 15)
SOFT = (91, 81, 72)
ACCENT = (168, 71, 31)

SERIF = "/System/Library/Fonts/Supplemental/Georgia.ttf"
SANS = "/System/Library/Fonts/Supplemental/Arial.ttf"


def font(path: str, size: int) -> ImageFont.ImageFont:
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


def wrap(draw, text, fnt, max_width):
    words, lines, current = text.split(), [], ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textlength(candidate, font=fnt) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    image = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(image)

    draw.rectangle([0, 0, 14, H], fill=ACCENT)

    margin = 84
    wordmark = font(SERIF, 34)

    # A marca ao lado do nome, mesmo lockup do cabeçalho do site
    mark_path = root / "assets" / "logo-mark.png"
    text_x = margin
    if mark_path.exists():
        mark = Image.open(mark_path).convert("RGBA")
        mark.thumbnail((54, 54), Image.LANCZOS)
        image.paste(mark, (margin, 70), mark)
        text_x = margin + mark.width + 20

    draw.text((text_x, 76), "HISTÓRIA NÔMADE", font=wordmark, fill=INK)
    draw.rectangle([text_x, 128, text_x + 70, 131], fill=ACCENT)

    title = font(SERIF, 62)
    lines = wrap(draw, "Every place has a story. Most hotels are sitting on theirs.", title, W - margin * 2)
    y = 208
    for line in lines:
        draw.text((margin, y), line, font=title, fill=INK)
        y += 76

    sub = font(SANS, 27)
    draw.text(
        (margin, y + 26),
        "Brand · Website · Social media · Channels — for small hospitality",
        font=sub,
        fill=SOFT,
    )

    foot = font(SANS, 23)
    draw.text((margin, H - 84), "Fixed scope, fixed price. From US$500.", font=foot, fill=ACCENT)

    out = root / "og-image.png"
    image.save(out, "PNG", optimize=True)
    print(f"wrote {out} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
