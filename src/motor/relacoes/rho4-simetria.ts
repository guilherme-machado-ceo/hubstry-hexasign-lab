import { arredondar12, compararPontosDeCodigo, quantizar12 } from "../canonico";
import type { Dominio, Mapeamento } from "../esquema";
import type { ContextoAvaliacao } from "./contexto";
import { mapaEntidades } from "./contexto";

export const VERSAO_DEFINICAO_RHO4 = "rho4-v1";

function mediana(valores: number[]): number {
  const ordenados = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(ordenados.length / 2);
  return ordenados.length % 2 === 1
    ? ordenados[meio]
    : (ordenados[meio - 1] + ordenados[meio]) / 2;
}

function escoreEscala(
  pares: Array<readonly [number, number]>,
  tolerancia: number,
): number | null {
  const logs: number[] = [];
  for (const [x, y] of pares) {
    const razao = y / x;
    if (!Number.isFinite(razao) || razao <= 0) return null;
    logs.push(Math.log(razao));
  }
  const logA = mediana(logs);
  const dentro = logs.filter(
    (logR) => arredondar12(Math.abs(logR - logA)) <= tolerancia,
  ).length;
  return dentro / logs.length;
}

function compararNumero(a: number, b: number): -1 | 0 | 1 {
  return a < b ? -1 : a > b ? 1 : 0;
}

function escoreMonotono(pares: Array<readonly [number, number]>): number | null {
  let concordantes = 0;
  let discordantes = 0;
  let empatesX = 0;
  let empatesY = 0;
  for (let i = 0; i < pares.length; i += 1) {
    for (let j = i + 1; j < pares.length; j += 1) {
      const sx = compararNumero(pares[i][0], pares[j][0]);
      const sy = compararNumero(pares[i][1], pares[j][1]);
      if (sx === 0 && sy === 0) continue;
      if (sx === 0) empatesX += 1;
      else if (sy === 0) empatesY += 1;
      else if (sx === sy) concordantes += 1;
      else discordantes += 1;
    }
  }
  const denominador = Math.sqrt(
    (concordantes + discordantes + empatesX) *
      (concordantes + discordantes + empatesY),
  );
  if (denominador === 0) return null;
  const tauB = (concordantes - discordantes) / denominador;
  return (tauB + 1) / 2;
}

export function avaliarRho4(
  fonte: Dominio,
  alvo: Dominio,
  mapeamento: Mapeamento,
  contexto: ContextoAvaliacao,
): number | null {
  const mapa = mapaEntidades(fonte, alvo, mapeamento);
  const entidadesAlvo = contexto.indicesAlvo.entidadesPorId;
  const escores: number[] = [];

  for (const nome of Object.keys(fonte.esquemaAtributos).sort(compararPontosDeCodigo)) {
    const definicaoFonte = fonte.esquemaAtributos[nome];
    const definicaoAlvo = alvo.esquemaAtributos[nome];
    if (
      definicaoFonte.tipo !== "numerico" ||
      definicaoAlvo?.tipo !== "numerico" ||
      !definicaoFonte.grupo ||
      definicaoFonte.grupo !== definicaoAlvo.grupo ||
      definicaoFonte.unidade !== definicaoAlvo.unidade
    ) {
      continue;
    }
    const pares: Array<readonly [number, number]> = [];
    for (const entidadeFonte of [...fonte.entidades].sort((a, b) =>
      compararPontosDeCodigo(a.id, b.id),
    )) {
      const idAlvo = mapa.get(entidadeFonte.id);
      if (!idAlvo) continue;
      const valorFonte = entidadeFonte.atributos[nome];
      const valorAlvo = entidadesAlvo.get(idAlvo)?.atributos[nome];
      if (typeof valorFonte === "number" && typeof valorAlvo === "number") {
        pares.push([valorFonte, valorAlvo]);
      }
    }
    if (pares.length < 3) continue;
    const escore =
      definicaoFonte.grupo === "escala"
        ? escoreEscala(pares, contexto.config.tolerancias.rho4LogEscala)
        : escoreMonotono(pares);
    if (escore !== null) escores.push(escore);
  }

  if (escores.length === 0) return null;
  return quantizar12(escores.reduce((total, valor) => total + valor, 0) / escores.length);
}
