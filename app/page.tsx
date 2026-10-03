"use client";

import { useState } from "react";
import { CheckCircle2, MessageCircle, Plus, ShoppingBag } from "lucide-react";

import { AcaiBuilder } from "@/components/acai-builder";
import { AcaiCart } from "@/components/acai-cart";
import { PaymentForm } from "@/components/payment-form";
import { AddressForm } from "@/components/address-form";
import { DeliveryMethod } from "@/components/delivery-method";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "@/hooks/use-toast";
import { custoExtras, extrasDoPedido, formatCurrency } from "@/lib/catalog";

const hoje = new Date();
const isDomingo = hoje.getDay() === 0;

const tamanhos = [
  {
    id: "200ml",
    tamanho: "200ml",
    precoOriginal: 12,
    precoPromocional: 10,
    imagemSrc: "/copo-pequeno.png",
  },
  {
    id: "330ml",
    tamanho: "330ml",
    precoOriginal: 15,
    precoPromocional: null,
    imagemSrc: "/copo-grande.png",
  },
  {
    id: "500ml",
    tamanho: "500ml",
    precoOriginal: 25,
    precoPromocional: null,
    imagemSrc: "/copo-500ml.png",
  },
];

const cremes = ["Creme de Ninho"];

const complementos = [
  {
    nome: "Cookies Cream",
    imagemSrc: "/complementos/cookies-cream.png",
  },
  {
    nome: "M&Ms",
    imagemSrc: "/complementos/mms.png",
  },
  {
    nome: "Nutella",
    imagemSrc: "/complementos/nutella.png",
  },
  {
    nome: "Chocoball (G)",
    imagemSrc: "/complementos/chocoball-grande.png",
  },
  {
    nome: "Castanha",
    imagemSrc: "/complementos/castanha.png",
  },
  {
    nome: "Gotas de Chocolate",
    imagemSrc: "/complementos/gotas-chocolate.png",
  },
  {
    nome: "Paçoquita",
    imagemSrc: "/complementos/pacoquita.png",
  },
  {
    nome: "Cereja",
    imagemSrc: "/complementos/cereja.png",
  },
  {
    nome: "Morango",
    imagemSrc: "/complementos/morango.png",
  },
  {
    nome: "Leite em pó",
    imagemSrc: "/complementos/leite-em-po.png",
  },
  {
    nome: "Chocoball (P)",
    imagemSrc: "/complementos/chocoball-pequeno.png",
  },
  {
    nome: "Banana",
    imagemSrc: "/complementos/banana.png",
  },
  {
    nome: "Farinha Láctea",
    imagemSrc: "/complementos/farinha-lactea.png",
  },
  {
    nome: "Amendoim",
    imagemSrc: "/complementos/amendoim.png",
  },
  {
    nome: "Granola",
    imagemSrc: "/complementos/granola.png",
  },
  {
    nome: "Kiwi",
    imagemSrc: "/complementos/kiwi.png",
  },
];

type Recebimento = "" | "entrega" | "retirada";

interface AcaiItem {
  id: string;
  tamanho: string;
  tamanhoLabel: string;
  preco: number;
  creme: string;
  complementos: string[];
  observacao: string;
}

