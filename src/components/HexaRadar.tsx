import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { HexaMetrics } from '@/lib/hexa-engine';

interface HexaRadarProps {
  metrics?: Partial<HexaMetrics> | null;
}

export const HexaRadar: React.FC<HexaRadarProps> = ({ metrics }) => {
  // Fallback defensivo rigoroso para evitar qualquer TypeError de undefined
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

  const data = [
    { subject: 'Similitude (ρ₁)', value: safeMetrics.similitude * 100, fullMark: 100 },
    { subject: 'Homologia (ρ₂)', value: safeMetrics.homology * 100, fullMark: 100 },
    { subject: 'Equivalência (ρ₃)', value: safeMetrics.equivalence * 100, fullMark: 100 },
    { subject: 'Simetria (ρ₄)', value: safeMetrics.symmetry * 100, fullMark: 100 },
    { subject: 'Equilíbrio (ρ₅)', value: safeMetrics.equilibrium * 100, fullMark: 100 },
    { subject: 'Compensação (ρ₆)', value: safeMetrics.compensation * 100, fullMark: 100 },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center font-mono">
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius={105}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" />
            <Radar name="HexaSign" dataKey="value" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.4} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontFamily: 'monospace' }}
              formatter={(value: any) => [`${(Number(value) || 0).toFixed(1)}%`, 'Score']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full mt-4 text-xs">
        <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-center">
          <span className="text-slate-400 block">Norma Áurea f(A):</span>
          <span className="text-amber-400 font-bold text-sm">{safeMetrics.goldenNorm.toFixed(4)}</span>
        </div>
        <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-center">
          <span className="text-slate-400 block">Π-radical Π(A):</span>
          <span className="text-amber-400 font-bold text-sm">{safeMetrics.piSqrtScore.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
};

export default HexaRadar;
