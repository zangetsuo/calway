import { Builder } from "@/components/builder";
import { CATEGORIES } from "@/lib/data";

const ingredientCount = CATEGORIES.reduce(
  (total, category) => total + category.items.length,
  0,
);

export default function Home() {
  return (
    <main>
      <header className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 pt-7 pb-10 sm:px-6 sm:pt-9 sm:pb-12">
          <div className="flex items-center gap-2">
            <BreadMark />
            <span className="text-sm font-semibold tracking-[-0.01em]">
              CalWay
            </span>
          </div>

          <h1 className="mt-8 max-w-2xl text-[2.4rem] leading-[1.05] font-semibold tracking-[-0.035em] text-balance sm:text-[3.25rem]">
            Monte seu Subway camada por camada.
          </h1>

          <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-ink-soft">
            Cada ingrediente que você escolhe entra no desenho do sanduíche — e
            aponta as próprias calorias. {ingredientCount} itens da tabela
            nutricional oficial da Subway Brasil.
          </p>
        </div>
      </header>

      <div className="pt-9 sm:pt-11">
        <Builder />
      </div>
    </main>
  );
}

/** marca: um corte de sanduíche em miniatura */
function BreadMark() {
  return (
    <svg viewBox="0 0 28 28" className="size-7" aria-hidden>
      <rect width="28" height="28" rx="7" fill="var(--color-ink)" />
      <path
        d="M7 12.5a7 7 0 0 1 14 0v.6H7Z"
        fill="#EBD3A6"
        stroke="#EBD3A6"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path d="M6.4 14.4h15.2v1.5H6.4Z" fill="#7FA85A" />
      <path d="M6.6 16.4h14.8v2.1H6.6Z" fill="#C08350" />
      <path
        d="M7 19.6h14v1.2a1.4 1.4 0 0 1-1.4 1.4H8.4A1.4 1.4 0 0 1 7 20.8Z"
        fill="#EBD3A6"
      />
    </svg>
  );
}
