// src/components/InputNota.tsx

import React, { useState } from 'react';

interface InputNotaProps {
  valorInicial: string;
  onSalvar: (val: string) => void;
}

export default function InputNota({
  valorInicial,
  onSalvar,
}: InputNotaProps) {
  const [valor, setValor] = useState(valorInicial || '');

  const salvar = () => {
    let texto = valor.trim();

    if (texto === '') {
      onSalvar('');
      return;
    }

    let numero = Number(texto.replace(',', '.'));

    if (isNaN(numero)) {
      return;
    }

    if (numero < 0) numero = 0;
    if (numero > 100) numero = 100;

    const finalValor = String(numero).replace('.', ',');

    setValor(finalValor);
    onSalvar(finalValor);
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={valor}
      onChange={(e) => {
        const novo = e.target.value
          .replace('.', ',')
          .replace(/[^0-9,]/g, '');

        const partes = novo.split(',');

        if (partes.length > 2) return;

        setValor(novo);
      }}
      onBlur={salvar}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          salvar();
        }
      }}
      placeholder="0"
      className="w-24 h-[38px] text-center bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-black text-xs text-slate-800 focus:outline-none"
    />
  );
}
