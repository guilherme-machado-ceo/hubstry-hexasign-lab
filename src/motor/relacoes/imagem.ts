import { compararPontosDeCodigo, chaveReferencia } from "../canonico";
import type { CorrespondenciaVocabulario, IndicesDominio } from "../correspondencia";
import type { Dominio, Mapeamento, Referencia, Relacao } from "../esquema";
import { mapaEntidades } from "./contexto";

export interface ResultadoImagensRelacoes {
  porRelacaoFonte: ReadonlyMap<string, Relacao>;
}

function chaveArgs(args: readonly Referencia[], simetrico: boolean): string {
  const chaves = args.map(chaveReferencia);
  if (simetrico) chaves.sort(compararPontosDeCodigo);
  return JSON.stringify(chaves);
}

export function resolverImagensRelacoesCom(
  fonte: Dominio,
  alvo: Dominio,
  mapeamento: Mapeamento,
  correspondencia: CorrespondenciaVocabulario,
  indicesFonte: IndicesDominio,
  indicesAlvo: IndicesDominio,
): ResultadoImagensRelacoes {
  const entidades = mapaEntidades(fonte, alvo, mapeamento);
  const imagens = new Map<string, Relacao>();

  for (const relacaoFonte of indicesFonte.ordemTopologica) {
    const nomeAlvo = correspondencia.fonteParaAlvo.get(relacaoFonte.predicado);
    if (!nomeAlvo) continue;
    const predicadoAlvo = indicesAlvo.predicadosPorNome.get(nomeAlvo);
    if (!predicadoAlvo) continue;

    const argsProjetados: Referencia[] = [];
    let completa = true;
    for (const arg of relacaoFonte.args) {
      if (arg.tipo === "entidade") {
        const idAlvo = entidades.get(arg.id);
        if (!idAlvo) {
          completa = false;
          break;
        }
        argsProjetados.push({ tipo: "entidade", id: idAlvo });
      } else {
        const imagem = imagens.get(arg.id);
        if (!imagem) {
          completa = false;
          break;
        }
        argsProjetados.push({ tipo: "relacao", id: imagem.id });
      }
    }
    if (!completa) continue;

    const chaveProjetada = chaveArgs(argsProjetados, predicadoAlvo.simetrico);
    const imagem = (indicesAlvo.relacoesPorPredicado.get(nomeAlvo) ?? []).find(
      (candidata) => chaveArgs(candidata.args, predicadoAlvo.simetrico) === chaveProjetada,
    );
    if (imagem) imagens.set(relacaoFonte.id, imagem);
  }

  return { porRelacaoFonte: imagens };
}

export function inverterCorrespondencia(
  correspondencia: CorrespondenciaVocabulario,
): CorrespondenciaVocabulario {
  return {
    fonteParaAlvo: new Map(correspondencia.alvoParaFonte),
    alvoParaFonte: new Map(correspondencia.fonteParaAlvo),
  };
}
