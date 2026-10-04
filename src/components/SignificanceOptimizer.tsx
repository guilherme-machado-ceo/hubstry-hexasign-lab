import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { calculateGoldenNorm, calculatePiSqrtScore, HexaMetrics } from '@/lib/hexa-engine';
import HexaRadar from './HexaRadar';

export const SignificanceOptimizer: React.FC = () => {
  const [metrics, setMetrics] = useState({
    similitude: 0.6,
    homology: 0.6,
    equivalence: 0.6,
    symmetry: 0.6,
    equilibrium: 0.6,
    compensation: 0.6
  });

  const handleChange = (dimension: string, value: number) => {
    setMetrics(prev => ({ ...prev, [dimension]: value }));
  };

  // Recálculo síncrono e direto a cada render para garantir reatividade imediata
  const vector = [
    metrics.similitude,
    metrics.homology,
    metrics.equivalence,
    metrics.symmetry,
    metrics.equilibrium,
    metrics.compensation
  ];

  const goldenNorm = calculateGoldenNorm(vector);
  const piSqrtScore = calculatePiSqrtScore(goldenNorm);

  const currentMetrics: HexaMetrics = {
    ...metrics,
    goldenNorm: isNaN(goldenNorm) ? 0 : goldenNorm,
    piSqrtScore: isNaN(piSqrtScore) ? 0 : piSqrtScore
  };

  const dimensions = [
    { key: 'similitude', label: 'Similitude (ρ₁)' },
    { key: 'homology', label: 'Homologia (ρ₂)' },
    { key: 'equivalence', label: 'Equivalência (ρ₃)' },
    { key: 'symmetry', label: 'Simetria (ρ₄)' },
    { key: 'equilibrium', label: 'Equilíbrio (ρ₅)' },
    { key: 'compensation', label: 'Compensação (ρ₆)' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card className="lg:col-span-6 bg-slate-950/40 border-slate-800 backdrop-blur-xl shadow-2xl text-slate-100">
        <CardHeader>
          <CardTitle className="text-xl font-mono text-amber-400 tracking-wider">
            SIMULADOR HEXARRELACIONAL
          </CardTitle>
          <CardDescription className="text-slate-400">
            Ajuste os vetores relacionais (ρ₁ a ρ₆) para observar o comportamento determinístico em tempo real.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 font-mono">
          {dimensions.map((dim) => {
            const val = Number(metrics[dim.key as keyof typeof metrics]) || 0;
            return (
              <div key={dim.key} className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{dim.label}</span>
                  <span className="text-amber-500 font-bold">{(val * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={val}
                  onChange={(e) => handleChange(dim.key, parseFloat(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-900 cursor-pointer h-2 rounded-lg"
                />
              </div>
            );
          })}

          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-900/80 rounded border border-slate-800">
              <span className="text-slate-400 block">Norma Áurea f(A):</span>
              <span className="text-amber-400 font-bold text-sm">{currentMetrics.goldenNorm.toFixed(4)}</span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded border border-slate-800">
              <span className="text-slate-400 block">Π-radical Π(A):</span>
              <span className="text-amber-400 font-bold text-sm">{currentMetrics.piSqrtScore.toFixed(4)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-6 flex items-center justify-center">
        <div className="w-full h-[450px] bg-slate-950/40 border border-slate-800 rounded-xl p-4 backdrop-blur-xl flex items-center justify-center">
          <HexaRadar metrics={currentMetrics} />
        </div>
      </div>
    </div>
  );
};

export default SignificanceOptimizer;
