const { readFileSync }     = require('fs');
const Repositorio           = require('./repositorio.js');
const ServicoCalculoFatura  = require('./servico.js');
const gerarFaturaStr        = require('./apresentacao.js');
const faturas = JSON.parse(readFileSync('./faturas.json'));
const calc    = new ServicoCalculoFatura(new Repositorio());

// exibe apenas string, conforme combinado
console.log(gerarFaturaStr(faturas, calc));
