/**
 * Mapa visual do corte transversal.
 *
 * Fica separado de `data.ts` de propósito: aquele arquivo é a transcrição
 * conferida da tabela oficial e não deve ganhar campos de aparência.
 * Aqui mora só o desenho — cor, silhueta e onde a camada entra na pilha.
 */

export type LayerKind =
  | "bread"
  | "slab"
  | "drape"
  | "strips"
  | "ruffle"
  | "discs"
  | "ribbon"
  | "crumbs"
  | "rings"
  | "band";

/** o que vai por cima da casca de cada pão */
export type BreadTopping = "none" | "seeds" | "cheese" | "herbs" | "butter";

/** acabamento das rodelas — o que diferencia azeitona de picles de tomate */
export type DiscStyle = "plain" | "ring" | "crinkle" | "seeded" | "pale-core";

export type Visual = {
  /** cor tirada do alimento, não da marca */
  color: string;
  kind: LayerKind;
  /** altura da camada em unidades do viewBox */
  thickness: number;
  /**
   * ordem de empilhamento, de cima para baixo. A tampa do pão é 0 e a base
   * é 100; tudo que recheia fica no meio.
   */
  rank: number;
  /** nome curto para a linha de chamada, quando o oficial não cabe */
  short?: string;
  /** só para pães */
  topping?: BreadTopping;
  /** só para rodelas */
  discStyle?: DiscStyle;
};

const BREAD = (color: string, topping: BreadTopping = "none"): Visual => ({
  color,
  kind: "bread",
  thickness: 26,
  rank: 0,
  topping,
});

const PROTEIN = (color: string, thickness = 20): Visual => ({
  color,
  kind: "slab",
  thickness,
  rank: 60,
});

const CHEESE = (color: string, kind: LayerKind = "drape"): Visual => ({
  color,
  kind,
  thickness: 11,
  rank: 45,
});

const SAUCE = (color: string): Visual => ({
  color,
  kind: "ribbon",
  thickness: 8,
  rank: 12,
});

const VEG = (
  color: string,
  kind: LayerKind,
  thickness = 9,
  discStyle: DiscStyle = "plain",
): Visual => ({
  color,
  kind,
  thickness,
  rank: 30,
  discStyle,
});

const CONDIMENT = (color: string): Visual => ({
  color,
  kind: "crumbs",
  thickness: 5,
  rank: 8,
});

export const VISUALS: Record<string, Visual> = {
  // pães — o miolo escurece conforme o grão
  "pao-italiano": BREAD("#F0D3A0", "none"),
  "pao-9-graos": BREAD("#D9A96E", "seeds"),
  "pao-3-queijos": BREAD("#EFCB8E", "cheese"),
  "pao-parmesao-oregano": BREAD("#EAC489", "herbs"),
  "pao-manteiga-alho": BREAD("#F2D69F", "butter"),

  // proteínas
  frango: PROTEIN("#DDA76F"),
  "frango-assado": PROTEIN("#D69C63"),
  "frango-assado-barbecue": PROTEIN("#B5713F"),
  "frango-teriyaki": PROTEIN("#A86136"),
  "frango-empanado": PROTEIN("#E0A555", 23),
  "frango-defumado-cream-cheese": PROTEIN("#DCB68C"),
  "carne-supreme": PROTEIN("#9A5C3E"),
  "carne-shaved-goulash": PROTEIN("#8C5136"),
  "carne-desfiada": PROTEIN("#A3623C"),
  "carne-seca-cream-cheese": PROTEIN("#AB6E4A"),
  "steak-churrasco": PROTEIN("#8A4F33"),
  presunto: { color: "#F0A6A0", kind: "slab", thickness: 13, rank: 60 },
  pepperoni: { color: "#C4514A", kind: "discs", thickness: 12, rank: 60, discStyle: "seeded" },
  salame: { color: "#B85852", kind: "discs", thickness: 12, rank: 60, discStyle: "seeded" },
  "hamburguer-veg": PROTEIN("#97754F", 22),

  // queijos
  "mussarela-ralada": CHEESE("#F8E9BE", "crumbs"),
  "queijo-cheddar-fatiado": CHEESE("#F5B942"),
  "queijo-suico-fatiado": CHEESE("#F7E5A8"),
  "cheddar-veg": CHEESE("#F2B14E"),

  // adicionais
  "add-bacon": { color: "#D4735C", kind: "strips", thickness: 13, rank: 52 },
  "add-cheddar-cremoso": { color: "#F0A63A", kind: "drape", thickness: 13, rank: 46 },
  "add-cream-cheese": { color: "#FBF5E8", kind: "drape", thickness: 13, rank: 46 },

  // vegetais
  alface: VEG("#8FBF6A", "ruffle", 15),
  tomate: VEG("#E05B4C", "discs", 13, "seeded"),
  cebola: VEG("#F0E6F2", "rings", 8),
  pepino: VEG("#94CBA5", "discs", 11, "pale-core"),
  pimentao: VEG("#7CBF57", "strips", 9),
  picles: VEG("#A5B845", "discs", 10, "crinkle"),
  azeitona: VEG("#55523A", "discs", 9, "ring"),
  "cebola-crispy": VEG("#DCA05A", "crumbs", 10),

  // molhos
  "molho-barbecue": SAUCE("#7A4326"),
  "molho-mostarda-mel": SAUCE("#E8B53A"),
  "molho-cebola-agridoce": SAUCE("#C08A47"),
  "molho-chipotle": SAUCE("#C85536"),
  "molho-maionese-temperada": SAUCE("#F7EBCE"),
  "molho-maionese": SAUCE("#FBF2DC"),
  "molho-parmesao": SAUCE("#F3E6C4"),
  "molho-supreme": SAUCE("#F2DFB2"),
  "molho-aioli": SAUCE("#F7EACB"),

  // condimentos
  oregano: CONDIMENT("#78883E"),
  "mix-pimentas": CONDIMENT("#BE4030"),
  sal: CONDIMENT("#F5F5EE"),
  vinagre: CONDIMENT("#E5DFC6"),
  azeite: CONDIMENT("#D6BC4E"),
};

/** cor de reserva para qualquer item sem entrada acima */
export const FALLBACK: Visual = {
  color: "#D6CDBE",
  kind: "band",
  thickness: 8,
  rank: 35,
};

export const getVisual = (id: string): Visual => VISUALS[id] ?? FALLBACK;

/** nomes longos demais para caber na chamada do desenho */
const SHORT_NAMES: Record<string, string> = {
  "queijo-cheddar-fatiado": "Cheddar fatiado",
  "queijo-suico-fatiado": "Suíço fatiado",
  "frango-defumado-cream-cheese": "Frango defumado",
  "carne-seca-cream-cheese": "Carne seca",
  "carne-shaved-goulash": "Carne shaved",
  "frango-assado-barbecue": "Frango barbecue",
  "molho-maionese-temperada": "Maionese temp.",
  "pao-manteiga-alho": "Manteiga de alho",
  "pao-parmesao-oregano": "Parmesão orégano",
};

/** rótulo do desenho: nome curto, sem "(3 fatias)" e sem estourar a coluna */
export function diagramLabel(id: string, name: string) {
  const short = SHORT_NAMES[id] ?? name.replace(/\s*\(.*?\)/g, "").trim();
  return short.length > 22 ? `${short.slice(0, 21)}\u2026` : short;
}
