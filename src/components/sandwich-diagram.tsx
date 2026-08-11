"use client";

import { useId } from "react";
import {
  diagramLabel,
  getVisual,
  type BreadTopping,
  type DiscStyle,
  type LayerKind,
  type Visual,
} from "@/lib/visuals";
import { round, type Line } from "@/lib/calc";
import { shade } from "@/lib/draw";

/*
 * Desenho estilizado: tudo é construído com o mesmo vocabulário de formas —
 * cápsulas de canto totalmente arredondado, arcos regulares e repetição
 * uniforme. Nada de ruído aleatório: repetição deliberada lê como desenho,
 * ondulação randômica lê como rabisco.
 */

const VIEW_W = 360;
const X0 = 10;
const X1 = 204;
const LABEL_X = 222;
const LABEL_GAP = 13;
const TOP_Y = 12;
const CROWN_H = 28;
const BASE_H = 17;

/** o quanto cada camada escapa do pão, por posição na pilha — ritmo, não sorteio */
const OVERHANG = [7, 3, 9, 5, 11, 4, 8, 6];

type Layer = {
  line: Line;
  color: string;
  kind: LayerKind;
  top: number;
  height: number;
  overhang: number;
  discStyle: DiscStyle;
};

export function SandwichDiagram({
  lines,
  onRemove,
}: {
  lines: Line[];
  onRemove?: (categoryId: Line["categoryId"], itemId: string) => void;
}) {
  const uid = useId();

  const stackable = lines.filter((line) => line.categoryId !== "sides");
  const bread = stackable.find((line) => line.categoryId === "bread");
  const fillings = stackable
    .filter((line) => line.categoryId !== "bread")
    .sort((a, b) => getVisual(a.id).rank - getVisual(b.id).rank);

  const layers: Layer[] = [];
  let cursor = TOP_Y + (bread ? CROWN_H : 0);
  fillings.forEach((line, index) => {
    const visual = getVisual(line.id);
    layers.push({
      line,
      color: visual.color,
      kind: visual.kind,
      top: cursor,
      height: visual.thickness,
      overhang: OVERHANG[index % OVERHANG.length],
      discStyle: visual.discStyle ?? "plain",
    });
    cursor += visual.thickness * 0.94;
  });

  const baseTop = cursor + 1;
  const stackBottom = baseTop + (bread ? BASE_H : 0);

  const labelled = [
    ...(bread ? [{ line: bread, y: TOP_Y + CROWN_H * 0.4 }] : []),
    ...layers.map((l) => ({ line: l.line, y: l.top + l.height / 2 })),
  ];
  const viewH = Math.max(
    stackBottom + 16,
    TOP_Y + labelled.length * LABEL_GAP + 8,
    92,
  );
  const labelYs = spreadLabels(
    labelled.map((l) => l.y),
    LABEL_GAP,
    TOP_Y + 4,
    viewH - 6,
  );

  if (!bread && layers.length === 0) return <EmptyDiagram />;

  const breadVisual = bread ? getVisual(bread.id) : null;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${viewH}`}
      className="w-full overflow-visible"
      role="img"
      aria-label={`Corte do sanduíche com ${labelled.length} camadas`}
    >
      <defs>
        <filter id={`${uid}-lift`} x="-30%" y="-20%" width="160%" height="170%">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3.4"
            floodColor="#6B4A28"
            floodOpacity="0.18"
          />
        </filter>

        {/*
          Borda irregular + granulado. A geometria continua desenhada à mão,
          mas o ruído quebra a perfeição do vetor: é o que faz a fatia parecer
          cortada em vez de traçada.
        */}
        <filter
          id={`${uid}-organic`}
          x="-12%"
          y="-25%"
          width="124%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.028 0.06"
            numOctaves="2"
            seed="11"
            result="warp"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="warp"
            scale="4"
            xChannelSelector="R"
            yChannelSelector="G"
            result="edge"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.55"
            numOctaves="3"
            seed="5"
            result="speck"
          />
          <feColorMatrix in="speck" type="saturate" values="0" result="grey" />
          <feComponentTransfer in="grey" result="grain">
            <feFuncA type="linear" slope="0.34" intercept="-0.12" />
          </feComponentTransfer>
          <feComposite in="grain" in2="edge" operator="in" result="grainOnShape" />
          <feBlend in="edge" in2="grainOnShape" mode="multiply" />
        </filter>

        {/* mesma ideia, mais contida, para o pão */}
        <filter
          id={`${uid}-crumbly`}
          x="-10%"
          y="-16%"
          width="120%"
          height="136%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.09"
            numOctaves="2"
            seed="23"
            result="warp"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="warp"
            scale="2.6"
            xChannelSelector="R"
            yChannelSelector="G"
            result="edge"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.32"
            numOctaves="3"
            seed="9"
            result="speck"
          />
          <feColorMatrix in="speck" type="saturate" values="0" result="grey" />
          <feComponentTransfer in="grey" result="grain">
            <feFuncA type="linear" slope="0.44" intercept="-0.15" />
          </feComponentTransfer>
          <feComposite in="grain" in2="edge" operator="in" result="grainOnShape" />
          <feBlend in="edge" in2="grainOnShape" mode="multiply" />
        </filter>
      </defs>

      <g filter={`url(#${uid}-lift)`}>
        {bread && breadVisual && (
          <g filter={`url(#${uid}-crumbly)`}>
            <Crown visual={breadVisual} uid={uid} />
          </g>
        )}

        {layers.map((layer) => (
          <g
            key={layer.line.id}
            className="animate-layer transition-opacity hover:opacity-80"
            onClick={() => onRemove?.(layer.line.categoryId, layer.line.id)}
            style={{ cursor: onRemove ? "pointer" : undefined }}
          >
            <title>{`${layer.line.name} — clique para tirar`}</title>
            <g filter={`url(#${uid}-organic)`}>
              <LayerShape layer={layer} uid={uid} />
            </g>
            <rect
              x={X0 - layer.overhang}
              y={layer.top - Math.max(0, (13 - layer.height) / 2)}
              width={X1 - X0 + layer.overhang * 2}
              height={Math.max(layer.height, 13)}
              fill="transparent"
            />
          </g>
        ))}

        {bread && breadVisual && (
          <g filter={`url(#${uid}-crumbly)`}>
            <Base visual={breadVisual} y={baseTop} uid={uid} />
          </g>
        )}
      </g>

      {labelled.map((entry, index) => {
        const y = labelYs[index];
        const isBread = entry.line.categoryId === "bread";
        const anchorX = isBread ? X1 - 16 : X1 + 2;
        return (
          <g
            key={`label-${entry.line.id}`}
            className="transition-opacity hover:opacity-55"
            onClick={() => onRemove?.(entry.line.categoryId, entry.line.id)}
            style={{ cursor: onRemove ? "pointer" : undefined }}
          >
            <title>{`${entry.line.name} — clique para tirar`}</title>
            <path
              d={`M ${anchorX} ${entry.y} C ${anchorX + 10} ${entry.y} ${LABEL_X - 18} ${y} ${LABEL_X - 6} ${y}`}
              stroke="var(--color-ink-faint)"
              strokeWidth="0.7"
              strokeOpacity="0.55"
              fill="none"
            />
            <circle cx={anchorX} cy={entry.y} r="1.4" fill="var(--color-ink-faint)" />
            <text
              x={LABEL_X}
              y={y + 2.8}
              className="fill-[var(--color-ink)] text-[8.6px] font-medium"
            >
              {diagramLabel(entry.line.id, entry.line.name)}
              {entry.line.qty > 1 ? ` ${entry.line.qty}×` : ""}
              <tspan className="tnum fill-[var(--color-ink-faint)] font-normal">
                {"   "}
                {round(entry.line.nutrients.kcal)}
              </tspan>
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- pão ---------- */

/**
 * Perfil do topo do pão. Um pão de sub não é uma cúpula em cima de uma caixa:
 * é um arco que sobe rápido nos ombros, corre quase reto no meio e desce do
 * outro lado. `t` vai de 0 (esquerda) a 1 (direita).
 */
function crownTop(t: number) {
  const w = X1 - X0;
  const shoulder = 0.22;
  const x = X0 + t * w;

  if (t < shoulder) {
    const u = t / shoulder;
    return { x, y: TOP_Y + CROWN_H * (1 - Math.sin((u * Math.PI) / 2)) };
  }
  if (t > 1 - shoulder) {
    const u = (1 - t) / shoulder;
    return { x, y: TOP_Y + CROWN_H * (1 - Math.sin((u * Math.PI) / 2)) };
  }
  // abaulamento suave no meio, para o topo não ficar plano
  const u = (t - shoulder) / (1 - 2 * shoulder);
  return { x, y: TOP_Y - Math.sin(u * Math.PI) * 2.2 };
}

/** ponto do perfil deslocado para dentro da massa, ao longo da normal */
function crownPoint(t: number, inset = 0) {
  const p = crownTop(t);
  if (inset === 0) return p;

  const eps = 0.004;
  const a = crownTop(Math.max(0, t - eps));
  const b = crownTop(Math.min(1, t + eps));
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  // normal apontando para baixo/dentro
  return { x: p.x - (dy / len) * inset, y: p.y + (dx / len) * inset };
}

/** contorno externo da tampa, amostrado do perfil */
function crownOutline(samples = 48) {
  const pts = Array.from({ length: samples + 1 }, (_, i) => crownTop(i / samples));
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

/** bolhas de ar do miolo, em posições fixas — desenhadas, não sorteadas */
const POCKETS = [
  [0.18, 0.42, 1.5], [0.3, 0.68, 2.1], [0.44, 0.35, 1.7],
  [0.56, 0.72, 2.4], [0.68, 0.4, 1.6], [0.8, 0.62, 1.9],
  [0.24, 0.85, 1.4], [0.5, 0.9, 1.6], [0.74, 0.86, 1.5],
  [0.38, 0.55, 1.2], [0.62, 0.52, 1.3],
] as const;

function Crown({ visual, uid }: { visual: Visual; uid: string }) {
  const crumb = visual.color;
  const crust = shade(crumb, -0.26);
  const y = TOP_Y;
  const h = CROWN_H;
  const outline = crownOutline();

  return (
    <g>
      <defs>
        <linearGradient
          id={`${uid}-crown`}
          x1="0"
          y1={y}
          x2="0"
          y2={y + h}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={shade(crumb, 0.4)} />
          <stop offset="55%" stopColor={shade(crumb, 0.3)} />
          <stop offset="100%" stopColor={shade(crumb, 0.12)} />
        </linearGradient>
      </defs>
      <path d={`${outline} Z`} fill={`url(#${uid}-crown)`} />
      {/* casca só na parte de fora; a base é a face cortada */}
      <path
        d={outline}
        fill="none"
        stroke={crust}
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <AirPockets top={y + h * 0.4} height={h * 0.55} color={crumb} />
      <ScoreMarks crumb={crumb} />
      <BreadTopping kind={visual.topping ?? "none"} />
    </g>
  );
}

function Base({ visual, y, uid }: { visual: Visual; y: number; uid: string }) {
  const crumb = visual.color;
  const crust = shade(crumb, -0.26);
  const w = X1 - X0;
  const taper = w * 0.13;

  // fundo levemente barrigudo, com as pontas fechando como as do pão
  const rim = [
    `M ${X0} ${y}`,
    `C ${X0} ${y + BASE_H * 0.72} ${X0 + taper * 0.35} ${y + BASE_H} ${X0 + taper} ${y + BASE_H}`,
    `L ${X1 - taper} ${y + BASE_H}`,
    `C ${X1 - taper * 0.35} ${y + BASE_H} ${X1} ${y + BASE_H * 0.72} ${X1} ${y}`,
  ].join(" ");

  return (
    <g>
      <defs>
        <linearGradient
          id={`${uid}-base`}
          x1="0"
          y1={y}
          x2="0"
          y2={y + BASE_H}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={shade(crumb, 0.18)} />
          <stop offset="100%" stopColor={shade(crumb, 0.34)} />
        </linearGradient>
      </defs>
      <path d={`${rim} Z`} fill={`url(#${uid}-base)`} />
      <path
        d={rim}
        fill="none"
        stroke={crust}
        strokeWidth="4.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <AirPockets top={y + 3} height={BASE_H - 7} color={crumb} />
    </g>
  );
}

function AirPockets({
  top,
  height,
  color,
}: {
  top: number;
  height: number;
  color: string;
}) {
  const w = X1 - X0;
  return (
    <g fill={shade(color, -0.12)} opacity="0.45">
      {POCKETS.map(([t, d, r], i) => (
        <ellipse
          key={i}
          cx={X0 + 10 + t * (w - 20)}
          cy={top + d * height}
          rx={r}
          ry={r * 0.78}
        />
      ))}
    </g>
  );
}

/** os cortes diagonais que toda broa da Subway tem no topo */
function ScoreMarks({ crumb }: { crumb: string }) {
  return (
    <g strokeLinecap="round">
      {[0.28, 0.5, 0.72].map((t, i) => {
        const p = crownPoint(t, 9);
        const dx = 5;
        const dy = 3;
        return (
          <g key={i}>
            <line
              x1={p.x - dx}
              y1={p.y + dy + 1.6}
              x2={p.x + dx}
              y2={p.y - dy + 1.6}
              stroke={shade(crumb, -0.28)}
              strokeWidth="2.6"
              opacity="0.4"
            />
            <line
              x1={p.x - dx}
              y1={p.y + dy}
              x2={p.x + dx}
              y2={p.y - dy}
              stroke={shade(crumb, 0.42)}
              strokeWidth="2.2"
            />
          </g>
        );
      })}
    </g>
  );
}

/** posição da cobertura ao longo da cúpula, sem encostar nas quinas */
const toppingT = (i: number, count: number) => 0.09 + ((i + 0.5) / count) * 0.82;

function BreadTopping({ kind }: { kind: BreadTopping }) {
  if (kind === "none") return null;

  if (kind === "seeds") {
    const count = 15;
    return (
      <g fill="#7A5A32" opacity="0.8">
        {Array.from({ length: count }, (_, i) => {
          const t = toppingT(i, count);
          const p = crownPoint(t, 4 + (i % 3) * 2.4);
          return (
            <ellipse
              key={i}
              cx={p.x}
              cy={p.y}
              rx="2"
              ry="1.05"
              transform={`rotate(${(t - 0.5) * 120} ${p.x} ${p.y})`}
            />
          );
        })}
      </g>
    );
  }

  if (kind === "cheese") {
    // queijo gratinado: bolotas douradas encostadas na casca
    const count = 9;
    return (
      <g>
        {Array.from({ length: count }, (_, i) => {
          const t = toppingT(i, count);
          const big = i % 2 === 0;
          const p = crownPoint(t, big ? 3.6 : 4.8);
          return (
            <ellipse
              key={i}
              cx={p.x}
              cy={p.y}
              rx={big ? 6.8 : 4.8}
              ry={big ? 3.9 : 2.9}
              fill={big ? "#D9A03C" : "#C68A2C"}
            />
          );
        })}
      </g>
    );
  }

  if (kind === "herbs") {
    const count = 13;
    return (
      <g>
        {Array.from({ length: count }, (_, i) => {
          const t = toppingT(i, count);
          const isCheese = i % 3 === 0;
          const p = crownPoint(t, isCheese ? 3.8 : 4.6);
          return isCheese ? (
            <ellipse key={i} cx={p.x} cy={p.y} rx="5.5" ry="3.2" fill="#D9A03C" />
          ) : (
            <rect
              key={i}
              x={p.x - 1.6}
              y={p.y - 0.9}
              width="3.2"
              height="1.8"
              rx="0.9"
              fill="#5F7434"
              transform={`rotate(${(t - 0.5) * 130} ${p.x} ${p.y})`}
            />
          );
        })}
      </g>
    );
  }

  // manteiga de alho: brilho ao longo da casca e lascas de alho
  const count = 9;
  return (
    <g>
      <path
        d={`M ${crownPoint(0.06, 3.4).x} ${crownPoint(0.06, 3.4).y} ${Array.from(
          { length: 14 },
          (_, i) => {
            const p = crownPoint(0.06 + (i / 13) * 0.88, 3.4);
            return `L ${p.x} ${p.y}`;
          },
        ).join(" ")}`}
        fill="none"
        stroke="#FBEBC4"
        strokeWidth="3.4"
        strokeLinecap="round"
        opacity="0.85"
      />
      {Array.from({ length: count }, (_, i) => {
        const t = toppingT(i, count);
        const p = crownPoint(t, 5.5);
        return (
          <ellipse
            key={i}
            cx={p.x}
            cy={p.y}
            rx="2.4"
            ry="1.5"
            fill="#C9A85E"
            opacity="0.85"
          />
        );
      })}
    </g>
  );
}

/* ---------- recheios ---------- */

/**
 * Sombra de contato e volume. Cada camada recebe o mesmo tratamento: um
 * degradê próprio de cima para baixo e uma sombra projetada pela camada de
 * cima. É o que separa as fatias sem precisar de contorno.
 */
function Shading({
  id,
  top,
  height,
  color,
}: {
  id: string;
  top: number;
  height: number;
  color: string;
}) {
  return (
    <defs>
      <linearGradient
        id={`${id}-body`}
        x1="0"
        y1={top}
        x2="0"
        y2={top + height}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor={shade(color, 0.2)} />
        <stop offset="42%" stopColor={color} />
        <stop offset="100%" stopColor={shade(color, -0.2)} />
      </linearGradient>
      <linearGradient
        id={`${id}-contact`}
        x1="0"
        y1={top}
        x2="0"
        y2={top + height * 0.55}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#2E1B0B" stopOpacity="0.30" />
        <stop offset="100%" stopColor="#2E1B0B" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}

function LayerShape({ layer, uid }: { layer: Layer; uid: string }) {
  const { color, kind, top, height, overhang, line } = layer;
  const x0 = X0 - overhang;
  const x1 = X1 + overhang;
  const w = x1 - x0;
  const dark = shade(color, -0.15);
  const light = shade(color, 0.26);
  const id = `${uid}-${line.id}`;
  const body = `url(#${id}-body)`;
  const contact = `url(#${id}-contact)`;
  const LIP = 2.5;

  const shading = (
    <Shading id={id} top={top} height={height} color={color} />
  );

  switch (kind) {
    case "ruffle": {
      const bumps = 9;
      const unit = w / bumps;
      const spine = height * 0.52;
      const shape = (dy: number) => {
        let d = `M ${x0} ${top + height + dy} L ${x0} ${top + spine + dy}`;
        for (let i = 0; i < bumps; i++) {
          const sx = x0 + i * unit;
          const lift = i % 2 === 0 ? height * 0.95 : height * 0.66;
          d += ` C ${sx + unit * 0.16} ${top + height - lift + dy} ${sx + unit * 0.84} ${top + height - lift + dy} ${sx + unit} ${top + spine + dy}`;
        }
        return `${d} L ${x1} ${top + height + dy} Z`;
      };
      return (
        <g>
          {shading}
          <path d={shape(LIP)} fill={dark} />
          <path d={shape(0)} fill={body} />
          {/* nervuras: sobem do talo até a ponta de cada lobo */}
          <g stroke={light} strokeWidth="0.8" strokeLinecap="round" opacity="0.55">
            {Array.from({ length: bumps }, (_, i) => {
              const sx = x0 + unit * (i + 0.5);
              const lift = i % 2 === 0 ? height * 0.72 : height * 0.5;
              return (
                <line
                  key={i}
                  x1={sx}
                  y1={top + height - 1.5}
                  x2={sx}
                  y2={top + height - lift}
                />
              );
            })}
          </g>
          <path d={shape(0)} fill={contact} />
        </g>
      );
    }

    case "drape": {
      const teeth = 7;
      const tw = w / teeth;
      const shape = (dy: number) => {
        const tr = 4;
        let d = `M ${x0} ${top + dy + tr} Q ${x0} ${top + dy} ${x0 + tr} ${top + dy}`;
        d += ` L ${x1 - tr} ${top + dy} Q ${x1} ${top + dy} ${x1} ${top + dy + tr}`;
        d += ` L ${x1} ${top + height * 0.45 + dy}`;
        for (let i = teeth; i > 0; i--) {
          const sx = x0 + i * tw;
          d += ` L ${sx - tw / 2} ${top + height * 1.3 + dy} L ${sx - tw} ${top + height * 0.45 + dy}`;
        }
        return `${d} Z`;
      };
      return (
        <g>
          {shading}
          <path d={shape(LIP)} fill={dark} />
          <path d={shape(0)} fill={body} />
          {/* brilho de queijo derretido */}
          <rect
            x={x0 + w * 0.1}
            y={top + height * 0.18}
            width={w * 0.42}
            height={height * 0.16}
            rx={height * 0.08}
            fill={shade(color, 0.45)}
            opacity="0.5"
          />
          <path d={shape(0)} fill={contact} />
        </g>
      );
    }

    case "discs": {
      const rx = height * 1.5;
      const count = Math.max(3, Math.round(w / (rx * 1.55)));
      const step = (w - rx * 1.3) / Math.max(count - 1, 1);
      const cy = top + height / 2;
      const ry = height * 0.54;

      return (
        <g>
          {shading}
          <rect
            x={x0}
            y={top + height * 0.3}
            width={w}
            height={height * 0.44}
            rx={height * 0.22}
            fill={dark}
          />
          {Array.from({ length: count }, (_, i) => {
            const cx = x0 + rx * 0.65 + i * step;
            return (
              <g key={i}>
                <ellipse cx={cx} cy={cy + LIP} rx={rx} ry={ry} fill={dark} />
                {layer.discStyle === "crinkle" ? (
                  <path d={crinkleEllipse(cx, cy, rx, ry)} fill={body} />
                ) : (
                  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={body} />
                )}

                {layer.discStyle === "ring" ? (
                  <ellipse
                    cx={cx}
                    cy={cy}
                    rx={rx * 0.3}
                    ry={ry * 0.42}
                    fill={shade(color, 0.55)}
                  />
                ) : (
                  <ellipse
                    cx={cx}
                    cy={cy - height * 0.06}
                    rx={rx * 0.48}
                    ry={ry * 0.44}
                    fill={light}
                  />
                )}

                {layer.discStyle === "seeded" && (
                  <g>
                    {/* lóculos: a polpa gelatinosa e as sementes dentro */}
                    {[-0.52, 0, 0.52].map((o, k) => (
                      <ellipse
                        key={`p${k}`}
                        cx={cx + o * rx * 0.62}
                        cy={cy - height * 0.05}
                        rx={rx * 0.17}
                        ry={ry * 0.3}
                        fill={shade(color, 0.44)}
                      />
                    ))}
                    {[-0.52, 0, 0.52].map((o, k) => (
                      <ellipse
                        key={`s${k}`}
                        cx={cx + o * rx * 0.62}
                        cy={cy - height * 0.05}
                        rx={rx * 0.07}
                        ry={ry * 0.14}
                        fill={shade(color, 0.68)}
                      />
                    ))}
                  </g>
                )}

                {layer.discStyle === "pale-core" && (
                  <g>
                    <ellipse
                      cx={cx}
                      cy={cy}
                      rx={rx * 0.3}
                      ry={ry * 0.34}
                      fill={shade(color, 0.42)}
                    />
                    {[-0.4, 0.4].map((o, k) => (
                      <ellipse
                        key={k}
                        cx={cx + o * rx * 0.3}
                        cy={cy}
                        rx={rx * 0.05}
                        ry={ry * 0.1}
                        fill={shade(color, -0.2)}
                        opacity="0.6"
                      />
                    ))}
                  </g>
                )}

                {/* reflexo: as rodelas são úmidas */}
                <ellipse
                  cx={cx - rx * 0.42}
                  cy={cy - ry * 0.5}
                  rx={rx * 0.26}
                  ry={ry * 0.16}
                  fill="#fff"
                  opacity="0.28"
                />
              </g>
            );
          })}
        </g>
      );
    }

    case "strips": {
      const h = height * 0.4;
      const periods = 4;
      const seg = w / periods;
      const amp = h * 0.75;
      const wave = (y: number, phase: number) => {
        let d = `M ${x0} ${y}`;
        for (let i = 0; i < periods; i++) {
          const sx = x0 + i * seg;
          d += ` Q ${sx + seg / 4} ${y - amp * phase} ${sx + seg / 2} ${y}`;
          d += ` Q ${sx + (seg * 3) / 4} ${y + amp * phase} ${sx + seg} ${y}`;
        }
        return d;
      };
      return (
        <g>
          {shading}
          {[0, 1].map((row) => {
            const y = top + row * (height * 0.55) + h / 2;
            const phase = row === 0 ? 1 : -1;
            const d = wave(y, phase);
            return (
              <g key={row}>
                <path d={d} fill="none" stroke={dark} strokeWidth={h} strokeLinecap="round" transform={`translate(0 ${LIP})`} />
                <path d={d} fill="none" stroke={color} strokeWidth={h} strokeLinecap="round" />
                {/* vetas de gordura, o que faz virar bacon e não fita */}
                <path d={wave(y - h * 0.22, phase)} fill="none" stroke={shade(color, 0.5)} strokeWidth={h * 0.24} strokeLinecap="round" opacity="0.85" />
                <path d={wave(y + h * 0.24, phase)} fill="none" stroke={shade(color, 0.38)} strokeWidth={h * 0.16} strokeLinecap="round" opacity="0.7" />
                <path d={d} fill="none" stroke={shade(color, -0.32)} strokeWidth={h} strokeLinecap="round" opacity="0.16" transform={`translate(0 ${-h * 0.34})`} />
              </g>
            );
          })}
        </g>
      );
    }

    case "ribbon": {
      const periods = 4;
      const seg = (w - 6) / periods;
      const y = top + height / 2;
      const amp = height * 0.38;
      let d = `M ${x0 + 3} ${y}`;
      for (let i = 0; i < periods; i++) {
        const sx = x0 + 3 + i * seg;
        d += ` Q ${sx + seg / 4} ${y - amp} ${sx + seg / 2} ${y}`;
        d += ` Q ${sx + (seg * 3) / 4} ${y + amp} ${sx + seg} ${y}`;
      }
      return (
        <g>
          {shading}
          <path d={d} fill="none" stroke={dark} strokeWidth={height * 0.82} strokeLinecap="round" transform={`translate(0 ${LIP * 0.7})`} />
          <path d={d} fill="none" stroke={color} strokeWidth={height * 0.82} strokeLinecap="round" />
          {/* fio de luz: molho é brilhante */}
          <path d={d} fill="none" stroke={shade(color, 0.5)} strokeWidth={height * 0.2} strokeLinecap="round" opacity="0.7" transform={`translate(0 ${-height * 0.2})`} />
        </g>
      );
    }

    case "rings": {
      const arcs = 5;
      const seg = w / arcs;
      return (
        <g>
          {Array.from({ length: arcs }, (_, i) => {
            const cx = x0 + seg * (i + 0.5);
            return (
              <g key={i}>
                <path
                  d={`M ${cx - seg * 0.44} ${top + height} A ${seg * 0.44} ${height * 0.92} 0 0 1 ${cx + seg * 0.44} ${top + height}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={height * 0.32}
                />
                <path
                  d={`M ${cx - seg * 0.44} ${top + height} A ${seg * 0.44} ${height * 0.92} 0 0 1 ${cx + seg * 0.44} ${top + height}`}
                  fill="none"
                  stroke={shade(color, -0.28)}
                  strokeWidth={height * 0.08}
                  opacity="0.45"
                />
                <path
                  d={`M ${cx - seg * 0.24} ${top + height} A ${seg * 0.24} ${height * 0.5} 0 0 1 ${cx + seg * 0.24} ${top + height}`}
                  fill="none"
                  stroke={dark}
                  strokeWidth={height * 0.2}
                  opacity="0.7"
                />
              </g>
            );
          })}
        </g>
      );
    }

    case "crumbs": {
      const per = 13;
      const sz = height * 0.44;
      return (
        <g>
          {[0, 1].flatMap((row) =>
            Array.from({ length: per }, (_, i) => {
              const t = (i + (row === 1 ? 0.5 : 0)) / per;
              const tone = (i + row) % 3;
              return (
                <rect
                  key={`${row}-${i}`}
                  x={x0 + 4 + t * (w - 10)}
                  y={top + (row === 0 ? height * 0.1 : height * 0.5)}
                  width={sz * 1.7}
                  height={sz}
                  rx={sz / 2}
                  fill={tone === 0 ? light : tone === 1 ? color : dark}
                />
              );
            }),
          )}
        </g>
      );
    }

    case "slab":
    case "band":
    default: {
      const r = Math.min(height / 2, 9);
      const fibres = Math.max(3, Math.round(height / 5));
      return (
        <g>
          {shading}
          <rect x={x0} y={top + LIP} width={w} height={height} rx={r} fill={dark} />
          <rect x={x0} y={top} width={w} height={height} rx={r} fill={body} />
          {/* fibras: traços curtos escalonados, como estriação de músculo */}
          <g strokeLinecap="round" opacity="0.4">
            {Array.from({ length: fibres }, (_, i) =>
              [0, 1, 2].map((k) => {
                const fy = top + height * ((i + 1) / (fibres + 1));
                const span = w * (0.18 + ((i + k) % 3) * 0.09);
                const sx = x0 + 10 + ((k * 0.34 + i * 0.11) % 0.78) * (w - 20);
                return (
                  <path
                    key={`${i}-${k}`}
                    d={`M ${sx} ${fy} q ${span / 2} ${(i % 2 === 0 ? -1 : 1) * height * 0.05} ${span} 0`}
                    fill="none"
                    stroke={(i + k) % 2 === 0 ? light : shade(color, -0.3)}
                    strokeWidth={height * 0.045}
                  />
                );
              }),
            )}
          </g>
          <rect x={x0} y={top} width={w} height={height} rx={r} fill={contact} />
        </g>
      );
    }
  }
}

/** elipse de borda ondulada — o corte crinkle do picles */
function crinkleEllipse(cx: number, cy: number, rx: number, ry: number) {
  const teeth = 14;
  const pts: string[] = [];
  for (let i = 0; i <= teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const wobble = i % 2 === 0 ? 1 : 0.84;
    pts.push(
      `${cx + Math.cos(a) * rx * wobble} ${cy + Math.sin(a) * ry * wobble}`,
    );
  }
  return `M ${pts[0]} ${pts.slice(1).map((pt) => `L ${pt}`).join(" ")} Z`;
}

/* ---------- apoio ---------- */

function spreadLabels(
  desired: number[],
  minGap: number,
  min: number,
  max: number,
) {
  const ys = [...desired];
  for (let i = 1; i < ys.length; i++) {
    if (ys[i] - ys[i - 1] < minGap) ys[i] = ys[i - 1] + minGap;
  }
  if (ys.length > 0 && ys[ys.length - 1] > max) {
    ys[ys.length - 1] = max;
    for (let i = ys.length - 2; i >= 0; i--) {
      if (ys[i + 1] - ys[i] < minGap) ys[i] = ys[i + 1] - minGap;
    }
  }
  return ys.map((y) => Math.max(y, min));
}

function EmptyDiagram() {
  return (
    <div className="flex h-36 flex-col items-center justify-center gap-2.5 text-center">
      <svg viewBox="0 0 130 56" className="w-32 opacity-30" aria-hidden>
        <path
          d="M8 30a57 57 0 0 1 114 0Z"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M8 38h114v7a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5Z"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
      </svg>
      <p className="text-[0.8rem] text-ink-faint">
        Escolha um pão para começar o desenho.
      </p>
    </div>
  );
}
