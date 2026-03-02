"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Wand2, Loader2, CheckCircle2 } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

interface AutoOptimizerProps {
  currentText: string;
  onOptimize: (newText: string) => void;
}

const AutoOptimizer = ({ currentText, onOptimize }: AutoOptimizerProps) => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const runOptimization = () => {
    setIsOptimizing(true);
    
    // Simulação de um processo de "evolução" do texto via LLM
    setTimeout(() => {
      const optimizedVersions = [
        `Considerando o contexto atual, ${currentText} Portanto, a aplicação prática desta teoria resulta em uma coesão semântica superior.`,
        `A essência de: "${currentText}" reside na sua capacidade de sintetizar complexidade em utilidade pragmática, ancorada por uma estrutura lógica rigorosa.`,
        `Sob a ótica da álgebra π√f(A), o artefato: "${currentText}" atua como um catalisador de significância, maximizando a ressonância entre intenção e realidade.`
      ];
      
      const result = optimizedVersions[Math.floor(Math.random() * optimizedVersions.length)];
      onOptimize(result);
      setIsOptimizing(false);
      showSuccess("Texto otimizado para máxima significância!");
    }, 2000);
  };

  return (
    <Card className="bg-gradient-to-r from-violet-600 to-indigo-600 border-none shadow-lg overflow-hidden">
      <CardContent className="p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-white font-bold">Otimizador de Realidade</h4>
            <p className="text-white/70 text-xs">Ajusta o texto para colapsar a função π√f(A) no valor máximo.</p>
          </div>
        </div>
        <Button 
          onClick={runOptimization} 
          disabled={isOptimizing}
          className="bg-white text-violet-600 hover:bg-violet-50 font-bold rounded-xl px-6"
        >
          {isOptimizing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Otimizar
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AutoOptimizer;