# CalWay

Calculadora de calorias para sanduíches do Subway®. Você monta o sub —
tamanho, pão, proteína, queijo, adicionais, vegetais, molhos, condimentos e
acompanhamento — e vê calorias, macronutrientes, sódio e o percentual de
valor diário atualizarem em tempo real.

Cada item escolhido aceita **dobro** (ou triplo) pelo controle `− / +`, do
mesmo jeito que a Subway cobra o adicional. Bacon, cheddar cremoso e cream
cheese ficam na categoria **Adicionais** e somam por cima da proteína e do
queijo que você já escolheu.

## Fonte dos dados

Todos os valores vêm da **tabela nutricional oficial da Subway Brasil**
(revisão de 02/01/2023), transcrita em `src/lib/data.ts`:

<https://sbw-cms.zamp.com.br/Tabela_Nutricional_02_01_2023_fa9b77005f/Tabela_Nutricional_02_01_2023_fa9b77005f.pdf>

São 54 itens em 8 categorias. Cada valor foi conferido campo a campo
(porção, kcal, carboidratos, proteínas, gorduras, fibras e sódio) contra o
PDF oficial. Os Valores Diários de Referência seguem a
IN nº 75 da ANVISA (8/10/2020), base de 2.000 kcal.

### Como o tamanho é calculado

A tabela oficial publica as porções para o sub de **15 cm**. Para o de
30 cm, o app dobra os componentes do sanduíche (pão, proteína, queijo,
vegetais, molhos, condimentos). Acompanhamentos — cookie, batata, maçã —
não escalam, porque não fazem parte do sanduíche.

Isso é uma **estimativa**. Montagem, fornecedor e região alteram os
valores reais.

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # build de produção (estático)
npm start
```

## O visual

O centro da interface é um **corte transversal do sanduíche que se desenha
sozinho**. Cada ingrediente escolhido entra como uma camada com silhueta
própria — o pão em cúpula, o queijo escorrendo, a alface recortada, o tomate
em rodelas, o molho em fio — e puxa uma linha de chamada até as próprias
calorias. Clicar numa camada tira o ingrediente.

- Cada pão tem o próprio acabamento: casca em volta, miolo com bolhas de ar,
  os cortes diagonais da broa e a cobertura certa — sementes no 9 grãos,
  queijo gratinado no 3 queijos, ervas no parmesão e orégano, brilho de
  manteiga no de alho
- Os vegetais carregam o detalhe que os identifica: azeitona é anel com furo,
  picles tem corte ondulado, cebola vira anéis concêntricos, tomate mostra
  as sementes
- Fundo papel quente, traço carvão fino, nada de branco puro nem preto puro
- As cores vêm do alimento, não da marca: miolo de pão, verde de alface,
  vermelho de tomate
- A tipografia fica de propósito quieta, para o desenho carregar a tela
- Acompanhamentos (cookie, batata, maçã) ficam fora do corte, porque não
  fazem parte do sanduíche — mas continuam somando no total

O mapa visual mora em `src/lib/visuals.ts`, separado de `data.ts`: aquele
arquivo é a transcrição conferida da tabela oficial e não recebe campo de
aparência.

## Estrutura

| Arquivo | O que faz |
| --- | --- |
| `src/lib/data.ts` | A tabela nutricional inteira, tipada |
| `src/lib/calc.ts` | Soma a seleção, aplica quantidade e tamanho, calcula %VD e macros |
| `src/components/builder.tsx` | Estado da montagem e os seletores |
| `src/components/sandwich-diagram.tsx` | O corte transversal: silhuetas, empilhamento e linhas de chamada |
| `src/lib/visuals.ts` | Cor, silhueta e ordem de cada ingrediente no desenho |
| `src/components/nutrition-panel.tsx` | Painel de resumo e barra fixa do mobile |

## Aviso

Projeto independente, sem qualquer vínculo com a Subway IP LLC.
Subway® é marca registrada da Subway IP LLC.