function parseCurrency(value: string): number {
  if (!value.trim()) return 0;

  let normalized = value.trim().replace(/[^\d,.]/g, "");

  const lastComma = normalized.lastIndexOf(",");
  const lastDot = normalized.lastIndexOf(".");

  if (lastComma !== -1 && lastDot !== -1) {
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";

    normalized = normalized.split(thousandsSeparator).join("");

    if (decimalSeparator === ",") {
      normalized = normalized.replace(",", ".");
    }
  } else if (lastComma !== -1) {
    normalized = normalized.replace(",", ".");
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

export default function AcaiPedido() {
  const [cart, setCart] = useState<AcaiItem[]>([]);
  const [nomeCliente, setNomeCliente] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [recebimento, setRecebimento] = useState<Recebimento>("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [troco, setTroco] = useState("");

  const [endereco, setEndereco] = useState({
    rua: "",
    numero: "",
    bairro: "",
    referencia: "",
  });

  const totalCart = cart.reduce((sum, item) => sum + item.preco, 0);

  const scrollTo = (id: string, block: ScrollLogicalPosition = "start") => {
    const element = document.getElementById(id);

    if (!element) return;

    setTimeout(() => {
      element.scrollIntoView({
        behavior: "smooth",
        block,
      });
    }, 100);
  };

  const scrollToCheckout = () => {
    setShowModal(false);
    scrollTo("checkout-section");
  };

  const scrollToBuilder = () => {
    setShowModal(false);
    scrollTo("builder-section");
  };

  const showErrorToast = (
    title: string,
    description: string,
    sectionId?: string,
    fieldId?: string,
  ) => {
    toast({
      variant: "destructive",
      title,
      description,
    });

    if (sectionId) {
      const element = document.getElementById(sectionId);

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }
    }

    if (fieldId) {
      setTimeout(() => {
        const field = document.getElementById(fieldId);

        if (field instanceof HTMLElement) {
          field.focus();
        }
      }, 600);
    }
  };

  const handleAddToCart = (acai: {
    tamanho: string;
    tamanhoLabel: string;
    preco: number;
    creme: string;
    complementos: string[];
    observacao: string;
  }) => {
    const tamanho = tamanhos.find((item) => item.id === acai.tamanho);

    if (!tamanho) return;

    const promocaoDisponivel =
      isDomingo &&
      tamanho.precoPromocional !== null &&
      tamanho.precoPromocional !== undefined;

    const precoBase = promocaoDisponivel
      ? tamanho.precoPromocional!
      : tamanho.precoOriginal;

    const novoItem: AcaiItem = {
      id: `${Date.now()}-${Math.random()}`,
      ...acai,
      preco: precoBase + custoExtras(acai.complementos),
    };

    setCart((prev) => [...prev, novoItem]);
    setShowModal(true);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEnderecoChange = (field: string, value: string) => {
    setEndereco((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const enviarWhatsApp = () => {
    if (cart.length === 0) {
      showErrorToast(
        "Seu pedido está vazio",
        "Adicione pelo menos um açaí antes de finalizar.",
        "builder-section",
      );
      return;
    }

    if (!nomeCliente.trim()) {
      showErrorToast(
        "Informe seu nome",
        "Precisamos do seu nome para identificar o pedido.",
        "dados-cliente",
        "nome-cliente",
      );
      return;
    }

    if (!recebimento) {
      showErrorToast(
        "Escolha como deseja receber",
        "Selecione Entrega ou Retirada para continuar.",
        "recebimento-section",
      );
      return;
    }

    if (recebimento === "entrega" && !endereco.rua.trim()) {
      showErrorToast(
        "Informe sua rua",
        "Digite a rua ou avenida do endereço de entrega.",
        "endereco-section",
        "rua",
      );
      return;
    }

    if (recebimento === "entrega" && !endereco.numero.trim()) {
      showErrorToast(
        "Informe o número",
        "Digite o número do endereço de entrega.",
        "endereco-section",
        "numero",
      );
      return;
    }

    if (recebimento === "entrega" && !endereco.bairro.trim()) {
      showErrorToast(
        "Informe o bairro",
        "Digite o bairro do endereço de entrega.",
        "endereco-section",
        "bairro",
      );
      return;
    }

    if (!formaPagamento) {
      showErrorToast(
        "Escolha a forma de pagamento",
        "Selecione Pix ou Dinheiro para continuar.",
        "pagamento-section",
      );
      return;
    }

    if (formaPagamento === "dinheiro" && troco.trim() === "") {
      showErrorToast(
        "Informe sobre o troco",
        "Digite o valor que irá pagar ou marque “Não preciso de troco”.",
        "pagamento-section",
        "troco",
      );
      return;
    }

    if (formaPagamento === "dinheiro" && troco.trim() !== "0") {
      const valorPagamento = parseCurrency(troco);

      if (valorPagamento <= totalCart) {
        showErrorToast(
          "Valor para troco inválido",
          `O valor precisa ser maior que ${formatCurrency(
            totalCart,
          )}. Para pagar o valor exato, marque “Não preciso de troco”.`,
          "pagamento-section",
          "troco",
        );
        return;
      }
    }

    let mensagem = `*PEDIDO*\n\n`;

    mensagem += `*Cliente:* ${nomeCliente.trim()}\n\n`;

    cart.forEach((item, index) => {
      const extras = extrasDoPedido(item.complementos);

      mensagem += `*Açaí ${index + 1}*\n`;
      mensagem += `- *Tamanho:* ${item.tamanhoLabel} — ${formatCurrency(
        item.preco,
      )}\n`;
      mensagem += `- *Creme:* ${item.creme || "Açaí Tradicional"}\n`;
      mensagem += `- *Complementos:* ${
        item.complementos.length > 0 ? item.complementos.join(", ") : "Nenhum"
      }\n`;

      if (extras.length > 0) {
        mensagem += `  _Extras: ${extras
          .map((extra) => `${extra.nome} ${formatCurrency(extra.preco)}`)
          .join(", ")}_\n`;
      }

      if (item.observacao.trim()) {
        mensagem += `- *Observações:* ${item.observacao.trim()}\n`;
      }

      mensagem += `\n`;
    });

    mensagem += `*Forma de recebimento:* ${
      recebimento === "entrega" ? "Entrega" : "Retirada no local"
    }\n`;

    if (recebimento === "entrega") {
      mensagem += `\n*Endereço*\n`;
      mensagem += `- Rua: ${endereco.rua.trim()}\n`;
      mensagem += `- Número: ${endereco.numero.trim()}\n`;
      mensagem += `- Bairro: ${endereco.bairro.trim()}\n`;

      if (endereco.referencia.trim()) {
        mensagem += `- Referência: ${endereco.referencia.trim()}\n`;
      }
    }

    mensagem += `\n*Forma de Pagamento:* ${
      formaPagamento === "pix" ? "Pix" : "Dinheiro"
    }\n`;

    if (formaPagamento === "dinheiro") {
      if (troco.trim() === "0") {
        mensagem += `- Não precisa de troco\n`;
      } else {
        const valorPagamento = parseCurrency(troco);
        const valorTroco = valorPagamento - totalCart;

        mensagem += `- Troco para: ${formatCurrency(valorPagamento)}\n`;

        mensagem += `- Troco estimado: ${formatCurrency(valorTroco)}\n`;
      }
    }

    mensagem += `\n*Total:* ${formatCurrency(totalCart)}\n`;

    if (recebimento === "entrega") {
      mensagem += `\n*Atenção:* O valor total ainda não inclui o valor da *taxa de entrega*, beleza? 😉\n`;
    }

    window.location.href = `https://wa.me/5585982255592?text=${encodeURIComponent(
      mensagem,
    )}`;
  };

  return (
    <main
      className={`min-h-[100svh] ${
        cart.length > 0
          ? "pb-[calc(6.5rem+env(safe-area-inset-bottom))]"
          : "pb-12"
      }`}
    >
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#09000c]/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-card w-full max-w-sm p-7 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-green text-white">
              <CheckCircle2 className="h-7 w-7" strokeWidth={2.5} />
            </div>

            <h2 className="mt-5 text-xl font-extrabold text-white">
              Adicionado ao pedido
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-white/70">
              O que deseja fazer agora?
            </p>

            <div className="mt-6 grid gap-3">
              <Button
                type="button"
                onClick={scrollToCheckout}
                className="btn-gold h-12"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Finalizar pedido
              </Button>

              <Button
                type="button"
                onClick={scrollToBuilder}
                variant="ghost"
                className="h-12 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                <Plus className="mr-2 h-4 w-4" />
                Montar outro açaí
              </Button>
            </div>
          </div>
        </div>
      )}

      <header className="brand-hero">
        <div className="brand-hero-wave" aria-hidden="true">
          <svg viewBox="0 0 1440 48" preserveAspectRatio="none">
            <path
              fill="currentColor"
              d="M0 0h1440v18c-90 22-180 34-270 32-140-4-220-28-360-28S570 50 430 48C280 46 180 18 90 18 50 18 20 22 0 28V0Z"
            />
          </svg>
        </div>

        <div className="brand-hero-content">
          <div className="brand-hero-copy">
            <p className="brand-hero-eyebrow">Monte seu</p>
            <h1 className="brand-hero-title">Açaí</h1>
          </div>

          <img
            src="/logo-acai-fessao-branco.png"
            alt="Açaí do Fessão"
            className="brand-hero-logo"
            fetchPriority="high"
          />
        </div>
      </header>

      <div className="mx-auto w-full max-w-[860px] px-5 pt-4 sm:px-8 sm:pt-6">

        <section id="builder-section" className="scroll-mt-4">
          <AcaiBuilder
            tamanhos={tamanhos.map((tamanho) => ({
              ...tamanho,
              precoBase: tamanho.precoOriginal,
              preco:
                isDomingo && tamanho.precoPromocional !== null
                  ? tamanho.precoPromocional!
                  : tamanho.precoOriginal,
            }))}
            cremes={cremes}
            complementos={complementos}
            promocaoAtiva={isDomingo}
            onAddToCart={handleAddToCart}
          />
        </section>

        {cart.length > 0 && (
          <div className="mt-10 space-y-6">
            <AcaiCart items={cart} onRemove={handleRemoveFromCart} />

            <Button
              type="button"
              onClick={scrollToBuilder}
              variant="ghost"
              className="h-12 w-full rounded-full border border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar outro açaí
            </Button>

            <section id="checkout-section" className="scroll-mt-4 pt-8 sm:pt-10">
              <div className="mb-7">
                <h2 className="catalog-heading">Finalize seu pedido</h2>

                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Preencha seus dados para enviar o pedido pelo WhatsApp.
                </p>
              </div>

              <div className="checkout-grid">
                <div
                  id="dados-cliente"
                  className="premium-panel scroll-mt-4 p-5 sm:p-6"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div>
                      <h3 className="text-lg font-extrabold text-white">
                        Seus dados
                      </h3>

                      <p className="mt-1 text-sm text-white/65">
                        Para identificar seu pedido
                      </p>
                    </div>
                  </div>

                  <label
                    htmlFor="nome-cliente"
                    className="mb-1.5 block text-sm font-medium text-white/70"
                  >
                    Seu nome <span className="text-brand-green">*</span>
                  </label>

                  <Input
                    id="nome-cliente"
                    autoComplete="name"
                    placeholder="Digite seu nome"
                    value={nomeCliente}
                    onChange={(event) => setNomeCliente(event.target.value)}
                    className="glass-input"
                  />
                </div>

                <div id="recebimento-section" className="scroll-mt-4">
                  <DeliveryMethod
                    selected={recebimento}
                    onSelect={setRecebimento}
                  />
                </div>

                {recebimento === "entrega" && (
                  <div
                    id="endereco-section"
                    className="premium-panel scroll-mt-4 p-5 sm:p-6 lg:col-span-2"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div>
                        <h3 className="text-lg font-extrabold text-white">
                          Endereço de entrega
                        </h3>

                        <p className="mt-1 text-sm text-white/65">
                          Informe onde devemos entregar
                        </p>
                      </div>
                    </div>

                    <AddressForm
                      rua={endereco.rua}
                      numero={endereco.numero}
                      bairro={endereco.bairro}
                      referencia={endereco.referencia}
                      onChange={handleEnderecoChange}
                    />
                  </div>
                )}

                {recebimento === "retirada" && (
                  <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-5 lg:col-span-2">
                    <p className="text-base font-bold text-white">
                      Retirada no local
                    </p>

                    <p className="mt-2 text-sm leading-relaxed text-white/65">
                      Não precisa informar endereço. Depois do pedido, combinamos
                      a retirada pelo WhatsApp.
                    </p>
                  </div>
                )}

                <div
                  id="pagamento-section"
                  className="scroll-mt-4 lg:col-span-2"
                >
                  <PaymentForm
                    formaPagamento={formaPagamento}
                    troco={troco}
                    totalPedido={totalCart}
                    onPaymentChange={(method) => {
                      setFormaPagamento(method);
                      setTroco("");
                    }}
                    onTrocoChange={setTroco}
                  />
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="order-bar">
          <div className="mx-auto flex w-full max-w-[860px] items-center gap-4 px-5 sm:px-8">
            <div className="min-w-[110px]">
              <span className="block text-sm text-white/60">Total</span>

              <span className="block whitespace-nowrap text-xl font-extrabold text-brand-green sm:text-2xl">
                {formatCurrency(totalCart)}
              </span>
            </div>

            <Button
              type="button"
              onClick={enviarWhatsApp}
              className="btn-gold h-14 flex-1 text-sm sm:text-base"
            >
              Enviar pedido
              <MessageCircle className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
