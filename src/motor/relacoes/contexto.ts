import {
  criarCorrespondenciaVocabulario,
  criarIndicesDominio,
  type CorrespondenciaVocabulario,
  type IndicesDominio,
} from "../correspondencia";
import type {
  ConfiguracaoMotor,
  Dominio,
  Mapeamento,
  TabelaCorrespondencia,
} from "../esquema";

export interface ContextoAvaliacao {
  config: ConfiguracaoMotor;
  correspondencia: CorrespondenciaVocabulario;
  indicesFonte: IndicesDominio;
  indicesAlvo: IndicesDominio;
}

export function criarContextoAvaliacao(
  fonte: Dominio,
  alvo: Dominio,
  config: ConfiguracaoMotor,
  tabela: TabelaCorrespondencia = [],
): ContextoAvaliacao {
  return {
    config,
    correspondencia: criarCorrespondenciaVocabulario(fonte, alvo, tabela),
    indicesFonte: criarIndicesDominio(fonte),
    indicesAlvo: criarIndicesDominio(alvo),
  };
}

export function mapaEntidades(
  fonte: Dominio,
  alvo: Dominio,
  mapeamento: Mapeamento,
): ReadonlyMap<string, string> {
  const idsFonte = new Set(fonte.entidades.map((entidade) => entidade.id));
  const idsAlvo = new Set(alvo.entidades.map((entidade) => entidade.id));
  const fontes = new Set<string>();
  const alvos = new Set<string>();
  const resultado = new Map<string, string>();
  for (const [idFonte, idAlvo] of mapeamento.pares) {
    if (!idsFonte.has(idFonte) || !idsAlvo.has(idAlvo)) {
      throw new TypeError(`mapeamento referencia entidade inexistente: ${idFonte} -> ${idAlvo}`);
    }
    if (fontes.has(idFonte) || alvos.has(idAlvo)) {
      throw new TypeError("mapeamento deve ser função parcial injetiva");
    }
    fontes.add(idFonte);
    alvos.add(idAlvo);
    resultado.set(idFonte, idAlvo);
  }
  return resultado;
}
