import { compararPontosDeCodigo, quantizar12 } from "../canonico";
import type { Dominio, Entidade, Mapeamento } from "../esquema";
import type { ContextoAvaliacao } from "./contexto";
import { mapaEntidades } from "./contexto";

export const VERSAO_DEFINICAO_RHO5 = "rho5-v1";

function chavePar(a: string, b: string): string {
  const [primeiro, segundo] = [a, b].sort(compararPontosDeCodigo);
  return `${primeiro}\u0000${segundo}`;
}

function paresOposicao(dominio: Dominio): Set<string> {
  const predicados = new Map(dominio.predicados.map((predicado) => [predicado.nome, predicado]));
  const pares = new Set<string>();
  dominio.relacoes.forEach((relacao) => {
    if (predicados.get(relacao.predicado)?.classe !== "oposicao") return;
    if (relacao.args.length !== 2 || relacao.args.some((arg) => arg.tipo !== "entidade")) return;
    pares.add(chavePar(relacao.args[0].id, relacao.args[1].id));
  });
  return pares;
}

function nomePotencial(dominio: Dominio): string | undefined {
  return Object.entries(dominio.esquemaAtributos).find(
    ([, definicao]) => definicao.tipo === "numerico" && definicao.potencial === true,
  )?.[0];
}

function equilibrioNumerico(
  a: Entidade,
  b: Entidade,
  potencial: string | undefined,
  epsilon: number,
): boolean {
  if (!potencial) return false;
  const x = a.atributos[potencial];
  const y = b.atributos[potencial];
  if (typeof x !== "number" || typeof y !== "number") return false;
  const escala = Math.max(Math.abs(x), Math.abs(y));
  if (escala === 0) return true;
  return Math.abs(x / escala + y / escala) <= epsilon;
}

function paresEquilibrados(dominio: Dominio, epsilon: number): Set<string> {
  const entidades = [...dominio.entidades].sort((a, b) => compararPontosDeCodigo(a.id, b.id));
  const oposicoes = paresOposicao(dominio);
  const potencial = nomePotencial(dominio);
  const resultado = new Set<string>();
  for (let i = 0; i < entidades.length; i += 1) {
    for (let j = i + 1; j < entidades.length; j += 1) {
      const chave = chavePar(entidades[i].id, entidades[j].id);
      if (
        oposicoes.has(chave) ||
        equilibrioNumerico(entidades[i], entidades[j], potencial, epsilon)
      ) {
        resultado.add(chave);
      }
    }
  }
  return resultado;
}

export function avaliarRho5(
  fonte: Dominio,
  alvo: Dominio,
  mapeamento: Mapeamento,
  contexto: ContextoAvaliacao,
): number | null {
  const epsilon = contexto.config.tolerancias.rho5Equilibrio;
  const fonteEquilibrada = paresEquilibrados(fonte, epsilon);
  if (fonteEquilibrada.size === 0) return null;
  const alvoEquilibrado = paresEquilibrados(alvo, epsilon);
  const mapa = mapaEntidades(fonte, alvo, mapeamento);
  let preservados = 0;
  for (const chave of fonteEquilibrada) {
    const [a, b] = chave.split("\u0000");
    const alvoA = mapa.get(a);
    const alvoB = mapa.get(b);
    if (alvoA && alvoB && alvoEquilibrado.has(chavePar(alvoA, alvoB))) preservados += 1;
  }
  return quantizar12(preservados / fonteEquilibrada.size);
}
