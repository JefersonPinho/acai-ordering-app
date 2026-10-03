"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { TamanhoCard } from "@/components/tamanho-card";
import { ComplementoCard } from "@/components/complemento-card";
import { CremeCard } from "@/components/creme-card";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  custoExtras,
  extrasDoPedido,
  formatCurrency,
  INCLUSOS,
  precoExtraDe,
} from "@/lib/catalog";

interface Tamanho {
  id: string;
  tamanho: string;
  preco: number;
  precoPromocional?: number | null;
  precoBase: number;
  imagemSrc: string;
}

interface Complemento {
  nome: string;
  imagemSrc: string;
}

interface AcaiBuilderProps {
  tamanhos: Tamanho[];
  cremes: string[];
  complementos: Complemento[];
  onAddToCart: (acai: {
    tamanho: string;
    tamanhoLabel: string;
    preco: number;
    creme: string;
    complementos: string[];
    observacao: string;
  }) => void;
  promocaoAtiva: boolean;
}

function StepHeader({
  title,
  hint,
  extra,
}: {
  title: string;
  hint?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="catalog-heading">{title}</h2>
        {extra}
      </div>

      {hint ? (
        <p className="mt-2 max-w-[40rem] text-[0.95rem] leading-relaxed text-white/70">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function AcaiBuilder({
  tamanhos,
  cremes,
  complementos,
  onAddToCart,
}: AcaiBuilderProps) {
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState("");

  const [cremeSelecionado, setCremeSelecionado] = useState("");

  const [complementosSelecionados, setComplementosSelecionados] = useState<
    string[]
  >([]);

  const [observacao, setObservacao] = useState("");

  const extras = extrasDoPedido(complementosSelecionados);

  const valorExtras = custoExtras(complementosSelecionados);

  const tamanhoObj = tamanhos.find((item) => item.id === tamanhoSelecionado);

  const precoTamanho = tamanhoObj?.preco ?? 0;

  const precoTotalItem = precoTamanho + valorExtras;

  const handleComplementoToggle = (complemento: string) => {
    setComplementosSelecionados((prev) => {
      if (prev.includes(complemento)) {
        return prev.filter((item) => item !== complemento);
      }

      return [...prev, complemento];
    });
  };

  const handleAddToCart = () => {
    if (!tamanhoSelecionado || !tamanhoObj) {
      return;
    }

    onAddToCart({
      tamanho: tamanhoObj.id,
      tamanhoLabel: tamanhoObj.tamanho,
      preco: precoTamanho,
      creme: cremeSelecionado,
      complementos: complementosSelecionados,
      observacao,
    });

    setTamanhoSelecionado("");

    setCremeSelecionado("");

    setComplementosSelecionados([]);

    setObservacao("");
  };

  return (
    <div className="builder-flow">
      <section className="step-section">
        <StepHeader title="Escolha o tamanho:" />

        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {tamanhos.map((tamanho) => {
            const temPromocao =
              tamanho.precoPromocional !== null &&
              tamanho.precoPromocional !== undefined &&
              tamanho.preco < tamanho.precoBase;

            return (
              <TamanhoCard
                key={tamanho.id}
                tamanho={tamanho.tamanho}
                preco={tamanho.preco}
                precoOriginal={temPromocao ? tamanho.precoBase : undefined}
                selecionado={tamanhoSelecionado === tamanho.id}
                onClick={() => setTamanhoSelecionado(tamanho.id)}
                imagemSrc={tamanho.imagemSrc}
              />
            );
          })}
        </div>
      </section>

      <section className="step-section">
        <StepHeader title="Escolha o creme:" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CremeCard
            creme="Açaí Tradicional"
            descricao="Só o açaí"
            selecionado={cremeSelecionado === "Açaí Tradicional"}
            onClick={() => setCremeSelecionado("Açaí Tradicional")}
          />

          {cremes.map((creme) => (
            <CremeCard
              key={creme}
              creme={creme}
              descricao="Açaí com creme de ninho"
              selecionado={cremeSelecionado === creme}
              onClick={() => setCremeSelecionado(creme)}
            />
          ))}
        </div>
      </section>

      <section className="step-section">
        <StepHeader
          title="Escolha os complementos:"
          hint="Os 3 primeiros entram no preço. Do quarto em diante, cobra o valor extra de cada um."
          extra={
            <span className="shrink-0 pt-0.5 text-sm font-semibold text-white/70">
              {complementosSelecionados.length}{" "}
              {complementosSelecionados.length === 1
                ? "escolhido"
                : "escolhidos"}
            </span>
          }
        />

        {extras.length > 0 && (
          <p className="mb-5 text-sm font-semibold leading-relaxed text-brand-green">
            {extras.length} {extras.length === 1 ? "extra" : "extras"}:{" "}
            {extras
              .map((extra) => `${extra.nome} ${formatCurrency(extra.preco)}`)
              .join(" · ")}{" "}
            = {formatCurrency(valorExtras)}
          </p>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {complementos.map((complemento) => {
            const selectedIndex = complementosSelecionados.indexOf(
              complemento.nome,
            );

            const selecionado = selectedIndex !== -1;

            const extraSelecionado = selecionado && selectedIndex >= INCLUSOS;

            const seraExtra =
              !selecionado && complementosSelecionados.length >= INCLUSOS;

            const precoExtra = precoExtraDe(complemento.nome);

            return (
              <ComplementoCard
                key={complemento.nome}
                complemento={complemento.nome}
                imagemSrc={complemento.imagemSrc}
                selecionado={selecionado}
                desabilitado={false}
                badge={
                  extraSelecionado || seraExtra
                    ? `+ ${formatCurrency(precoExtra)}`
                    : undefined
                }
                onClick={() => handleComplementoToggle(complemento.nome)}
              />
            );
          })}
        </div>
      </section>

      <section className="step-section">
        <StepHeader
          title="Observações:"
          hint="Opcional. Diga se quer pouco creme, sem algum item ou outro detalhe."
        />

        <Textarea
          placeholder="Ex.: pouco creme, sem granola..."
          value={observacao}
          maxLength={250}
          onChange={(event) => setObservacao(event.target.value)}
          className="glass-input min-h-[110px] resize-none pt-3"
        />

        <p className="mt-2 text-right text-sm text-white/45">
          {observacao.length}/250
        </p>
      </section>

      <div>
        <Button
          type="button"
          onClick={handleAddToCart}
          disabled={!tamanhoSelecionado}
          className="btn-gold min-h-[56px] w-full text-base"
        >
          <span className="flex w-full items-center justify-center gap-2 px-2 sm:justify-between">
            <span className="flex items-center gap-2 font-extrabold">
              <Plus className="h-5 w-5" strokeWidth={2.5} />
              Adicionar ao pedido
            </span>

            {tamanhoSelecionado && (
              <span className="font-extrabold">
                {formatCurrency(precoTotalItem)}
              </span>
            )}
          </span>
        </Button>

        {!tamanhoSelecionado && (
          <p className="mt-3 text-center text-sm text-white/55">
            Escolha o tamanho para adicionar o açaí.
          </p>
        )}
      </div>
    </div>
  );
}
