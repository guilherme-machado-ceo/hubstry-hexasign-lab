import React from 'react';
import { HexaMetrics } from '@/lib/hexa-engine';

interface HexaRadarProps {
  metrics?: Partial<HexaMetrics> | null;
}

export const HexaRadar: React.FC<HexaRadarProps> = ({ metrics }) => {
  const safeMetrics = {
    similitude: Number(metrics?.similitude ?? 0),
    homology: Number(metrics?.homology ?? 0),
    equivalence: Number(metrics?.equivalence ?? 0),
    symmetry: Number(metrics?.symmetry ?? 0),
    equilibrium: Number(metrics?.equilibrium ?? 0),
    compensation: Number(metrics?.compensation ?? 0),
    goldenNorm: Number(metrics?.goldenNorm ?? 0),
    piSqrtScore: Number(metrics?.piSqrtScore ?? 0),
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center font-mono p-6 text-slate-100 space-y-4 bg-slate-900/90 rounded-xl border border-amber-500/30">
      <h3 className="text-amber-400 font-bold text-sm">DIAGNÓSTICO DE REATIVIDADE DO VETOR</h3>
      <div className="grid grid-cols-2 gap-3 w-full text-xs">
        <div className="bg-slate-950 p-2 rounded border border-slate-800">ρ₁ Similitude: {(safeMetrics.similitude * 100).toFixed(0)}%</div>
        <div className="bg-slate-950 p-2 rounded border border-slate-800">ρ₂ Homologia: {(safeMetrics.homology * 100).toFixed(0)}%</div>
        <div className="bg-slate-950 p-2 rounded border border-slate-800">ρ₃ Equivalência: {(safeMetrics.equivalence * 100).toFixed(0)}%</div>
        <div className="bg-slate-950 p-2 rounded border border-slate-800">ρ₄ Simetria: {(safeMetrics.symmetry * 100).toFixed(0)}%</div>
        <div className="bg-slate-950 p-2 rounded border border-slate-800">ρ₅ Equilíbrio: {(safeMetrics.equilibrium * 100).toFixed(0)}%</div>
        <div className="bg-slate-950 p-2 rounded border border-slate-800">ρ₆ Compensação: {(safeMetrics.compensation * 100).toFixed(0)}%</div>
      </div>
      <div className="w-full pt-2 border-t border-slate-800 flex justify-between text-xs font-bold text-amber-300">
        <span>f(A): {safeMetrics.goldenNorm.toFixed(4)}</span>
        <span>Π(A): {safeMetrics.piSqrtScore.toFixed(4)}</span>
      </div>
    </div>
  );
};

export default HexaRadar;
