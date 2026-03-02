"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { analyzeSignificance, calculatePiSqrtScore, HexaMetrics } from '@/lib/hexa-engine';
import HexaRadar from './HexaRadar';
import { Sparkles, Zap, Brain, Target } from 'lucide-react';

const SignificanceAnalyzer = () => {
  const [text, setText] = useState("A inteligência artificial não é apenas processamento, é a busca pela ressonância do significado no caos da informação.");
  const [metrics, setMetrics] = useState<HexaMetrics | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const m = analyzeSignificance(text);
    setMetrics(m);
    setScore(calculatePiSqrtScore(m));
  }, [text]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto p-4">
      <div className="space-y-6">
        <Card className="border-2 border-violet-100 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-violet-700">
              <Brain className="w-6 h-6" />
              Entrada de Dados (A)
            </CardTitle>
            <CardDescription>
              Insira o artefato linguístico para processamento hexarrelacional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Digite sua teoria ou prompt aqui..."
              className="min-h-[200px] text-lg border-violet-200 focus:ring-violet-500"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-violet-50 border-none">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-violet-600 font-medium uppercase tracking-wider">Score π√f(A)</p>
              <p className="text-4xl font-bold text-violet-900">{score.toFixed(4)}</p>
            </CardContent>
          </Card>
          <Card className="bg-indigo-50 border-none">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-indigo-600 font-medium uppercase tracking-wider">Status</p>
              <Badge className="mt-2 bg-indigo-500">
                {score > 2.5 ? 'Alta Significância' : 'Baixa Significância'}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border-2 border-indigo-100 shadow-xl overflow-hidden">
          <CardHeader className="bg-indigo-50/50">
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Target className="w-6 h-6" />
              Mapeamento Hexarrelacional
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {metrics && <HexaRadar metrics={metrics} />}
            
            <div className="mt-6 grid grid-cols-1 gap-2">
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Densidade Contextual</span>
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500" style={{ width: `${(metrics?.contextualDensity || 0) * 100}%` }} />
                </div>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Ressonância Semântica</span>
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${(metrics?.semanticResonance || 0) * 100}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Insight da Álgebra</h4>
                <p className="text-white/80 text-sm leading-relaxed">
                  Sua entrada demonstra uma forte {metrics?.logicalCohesion && metrics.logicalCohesion > 0.7 ? 'coesão lógica' : 'densidade de informação'}. 
                  O equilíbrio entre entropia e pragmática sugere um artefato de alta utilidade para sistemas de NLP.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignificanceAnalyzer;