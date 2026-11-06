import { compararPontosDeCodigo } from "../canonico";
import type { Dominio, Mapeamento, Modalidade } from "../esquema";
import { avaliarRho1, avaliarRho3, type ContextoAvaliacao } from "../relacoes";
import { verificarOrcamento } from "./orcamento";
import type { HipoteseLocal } from "./tipos";

function chaveRelacao(fonte: string, alvo: string): string {
  return JSON.stringify(["r", fonte, alvo]);
}

function chaveEntidade(fonte: string, alvo: string): string {
  return JSON.stringify(["e", fonte, alvo]);
}

export function listarHipotesesLocais(
  fonte: Dominio,
  alvo: Dominio,
  modalidade: Modalidade,
  contexto: ContextoAvaliacao,
): HipoteseLocal[] {
  const hipoteses: HipoteseLocal[] = [];
  const limite = contexto.config.limites.hipotesesLocais;
  const adicionar = (hipotese: HipoteseLocal) => {
    verificarOrcamento("hipotesesLocais", hipoteses.length + 1, limite);
    hipoteses.push(hipotese);
  };

  for (const relacaoFonte of [...fonte.relacoes].sort((a, b) =>
    compararPontosDeCodigo(a.id, b.id),
  )) {
    const nomeAlvo = contexto.correspondencia.fonteParaAlvo.get(relacaoFonte.predicado);
    if (!nomeAlvo) continue;
    for (const relacaoAlvo of contexto.indicesAlvo.relacoesPorPredicado.get(nomeAlvo) ?? []) {
      adicionar({
        tipo: "relacao",
        fonte: relacaoFonte,
        alvo: relacaoAlvo,
        chave: chaveRelacao(relacaoFonte.id, relacaoAlvo.id),
      });
    }
  }

  if (modalidade === "heuristica" || modalidade === "funcional") {
    for (const entidadeFonte of [...fonte.entidades].sort((a, b) =>
      compararPontosDeCodigo(a.id, b.id),
    )) {
      for (const entidadeAlvo of [...alvo.entidades].sort((a, b) =>
        compararPontosDeCodigo(a.id, b.id),
      )) {
        const mapeamento: Mapeamento = { pares: [[entidadeFonte.id, entidadeAlvo.id]] };
        const escore =
          modalidade === "heuristica"
            ? avaliarRho1(fonte, alvo, mapeamento, contexto)
            : avaliarRho3(fonte, alvo, mapeamento, contexto);
        if ((escore ?? 0) > 0) {
          adicionar({
            tipo: "entidade",
            fonte: entidadeFonte.id,
            alvo: entidadeAlvo.id,
            chave: chaveEntidade(entidadeFonte.id, entidadeAlvo.id),
          });
        }
      }
    }
  }

  // Ordem por tupla (tipo, fonte, alvo), independente da serialização da chave.
  const tupla = (h: HipoteseLocal): string[] => JSON.parse(h.chave) as string[];
  return hipoteses.sort((a, b) => {
    const [x, y] = [tupla(a), tupla(b)];
    for (let i = 0; i < 3; i += 1) {
      const c = compararPontosDeCodigo(x[i], y[i]);
      if (c !== 0) return c;
    }
    return 0;
  });
}
