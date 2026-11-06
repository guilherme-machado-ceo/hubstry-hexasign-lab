import { compararPontosDeCodigo, jsonCanonico } from "../canonico";
import type { Dominio, Mapeamento, Modalidade } from "../esquema";
import type { ContextoAvaliacao } from "../relacoes";
import { avaliarCandidato, compararCandidatos } from "./ranking";
import type { CandidatoBusca, Nucleo } from "./tipos";

function fundirNucleos(base: Nucleo, adicional: Nucleo): Nucleo | null {
  const entidadesFonte = new Map(base.mapeamento.pares);
  const entidadesAlvo = new Map(base.mapeamento.pares.map(([fonte, alvo]) => [alvo, fonte]));
  const relacoesFonte = new Map(base.paresRelacoes);
  const relacoesAlvo = new Map(base.paresRelacoes.map(([fonte, alvo]) => [alvo, fonte]));

  for (const [fonte, alvo] of adicional.mapeamento.pares) {
    if (
      (entidadesFonte.has(fonte) && entidadesFonte.get(fonte) !== alvo) ||
      (entidadesAlvo.has(alvo) && entidadesAlvo.get(alvo) !== fonte)
    ) {
      return null;
    }
    entidadesFonte.set(fonte, alvo);
    entidadesAlvo.set(alvo, fonte);
  }
  for (const [fonte, alvo] of adicional.paresRelacoes) {
    if (
      (relacoesFonte.has(fonte) && relacoesFonte.get(fonte) !== alvo) ||
      (relacoesAlvo.has(alvo) && relacoesAlvo.get(alvo) !== fonte)
    ) {
      return null;
    }
    relacoesFonte.set(fonte, alvo);
    relacoesAlvo.set(alvo, fonte);
  }

  const pares = [...entidadesFonte.entries()].sort(
    (a, b) => compararPontosDeCodigo(a[0], b[0]) || compararPontosDeCodigo(a[1], b[1]),
  );
  const paresRelacoes = [...relacoesFonte.entries()].sort(
    (a, b) => compararPontosDeCodigo(a[0], b[0]) || compararPontosDeCodigo(a[1], b[1]),
  );
  return {
    mapeamento: { pares },
    paresRelacoes,
    chaveCanonica: jsonCanonico({ pares, paresRelacoes }),
  };
}

/**
 * Teto de sementes da fusão gulosa (ADR-016). As três melhores sementes
 * entram sempre; empates com a terceira também entram, até este teto, para
 * que a escolha não dependa da ordem lexicográfica das chaves.
 */
export const MAXIMO_SEMENTES_GULOSA = 256;

/** Comparação sem o desempate final pela chave canônica. */
function empatados(a: CandidatoBusca, b: CandidatoBusca, modalidade: Modalidade): boolean {
  const semChave = (c: CandidatoBusca): CandidatoBusca => ({ ...c, chaveCanonica: "" });
  return compararCandidatos(semChave(a), semChave(b), modalidade) === 0;
}

/**
 * Devolve todos os candidatos distintos produzidos pela fusão, ordenados.
 * O corte em três acontece só depois do filtro da modalidade, em
 * selecionarPorModalidade.
 */
export function buscaGulosa(
  fonte: Dominio,
  alvo: Dominio,
  modalidade: Modalidade,
  nucleos: readonly Nucleo[],
  contexto: ContextoAvaliacao,
): CandidatoBusca[] {
  if (nucleos.length === 0) {
    return [avaliarCandidato(fonte, alvo, { pares: [] }, contexto)];
  }
  const avaliados = nucleos.map((nucleo) => ({
    nucleo,
    candidato: avaliarCandidato(fonte, alvo, nucleo.mapeamento, contexto),
  }));
  avaliados.sort(
    (a, b) =>
      compararCandidatos(a.candidato, b.candidato, modalidade) ||
      compararPontosDeCodigo(a.nucleo.chaveCanonica, b.nucleo.chaveCanonica),
  );
  const ordenados = avaliados.map((item) => item.nucleo);

  const corte = avaliados[Math.min(2, avaliados.length - 1)].candidato;
  let quantidadeSementes = Math.min(3, avaliados.length);
  while (
    quantidadeSementes < avaliados.length &&
    quantidadeSementes < MAXIMO_SEMENTES_GULOSA &&
    empatados(avaliados[quantidadeSementes].candidato, corte, modalidade)
  ) {
    quantidadeSementes += 1;
  }

  const resultados = new Map<string, CandidatoBusca>();
  for (const semente of ordenados.slice(0, quantidadeSementes)) {
    let combinado = semente;
    for (const nucleo of ordenados) {
      if (nucleo === semente) continue;
      const fusao = fundirNucleos(combinado, nucleo);
      if (fusao) combinado = fusao;
    }
    const candidato = avaliarCandidato(fonte, alvo, combinado.mapeamento, contexto);
    resultados.set(candidato.chaveCanonica, candidato);
  }

  return [...resultados.values()].sort((a, b) => compararCandidatos(a, b, modalidade));
}

export function mapeamentoDePares(pares: ReadonlyArray<readonly [string, string]>): Mapeamento {
  return { pares: [...pares] };
}
