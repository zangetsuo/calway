import {
  CATEGORIES,
  ITEM_INDEX,
  SIZES,
  VDR,
  type CategoryId,
  type Nutrients,
  type SizeId,
} from "./data";

/**
 * Seleção do usuário: para cada categoria, um mapa de id do item -> quantidade.
 * Quantidade 2 é o "dobro" que a Subway cobra como adicional.
 */
export type Selection = Record<CategoryId, Record<string, number>>;

export const EMPTY_SELECTION: Selection = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, {} as Record<string, number>]),
) as Selection;

const ZERO: Nutrients = {
  kcal: 0,
  carbs: 0,
  protein: 0,
  fat: 0,
  satFat: 0,
  transFat: 0,
  fiber: 0,
  sodium: 0,
};

export type Line = {
  id: string;
  name: string;
  categoryId: CategoryId;
  categoryLabel: string;
  /** porção já ajustada ao tamanho escolhido */
  portion: number;
  /** nutrientes já ajustados ao tamanho escolhido */
  nutrients: Nutrients;
  /** porções-base que entraram: quantidade x tamanho */
  multiplier: number;
  /** quantas vezes o usuário pediu o item (1 = normal, 2 = dobro) */
  qty: number;
};

export type Totals = {
  nutrients: Nutrients;
  /** peso total em gramas */
  weight: number;
  lines: Line[];
  /** % do valor diário de referência, por nutriente */
  percentVDR: Nutrients;
};

const scale = (nutrients: Nutrients, factor: number): Nutrients => ({
  kcal: nutrients.kcal * factor,
  carbs: nutrients.carbs * factor,
  protein: nutrients.protein * factor,
  fat: nutrients.fat * factor,
  satFat: nutrients.satFat * factor,
  transFat: nutrients.transFat * factor,
  fiber: nutrients.fiber * factor,
  sodium: nutrients.sodium * factor,
});

const add = (a: Nutrients, b: Nutrients): Nutrients => ({
  kcal: a.kcal + b.kcal,
  carbs: a.carbs + b.carbs,
  protein: a.protein + b.protein,
  fat: a.fat + b.fat,
  satFat: a.satFat + b.satFat,
  transFat: a.transFat + b.transFat,
  fiber: a.fiber + b.fiber,
  sodium: a.sodium + b.sodium,
});

export function sizeMultiplier(size: SizeId): number {
  return SIZES.find((s) => s.id === size)?.multiplier ?? 1;
}

/**
 * Soma a seleção inteira. Componentes do sanduíche dobram no sub de 30 cm;
 * acompanhamentos (cookie, batata, maçã) entram sempre em porção única.
 */
export function computeTotals(selection: Selection, size: SizeId): Totals {
  const sizeFactor = sizeMultiplier(size);
  const lines: Line[] = [];

  for (const category of CATEGORIES) {
    for (const [id, qty] of Object.entries(selection[category.id] ?? {})) {
      const entry = ITEM_INDEX[id];
      if (!entry || qty < 1) continue;

      const multiplier = (category.scalesWithSize ? sizeFactor : 1) * qty;
      lines.push({
        id,
        name: entry.item.name,
        categoryId: category.id,
        categoryLabel: category.label,
        portion: entry.item.portion * multiplier,
        nutrients: scale(entry.item.nutrients, multiplier),
        multiplier,
        qty,
      });
    }
  }

  const nutrients = lines.reduce((acc, line) => add(acc, line.nutrients), ZERO);
  const weight = lines.reduce((acc, line) => acc + line.portion, 0);

  const percentVDR = Object.fromEntries(
    (Object.keys(VDR) as (keyof Nutrients)[]).map((key) => [
      key,
      VDR[key] === 0 ? 0 : (nutrients[key] / VDR[key]) * 100,
    ]),
  ) as Nutrients;

  return { nutrients, weight, lines, percentVDR };
}

/**
 * Distribuição calórica pelos macronutrientes (Atwater: 4/4/9 kcal por grama).
 * Normalizada para 100% para que o gráfico feche mesmo com arredondamentos
 * da tabela oficial.
 */
export function macroSplit(nutrients: Nutrients) {
  const carbsKcal = nutrients.carbs * 4;
  const proteinKcal = nutrients.protein * 4;
  const fatKcal = nutrients.fat * 9;
  const total = carbsKcal + proteinKcal + fatKcal;

  if (total === 0) return { carbs: 0, protein: 0, fat: 0 };

  return {
    carbs: (carbsKcal / total) * 100,
    protein: (proteinKcal / total) * 100,
    fat: (fatKcal / total) * 100,
  };
}

export const round = (value: number, decimals = 0) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/** formata gramas escondendo casas decimais desnecessárias */
export const grams = (value: number) => {
  const rounded = round(value, 1);
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toString().replace(".", ",");
};

/** texto compartilhável do sanduíche montado */
export function buildShareText(totals: Totals, size: SizeId): string {
  const sizeLabel = SIZES.find((s) => s.id === size)?.label ?? size;
  const byCategory = new Map<string, string[]>();

  for (const line of totals.lines) {
    const list = byCategory.get(line.categoryLabel) ?? [];
    list.push(line.qty > 1 ? `${line.name} (${line.qty}x)` : line.name);
    byCategory.set(line.categoryLabel, list);
  }

  const body = [...byCategory.entries()]
    .map(([label, names]) => `${label}: ${names.join(", ")}`)
    .join("\n");

  return [
    `Meu Subway de ${sizeLabel} — ${round(totals.nutrients.kcal)} kcal`,
    "",
    body,
    "",
    `Proteínas ${grams(totals.nutrients.protein)} g · Carboidratos ${grams(
      totals.nutrients.carbs,
    )} g · Gorduras ${grams(totals.nutrients.fat)} g · Sódio ${round(
      totals.nutrients.sodium,
    )} mg`,
    "",
    "Calculado no CalWay",
  ].join("\n");
}
