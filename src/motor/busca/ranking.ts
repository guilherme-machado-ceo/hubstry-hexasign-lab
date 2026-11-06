import { compararPontosDeCodigo, jsonCanonico } from "../canonico";
import type { ConfiguracaoMotor, Dominio, Mapeamento, Modalidade } from "../esquema";
import { avaliarPerfil, type ContextoAvaliacao } from "../relacoes";
import { calcularSistematicidade } from "./sistematicidade";
import type { CandidatoBusca } from "./tipos";

export function chaveMapeamento(mapeamento: Mapeamento): string {
  return jsonCanonico({
    pares: [...mapeamento.pares].sort(
      (a, b) =>
        compararPontosDeCodigo(a[0], b[0]) || compararPontosDeCodigo(a[1], b[1]),
    ),
  });
}

export function avaliarCandidato(
  fonte: Dominio,
  alvo: Dominio,
  mapeamento: Mapeamento,
  contexto: ContextoAvaliacao,
): CandidatoBusca {
  const avaliacao = avaliarPerfil(fonte, alvo, mapeamento, contexto);
  return {
    ...avaliacao,
    mapeamento: {
      pares: [...mapeamento.pares].sort(
        (a, b) =>
          compararPontosDeCodigo(a[0], b[0]) || compararPontosDeCodigo(a[1], b[1]),
      ),
    },
    sistematicidade: calcularSistematicidade(fonte, alvo, mapeamento, contexto),
    chaveCanonica: chaveMapeamento(mapeamento),
  };
}

function numeroOrdenavel(valor: number | null): number {
  return valor ?? Number.NEGATIVE_INFINITY;
}

export function primeiroCriterio(
  candidato: CandidatoBusca,
  modalidade: Modalidade,
): number {
  if (modalidade === "heuristica") return numeroOrdenavel(candidato.perfil[0]);
  if (modalidade === "funcional") return numeroOrdenavel(candidato.perfil[2]);
  return numeroOrdenavel(candidato.sistematicidade);
}

function compararDecrescente(a: number | null, b: number | null): number {
  const valorA = numeroOrdenavel(a);
  const valorB = numeroOrdenavel(b);
  if (valorA === valorB) return 0;
  return valorA > valorB ? -1 : 1;
}

export function compararCandidatos(
  a: CandidatoBusca,
  b: CandidatoBusca,
  modalidade: Modalidade,
): number {
  const primeiro = compararDecrescente(
    primeiroCriterio(a, modalidade),
    primeiroCriterio(b, modalidade),
  );
  if (primeiro !== 0) return primeiro;
  const desempateA = modalidade === "funcional" ? a.perfil[1] : a.perfil[modalidade === "heuristica" ? 1 : 0];
  const desempateB = modalidade === "funcional" ? b.perfil[1] : b.perfil[modalidade === "heuristica" ? 1 : 0];
  const segundo = compararDecrescente(desempateA, desempateB);
  if (segundo !== 0) return segundo;
  return compararPontosDeCodigo(a.chaveCanonica, b.chaveCanonica);
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

/** Requisito mínimo da modalidade (ρ₁, ρ₃ ou ρ₂), aplicado antes de qualquer corte. */
export function atendeModalidade(
  candidato: CandidatoBusca,
  modalidade: Modalidade,
  config: ConfiguracaoMotor,
): boolean {
  const valor = valorExigido(candidato, modalidade);
  return valor !== null && valor >= limiarModalidade(modalidade, config);
}
