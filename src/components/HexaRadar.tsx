/**
 * HexaRadar.tsx - Visualização Hexadimensional da Significância
 * Mapeia as 6 Relações (ρ1 a ρ6), Norma Áurea e Operador Π-radical
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HexaMetrics } from '@/lib/hexa-engine';
import { PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

interface HexaRadarProps {
  metrics: HexaMetrics | null;
}

export const HexaRadar: React.FC<HexaRadarProps> = ({ metrics }) => {
  const data = metrics ? [
    { dimension: 'Similitude (ρ₁)', value: metrics.similitude, fullMark: 1 },
    { dimension: 'Homologia (ρ₂)', value: metrics.homology, fullMark: 1 },
    { dimension: 'Equivalência (ρ₃)', value: metrics.equivalence, fullMark: 1 },
    { dimension: 'Simetria (ρ₄)', value: metrics.symmetry, fullMark: 1 },
    { dimension: 'Equilíbrio (ρ₅)', value: metrics.equilibrium, fullMark: 1 },
    { dimension: 'Compensação (ρ₆)', value: metrics.compensation, fullMark: 1 },
  ] : [
    { dimension: 'Similitude (ρ₁)', value: 0, fullMark: 1 },
    { dimension: 'Homologia (ρ₂)', value: 0, fullMark: 1 },
    { dimension: 'Equivalência (ρ₃)', value: 0, fullMark: 1 },
    { dimension: 'Simetria (ρ₄)', value: 0, fullMark: 1 },
    { dimension: 'Equilíbrio (ρ₅)', value: 0, fullMark: 1 },
    { dimension: 'Compensação (ρ₆)', value: 0, fullMark: 1 },
  ];

  return (
    <Card className="bg-slate-950/40 border-slate-800 text-slate-100 backdrop-blur-xl shadow-2xl">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-mono tracking-wider text-amber-400">
              MATRIZ HEXARRELACIONAL $\vec{f}(A)$
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Espectro multidimensional das seis relações de significância ($\rho_1 \dots \rho_6$)
            </CardDescription>
          </div>
          {metrics && (
            <div className="text-right font-mono">
              <div className="text-xs text-amber-500/80">Norma Áurea $f(A)$: {metrics.goldenNorm.toFixed(3)}</div>
              <div className="text-sm font-bold text-amber-300">Π-radical $\Pi(A)$: {metrics.piSqrtScore.toFixed(3)}</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis 
                dataKey="dimension" 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
              />
              <PolarRadiusAxis angle={30} domain={[0, 1]} stroke="#475569" />
              <Radar
                name="Significância"
                dataKey="value"
                stroke="#fbbf24"
                fill="#f59e0b"
                fillOpacity={0.35}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                itemStyle={{ color: '#fbbf24' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default HexaRadar;
