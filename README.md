# História Nômade

Site do estúdio: marca, sites, conteúdo, automação e aquisição para hospitalidade e turismo.

O objetivo comercial atual é fechar **serviços pagos**, com criação/reconstrução de sites como principal porta de entrada quando essa necessidade estiver clara.

**No ar:** https://historianomade.com/

## Arquitetura

Estático puro: HTML + CSS + JS, sem build, sem backend e sem banco de dados.
Deploy por GitHub Pages a cada push na `main`.

Nada é coletado automaticamente. O **Field Check** roda inteiro no navegador; as respostas ficam no dispositivo e a única saída possível é a mensagem que a própria pessoa abre e envia por e-mail ou WhatsApp quando esse canal estiver configurado.

Sem analytics, sem cookies e sem requisições externas de aplicação. A CSP do `index.html` restringe hosts externos.

## Arquivos

| Arquivo | O que é |
|---|---|
| `js/content.js` | **Toda a copy do site.** Editar texto = editar este arquivo. |
| `js/site.js` | Monta as seções a partir do `content.js`. |
| `js/proposal-engine.js` | Lógica pura do Field Check: perguntas, prioridade de áreas e mensagem final. **Não escolhe plano nem preço.** |
| `js/proposal.js` | Interface DOM do Field Check e abertura do e-mail/WhatsApp para revisão do usuário. |
| `styles-base.css` | Tokens da marca — cor, fonte, raio e movimento. |
| `styles-site.css` | Layout das seções. |
| `styles-motion.css` | Movimento visual. |
| `js/motion.js` | Revelação por scroll, títulos e trilha do itinerário. |
| `js/theme.js` | Claro / escuro / seguir o sistema. |
| `tests/test-proposal.mjs` | Testes do motor atual de **Field Check**. O nome do arquivo é legado. |
| `dev/make-og.py` | Regera o `og-image.png`. |
| `dev/make-photos.py` | Prepara foto de perfil da equipe. |
| `dev/make-logo.py` | Regera a marca e os favicons a partir do PNG transparente. |

## Fluxo comercial do site

O site não gera proposta comercial automaticamente.

O fluxo atual é:

```text
visitante
↓
Get a Field Check
↓
4 perguntas curtas
↓
até 3 áreas sugeridas para revisão
↓
mensagem aberta para hello@historianomade.com
↓
revisão humana da presença pública
↓
Field Check real
↓
plano/proposta somente se houver problema confirmado e interesse
```

O browser **não recomenda Compass, Landmark, Expedition ou Atlas**, não calcula preço e não diagnostica o negócio sozinho.

## Contato profissional

E-mail público:

```text
hello@historianomade.com
```

O WhatsApp em `js/content.js` permanece vazio até existir um número profissional definitivo. Enquanto estiver vazio, os botões de WhatsApp não aparecem.

## Rodar local

```bash
python3 -m http.server 4321
```

Depois abrir `http://localhost:4321`.

## Antes de fazer push

```bash
python3 security_check.py . && node tests/test-proposal.mjs
```

O workflow `Validate` executa o checker de segurança, valida a sintaxe JavaScript e roda os testes do Field Check.

## Mudar texto do site

A copy principal vive em `js/content.js`.

Se o site virar bilíngue, a estrutura prevista é transformar esse objeto em `CONTENT.en` e adicionar `CONTENT.pt`, sem alterar a arquitetura geral.

## Cases

Um case só aparece quando `published: true` em `js/content.js`.

Não publicar cliente, resultado ou métrica que não aconteceu.

O primeiro case publicado é a **DLT Academy**, identificado claramente como projeto próprio do Tiago e sem métricas de desempenho inventadas.

## Planos

A versão publicada na `main` continua sendo a oferta oficialmente aprovada naquele momento.

Mudanças de arquitetura comercial devem ser revisadas em branch separada antes de chegar à `main`. Enquanto uma revisão não for aprovada, documentação experimental não substitui a oferta publicada.

## Foto de perfil da equipe

```bash
python3 dev/make-photos.py marina ~/Downloads/foto.jpg --focus 0.35
```

Aceita `.jpg`, `.png` e `.heic` do iPhone. O script recorta em 4:5, redimensiona para 900 px, remove EXIF e salva em `assets/team/<slug>.webp`.

## Indexação

O site está liberado para indexação:

```html
<meta name="robots" content="index, follow">
```

Para conferir na produção:

```bash
curl -s https://historianomade.com/ | grep robots
```

## Logo

Para regerar a marca e favicons:

```bash
python3 dev/make-logo.py ~/Downloads/historia-nomade-logo-transparente.png
```

A marca-base deve permanecer preta sobre transparente. No tema escuro o CSS faz a inversão necessária.

## Domínio próprio

Domínio principal: `historianomade.com`.

O site é publicado pelo workflow `.github/workflows/pages.yml`.

Nesse modo, não criar `CNAME` no repositório; o domínio é configurado em **Settings → Pages → Custom domain**.

DNS esperado:

- `A` `@` → `185.199.108.153`
- `A` `@` → `185.199.109.153`
- `A` `@` → `185.199.110.153`
- `A` `@` → `185.199.111.153`
- `CNAME` `www` → `nomadhistory.github.io`

As URLs absolutas usam `https://historianomade.com/` em canonical, Open Graph, Twitter metadata, Schema.org, `robots.txt` e `sitemap.xml`.
