"use client";

import { useMemo, useState } from "react";
import { SIZES, VDR, type CategoryId, type SizeId } from "@/lib/data";
import { buildShareText, grams, macroSplit, round, type Totals } from "@/lib/calc";
import { SandwichDiagram } from "./sandwich-diagram";
import { cx, useCountUp } from "./ui";

type Props = {
  totals: Totals;
  size: SizeId;
  onReset: () => void;
  onRemove: (categoryId: CategoryId, itemId: string) => void;
};

const MACROS = [
  { key: "protein", label: "Proteínas", color: "var(--color-macro-protein)" },
  { key: "carbs", label: "Carboidratos", color: "var(--color-macro-carb)" },
  { key: "fat", label: "Gorduras", color: "var(--color-macro-fat)" },
] as const;

export function NutritionPanel({ totals, size, onReset, onRemove }: Props) {
  const [copied, setCopied] = useState(false);
  const { nutrients, weight, lines } = totals;
  const animatedKcal = useCountUp(nutrients.kcal);
  const split = useMemo(() => macroSplit(nutrients), [nutrients]);

  const isEmpty = lines.length === 0;
  const sizeLabel = SIZES.find((s) => s.id === size)?.label ?? "";
  const sides = lines.filter((line) => line.categoryId === "sides");
  const sodiumOver = totals.percentVDR.sodium >= 100;

  const handleShare = async () => {
    const text = buildShareText(totals, size);
    try {
      if (navigator.share) {
        await navigator.share({ title: "Meu Subway", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // share cancelado ou clipboard bloqueado — nada a fazer
    }
  };

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-[0_1px_2px_oklch(28%_0.02_65/0.05),0_18px_40px_-24px_oklch(28%_0.02_65/0.22)]">
      {/* o desenho */}
      <div className="border-b border-line-soft px-3 pt-3.5 pb-2">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="eyebrow text-ink-faint">
            Seu sanduíche
            {lines.length > 0 && (
              <span className="ml-1.5 hidden font-normal normal-case tracking-normal text-ink-faint/70 sm:inline">
                clique para tirar
              </span>
            )}
          </h2>
          <span className="tnum text-[0.7rem] text-ink-faint">
            {sizeLabel} · {round(weight)} g
          </span>
        </div>

        <div className="mt-1.5">
          <SandwichDiagram lines={lines} onRemove={onRemove} />
        </div>

        {sides.length > 0 && (
          <p className="px-1 pt-1 text-[0.68rem] text-ink-faint">
            + {sides.map((s) => s.name).join(", ")} (fora do sanduíche)
          </p>
        )}
      </div>

      {/* total */}
      <div className="border-b border-line-soft px-4 py-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow text-ink-faint">Total</p>
            <p className="tnum mt-0.5 flex items-baseline gap-1.5">
              <span className="text-[2.6rem] leading-none font-semibold tracking-[-0.035em]">
                {round(animatedKcal)}
              </span>
              <span className="text-sm text-ink-soft">kcal</span>
            </p>
          </div>
          <span className="tnum pb-1 text-xs text-ink-faint">
            {round(totals.percentVDR.kcal)}% do dia
          </span>
        </div>

        <div className="mt-3 flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-surface-alt">
          {MACROS.map((macro) => (
            <div
              key={macro.key}
              className="h-full rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${split[macro.key]}%`, backgroundColor: macro.color }}
            />
          ))}
        </div>

        <dl className="mt-2.5 grid grid-cols-3 gap-2">
          {MACROS.map((macro) => (
            <div key={macro.key}>
              <dt className="flex items-center gap-1.5 text-[0.68rem] text-ink-faint">
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: macro.color }}
                />
                {macro.label}
              </dt>
              <dd className="tnum mt-0.5 text-[0.95rem] font-semibold">
                {grams(nutrients[macro.key])}
                <span className="ml-0.5 text-[0.68rem] font-normal text-ink-faint">
                  g
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* nutrientes de atenção */}
      <div className="border-b border-line-soft px-4 py-3">
        <Row
          label="Sódio"
          value={`${round(nutrients.sodium)} mg`}
          percent={totals.percentVDR.sodium}
          alert={sodiumOver}
        />
        <Row
          label="Gordura saturada"
          value={`${grams(nutrients.satFat)} g`}
          percent={totals.percentVDR.satFat}
          alert={totals.percentVDR.satFat >= 100}
        />
        <Row
          label="Fibras"
          value={`${grams(nutrients.fiber)} g`}
          percent={totals.percentVDR.fiber}
          good
        />

        {sodiumOver && (
          <p className="animate-rise mt-2 rounded-md bg-[oklch(96%_0.035_45)] px-2.5 py-1.5 text-[0.7rem] leading-snug text-warn">
            Passa do limite diário de sódio ({VDR.sodium} mg).
          </p>
        )}
      </div>

      <div className="flex gap-2 px-4 py-3">
        <button
          type="button"
          onClick={handleShare}
          disabled={isEmpty}
          className="flex-1 rounded-lg bg-accent px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-deep disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-ink-faint"
        >
          {copied ? "Copiado!" : "Compartilhar"}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={isEmpty}
          className="rounded-lg border border-line px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  percent,
  alert,
  good,
}: {
  label: string;
  value: string;
  percent: number;
  alert?: boolean;
  good?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="w-28 shrink-0 text-[0.76rem] text-ink-soft">{label}</span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-alt">
        <div
          className={cx(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            alert ? "bg-warn" : good ? "bg-accent" : "bg-ink-faint",
          )}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span
        className={cx(
          "tnum w-16 shrink-0 text-right text-[0.76rem] font-semibold",
          alert ? "text-warn" : "text-ink",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** faixa fixa no rodapé em telas pequenas */
export function MobileTotalBar({
  totals,
  size,
}: {
  totals: Totals;
  size: SizeId;
}) {
  const animated = useCountUp(totals.nutrients.kcal);
  const sizeLabel = SIZES.find((s) => s.id === size)?.label ?? "";

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 py-2.5 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <div>
          <p className="eyebrow text-ink-faint">
            {sizeLabel} · {totals.lines.length}{" "}
            {totals.lines.length === 1 ? "item" : "itens"}
          </p>
          <p className="tnum text-2xl leading-tight font-semibold tracking-[-0.03em]">
            {round(animated)}
            <span className="ml-1 text-sm font-normal text-ink-soft">kcal</span>
          </p>
        </div>
        <a
          href="#resumo"
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-deep"
        >
          Ver sanduíche
        </a>
      </div>
    </div>
  );
}
