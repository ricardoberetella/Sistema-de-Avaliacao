// src/components/InputNota.tsx
import React, { useState, useEffect } from 'react';

interface InputNotaProps {
  valorInicial: string;
  onSalvar: (val: string) => void;
}

export default function InputNota({
  valorInicial,
  onSalvar,
}: InputNotaProps) {
  const [localVal, setLocalVal] = useState(valorInicial);

  useEffect(() => {
    setLocalVal(valorInicial);
  }, [valorInicial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value;

    // aceita apenas números e vírgula
    valor = valor.replace(/[^0-9,]/g, '');

    // permite apenas uma vírgula
    const partes = valor.split(',');
    if (partes.length > 2) return;

    setLocalVal(valor);
  };

  const executarSalvar = () => {
    if (localVal === '') {
      onSalvar('');
      return;
    }

    let numero = Number(localVal.replace(',', '.'));

    if (isNaN(numero)) {
      setLocalVal(valorInicial);
      return;
    }

    numero = Math.max(0, Math.min(100, numero));

    const valorFinal = String(numero).replace('.', ',');

    setLocalVal(valorFinal);

    if (valorFinal !== valorInicial) {
      onSalvar(valorFinal);
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={localVal}
      onChange={handleChange}
      onBlur={executarSalvar}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          executarSalvar();
          (e.target as HTMLInputElement).blur();
        }
      }}
      placeholder="0"
      className="w-24 h-[38px] text-center bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-black text-xs text-slate-800 focus:outline-none"
    />
  );
}
