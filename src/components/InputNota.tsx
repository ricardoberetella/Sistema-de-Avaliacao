import React, { useEffect, useState } from 'react';

interface InputNotaProps {
  valorInicial: string;
  onSalvar: (val: string) => void;
}

export default function InputNota({
  valorInicial,
  onSalvar,
}: InputNotaProps) {
  const [valor, setValor] = useState('');

  useEffect(() => {
    setValor((atual) => {
      if (atual === valorInicial) return atual;
      return valorInicial || '';
    });
  }, [valorInicial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let novo = e.target.value;

    novo = novo.replace('.', ',');
    novo = novo.replace(/[^0-9,]/g, '');

    const partes = novo.split(',');
    if (partes.length > 2) return;

    setValor(novo);
  };

  const salvar = () => {
    if (valor.trim() === '') {
      onSalvar('');
      return;
    }

    const numero = parseFloat(valor.replace(',', '.'));

    if (isNaN(numero)) return;

    const limitado = Math.max(0, Math.min(100, numero));

    const textoFinal = String(limitado).replace('.', ',');

    setValor(textoFinal);

    if (textoFinal !== valorInicial) {
      onSalvar(textoFinal);
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={valor}
      onChange={handleChange}
      onBlur={salvar}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          salvar();
          (e.target as HTMLInputElement).blur();
        }
      }}
      placeholder="0"
      autoComplete="off"
      spellCheck={false}
      className="w-24 h-[38px] text-center bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-black text-xs text-slate-800 focus:outline-none"
    />
  );
}
