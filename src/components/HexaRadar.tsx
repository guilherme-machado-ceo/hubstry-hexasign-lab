"use client";

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { HexaMetrics } from '@/lib/hexa-engine';

interface HexaRadarProps {
  metrics: HexaMetrics;
}

const HexaRadar = ({ metrics }: HexaRadarProps) => {
  const data = [
    { subject: 'Contexto', A: metrics.contextualDensity * 100 },
    { subject: 'Semântica', A: metrics.semanticResonance * 100 },
    { subject: 'Lógica', A: metrics.logicalCohesion * 100 },
    { subject: 'Intenção', A: metrics.intentionalAlignment * 100 },
    { subject: 'Entropia', A: metrics.informationalEntropy * 100 },
    { subject: 'Pragmática', A: metrics.pragmaticUtility * 100 },
  ];

  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
          <Radar
            name="Significância"
            dataKey="A"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HexaRadar;