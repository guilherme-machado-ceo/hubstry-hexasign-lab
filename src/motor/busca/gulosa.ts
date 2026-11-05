import { compararPontosDeCodigo } from "../canonico";
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
    chaveCanonica: JSON.stringify({ pares, paresRelacoes }),
  };
}

function candidatoNucleo(
  nucleo: Nucleo,
  fonte: Dominio,
  alvo: Dominio,
  contexto: ContextoAvaliacao,
): CandidatoBusca {
  return avaliarCandidato(fonte, alvo, nucleo.mapeamento, contexto);
}

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
  const ordenados = [...nucleos].sort((a, b) => {
    const comparacao = compararCandidatos(
      candidatoNucleo(a, fonte, alvo, contexto),
      candidatoNucleo(b, fonte, alvo, contexto),
      modalidade,
    );
    return comparacao || compararPontosDeCodigo(a.chaveCanonica, b.chaveCanonica);
  });

  const resultados = new Map<string, CandidatoBusca>();
  for (const semente of ordenados.slice(0, 3)) {
    let combinado = semente;
    for (const nucleo of ordenados) {
      if (nucleo === semente) continue;
      const fusao = fundirNucleos(combinado, nucleo);
      if (fusao) combinado = fusao;
    }
    const candidato = avaliarCandidato(fonte, alvo, combinado.mapeamento, contexto);
    resultados.set(candidato.chaveCanonica, candidato);
  }

  return [...resultados.values()]
    .sort((a, b) => compararCandidatos(a, b, modalidade))
    .slice(0, 3);
}

export function mapeamentoDePares(pares: ReadonlyArray<readonly [string, string]>): Mapeamento {
  return { pares: [...pares] };
}
