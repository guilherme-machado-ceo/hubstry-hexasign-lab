"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Smile, Frown, Meh, Thermometer } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SentimentIndicatorProps {
  score: number;
  label: string;
}

const SentimentIndicator = ({ score, label }: SentimentIndicatorProps) => {
  // Normaliza o score de -1/1 para 0/100 para o Progress
  const progressValue = ((score + 1) / 2) * 100;
  
  const getColor = () => {
    if (score > 0.1) return 'text-emerald-500';
    if (score < -0.1) return 'text-rose-500';
    return 'text-amber-500';
  };

  const getBgColor = () => {
    if (score > 0.1) return 'bg-emerald-500';
    if (score < -0.1) return 'bg-rose-500';
    return 'bg-amber-500';
  };

  const getIcon = () => {
    if (score > 0.1) return <Smile className={`w-6 h-6 ${getColor()}`} />;
    if (score < -0.1) return <Frown className={`w-6 h-6 ${getColor()}`} />;
    return <Meh className={`w-6 h-6 ${getColor()}`} />;
  };

  return (
    <Card className="border-none bg-slate-50 shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-white shadow-sm`}>
              {getIcon()}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Polaridade</p>
              <h4 className={`font-black text-lg leading-none ${getColor()}`}>{label}</h4>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intensidade</p>
            <p className="font-mono font-bold text-slate-700">{Math.abs(score).toFixed(2)}</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
            <span>Negativo</span>
            <span>Neutro</span>
            <span>Positivo</span>
          </div>
          <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full transition-all duration-500 ${getBgColor()}`}
              style={{ width: `${progressValue}%` }}
            />
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/50 -translate-x-1/2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentIndicator;