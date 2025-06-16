// formata centavos em "R$ x.xxx,xx"
function formatarMoeda(valorCentavos) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  }).format(valorCentavos / 100);
}

module.exports = { formatarMoeda };
