/**
 * Utilidades de desenho do corte transversal.
 *
 * O objetivo é fugir do traço mecânico: cada camada recebe uma semente
 * derivada do próprio id, então as ondulações variam de ingrediente para
 * ingrediente mas nunca mudam entre renderizações.
 */

/** gerador determinístico — mesma semente, mesmo desenho */
export function makeRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Point = { x: number; y: number };

/**
 * Curva suave passando por todos os pontos (Catmull-Rom convertido em
 * Bézier). É o que dá o aspecto desenhado à mão em vez de serrilhado.
 */
export function smoothThrough(points: Point[], tension = 1): string {
  if (points.length < 2) return "";
  let d = `L ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

/** série de pontos ondulados entre x0 e x1 */
export function wavePoints(
  x0: number,
  x1: number,
  y: number,
  amplitude: number,
  steps: number,
  random: () => number,
): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // as pontas ficam mais calmas que o miolo
    const ease = Math.sin(t * Math.PI) ** 0.6;
    points.push({
      x: x0 + t * (x1 - x0),
      y: y + (random() - 0.5) * 2 * amplitude * ease,
    });
  }
  return points;
}

/**
 * Faixa orgânica com pontas arredondadas — a forma base de quase todo
 * recheio.
 */
export function organicBand(
  x0: number,
  x1: number,
  y: number,
  h: number,
  random: () => number,
  { amplitude = 1.4, steps = 7, cap = 0.5 } = {},
): string {
  const capR = Math.min(h * cap, (x1 - x0) / 2);
  const top = wavePoints(x0 + capR, x1 - capR, y, amplitude, steps, random);
  const bottom = wavePoints(
    x1 - capR,
    x0 + capR,
    y + h,
    amplitude,
    steps,
    random,
  );

  return [
    `M ${x0 + capR} ${top[0].y}`,
    smoothThrough(top),
    `Q ${x1} ${y + h / 2} ${bottom[0].x} ${bottom[0].y}`,
    smoothThrough(bottom),
    `Q ${x0} ${y + h / 2} ${x0 + capR} ${top[0].y}`,
    "Z",
  ].join(" ");
}

/* ---------- cor ---------- */

function clamp(v: number) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function parseHex(hex: string) {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

const toHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("")}`;

/** escurece (amount < 0) ou clareia (amount > 0) uma cor hex */
export function shade(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  if (amount >= 0) {
    return toHex(
      r + (255 - r) * amount,
      g + (255 - g) * amount,
      b + (255 - b) * amount,
    );
  }
  const k = 1 + amount;
  return toHex(r * k, g * k, b * k);
}

/** contorno: uma versão mais escura e levemente dessaturada da própria cor */
export const outlineOf = (hex: string) => shade(hex, -0.28);
