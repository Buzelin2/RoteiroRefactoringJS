const { readFileSync } = require('fs');

function gerarFaturaStr(fatura, pecas) {
  // função query
  function getPeca(apre) {
    return pecas[apre.id];
  }

  // cálculo de valor de apresentação
  function calcularTotalApresentacao(apre) {
    let total = 0;
    switch (getPeca(apre).tipo) {
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
        throw new Error(`Peça desconhecida: ${getPeca(apre).tipo}`);
    }
    return total;
  }

  // **novo**: extrai cálculo de créditos
  function calcularCredito(apre) {
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (getPeca(apre).tipo === "comedia") {
      creditos += Math.floor(apre.audiencia / 5);
    }
    return creditos;
  }

  // **novo**: extrai formatação de moeda
  function formatarMoeda(valorCentavos) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2
    }).format(valorCentavos / 100);
  }

  let totalFatura = 0;
  let creditos    = 0;
  let faturaStr   = `Fatura ${fatura.cliente}\n`;

  for (let apre of fatura.apresentacoes) {
    const total = calcularTotalApresentacao(apre);
    creditos    += calcularCredito(apre);

    faturaStr += `  ${getPeca(apre).nome}: ${formatarMoeda(total)} (${apre.audiencia} assentos)\n`;
    totalFatura += total;
  }

  faturaStr += `Valor total: ${formatarMoeda(totalFatura)}\n`;
  faturaStr += `Créditos acumulados: ${creditos} \n`;
  return faturaStr;
}

// main
const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas   = JSON.parse(readFileSync('./pecas.json'));
console.log(gerarFaturaStr(faturas, pecas));
