"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, BookOpen } from 'lucide-react';

const MetricGlossary = () => {
  const definitions = [
    { title: "Densidade Contextual", desc: "A quantidade de informação de fundo que ancora o texto a uma realidade específica." },
    { title: "Ressonância Semântica", desc: "A profundidade e riqueza do vocabulário utilizado em relação ao tema central." },
    { title: "Coesão Lógica", desc: "A força das conexões causais e estruturais entre as sentenças." },
    { title: "Alinhamento Intencional", desc: "O quão claro é o propósito ou o objetivo por trás da mensagem." },
    { title: "Entropia Informacional", desc: "A taxa de novidade e imprevisibilidade da informação (evita clichês)." },
    { title: "Utilidade Pragmática", desc: "A capacidade do texto de ser aplicado ou gerar uma ação concreta." },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="w-6 h-6 text-violet-600" />
        <h2 className="text-2xl font-bold text-slate-800">Glossário da Álgebra π√f(A)</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {definitions.map((d, i) => (
          <Card key={i} className="border-slate-200 hover:border-violet-300 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-violet-700 flex items-center gap-2">
                <Info className="w-4 h-4" />
                {d.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 leading-relaxed">{d.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MetricGlossary;