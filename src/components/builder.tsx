"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CATEGORIES,
  SIZES,
  type Category,
  type CategoryId,
  type Item,
  type SizeId,
} from "@/lib/data";
import {
  computeTotals,
  EMPTY_SELECTION,
  round,
  sizeMultiplier,
  type Selection,
} from "@/lib/calc";
import { MobileTotalBar, NutritionPanel } from "./nutrition-panel";
import { CheckIcon, cx, MinusIcon, PlusIcon } from "./ui";

/** devolve o mapa sem a chave indicada */
function omit(source: Record<string, number>, key: string) {
  const next = { ...source };
  delete next[key];
  return next;
}

export function Builder() {
  const [size, setSize] = useState<SizeId>("15");
  const [selection, setSelection] = useState<Selection>(EMPTY_SELECTION);

  const totals = useMemo(() => computeTotals(selection, size), [selection, size]);
  const multiplier = sizeMultiplier(size);

  /** clique no card: marca, ou desmarca se já estava marcado */
  const toggle = useCallback((category: Category, itemId: string) => {
    setSelection((current) => {
      const chosen = current[category.id] ?? {};

      if (itemId in chosen) {
        return { ...current, [category.id]: omit(chosen, itemId) };
      }

      // escolha única troca o item em vez de somar
      const base = category.mode === "single" ? {} : chosen;
      return { ...current, [category.id]: { ...base, [itemId]: 1 } };
    });
  }, []);

  /** + e − no item já escolhido: o "dobro" que a Subway cobra à parte */
  const changeQty = useCallback(
    (category: Category, itemId: string, delta: number) => {
      setSelection((current) => {
        const chosen = current[category.id] ?? {};
        const next = (chosen[itemId] ?? 0) + delta;

        if (next < 1) {
          return { ...current, [category.id]: omit(chosen, itemId) };
        }

        return {
          ...current,
          [category.id]: { ...chosen, [itemId]: Math.min(next, category.maxQty) },
        };
      });
    },
    [],
  );

  const reset = useCallback(() => setSelection(EMPTY_SELECTION), []);

  /** tirar direto pelo desenho */
  const remove = useCallback((categoryId: CategoryId, itemId: string) => {
    setSelection((current) => ({
      ...current,
      [categoryId]: omit(current[categoryId] ?? {}, itemId),
    }));
  }, []);

  return (
    <>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-32 sm:px-6 lg:grid-cols-[minmax(0,1fr)_392px] lg:gap-10 lg:pb-20">
        <div className="min-w-0">
          <SizePicker size={size} onChange={setSize} />

          <div className="mt-10 space-y-10">
            {CATEGORIES.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                chosen={selection[category.id] ?? {}}
                sizeFactor={category.scalesWithSize ? multiplier : 1}
                onToggle={toggle}
                onChangeQty={changeQty}
              />
            ))}
          </div>

          <Disclaimer />
        </div>

        <aside id="resumo" className="lg:sticky lg:top-6 lg:self-start">
          <NutritionPanel
            totals={totals}
            size={size}
            onReset={reset}
            onRemove={remove}
          />
        </aside>
      </div>

      <MobileTotalBar totals={totals} size={size} />
    </>
  );
}

