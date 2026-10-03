export const INCLUSOS = 3;

export const PRECO_EXTRA: Record<string, number> = {
  Banana: 1,
  Granola: 1,
  Amendoim: 1,
  Paçoquita: 1,
  "Farinha Láctea": 1,
  "Chocoball (P)": 1,
  "Leite em pó": 1.5,
  "Gotas de Chocolate": 1.5,
  "Chocoball (G)": 1.5,
  "Cookies Cream": 1.5,
  Cereja: 1.5,
  Morango: 1.5,
  Kiwi: 1.5,
  "M&Ms": 2,
  Castanha: 2,
  Nutella: 2,
};

export function formatCurrency(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export function precoExtraDe(nome: string) {
  return PRECO_EXTRA[nome] ?? 1;
}

export function extrasDoPedido(complementos: string[]) {
  return complementos.slice(INCLUSOS).map((nome) => ({
    nome,
    preco: precoExtraDe(nome),
  }));
}

export function custoExtras(complementos: string[]) {
  return extrasDoPedido(complementos).reduce((sum, extra) => sum + extra.preco, 0);
}
