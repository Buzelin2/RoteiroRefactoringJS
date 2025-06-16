const { readFileSync } = require('fs');

// Repositório de dados das peças
class Repositorio {
  constructor() {
    this.pecas = JSON.parse(readFileSync('./pecas.json'));
  }

  getPeca(apre) {
    return this.pecas[apre.id];
  }
}

// formata centavos em "R$ x.xxx,xx"
function formatarMoeda(valorCentavos) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  }).format(valorCentavos / 100);
}

// serviço de cálculo, agora usando o repositório
class ServicoCalculoFatura {
  constructor(repo) {
    this.repo = repo;
  }

  calcularTotalApresentacao(apre) {
    const peca = this.repo.getPeca(apre);
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

  calcularCredito(apre) {
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (this.repo.getPeca(apre).tipo === "comedia") {
      creditos += Math.floor(apre.audiencia / 5);
    }
    return creditos;
  }

  calcularTotalFatura(apresentacoes) {
    return apresentacoes
      .map(a => this.calcularTotalApresentacao(a))
      .reduce((acc, cur) => acc + cur, 0);
  }

  calcularTotalCreditos(apresentacoes) {
    return apresentacoes
      .map(a => this.calcularCredito(a))
      .reduce((acc, cur) => acc + cur, 0);
  }
}

// apresentação em texto
function gerarFaturaStr(fatura, calc) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;

  for (let apre of fatura.apresentacoes) {
    const peca  = calc.repo.getPeca(apre);
    const total = calc.calcularTotalApresentacao(apre);
    faturaStr += `  ${peca.nome}: ${formatarMoeda(total)} (${apre.audiencia} assentos)\n`;
  }

  faturaStr += `Valor total: ${formatarMoeda(
    calc.calcularTotalFatura(fatura.apresentacoes)
  )}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(
    fatura.apresentacoes
  )} \n`;

  return faturaStr;
}

// main
const faturas = JSON.parse(readFileSync('./faturas.json'));
const calc    = new ServicoCalculoFatura(new Repositorio());

console.log(gerarFaturaStr(faturas, calc));
