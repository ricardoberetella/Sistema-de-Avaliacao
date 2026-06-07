// src/components/InputNota.tsx
import React, { useState, useEffect } from 'react';

interface InputNotaProps {
  valorInicial: string;
  onSalvar: (val: string) => void;
}

export default function InputNota({ valorInicial, onSalvar }: InputNotaProps) {
  const [localVal, setLocalVal] = useState(valorInicial);

  useEffect(() => {
    setLocalVal(valorInicial);
  }, [valorInicial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permite apenas números de 0 a 9
    const apenasNumeros = e.target.value.replace(/\D/g, '');
    setLocalVal(apenasNumeros);
  };

  return (
    <div className="relative">
      <style>{`
        /* Remove as setinhas nativas de inputs numéricos no Chrome, Safari, Edge e Firefox */
        .input-nota-blindado::-webkit-outer-spin-button,
        .input-nota-blindado::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .input-nota-blindado {
          -moz-appearance: textfield;
        }
      `}</style>

      <input 
        type="text" 
        inputMode="numeric"
        pattern="[0-9]*"
        value={localVal} 
        onChange={handleChange}
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
        className="input-nota-blindado w-16 h-[38px] text-center bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-black text-xs text-slate-800 focus:outline-none transition-all shadow-inner"
      />
    </div>
  );
}
