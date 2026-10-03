"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { extrasDoPedido, formatCurrency } from "@/lib/catalog";

interface AcaiItem {
  id: string;
  tamanho: string;
  tamanhoLabel: string;
  preco: number;
  creme: string;
  complementos: string[];
  observacao: string;
}

interface AcaiCartProps {
  items: AcaiItem[];
  onRemove: (id: string) => void;
}

export function AcaiCart({ items, onRemove }: AcaiCartProps) {
  if (!items.length) return null;

  const total = items.reduce((sum, item) => sum + item.preco, 0);

  return (
    <section className="premium-panel p-5 sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="catalog-heading">Seu pedido</h2>
          <p className="mt-2 text-sm text-white/65">
            Confira antes de enviar pelo WhatsApp.
          </p>
        </div>

        <span className="pt-1 text-sm font-semibold text-white/70">
          {items.length} {items.length === 1 ? "item" : "itens"}
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => {
          const extras = extrasDoPedido(item.complementos);

          return (
            <article
              key={item.id}
              className="rounded-2xl border border-white/12 bg-white/[0.04] p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-white/55">Açaí {index + 1}</p>
                  <h3 className="mt-1 text-lg font-extrabold text-white">
                    {item.tamanhoLabel.replace("ml", " ML")}
                  </h3>
                  <p className="mt-1 text-base font-extrabold text-brand-green">
                    {formatCurrency(item.preco)}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(item.id)}
                  className="h-11 w-11 shrink-0 text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label={`Remover açaí ${index + 1}`}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>

              {item.creme && (
                <p className="mt-4 text-sm leading-relaxed text-white/70">
                  {item.creme}
                </p>
              )}

              {item.complementos.length > 0 && (
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {item.complementos.join(", ")}
                  {extras.length > 0
                    ? ` · extras: ${extras
                        .map(
                          (extra) =>
                            `${extra.nome} ${formatCurrency(extra.preco)}`,
                        )
                        .join(", ")}`
                    : ""}
                </p>
              )}

              {item.observacao && (
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  {item.observacao}
                </p>
              )}
            </article>
          );
        })}
      </div>

      <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/12 pt-5">
        <div>
          <span className="block text-sm font-semibold text-white">
            Total do pedido
          </span>
          <span className="mt-1 block text-sm text-white/55">
            Taxa de entrega não inclusa
          </span>
        </div>

        <strong className="text-2xl font-extrabold text-brand-green sm:text-3xl">
          {formatCurrency(total)}
        </strong>
      </div>
    </section>
  );
}
