import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { analyzeSignificance, HexaMetrics } from '@/lib/hexa-engine';
import HexaRadar from './HexaRadar';

export const ComparisonAnalyzer: React.FC = () => {
  const [textA, setTextA] = useState<string>('');
  const [textB, setTextB] = useState<string>('');
  const [metricsA, setMetricsA] = useState<HexaMetrics | null>(null);
  const [metricsB, setMetricsB] = useState<HexaMetrics | null>(null);

  const handleCompare = () => {
    if (textA.trim()) setMetricsA(analyzeSignificance(textA));
    if (textB.trim()) setMetricsB(analyzeSignificance(textB));
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      <Card className="bg-slate-950/40 border-slate-800 text-slate-100 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-mono text-amber-400 tracking-wider">
            COMPARAÇÃO HEXARRELACIONAL CROSS-ARTEFATO
          </CardTitle>
          <CardDescription className="text-slate-400">
            Compare a topologia semiótica e o score Π-radical entre dois modelos, códigos ou textos.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Artefato A */}
        <Card className="bg-slate-900/60 border-slate-800 flex flex-col">
          <CardHeader>
            <CardTitle className="text-md font-mono text-slate-300">ARTEFATO [A] - LINHA DE BASE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <Textarea
              placeholder="Insira o texto ou código original aqui..."
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              className="min-h-[150px] bg-slate-950/50 border-slate-700 text-slate-100 font-mono text-sm resize-none"
            />
            {metricsA && (
              <div className="flex-1 mt-4 p-4 border border-slate-700 rounded-lg bg-slate-950/80">
                <HexaRadar metrics={metricsA} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Artefato B */}
        <Card className="bg-slate-900/60 border-slate-800 flex flex-col">
          <CardHeader>
            <CardTitle className="text-md font-mono text-amber-500">ARTEFATO [B] - EVOLUÇÃO / ALVO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <Textarea
              placeholder="Insira o texto refatorado ou resposta otimizada aqui..."
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              className="min-h-[150px] bg-slate-950/50 border-slate-700 text-slate-100 font-mono text-sm resize-none"
            />
            {metricsB && (
              <div className="flex-1 mt-4 p-4 border border-slate-700 rounded-lg bg-slate-950/80">
                <HexaRadar metrics={metricsB} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-4">
        <Button 
          onClick={handleCompare}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-bold px-12 py-6 text-lg transition-all"
        >
          PROCESSAR MATRIZ DE COMPARAÇÃO
        </Button>
      </div>
    </div>
  );
};

export default ComparisonAnalyzer;
