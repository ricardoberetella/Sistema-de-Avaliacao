// src/components/TextareaObservacao.tsx
import React, { useState, useEffect } from 'react';

interface TextareaObservacaoProps {
  valorInicial: string;
  onSalvar: (val: string) => void;
}

export default function TextareaObservacao({ valorInicial, onSalvar }: TextareaObservacaoProps) {
  const [localText, setLocalText] = useState(valorInicial);

  useEffect(() => {
    setLocalText(valorInicial);
  }, [valorInicial]);

  return (
    <textarea 
      value={localText} 
      onChange={(e) => setLocalText(e.target.value)}
      onBlur={() => {
        if (localText !== valorInicial) {
          onSalvar(localText);
        }
      }}
      placeholder="Descreva pontos de atenção ou conquistas do estudante nesta capacidade técnica..." 
      className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl text-xs focus:outline-none focus:bg-white focus:border-blue-400 transition-all min-h-[70px] placeholder-slate-400" 
    />
  );
}
