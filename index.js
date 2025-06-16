const { readFileSync } = require('fs');

// formata centavos em "R$ x.xxx,xx"
function formatarMoeda(valorCentavos) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  }).format(valorCentavos / 100);
}

// retorna o objeto peça dado o id da apresentação
function getPeca(pecas, apre) {
  return pecas[apre.id];
}

// calcula o total de uma apresentação
function calcularTotalApresentacao(pecas, apre) {
  const peca = getPeca(pecas, apre);
  let total = 0;
  switch (peca.tipo) {
    case "tragedia":
      total = 40000;
      if (apre.audiencia > 30) {
        total += 1000 * (apre.audiencia - 30);
      }
      break;
    case "comedia":
      total = 30000;
      if (apre.audiencia > 20) {
        total += 10000 + 500 * (apre.audiencia - 20);
      }
      total += 300 * apre.audiencia;
      break;
    default:
      throw new Error(`Peça desconhecida: ${peca.tipo}`);
  }
  return total;
}

// calcula os créditos de uma apresentação
function calcularCredito(pecas, apre) {
  let creditos = 0;
  creditos += Math.max(apre.audiencia - 30, 0);
  if (getPeca(pecas, apre).tipo === "comedia") {
    creditos += Math.floor(apre.audiencia / 5);
  }
  return creditos;
}

// soma todos os totais da fatura
function calcularTotalFatura(pecas, apresentacoes) {
  return apresentacoes
    .map(apre => calcularTotalApresentacao(pecas, apre))
    .reduce((acc, cur) => acc + cur, 0);
}

// soma todos os créditos da fatura
function calcularTotalCreditos(pecas, apresentacoes) {
  return apresentacoes
    .map(apre => calcularCredito(pecas, apre))
    .reduce((acc, cur) => acc + cur, 0);
}

// função “apenas apresentação”
function gerarFaturaStr(fatura, pecas) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;

  for (let apre of fatura.apresentacoes) {
    const peca  = getPeca(pecas, apre);
    const total = calcularTotalApresentacao(pecas, apre);
    faturaStr += `  ${peca.nome}: ${formatarMoeda(total)} (${apre.audiencia} assentos)\n`;
  }

  faturaStr += `Valor total: ${formatarMoeda(
    calcularTotalFatura(pecas, fatura.apresentacoes)
  )}\n`;
  faturaStr += `Créditos acumulados: ${calcularTotalCreditos(
    pecas,
    fatura.apresentacoes
  )} \n`;

  return faturaStr;
}

// main
const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas   = JSON.parse(readFileSync('./pecas.json'));
console.log(gerarFaturaStr(faturas, pecas));
