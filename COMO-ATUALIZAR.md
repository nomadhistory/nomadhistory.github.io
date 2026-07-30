# Animação do globo — como atualizar

O único arquivo a editar depois de uma viagem é `js/hero-globe.js`.

## Atualizar países

No início desse arquivo existem as listas `VISITED` e `IN_PROGRESS`.

- Ao chegar a um país novo, mova o nome de `IN_PROGRESS` para `VISITED`.
- Ao viajar para um lugar, adicione o nome em `IN_PROGRESS`.
- Recarregue a página: a contagem, lista de nomes, pegadas e cores são geradas automaticamente.

Use o nome em inglês existente no atlas. Alguns nomes que diferem do uso comum:

| País | Nome no atlas |
| --- | --- |
| Estados Unidos | `United States of America` |
| Reino Unido | `United Kingdom` |
| República Tcheca | `Czechia` |
| Coreia do Sul | `South Korea` |
| Emirados Árabes | `United Arab Emirates` |
| Bósnia | `Bosnia and Herz.` |
| República Dominicana | `Dominican Rep.` |
| Costa do Marfim | `Côte d'Ivoire` |

Se um nome estiver incorreto, o país não é pintado e o console do navegador informa qual não foi encontrado. Países muito pequenos, como Singapura, Malta e Bahrein, não existem na geometria Natural Earth 110m; nesse caso será preciso adotar uma malha de maior resolução.

## Ajustes finos

O objeto `SETTINGS` no mesmo arquivo controla `spin` (velocidade; `0` deixa o globo parado), `tilt`, `startLon` e `footScale`. O objeto `LABELS` contém os textos da legenda.

As cores são tokens de `styles-base.css`: alterar `--accent` atualiza os países e as pegadas, inclusive nos temas claro e escuro.

## Dependências locais

O globo depende de `assets/lib/d3.min.js`, `assets/lib/topojson-client.min.js` e `assets/world-110m.js`. Todos são arquivos locais para preservar a Content Security Policy: a geometria atribui dados a `window.WORLD_110M` e nunca é carregada por `fetch`.
