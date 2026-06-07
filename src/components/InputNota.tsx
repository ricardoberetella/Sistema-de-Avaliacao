// src/components/InputNota.tsx
import React, { useState, useEffect } from 'react';

interface InputNotaProps {
  valorInicial: string;
  onSalvar: (val: string) => void;
}

export default function InputNota({ valorInicial, onSalvar }: InputNotaProps) {
  const [localVal, setLocalVal] = useState(valorInicial);

  // Sincroniza apenas se o valor mudar vindo de outra turma ou card
  useEffect(() => {
    setLocalVal(valorInicial);
  }, [valorInicial]);

  return (
    <input 
      type="text" 
      value={localVal} 
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={() => {
        if (localVal !== valorInicial) {
          onSalvar(localVal);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          if (localVal !== valorInicial) {
            onSalvar(localVal);
          }
          (e.target as HTMLInputElement).blur();
        }
      }}
      placeholder="Ex: 85" 
      className="w-16 h-[38px] text-center bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-black text-xs text-slate-800 focus:outline-none transition-all shadow-inner"
    />
  );
}
