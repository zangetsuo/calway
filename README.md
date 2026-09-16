# CalWay

Calculadora de calorias para sanduíches do Subway®. Você monta o sub
(tamanho, pão, proteína, queijo, adicionais, vegetais, molhos, condimentos e
acompanhamento) e vê calorias, macronutrientes, sódio e o percentual de
valor diário atualizarem em tempo real.

Enquanto você escolhe, o app desenha o corte transversal do sanduíche,
camada por camada, e cada camada aponta as próprias calorias.

## Funcionalidades

- **Montagem por categoria.** Pão e proteína são escolha única; o resto
  aceita vários itens ao mesmo tempo.
- **Dobro e triplo.** Cada item tem um controle `− / +`, do mesmo jeito que a
  Subway cobra o adicional. Bacon, cheddar cremoso e cream cheese ficam em
  **Adicionais** e somam por cima da proteína e do queijo já escolhidos.
- **15 cm ou 30 cm**, com o total recalculado na hora (veja
  [Como o tamanho é calculado](#como-o-tamanho-é-calculado)).
- **Painel nutricional** com calorias, carboidratos, proteínas, gorduras
  (total, saturada e trans), fibras, sódio, %VD e a divisão das calorias
  entre os macros.
- **Remover pelo desenho.** Clicar numa camada do corte tira o ingrediente.
- **Compartilhar.** Gera um resumo em texto do sanduíche. Usa o menu de
  compartilhamento nativo quando o navegador oferece; nos outros, copia para
  a área de transferência.
- **Mobile.** No celular, o total fica numa barra fixa no rodapé.
- **Acessibilidade.** Os números animam ao mudar, mas a animação é desligada
  quando o sistema pede `prefers-reduced-motion`.

### Limites de quantidade

| Categoria | Escolha | Máximo por item |
| --- | --- | --- |
| Pão | única, obrigatória | 1 |
| Proteína | única, obrigatória | 3 |
| Queijo | várias | 3 |
| Adicionais | várias | 3 |
| Vegetais | várias | 2 |
| Molhos | várias | 3 |
| Condimentos | várias | 2 |
| Acompanhamentos | várias | 3 |

## Fonte dos dados

Todos os valores vêm da **tabela nutricional oficial da Subway Brasil**
(revisão de 02/01/2023), transcrita em `src/lib/data.ts`:

<https://sbw-cms.zamp.com.br/Tabela_Nutricional_02_01_2023_fa9b77005f/Tabela_Nutricional_02_01_2023_fa9b77005f.pdf>

São 54 itens em 8 categorias. Cada valor foi conferido campo a campo
(porção, kcal, carboidratos, proteínas, gorduras, fibras e sódio) contra o
PDF oficial. Os Valores Diários de Referência seguem a
IN nº 75 da ANVISA (8/10/2020), base de 2.000 kcal.

A divisão das calorias entre os macros usa os fatores de Atwater
(4 kcal/g para carboidrato e proteína, 9 kcal/g para gordura). O resultado é
normalizado para fechar em 100%, porque a tabela oficial vem arredondada.

### Como o tamanho é calculado

A tabela oficial publica as porções para o sub de **15 cm**. Para o de
30 cm, o app dobra os componentes do sanduíche (pão, proteína, queijo,
adicionais, vegetais, molhos, condimentos). Os acompanhamentos (cookie,
batata, maçã) não escalam, porque não fazem parte do sanduíche.

Isso é uma **estimativa**. Montagem, fornecedor e região alteram os
valores reais.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) + React 19
- TypeScript
- Tailwind CSS 4
- Desenho em SVG puro, sem biblioteca gráfica
- Fontes Inter e Archivo via `next/font`

Não há backend nem banco de dados: a tabela nutricional está no código e
todo o cálculo roda no navegador.

## Rodando localmente

Requer **Node.js 20.9** ou mais recente.

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # build de produção
npm start
npm run lint     # ESLint
```

> Esta versão do Next.js tem mudanças incompatíveis com versões anteriores.
> Antes de mexer no código, veja `AGENTS.md` e a documentação em
> `node_modules/next/dist/docs/`.

## O visual

O centro da interface é um **corte transversal do sanduíche que se desenha
sozinho**. Cada ingrediente escolhido entra como uma camada com silhueta
própria (o pão em cúpula, o queijo escorrendo, a alface recortada, o tomate
em rodelas, o molho em fio) e puxa uma linha de chamada até as próprias
calorias.

- Cada pão tem o próprio acabamento: casca em volta, miolo com bolhas de ar,
  os cortes diagonais da broa e a cobertura certa. Sementes no 9 grãos,
  queijo gratinado no 3 queijos, ervas no parmesão e orégano, brilho de
  manteiga no de alho.
- Os vegetais carregam o detalhe que os identifica: azeitona é anel com furo,
  picles tem corte ondulado, cebola vira anéis concêntricos, tomate mostra
  lóculos e sementes.
- Cada ingrediente tem degradê e textura próprios: veios de gordura no bacon,
  fibras nas carnes, nervuras na alface, brilho no queijo e nos molhos. Uma
  sombra de contato separa as camadas.
- Filtros SVG (`feTurbulence` + `feDisplacementMap`) deixam as bordas
  irregulares e granuladas, para a fatia parecer cortada e não traçada no
  vetor.
- As ondulações vêm de um gerador pseudoaleatório com semente tirada do id
  do ingrediente. Cada camada tem um formato diferente, mas o mesmo
  ingrediente sai igual em toda renderização.
- Fundo papel quente, traço carvão fino, nada de branco puro nem preto puro.
- As cores vêm do alimento, não da marca: miolo de pão, verde de alface,
  vermelho de tomate.
- A tipografia fica de propósito quieta, para o desenho carregar a tela.
- Acompanhamentos ficam fora do corte, porque não fazem parte do sanduíche,
  mas continuam somando no total.

O mapa visual mora em `src/lib/visuals.ts`, separado de `data.ts`: aquele
arquivo é a transcrição conferida da tabela oficial e não recebe campo de
aparência.

## Estrutura

| Arquivo | O que faz |
| --- | --- |
| `src/app/page.tsx` | Página inicial: cabeçalho e o montador |
| `src/app/layout.tsx` | Fontes, metadados e Open Graph |
| `src/lib/data.ts` | A tabela nutricional inteira, tipada, mais tamanhos e VDR |
| `src/lib/calc.ts` | Soma a seleção, aplica quantidade e tamanho, calcula %VD, macros e o texto de compartilhamento |
| `src/lib/visuals.ts` | Cor, silhueta e ordem de cada ingrediente no desenho |
| `src/lib/draw.ts` | Utilitários de desenho: gerador com semente, curvas suaves, bordas onduladas, cores |
| `src/components/builder.tsx` | Estado da montagem e os seletores |
| `src/components/sandwich-diagram.tsx` | O corte transversal: silhuetas, texturas, empilhamento e linhas de chamada |
| `src/components/nutrition-panel.tsx` | Painel de resumo, compartilhar/limpar e barra fixa do mobile |
| `src/components/ui.tsx` | Componentes pequenos, como a animação dos números |

### Atualizando a tabela nutricional

1. Edite os itens em `src/lib/data.ts`, sempre conferindo com o PDF oficial,
   e atualize a revisão e o link no comentário do topo.
2. Se o item for novo, dê a ele uma entrada em `VISUALS`, em
   `src/lib/visuals.ts`. Sem ela, o item aparece no desenho com a camada
   genérica (`FALLBACK`).
3. A contagem de itens exibida na página é calculada sozinha a partir de
   `CATEGORIES`.

## Aviso

Projeto independente, sem qualquer vínculo com a Subway IP LLC.
Subway® é marca registrada da Subway IP LLC. Os valores são informativos e
não substituem orientação de um nutricionista.
