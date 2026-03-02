"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { analyzeSignificance, calculatePiSqrtScore } from '@/lib/hexa-engine';
import { ArrowRightLeft, TrendingUp, AlertCircle } from 'lucide-react';
import HexaRadar from './HexaRadar';

const ComparisonAnalyzer = () => {
  const [textA, setTextA] = useState("A IA é uma ferramenta que processa dados para gerar respostas baseadas em padrões.");
  const [textB, setTextB] = useState("A inteligência artificial atua como um catalisador da cognição humana, sintetizando complexidade em insights pragmáticos através de redes neurais.");

  const metricsA = analyzeSignificance(textA);
  const metricsB = analyzeSignificance(textB);
  const scoreA = calculatePiSqrtScore(metricsA);
  const scoreB = calculatePiSqrtScore(metricsB);

  const winner = scoreA > scoreB ? 'A' : 'B';
  const diff = Math.abs(((scoreA - scoreB) / Math.max(scoreA, scoreB)) * 100).toFixed(1);

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="h-px flex-1 bg-slate-200" />
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <ArrowRightLeft className="w-5 h-5" />
          Benchmarking de Significância
        </div>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lado A */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="font-bold text-slate-700">Artefato A</h3>
            <span className="text-2xl font-black text-violet-600">{scoreA.toFixed(3)}</span>
          </div>
          <Textarea 
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            className="min-h-[120px] border-slate-200 focus:border-violet-400"
          />
          <Card className="bg-white/50 border-slate-100">
            <CardContent className="p-4">
              <HexaRadar metrics={metricsA} />
            </CardContent>
          </Card>
        </div>

        {/* Lado B */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="font-bold text-slate-700">Artefato B</h3>
            <span className="text-2xl font-black text-indigo-600">{scoreB.toFixed(3)}</span>
          </div>
          <Textarea 
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            className="min-h-[120px] border-slate-200 focus:border-indigo-400"
          />
          <Card className="bg-white/50 border-slate-100">
            <CardContent className="p-4">
              <HexaRadar metrics={metricsB} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className={`border-none shadow-lg ${winner === 'A' ? 'bg-violet-600' : 'bg-indigo-600'} text-white`}>
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider">Resultado da Álgebra</p>
              <h3 className="text-xl font-bold">O Artefato {winner} possui {diff}% mais significância</h3>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-white/60 text-xs">Delta de Significância</p>
            <p className="text-2xl font-mono font-bold">Δ {(scoreA - scoreB).toFixed(4)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparisonAnalyzer;