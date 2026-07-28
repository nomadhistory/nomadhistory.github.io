# História Nômade

Site do estúdio: marca, site, automação e tráfego pago para hotelaria e turismo pequeno.
Serviço com preço fechado — e, para propriedades com quarto sobrando na baixa temporada,
a opção de pagar em hospedagem.

**No ar:** https://nomadhistory.github.io/

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
| `styles-base.css` | Tokens de cor e tipografia, botões. |
| `styles-site.css` | Layout das seções. |
| `dev/make-og.py` | Regera o `og-image.png` (o preview de link compartilhado). |
| `tests/test-proposal.mjs` | Testes do motor de propostas. |

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

## Pendências antes do lançamento

1. **Contatos reais** — `js/content.js` → `brand.email` e `brand.whatsapp`
   ainda são placeholder. O site não funciona sem eles.
2. **Primeiro case real** — Marina escreve, vira `published: true`.
3. **Tirar o `noindex`** — o `index.html` sobe com
   `<meta name="robots" content="noindex, nofollow">` de propósito, enquanto o
   portfólio está vazio. Ao remover, conferir **na URL de produção**, não no repo:

   ```bash
   curl -s https://nomadhistory.github.io/ | grep robots
   ```

   Tem que voltar vazio. Repo limpo e página servindo `noindex` já aconteceu antes.
4. **Wordmark definitivo** — `assets/wordmark.svg` é tipográfico e provisório
   (usa fonte do sistema). Serve pro lançamento, mas não é o logo final.

## Domínio próprio (quando comprar)

1. Criar o arquivo `CNAME` na raiz com o domínio, uma linha só, sem `https://`:
   ```
   historianomade.com
   ```
2. No registrador (Namecheap, mesmo lugar do `dlt.academy`), criar:
   - 4 registros `A` para `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - um `CNAME` de `www` para `nomadhistory.github.io`
3. Em Settings → Pages do repo, preencher o custom domain e marcar **Enforce HTTPS**
   (o certificado leva alguns minutos).
4. Trocar as URLs absolutas em `index.html` (canonical, `og:url`, `og:image`,
   `twitter:image`), em `robots.txt` e em `sitemap.xml`.
