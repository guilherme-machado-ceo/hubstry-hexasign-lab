import type { CandidatoBusca } from "./busca";
import { compararCandidatos } from "./busca";
import type { ConfiguracaoMotor, Modalidade } from "./esquema";

export type CategoriaGentner =
  | "semelhanca-literal"
  | "analogia"
  | "aparencia-superficial"
  | "anomalia"
  | "indeterminado";

export interface DiagnosticoGentner {
  categoria: CategoriaGentner;
  justificativa?: string;
  alertas: string[];
}

export interface CandidatoModalidade extends CandidatoBusca, DiagnosticoGentner {
  rotulo?: "hipotese-de-exploracao";
}

export interface MelhorCandidatoRejeitado {
  mapeamento: CandidatoBusca["mapeamento"];
  perfil: CandidatoBusca["perfil"];
  sistematicidade: number | null;
  motivo: string;
}

export interface ResultadoSelecaoModalidade {
  elegiveis: CandidatoModalidade[];
  justificativaVazio?: string;
  melhorCandidatoRejeitado?: MelhorCandidatoRejeitado;
}

export function diagnosticarGentner(
  rho1: number | null,
  rho2: number | null,
  config: ConfiguracaoMotor,
): DiagnosticoGentner {
  if (rho1 === null || rho2 === null) {
    const ausentes = [rho1 === null ? "ρ₁" : null, rho2 === null ? "ρ₂" : null]
      .filter(Boolean)
      .join(" e ");
    return {
      categoria: "indeterminado",
      justificativa: `diagnóstico indisponível: ${ausentes} indefinido`,
      alertas: [],
    };
  }
  const rho1Alto = rho1 >= config.gentner.rho1Alto;
  const rho2Alto = rho2 >= config.gentner.rho2Alto;
  if (rho1Alto && rho2Alto) return { categoria: "semelhanca-literal", alertas: [] };
  if (!rho1Alto && rho2Alto) return { categoria: "analogia", alertas: [] };
  if (rho1Alto) {
    return {
      categoria: "aparencia-superficial",
      alertas: ["aparência superficial: atributos semelhantes sem preservação estrutural suficiente"],
    };
  }
  return { categoria: "anomalia", alertas: [] };
}

export function limiarModalidade(modalidade: Modalidade, config: ConfiguracaoMotor): number {
  if (modalidade === "heuristica") return config.heuristica.exige.rho1;
  if (modalidade === "funcional") return config.funcional.exige.rho3;
  return config.homologica.exige.rho2;
}

export function valorExigido(candidato: CandidatoBusca, modalidade: Modalidade): number | null {
  if (modalidade === "heuristica") return candidato.perfil[0];
  if (modalidade === "funcional") return candidato.perfil[2];
  return candidato.perfil[1];
}

export function atendeModalidade(
  candidato: CandidatoBusca,
  modalidade: Modalidade,
  config: ConfiguracaoMotor,
): boolean {
  const valor = valorExigido(candidato, modalidade);
  return valor !== null && valor >= limiarModalidade(modalidade, config);
}

function comDiagnostico(
  candidato: CandidatoBusca,
  modalidade: Modalidade,
  config: ConfiguracaoMotor,
): CandidatoModalidade {
  return {
    ...candidato,
    ...diagnosticarGentner(candidato.perfil[0], candidato.perfil[1], config),
    ...(modalidade === "heuristica" ? { rotulo: "hipotese-de-exploracao" as const } : {}),
  };
}

export function selecionarPorModalidade(
  candidatos: readonly CandidatoBusca[],
  modalidade: Modalidade,
  config: ConfiguracaoMotor,
): ResultadoSelecaoModalidade {
  const ordenados = [...candidatos].sort((a, b) => compararCandidatos(a, b, modalidade));
  const elegiveis = ordenados
    .filter((candidato) => atendeModalidade(candidato, modalidade, config))
    .slice(0, 3)
    .map((candidato) => comDiagnostico(candidato, modalidade, config));
  if (elegiveis.length > 0) return { elegiveis };

  const melhor = ordenados[0];
  const limiar = limiarModalidade(modalidade, config);
  const valor = melhor ? valorExigido(melhor, modalidade) : null;
  const nome = modalidade === "heuristica" ? "ρ₁" : modalidade === "funcional" ? "ρ₃" : "ρ₂";
  const motivo = valor === null ? `${nome} indefinido` : `${nome} ${valor} abaixo do limiar ${limiar}`;
  return {
    elegiveis: [],
    justificativaVazio: `nenhum mapeamento atingiu o requisito da modalidade: ${motivo}`,
    ...(melhor
      ? {
          melhorCandidatoRejeitado: {
            mapeamento: melhor.mapeamento,
            perfil: melhor.perfil,
            sistematicidade: melhor.sistematicidade,
            motivo,
          },
        }
      : {}),
  };
}
