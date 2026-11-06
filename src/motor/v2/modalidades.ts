import type { ConfiguracaoMotorV2 } from "./esquema";

export type CategoriaGentnerV2 =
  | "semelhanca-literal"
  | "analogia"
  | "aparencia-superficial"
  | "anomalia"
  | "indeterminado";

export interface DiagnosticoGentnerV2 {
  categoria: CategoriaGentnerV2;
  justificativa?: string;
  alertas: string[];
}

export function diagnosticarGentnerV2(
  rho1: number | null,
  sigma: number | null,
  config: ConfiguracaoMotorV2,
): DiagnosticoGentnerV2 {
  if (rho1 === null || sigma === null) {
    const ausentes = [rho1 === null ? "ρ₁" : null, sigma === null ? "σ" : null].filter(Boolean).join(" e ");
    return { categoria: "indeterminado", justificativa: `diagnóstico indisponível: ${ausentes} indefinido`, alertas: [] };
  }
  const altoRho1 = rho1 >= config.gentner.rho1Alto;
  const altoSigma = sigma >= config.gentner.sigmaAlto;
  if (altoRho1 && altoSigma) return { categoria: "semelhanca-literal", alertas: [] };
  if (!altoRho1 && altoSigma) return { categoria: "analogia", alertas: [] };
  if (altoRho1) return { categoria: "aparencia-superficial", alertas: ["aparência superficial: atributos semelhantes sem sustentação estrutural suficiente"] };
  return { categoria: "anomalia", alertas: [] };
}
