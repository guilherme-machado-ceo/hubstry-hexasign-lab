"use client";

import React from 'react';
import { HexaMetrics } from '@/lib/hexa-engine';
import { Lightbulb, ArrowUpCircle } from 'lucide-react';

interface SignificanceOptimizerProps {
  metrics: HexaMetrics;
}

const SignificanceOptimizer = ({ metrics }: SignificanceOptimizerProps) => {
  const suggestions = [];

  if (metrics.logicalCohesion < 0.6) {
    suggestions.push("Use conectivos como 'portanto', 'visto que' ou 'consequentemente' para fortalecer a estrutura lógica.");
  }
  if (metrics.semanticResonance < 0.5) {
    suggestions.push("Enriqueça o vocabulário com termos mais específicos do domínio para aumentar a ressonância semântica.");
  }
  if (metrics.contextualDensity < 0.4) {
    suggestions.push("Forneça mais contexto ou detalhes de fundo para ancorar a informação.");
  }
  if (metrics.pragmaticUtility < 0.7) {
    suggestions.push("Foque em aplicações práticas ou resultados claros para aumentar a utilidade do artefato.");
  }

  if (suggestions.length === 0) {
    return (
      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
        <div className="p-2 bg-emerald-500 rounded-full text-white">
          <ArrowUpCircle className="w-5 h-5" />
        </div>
        <p className="text-emerald-800 text-sm font-medium">
          Significância Otimizada: O artefato atingiu um equilíbrio hexarrelacional superior.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        Sugestões de Otimização
      </h4>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div key={i} className="p-3 bg-white border border-slate-100 rounded-lg text-xs text-slate-600 leading-relaxed shadow-sm">
            {s}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignificanceOptimizer;