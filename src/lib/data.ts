/**
 * Tabela Nutricional Subway® Brasil
 * Fonte: tabela nutricional oficial publicada pela Subway Brasil (rev. 02/01/2023).
 * https://sbw-cms.zamp.com.br/Tabela_Nutricional_02_01_2023_fa9b77005f/Tabela_Nutricional_02_01_2023_fa9b77005f.pdf
 *
 * Todos os valores correspondem à PORÇÃO PADRÃO de um sanduíche de 15 cm.
 * Para 30 cm, os componentes do sanduíche são multiplicados por 2 (ver SIZE_MULTIPLIER).
 */

export type Nutrients = {
  /** quilocalorias */
  kcal: number;
  /** carboidratos (g) */
  carbs: number;
  /** proteínas (g) */
  protein: number;
  /** gordura total (g) */
  fat: number;
  /** gordura saturada (g) */
  satFat: number;
  /** gordura trans (g) */
  transFat: number;
  /** fibra alimentar (g) */
  fiber: number;
  /** sódio (mg) */
  sodium: number;
};

export type Item = {
  id: string;
  name: string;
  /** porção em gramas */
  portion: number;
  nutrients: Nutrients;
  /** rótulos curtos exibidos no card */
  tags?: string[];
};

export type CategoryId =
  | "bread"
  | "protein"
  | "cheese"
  | "addons"
  | "veggies"
  | "sauces"
  | "condiments"
  | "sides";

export type Category = {
  id: CategoryId;
  label: string;
  hint: string;
  /** "single" = escolha única (ou nenhuma), "multi" = várias */
  mode: "single" | "multi";
  /** true = obrigatório para montar o sanduíche */
  required?: boolean;
  /** acompanhamentos não escalam com o tamanho do sanduíche */
  scalesWithSize: boolean;
  /** quantas porções do mesmo item o usuário pode empilhar (dobro, triplo...) */
  maxQty: number;
  items: Item[];
};

/** helper para reduzir ruído na tabela abaixo */
const n = (
  kcal: number,
  carbs: number,
  protein: number,
  fat: number,
  satFat: number,
  transFat: number,
  fiber: number,
  sodium: number,
): Nutrients => ({ kcal, carbs, protein, fat, satFat, transFat, fiber, sodium });

export const CATEGORIES: Category[] = [
  {
    id: "bread",
    label: "Pão",
    hint: "A base do seu sanduíche. Escolha um.",
    mode: "single",
    required: true,
    scalesWithSize: true,
    maxQty: 1,
    items: [
      { id: "pao-italiano", name: "Italiano Branco", portion: 85, nutrients: n(254, 47, 11, 3, 0, 0, 2, 332), tags: ["Mais leve"] },
      { id: "pao-9-graos", name: "9 Grãos", portion: 89, nutrients: n(286, 58, 9, 2, 0, 0, 4, 432), tags: ["Rico em fibras"] },
      { id: "pao-3-queijos", name: "3 Queijos", portion: 89, nutrients: n(273, 47, 12, 4, 1, 0, 2, 357) },
      { id: "pao-parmesao-oregano", name: "Parmesão e Orégano", portion: 89, nutrients: n(273, 49, 11, 3, 1, 0, 3, 501) },
      { id: "pao-manteiga-alho", name: "Pão c/ Manteiga de Alho", portion: 89, nutrients: n(268, 50, 11, 3, 0, 0, 2, 501) },
    ],
  },
  {
    id: "protein",
    label: "Proteína",
    hint: "O recheio principal. Escolha um.",
    mode: "single",
    required: true,
    scalesWithSize: true,
    maxQty: 3,
    items: [
      { id: "frango", name: "Frango", portion: 70, nutrients: n(116, 3, 13, 6, 2, 0, 0, 287) },
      { id: "frango-assado", name: "Frango Assado", portion: 70, nutrients: n(100, 0, 15, 4, 0, 0, 0, 217), tags: ["Alta proteína"] },
      { id: "frango-assado-barbecue", name: "Frango Assado com Barbecue", portion: 90, nutrients: n(118, 8, 14, 3, 0, 0, 0, 404) },
      { id: "frango-teriyaki", name: "Frango Teriyaki", portion: 75, nutrients: n(100, 7, 13, 2, 1, 0, 0, 431) },
      { id: "frango-empanado", name: "Frango Empanado", portion: 78, nutrients: n(209, 17, 10, 11, 2, 0, 1, 472) },
      { id: "frango-defumado-cream-cheese", name: "Frango Defumado c/ Cream Cheese", portion: 70, nutrients: n(151, 3, 8, 12, 7, 0.4, 0, 405) },
      { id: "carne-supreme", name: "Carne Supreme", portion: 70, nutrients: n(78, 2, 12, 3, 1, 0, 0, 406), tags: ["Alta proteína"] },
      { id: "carne-shaved-goulash", name: "Carne Shaved c/ Molho Goulash", portion: 70, nutrients: n(70, 3, 9, 2, 1, 0, 0, 644) },
      { id: "carne-desfiada", name: "Carne Desfiada", portion: 70, nutrients: n(59, 3.5, 7.5, 1.8, 0.8, 0, 0.8, 670), tags: ["Menos calorias"] },
      { id: "carne-seca-cream-cheese", name: "Carne Seca c/ Cream Cheese", portion: 70, nutrients: n(145, 1, 9, 12, 7, 0.4, 0, 354) },
      { id: "steak-churrasco", name: "Steak Churrasco", portion: 64, nutrients: n(147, 6, 9, 10, 4, 0, 0, 480) },
      { id: "presunto", name: "Presunto (2 fatias)", portion: 30, nutrients: n(24, 0, 5, 0, 0, 0, 0, 244), tags: ["Menos calorias"] },
      { id: "pepperoni", name: "Pepperoni (3 fatias)", portion: 19, nutrients: n(83, 0, 4, 8, 3, 0, 0, 256) },
      { id: "salame", name: "Salame (3 fatias)", portion: 19, nutrients: n(74, 0, 5, 6, 3, 0, 0, 304) },
      { id: "hamburguer-veg", name: "Hambúrguer Veg", portion: 60, nutrients: n(175, 3, 10, 14, 5, 0, 1, 300), tags: ["Vegetariano"] },
    ],
  },
  {
    id: "cheese",
    label: "Queijo",
    hint: "Escolha um ou combine mais de um. Use + para dobrar.",
    mode: "multi",
    scalesWithSize: true,
    maxQty: 3,
    items: [
      { id: "mussarela-ralada", name: "Mussarela Ralada", portion: 15, nutrients: n(14, 0, 1, 1, 0.7, 0, 0, 24), tags: ["Mais leve"] },
      { id: "queijo-cheddar-fatiado", name: "Processado Fatiado Cheddar (2 fatias)", portion: 11, nutrients: n(40, 1, 1, 3, 2, 0, 0, 146) },
      { id: "queijo-suico-fatiado", name: "Processado Fatiado Suíço (2 fatias)", portion: 11, nutrients: n(40, 1, 1, 4, 2, 0.2, 0, 129) },
      { id: "cheddar-veg", name: "Cheddar Veg", portion: 30, nutrients: n(73, 3, 0, 7, 1, 0, 0, 190), tags: ["Vegano"] },
    ],
  },
  {
    id: "addons",
    label: "Adicionais",
    hint: "O que a Subway cobra à parte. Somam por cima do que você já escolheu.",
    mode: "multi",
    scalesWithSize: true,
    maxQty: 3,
    items: [
      { id: "add-bacon", name: "Bacon", portion: 15, nutrients: n(72, 1, 5, 6, 2, 0, 0, 282) },
      { id: "add-cheddar-cremoso", name: "Cheddar Cremoso", portion: 74, nutrients: n(159, 5, 5, 13, 9, 0, 0, 795) },
      { id: "add-cream-cheese", name: "Cream Cheese", portion: 72, nutrients: n(193, 2, 4, 19, 12, 0.6, 0, 371) },
    ],
  },
  {
    id: "veggies",
    label: "Vegetais",
    hint: "Escolha quantos quiser — quase todos custam pouquíssimas calorias.",
    mode: "multi",
    scalesWithSize: true,
    maxQty: 2,
    items: [
      { id: "alface", name: "Alface", portion: 21, nutrients: n(3, 1, 0, 0, 0, 0, 0, 2) },
      { id: "tomate", name: "Tomate", portion: 39, nutrients: n(7, 2, 0, 0, 0, 0, 0, 2) },
      { id: "cebola", name: "Cebola", portion: 7, nutrients: n(3, 1, 0, 0, 0, 0, 0, 0) },
      { id: "pepino", name: "Pepino (3 fatias)", portion: 15, nutrients: n(2, 0, 0, 0, 0, 0, 0, 0) },
      { id: "pimentao", name: "Pimentão (3 fatias)", portion: 6, nutrients: n(1, 0, 0, 0, 0, 0, 0, 0) },
      { id: "picles", name: "Picles (3 fatias)", portion: 9, nutrients: n(1, 1, 0, 0, 0, 0, 0, 74) },
      { id: "azeitona", name: "Azeitona (3 fatias)", portion: 3, nutrients: n(4, 0, 0, 0, 0, 0, 0, 26) },
      { id: "cebola-crispy", name: "Cebola Crispy", portion: 12, nutrients: n(56, 7, 1, 3, 1, 0, 1, 108), tags: ["Frito"] },
    ],
  },
  {
    id: "sauces",
    label: "Molhos",
    hint: "Onde as calorias escondidas moram. Use + para pedir molho extra.",
    mode: "multi",
    scalesWithSize: true,
    maxQty: 3,
    items: [
      { id: "molho-barbecue", name: "Barbecue", portion: 11.5, nutrients: n(12, 3, 0, 0, 0, 0, 0, 88), tags: ["Mais leve"] },
      { id: "molho-mostarda-mel", name: "Mostarda e Mel", portion: 10, nutrients: n(10, 8, 0, 1, 0, 0, 0, 58), tags: ["Mais leve"] },
      { id: "molho-cebola-agridoce", name: "Cebola Agridoce", portion: 13, nutrients: n(20, 5, 0, 0, 0, 0, 0, 54) },
      { id: "molho-chipotle", name: "Chipotle", portion: 7.5, nutrients: n(20, 1, 0, 2, 0, 0, 0, 68) },
      { id: "molho-maionese-temperada", name: "Maionese Temperada", portion: 9, nutrients: n(22, 1, 0, 2, 0, 0, 0, 74) },
      { id: "molho-maionese", name: "Maionese", portion: 9, nutrients: n(26, 1, 0, 3, 0, 0, 0, 75) },
      { id: "molho-parmesao", name: "Molho Parmesão", portion: 10, nutrients: n(29, 1, 0, 3, 0, 0, 0, 102) },
      { id: "molho-supreme", name: "Supreme", portion: 10, nutrients: n(35, 1, 0, 4, 1, 0, 0, 88) },
      { id: "molho-aioli", name: "Molho Aioli", portion: 20, nutrients: n(61, 1.5, 0, 7, 1, 0, 0, 137) },
    ],
  },
  {
    id: "condiments",
    label: "Condimentos",
    hint: "O toque final. Praticamente zero caloria.",
    mode: "multi",
    scalesWithSize: true,
    maxQty: 2,
    items: [
      { id: "oregano", name: "Orégano", portion: 0.14, nutrients: n(0, 0, 0, 0, 0, 0, 0, 0) },
      { id: "mix-pimentas", name: "Mix de Pimentas", portion: 0.14, nutrients: n(0, 0, 0, 0, 0, 0, 0, 0) },
      { id: "sal", name: "Sal", portion: 0.8, nutrients: n(0, 0, 0, 0, 0, 0, 0, 312), tags: ["Muito sódio"] },
      { id: "vinagre", name: "Vinagre", portion: 3.5, nutrients: n(1, 0, 0, 0, 0, 0, 0, 0) },
      { id: "azeite", name: "Azeite", portion: 3.5, nutrients: n(29, 0, 0, 3, 0, 0, 0, 0) },
    ],
  },
  {
    id: "sides",
    label: "Acompanhamentos",
    hint: "Não escalam com o tamanho do sanduíche.",
    mode: "multi",
    scalesWithSize: false,
    maxQty: 3,
    items: [
      { id: "maca", name: "Maçã", portion: 90, nutrients: n(47, 13, 0, 0, 0, 0, 2, 1), tags: ["Mais leve"] },
      { id: "batata-rustica", name: "Batata Rústica c/ Ervas Finas", portion: 84, nutrients: n(93, 14, 2.5, 2.9, 1.3, 0, 2.6, 160) },
      { id: "cookie-gotas", name: "Cookie Gotas de Chocolate", portion: 45, nutrients: n(207, 29, 2, 9, 5, 0, 1, 91) },
      { id: "cookie-chocolate", name: "Cookie Chocolate c/ Gotas", portion: 45, nutrients: n(204, 27, 3, 9, 5, 0, 1, 105) },
      { id: "cookie-macadamia", name: "Cookie Macadâmia", portion: 45, nutrients: n(214, 27, 2, 11, 5, 0.1, 1, 140) },
    ],
  },
];

export const SIZES = [
  { id: "15", label: "15 cm", sublabel: "Sub de 15", multiplier: 1 },
  { id: "30", label: "30 cm", sublabel: "Sub de 30", multiplier: 2 },
] as const;

export type SizeId = (typeof SIZES)[number]["id"];

/**
 * Valores Diários de Referência (VDR) — ANVISA, IN nº 75 de 8/10/2020.
 * Base: dieta de 2.000 kcal.
 */
export const VDR: Nutrients = {
  kcal: 2000,
  carbs: 300,
  protein: 50,
  fat: 65,
  satFat: 20,
  transFat: 2,
  fiber: 25,
  sodium: 2000,
};

/** índice id -> item, para lookup O(1) na hora de somar */
export const ITEM_INDEX: Record<string, { item: Item; category: Category }> =
  Object.fromEntries(
    CATEGORIES.flatMap((category) =>
      category.items.map((item) => [item.id, { item, category }] as const),
    ),
  );
