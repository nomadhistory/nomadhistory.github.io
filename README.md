# História Nômade

Site do estúdio: marca, site, automação e tráfego pago para hotelaria e turismo pequeno.
Serviço com preço fechado — e, para propriedades com quarto sobrando na baixa temporada,
a opção de pagar em hospedagem.

**No ar:** https://historianomade.com/

## Arquitetura

Estático puro: HTML + CSS + JS, sem build, sem dependência, sem backend.
Deploy por GitHub Pages a cada push na `main`.

Nada é coletado de ninguém. O formulário de proposta roda inteiro no navegador;
a única saída possível é a mensagem que a própria pessoa envia clicando em
WhatsApp ou e-mail. Sem analytics, sem cookie, sem requisição externa — a CSP
do `index.html` bloqueia qualquer host de fora.

## Arquivos

| Arquivo | O que é |
|---|---|
| `js/content.js` | **Toda a copy do site.** Editar texto = editar só este arquivo. |
| `js/site.js` | Monta as seções a partir do `content.js`. Não tem texto dentro. |
| `js/proposal-engine.js` | Lógica do formulário: qual pacote, quais serviços, qual acerto. Sem DOM. |
| `js/proposal.js` | Interface do formulário. Só DOM. |
| `styles-base.css` | **Tokens da marca** — cor, fonte, raio, movimento. É aqui que a identidade visual entra. |
| `styles-site.css` | Layout das seções. |
| `styles-motion.css` | Todo o movimento. |
| `js/motion.js` | Revelação por scroll, título linha a linha, trilha do itinerário. Puro enfeite. |
| `js/theme.js` | Claro / escuro / seguir o sistema. **Único script no `<head>`** — precisa rodar antes da primeira pintura, senão a página pisca no tema errado. |
| `dev/make-og.py` | Regera o `og-image.png` (o preview de link compartilhado). |
| `dev/make-photos.py` | Prepara foto de perfil da equipe. |
| `dev/make-logo.py` | Regera a marca e os favicons a partir do PNG transparente. |
| `tests/test-proposal.mjs` | Testes do motor de propostas. |

## Foto de perfil da equipe

```bash
python3 dev/make-photos.py marina ~/Downloads/foto.jpg --focus 0.35
```

Aceita `.jpg`, `.png` e `.heic` do iPhone. Recorta em 4:5 em volta do
rosto (`--focus` é a altura dele, 0 = topo, 1 = base; o padrão 0.38
serve pra retrato em pé), redimensiona pra 900px, **remove o EXIF** —
o original carrega GPS e modelo do aparelho, que não têm o que fazer
num site público — e salva em `assets/team/<slug>.webp`.

Depois é só apontar o campo `photo` do membro em `js/content.js`.
Membro sem foto renderiza só o texto, sem buraco no layout.

## Rodar local

```bash
python3 -m http.server 4321
```

E abrir http://localhost:4321.

## Antes de fazer push

```bash
python3 security_check.py . && node tests/test-proposal.mjs
```

O CI roda exatamente isso.

## Mudar texto do site

Tudo em `js/content.js`. Se um dia o site virar bilíngue, esse objeto vira
`CONTENT.en` e ganha um `CONTENT.pt` do lado — a estrutura não muda.

## Cases (`js/content.js` → `cases.items`)

Um case só aparece no site quando tem `published: true`. Enquanto não houver
trabalho real publicado, a seção mostra o aviso de `emptyNote` em vez de
resultado inventado. **Não publicar case com número que não aconteceu** — é a
única parte do site que não pode ser escrita antes do trabalho existir.

## Pendências de conteúdo

1. **Contatos reais** — `js/content.js` → `brand.email` e `brand.whatsapp`
   ainda precisam representar os canais definitivos usados pela operação.
2. **Primeiro case real** — Marina escreve e vira `published: true` quando houver
   resultado real que possa ser publicado.
3. **Wordmark definitivo** — a marca (`assets/logo-mark.png`) já é a final, da
   Marina. Só o *nome escrito* ao lado dela (`assets/wordmark.svg`) ainda é
   tipografia de sistema, provisória.

O site está liberado para indexação (`index, follow`). Para conferir na produção:

```bash
curl -s https://historianomade.com/ | grep robots
```

## Logo

A marca vem de um PNG preto sobre transparente. Para regerar tudo:

```bash
python3 dev/make-logo.py ~/Downloads/historia-nomade-logo-transparente.png
```

Gera `logo-mark.png` (recortado no limite real, cinza+alfa pra pesar pouco) e
os três favicons.

**A marca tem que ser preta pura, sem cor.** No tema escuro o CSS aplica
`filter: invert(1)` pra deixar ela branca — é o que impede o logo de sumir no
fundo escuro. Qualquer cor no arquivo vira cor invertida errada.

Os favicons saem com o fundo creme de propósito: ícone transparente
desaparece na barra de abas dependendo do tema do sistema.

No cabeçalho a marca aparece com o nome ao lado; abaixo de 560px o nome some e
fica só a marca, senão o botão "Get a proposal" quebra em duas linhas.

## Domínio próprio

Domínio principal: `historianomade.com`.

O site é publicado por um workflow customizado do GitHub Actions (`.github/workflows/pages.yml`).
Nesse modo, **não criar arquivo `CNAME` no repositório**: o GitHub Pages ignora esse arquivo.
O domínio é definido em **Settings → Pages → Custom domain**.

DNS esperado no registrador:

- `A` `@` → `185.199.108.153`
- `A` `@` → `185.199.109.153`
- `A` `@` → `185.199.110.153`
- `A` `@` → `185.199.111.153`
- `CNAME` `www` → `nomadhistory.github.io`

No GitHub Pages:

1. Custom domain: `historianomade.com`.
2. **Enforce HTTPS** ativado assim que o certificado estiver disponível.
3. Com apex e `www` configurados no DNS, o GitHub redireciona `www.historianomade.com` para o domínio canônico configurado.

As URLs absolutas do site usam `https://historianomade.com/` em canonical, Open Graph,
Twitter metadata, Schema.org, `robots.txt` e `sitemap.xml`.
