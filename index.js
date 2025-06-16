const { readFileSync } = require('fs');

// formata centavos em "R$ x.xxx,xx"
function formatarMoeda(valorCentavos) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  }).format(valorCentavos / 100);
}

// classe de serviço com todos os cálculos
class ServicoCalculoFatura {
  calcularTotalApresentacao(pecas, apre) {
    const peca = pecas[apre.id];
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

  calcularCredito(pecas, apre) {
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (pecas[apre.id].tipo === "comedia") {
      creditos += Math.floor(apre.audiencia / 5);
    }
    return creditos;
  }

  calcularTotalFatura(pecas, apresentacoes) {
    return apresentacoes
      .map(a => this.calcularTotalApresentacao(pecas, a))
      .reduce((acc, cur) => acc + cur, 0);
  }

  calcularTotalCreditos(pecas, apresentacoes) {
    return apresentacoes
      .map(a => this.calcularCredito(pecas, a))
      .reduce((acc, cur) => acc + cur, 0);
  }
}

// função “apenas apresentação” agora recebe o serviço de cálculo
function gerarFaturaStr(fatura, pecas, calc) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;

  for (let apre of fatura.apresentacoes) {
    const peca  = pecas[apre.id];
    const total = calc.calcularTotalApresentacao(pecas, apre);
    faturaStr += `  ${peca.nome}: ${formatarMoeda(total)} (${apre.audiencia} assentos)\n`;
  }

  faturaStr += `Valor total: ${formatarMoeda(
    calc.calcularTotalFatura(pecas, fatura.apresentacoes)
  )}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(
    pecas,
    fatura.apresentacoes
  )} \n`;

  return faturaStr;
}

// geração em HTML comentada 
// function gerarFaturaHTML

// main
const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas    = JSON.parse(readFileSync('./pecas.json'));
const calc     = new ServicoCalculoFatura();

console.log(gerarFaturaStr(faturas, pecas, calc));
// console.log(gerarFaturaHTML(faturas, pecas));
