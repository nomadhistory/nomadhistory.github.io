#!/usr/bin/env python3
"""Prepara as fotos de perfil da equipe para o site.

Uso:
    python3 dev/make-photos.py <slug> <arquivo-de-origem> [--focus 0.38]

    slug            nome do arquivo final (ex.: tiago, marina)
    arquivo         .jpg, .png ou .heic vindo do celular
    --focus         onde está o rosto na vertical, de 0 (topo) a 1
                    (base). O recorte 4:5 é feito em volta desse ponto.
                    Padrão 0.38, que costuma acertar retrato em pé.

Gera assets/team/<slug>.webp com 900px de largura — o suficiente para
tela retina num card de ~450px, e ainda assim um arquivo pequeno.

HEIC do iPhone é convertido antes com o sips (vem no macOS); Pillow
sozinho não lê HEIC.
"""

import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

WIDTH = 900
RATIO = 4 / 5  # retrato
QUALITY = 82


def load(source: Path) -> Image.Image:
    if source.suffix.lower() in {".heic", ".heif"}:
        tmp = Path(tempfile.mkdtemp()) / "converted.png"
        subprocess.run(
            ["sips", "-s", "format", "png", str(source), "--out", str(tmp)],
            check=True,
            capture_output=True,
        )
        return Image.open(tmp)
    return Image.open(source)


def crop_portrait(image: Image.Image, focus: float) -> Image.Image:
    image = image.convert("RGB")
    w, h = image.size
    target_h = int(w / RATIO)

    if target_h <= h:
        # imagem larga demais: corta em cima e embaixo, centrado no rosto
        centre = h * focus
        top = int(max(0, min(centre - target_h / 2, h - target_h)))
        return image.crop((0, top, w, top + target_h))

    # imagem alta demais: corta as laterais, centro horizontal
    target_w = int(h * RATIO)
    left = (w - target_w) // 2
    return image.crop((left, 0, left + target_w, h))


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) < 2:
        print(__doc__)
        raise SystemExit(1)

    focus = 0.38
    for i, arg in enumerate(sys.argv):
        if arg == "--focus" and i + 1 < len(sys.argv):
            focus = float(sys.argv[i + 1])

    slug, source = args[0], Path(args[1]).expanduser()
    if not source.exists():
        raise SystemExit(f"não encontrei {source}")

    root = Path(__file__).resolve().parent.parent
    out_dir = root / "assets" / "team"
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"{slug}.webp"

    image = crop_portrait(load(source), focus)
    image = image.resize((WIDTH, int(WIDTH / RATIO)), Image.LANCZOS)
    # sem EXIF: a foto vai pra web e o original carrega GPS e modelo
    # do aparelho, que não têm nada que fazer num site público
    image.save(out, "WEBP", quality=QUALITY, method=6)

    print(f"{out.relative_to(root)} — {out.stat().st_size // 1024} KB, {image.size[0]}x{image.size[1]}")


if __name__ == "__main__":
    main()
