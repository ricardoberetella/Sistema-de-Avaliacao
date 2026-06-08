// src/components/InputNota.tsx
import React, { useEffect, useState } from 'react';

interface InputNotaProps {
  valorInicial: string;
  onSalvar: (val: string) => void;
}

export default function InputNota({ valorInicial, onSalvar }: InputNotaProps) {
  const [valor, setValor] = useState<string>('');

  useEffect(() => {
    setValor(valorInicial || '');
  }, [valorInicial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === '') {
      setValor('');
      return;
    }
    const apenasNumeros = v.replace(/\D/g, '');
    if (apenasNumeros === '') return;

    const num = parseInt(apenasNumeros, 10);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setValor(num.toString());
    }
  };

  const handleSalvarClique = () => {
    const valorLimpo = valor.trim();
    if (valorLimpo === '') {
      onSalvar('');
      return;
    }
    const num = parseInt(valorLimpo, 10);
    if (!isNaN(num)) {
      const verificado = Math.max(0, Math.min(100, num));
      onSalvar(verificado.toString());
    }
  };

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={3}
        value={valor}
        onChange={handleChange}
        placeholder="0-100"
        autoComplete="off"
        spellCheck={false}
        className="w-16 h-[34px] text-center bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg font-black text-xs text-slate-800 focus:outline-none"
      />
      <button
        type="button"
        onClick={handleSalvarClique}
        className="h-[34px] px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase transition-colors"
      >
        OK
      </button>
    </div>
  );
}
