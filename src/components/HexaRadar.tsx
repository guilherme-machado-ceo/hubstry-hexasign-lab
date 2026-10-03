import React from 'react';
import { HexaMetrics } from '@/lib/hexa-engine';
import { Activity } from 'lucide-react';

interface HexaRadarProps {
  metrics?: Partial<HexaMetrics> | null;
}

const RELATIONS = [
  ['similitude', 'ρ₁', 'Similitude'],
  ['homology', 'ρ₂', 'Homologia'],
  ['equivalence', 'ρ₃', 'Equivalência'],
  ['symmetry', 'ρ₄', 'Simetria'],
  ['equilibrium', 'ρ₅', 'Equilíbrio'],
  ['compensation', 'ρ₆', 'Compensação'],
] as const;

export const HexaRadar: React.FC<HexaRadarProps> = ({ metrics }) => {
  const values = RELATIONS.map(([key]) => [key, Number(metrics?.[key] ?? 0)] as const);
  const goldenNorm = Number(metrics?.goldenNorm ?? 0);
  const piSqrtScore = Number(metrics?.piSqrtScore ?? 0);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-slate-950/80 p-5 text-slate-100 shadow-xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
            <Activity className="h-4 w-4" /> Vetor hexarrelacional
          </div>
          <p className="mt-1 text-xs text-slate-500">Estado contínuo das seis relações ρ₁…ρ₆.</p>
        </div>
        <div className="font-mono text-right">
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Π(A)</div>
          <div className="text-lg font-semibold text-white">{piSqrtScore.toFixed(5)}</div>
        </div>
      </div>

      <div className="space-y-3">
        {values.map(([key, value]) => {
          const relation = RELATIONS.find(([item]) => item === key)!;
          return (
            <div key={key} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-amber-400/20 bg-amber-400/5 px-2 py-0.5 font-mono text-xs text-amber-300">{relation[1]}</span>
                  <span className="text-sm font-medium text-slate-200">{relation[2]}</span>
                </div>
                <span className="font-mono text-sm font-semibold text-slate-100">{(value * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-300 to-white transition-all duration-200"
                  style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-500">f(A) · norma áurea</div>
          <div className="mt-1 font-mono text-lg font-semibold text-slate-100">{goldenNorm.toFixed(4)}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Relação ativa</div>
          <div className="mt-1 font-mono text-lg font-semibold text-amber-200">{values.filter(([, value]) => value > 0).length}/6</div>
        </div>
      </div>
    </div>
  );
};

export default HexaRadar;
