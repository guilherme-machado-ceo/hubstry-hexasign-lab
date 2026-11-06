import type { AvaliacaoPerfil } from "../relacoes";
import type { Mapeamento, Modalidade, Relacao } from "../esquema";

export interface HipoteseRelacao {
  tipo: "relacao";
  fonte: Relacao;
  alvo: Relacao;
  chave: string;
}

export interface HipoteseEntidade {
  tipo: "entidade";
  fonte: string;
  alvo: string;
  chave: string;
}

export type HipoteseLocal = HipoteseRelacao | HipoteseEntidade;

export interface Nucleo {
  mapeamento: Mapeamento;
  paresRelacoes: ReadonlyArray<readonly [fonte: string, alvo: string]>;
  chaveCanonica: string;
}

export interface CandidatoBusca extends AvaliacaoPerfil {
  mapeamento: Mapeamento;
  sistematicidade: number | null;
  chaveCanonica: string;
}

export interface EstatisticasBuscaExata {
  visitados: number;
  podados: number;
  avaliados: number;
}

export interface ResultadoBuscaExata {
  candidatos: CandidatoBusca[];
  estatisticas: EstatisticasBuscaExata;
}

export interface OpcoesBusca {
  modalidade: Modalidade;
}
