#!/usr/bin/env python3
"""Gera os arquivos de logo do site a partir do PNG transparente original.

Uso:
    python3 dev/make-logo.py ~/Downloads/historia-nomade-logo-transparente.png

Produz:
    assets/logo-mark.png      marca recortada no limite real, 512px, transparente
    assets/favicon-32.png     ícone da aba
    assets/favicon-180.png    ícone de atalho no iOS
    assets/favicon.ico        fallback pra navegador velho

A marca é preta sobre transparente. No modo escuro o CSS aplica
`filter: invert(1)`, o que deixa ela branca — por isso o arquivo tem
que ser preto puro, sem cor, e o recorte tem que ser justo: qualquer
sobra de margem vira desalinhamento no cabeçalho.

Os favicons saem com o fundo creme da marca porque ícone transparente
some na barra de abas dependendo do tema do sistema.
"""

import sys
from pathlib import Path

from PIL import Image

PAPER = (247, 243, 236)  # --brand-paper
MARK_SIZE = 512


def trim(image: Image.Image) -> Image.Image:
    """Recorta no limite real do desenho, usando o alfa."""
    alpha = image.convert("RGBA").getchannel("A")
    box = alpha.getbbox()
    if not box:
        raise SystemExit("imagem vazia — o PNG tem alfa mesmo?")
    return image.crop(box)


def on_paper(mark: Image.Image, size: int) -> Image.Image:
    """Marca centrada sobre o creme, com respiro de 14% em volta."""
    canvas = Image.new("RGB", (size, size), PAPER)
    inner = int(size * 0.72)
    scaled = mark.copy()
    scaled.thumbnail((inner, inner), Image.LANCZOS)
    canvas.paste(
        scaled,
        ((size - scaled.width) // 2, (size - scaled.height) // 2),
        scaled,
    )
    return canvas


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        raise SystemExit(1)

    source = Path(sys.argv[1]).expanduser()
    if not source.exists():
        raise SystemExit(f"não encontrei {source}")

    root = Path(__file__).resolve().parent.parent
    assets = root / "assets"

    original = Image.open(source).convert("RGBA")
    mark = trim(original)
    print(f"original {original.size} → recortado {mark.size}")

    square = mark.copy()
    square.thumbnail((MARK_SIZE, MARK_SIZE), Image.LANCZOS)
    # A marca é preta pura sobre transparente: guardar em RGBA gasta
    # três canais idênticos. "LA" (cinza + alfa) dá o mesmo pixel na
    # tela por uma fração do peso.
    square.convert("LA").save(assets / "logo-mark.png", "PNG", optimize=True)

    for size in (32, 180):
        on_paper(mark, size).save(assets / f"favicon-{size}.png", "PNG", optimize=True)

    on_paper(mark, 64).save(assets / "favicon.ico", "ICO", sizes=[(16, 16), (32, 32), (48, 48)])

    for name in ("logo-mark.png", "favicon-32.png", "favicon-180.png", "favicon.ico"):
        path = assets / name
        print(f"  {name} — {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
