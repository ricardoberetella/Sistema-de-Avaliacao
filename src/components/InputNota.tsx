import React, { useState } from 'react';

interface InputNotaProps {
  valorInicial: string;
  onSalvar: (val: string) => void;
}

export default function InputNota({
  valorInicial,
  onSalvar
}: InputNotaProps) {

  const [localVal, setLocalVal] = useState(valorInicial);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value;

    valor = valor.replace(/[^0-9,]/g, '');

    const partes = valor.split(',');
    if (partes.length > 2) return;

    setLocalVal(valor);
  };

  const executarSalvar = () => {
    let valor = localVal.trim();

    if (valor === '') {
      onSalvar('');
      return;
    }

    let numero = parseFloat(valor.replace(',', '.'));

    if (isNaN(numero)) return;

    if (numero > 100) numero = 100;
    if (numero < 0) numero = 0;

    const finalValor = String(numero).replace('.', ',');

    setLocalVal(finalValor);
    onSalvar(finalValor);
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
