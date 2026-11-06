import type { ConfiguracaoMotor, Dominio, LimitesMotor } from "../esquema";

export const LIMITES_TESTE: LimitesMotor = {
  entidadesPorDominio: 200,
  relacoesPorDominio: 1000,
  predicadosPorDominio: 200,
  atributosPorEntidade: 100,
  aridade: 16,
  profundidadeRelacional: 100,
  dominiosBiblioteca: 100,
  hipotesesLocais: 250000,
  nucleos: 50000,
  entidadesBuscaExata: 8,
  mapeamentosParciaisBuscaExata: 1441729,
};

export const CONFIG_TESTE: ConfiguracaoMotor = {
  versao: "1.0.0",
  semanticaRho6: "emergencia-v1",
  agregacaoTeorica: false,
  heuristica: { exige: { rho1: 0.5 }, ordem: ["rho1", "rho2", "chaveCanonica"] },
  funcional: { exige: { rho3: 0.5 }, ordem: ["rho3", "rho2", "chaveCanonica"] },
  homologica: {
    exige: { rho2: 0.6 },
    ordem: ["sistematicidade", "rho1", "chaveCanonica"],
  },
  gentner: { rho1Alto: 0.6, rho2Alto: 0.6 },
  correspondencias: { pesosPermitidos: [1] },
  limiaresBinarios: null,
  tolerancias: { rho4LogEscala: 0.05, rho5Equilibrio: 0.05 },
  limites: LIMITES_TESTE,
};

export function criarDominioValido(): Dominio {
  return {
    id: "domínio",
    esquemaAtributos: {
      categoria: { tipo: "categorico" },
      valor: { tipo: "numerico", unidade: "u", grupo: "escala" },
      potencial: { tipo: "numerico", unidade: "u", potencial: true },
    },
    entidades: [
      {
        id: "a",
        atributos: { categoria: "A", valor: 1, potencial: -1 },
        capacidades: ["entrada"],
      },
      {
        id: "b",
        atributos: { categoria: "B", valor: 2, potencial: 1 },
        capacidades: ["saida"],
      },
    ],
    predicados: [
      { nome: "liga", aridade: 2, classe: "comum", simetrico: false },
      { nome: "opoe", aridade: 2, classe: "oposicao", simetrico: true },
      {
        nome: "combina",
        aridade: 2,
        classe: "emergencia",
        simetrico: true,
        capacidadesExigidas: ["entrada", "saida"],
      },
      { nome: "causa", aridade: 2, classe: "comum", simetrico: false },
    ],
    relacoes: [
      {
        id: "r1",
        predicado: "liga",
        args: [
          { tipo: "entidade", id: "a" },
          { tipo: "entidade", id: "b" },
        ],
      },
      {
        id: "r2",
        predicado: "opoe",
        args: [
          { tipo: "entidade", id: "a" },
          { tipo: "entidade", id: "b" },
        ],
      },
      {
        id: "r3",
        predicado: "combina",
        args: [
          { tipo: "entidade", id: "a" },
          { tipo: "entidade", id: "b" },
        ],
      },
      {
        id: "r4",
        predicado: "causa",
        args: [
          { tipo: "relacao", id: "r1" },
          { tipo: "relacao", id: "r2" },
        ],
      },
    ],
  };
}