function SizePicker({
  size,
  onChange,
}: {
  size: SizeId;
  onChange: (size: SizeId) => void;
}) {
  return (
    <section aria-labelledby="tamanho">
      <SectionHeading id="tamanho" step="01" title="Tamanho" />

      <div
        role="radiogroup"
        aria-labelledby="tamanho"
        className="mt-4 grid grid-cols-2 gap-3"
      >
        {SIZES.map((option) => {
          const active = option.id === size;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.id)}
              className={cx(
                "rounded-card border px-5 py-4 text-left transition-all duration-150",
                active
                  ? "border-accent bg-accent-soft shadow-[0_0_0_1px_var(--color-accent)]"
                  : "border-line bg-surface hover:border-ink-faint",
              )}
            >
              <span
                className={cx(
                  "block text-2xl font-semibold tracking-[-0.03em]",
                  active ? "text-accent-deep" : "text-ink",
                )}
              >
                {option.label}
              </span>
              <span className="mt-0.5 block text-xs text-ink-faint">
                {active ? "selecionado" : option.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SectionHeading({
  id,
  step,
  title,
  required,
  meta,
}: {
  id: string;
  step: string;
  title: string;
  required?: boolean;
  meta?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="tnum eyebrow text-ink-faint">{step}</span>
      <h2 id={id} className="text-lg font-semibold tracking-[-0.015em]">
        {title}
      </h2>
      {required && (
        <span className="eyebrow rounded-full bg-accent-soft px-2 py-0.5 text-accent-deep">
          obrigatório
        </span>
      )}
      {meta && (
        <span className="tnum ml-auto text-xs text-ink-faint">{meta}</span>
      )}
    </div>
  );
}

function CategorySection({
  category,
  chosen,
  sizeFactor,
  onToggle,
  onChangeQty,
}: {
  category: Category;
  chosen: Record<string, number>;
  sizeFactor: number;
  onToggle: (category: Category, itemId: string) => void;
  onChangeQty: (category: Category, itemId: string, delta: number) => void;
}) {
  const headingId = `cat-${category.id}`;
  const count = Object.keys(chosen).length;
  const index = CATEGORIES.findIndex((c) => c.id === category.id) + 2;

  return (
    <section aria-labelledby={headingId}>
      <SectionHeading
        id={headingId}
        step={String(index).padStart(2, "0")}
        title={category.label}
        required={category.required}
        meta={count > 0 ? `${count} escolhido${count > 1 ? "s" : ""}` : undefined}
      />

      <p className="mt-1.5 text-[0.83rem] text-ink-soft">{category.hint}</p>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {category.items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            sizeFactor={sizeFactor}
            qty={chosen[item.id] ?? 0}
            maxQty={category.maxQty}
            onSelect={() => onToggle(category, item.id)}
            onChangeQty={(delta) => onChangeQty(category, item.id, delta)}
          />
        ))}
      </div>
    </section>
  );
}

function ItemCard({
  item,
  sizeFactor,
  qty,
  maxQty,
  onSelect,
  onChangeQty,
}: {
  item: Item;
  sizeFactor: number;
  qty: number;
  maxQty: number;
  onSelect: () => void;
  onChangeQty: (delta: number) => void;
}) {
  const selected = qty > 0;
  const kcal = round(item.nutrients.kcal * sizeFactor * Math.max(qty, 1));
  const canStack = maxQty > 1;

  return (
    <div
      className={cx(
        "group relative flex min-h-[5.25rem] flex-col justify-between rounded-xl border transition-all duration-150",
        selected
          ? "border-accent bg-accent-soft shadow-[0_0_0_1px_var(--color-accent)]"
          : "border-line bg-surface hover:border-ink-faint",
      )}
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className="flex flex-1 flex-col justify-between p-3 text-left"
      >
        <span className="flex items-start justify-between gap-2">
          <span className="text-[0.83rem] leading-snug font-medium text-balance text-ink">
            {item.name}
          </span>

          <span
            aria-hidden
            className={cx(
              "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border transition-colors",
              selected
                ? "border-accent bg-accent text-white"
                : "border-line text-transparent group-hover:border-ink-faint",
            )}
          >
            <CheckIcon className="size-3" />
          </span>
        </span>

        <span className="mt-2 flex items-baseline justify-between gap-2">
          <span
            className={cx(
              "tnum text-[1.05rem] font-semibold tracking-[-0.02em]",
              selected ? "text-accent-deep" : "text-ink",
            )}
          >
            {kcal}
            <span className="ml-0.5 text-[0.68rem] font-normal text-ink-faint">
              kcal
            </span>
          </span>

          {!selected && item.tags?.[0] && (
            <span className="truncate rounded-full bg-surface-alt px-1.5 py-0.5 text-[0.6rem] font-medium text-ink-soft">
              {item.tags[0]}
            </span>
          )}
        </span>
      </button>

      {/* controle de dobro, só depois de escolher */}
      {selected && canStack && (
        <div className="animate-rise flex items-center justify-between gap-1 border-t border-accent/30 px-2 py-1">
          <QtyButton
            label={`Remover uma porção de ${item.name}`}
            onClick={() => onChangeQty(-1)}
          >
            <MinusIcon className="size-3" />
          </QtyButton>

          <span className="text-[0.7rem] font-semibold text-accent-deep">
            {qty === 1 ? "normal" : qty === 2 ? "dobro" : `${qty}×`}
          </span>

          <QtyButton
            label={`Adicionar uma porção de ${item.name}`}
            disabled={qty >= maxQty}
            onClick={() => onChangeQty(1)}
          >
            <PlusIcon className="size-3" />
          </QtyButton>
        </div>
      )}
    </div>
  );
}

function QtyButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-6 place-items-center rounded-md text-ink-soft transition-colors hover:bg-accent hover:text-white disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function Disclaimer() {
  return (
    <p className="mt-12 border-t border-line pt-4 text-[0.72rem] leading-relaxed text-ink-faint">
      Valores da tabela nutricional oficial da Subway® Brasil (revisão de
      02/01/2023), calculados sobre a porção padrão de 15 cm. O sub de 30 cm
      dobra os componentes do sanduíche; adicionais e dobro somam porções
      inteiras. Montagem, fornecedor e região alteram os valores reais. CalWay é
      um projeto independente, sem vínculo com a Subway IP LLC.
    </p>
  );
}
