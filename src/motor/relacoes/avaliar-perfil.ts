import { quantizar12 } from "../canonico";
import type {
  ConfiguracaoMotor,
  Dominio,
  Mapeamento,
  Perfil,
  PerfilBinario,
  VersoesRelacoes,
} from "../esquema";
import type { ContextoAvaliacao } from "./contexto";
import { avaliarRho1, VERSAO_DEFINICAO_RHO1 } from "./rho1-similitude";
import {
  avaliarRho2,
  detectarIsomorfismo,
  VERSAO_DEFINICAO_RHO2,
} from "./rho2-homologia";
import { avaliarRho3, VERSAO_DEFINICAO_RHO3 } from "./rho3-equivalencia";
import { avaliarRho4, VERSAO_DEFINICAO_RHO4 } from "./rho4-simetria";
import { avaliarRho5, VERSAO_DEFINICAO_RHO5 } from "./rho5-equilibrio";
import { avaliarRho6, VERSAO_DEFINICAO_RHO6 } from "./rho6-compensacao";

export const VERSOES_RELACOES: VersoesRelacoes = {
  rho1: VERSAO_DEFINICAO_RHO1,
  rho2: VERSAO_DEFINICAO_RHO2,
  rho3: VERSAO_DEFINICAO_RHO3,
  rho4: VERSAO_DEFINICAO_RHO4,
  rho5: VERSAO_DEFINICAO_RHO5,
  rho6: VERSAO_DEFINICAO_RHO6,
};

export interface AvaliacaoPerfil {
  perfil: Perfil;
  perfilBinario?: PerfilBinario;
  isomorfismo: boolean;
  versoesRelacoes: VersoesRelacoes;
}

function normalizarValor(valor: number | null): number | null {
  if (valor === null) return null;
  if (!Number.isFinite(valor) || valor < 0 || valor > 1) {
    throw new TypeError("avaliador de relação produziu valor inválido");
  }
  return quantizar12(valor);
}

function binarizar(
  perfil: Perfil,
  limiares: NonNullable<ConfiguracaoMotor["limiaresBinarios"]>,
): PerfilBinario {
  const nomes = ["rho1", "rho2", "rho3", "rho4", "rho5", "rho6"] as const;
  return nomes.map((nome, indice) => {
    const valor = perfil[indice];
    return valor === null ? null : valor >= limiares[nome] ? 1 : 0;
  }) as unknown as PerfilBinario;
}

export function avaliarPerfil(
  fonte: Dominio,
  alvo: Dominio,
  mapeamento: Mapeamento,
  contexto: ContextoAvaliacao,
): AvaliacaoPerfil {
  const perfil = [
    avaliarRho1(fonte, alvo, mapeamento, contexto),
    avaliarRho2(fonte, alvo, mapeamento, contexto),
    avaliarRho3(fonte, alvo, mapeamento, contexto),
    avaliarRho4(fonte, alvo, mapeamento, contexto),
    avaliarRho5(fonte, alvo, mapeamento, contexto),
    avaliarRho6(fonte, alvo, mapeamento, contexto),
  ].map(normalizarValor) as unknown as Perfil;

  return {
    perfil,
    ...(contexto.config.limiaresBinarios === null
      ? {}
      : { perfilBinario: binarizar(perfil, contexto.config.limiaresBinarios) }),
    isomorfismo: detectarIsomorfismo(fonte, alvo, mapeamento, contexto),
    versoesRelacoes: { ...VERSOES_RELACOES },
  };
}
