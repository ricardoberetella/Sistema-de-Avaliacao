// src/components/InputNota.tsx
import React, { useEffect, useState } from 'react';

interface InputNotaProps {
  valorInicial: string;
  onSalvar: (val: string) => void;
}

export default function InputNota({ valorInicial, onSalvar }: InputNotaProps) {
  // Estado local isolado armazena o texto livremente durante a digitação
  const [texto, setTexto] = useState<string>('');

  // Sincroniza apenas quando o valor inicial do banco realmente mudar
  useEffect(() => {
    setTexto(valorInicial || '');
  }, [valorInicial]);

  // Debounce: Espera o usuário parar de digitar por 1 segundo antes de salvar no Firebase
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (texto !== valorInicial) {
        onSalvar(texto);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [texto, valorInicial, onSalvar]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;

    // Se apagar tudo, permite ficar em branco
    if (inputVal === '') {
      setTexto('');
      return;
    }

    // Remove qualquer coisa que não seja número
    const apenasNumeros = inputVal.replace(/\D/g, '');
    if (apenasNumeros === '') return;

    // Força o teto regulamentar de 0 a 100 do SENAI
    const num = parseInt(apenasNumeros, 10);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setTexto(num.toString());
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={3}
      value={texto}
      onChange={handleChange}
      placeholder="0-100"
      autoComplete="off"
      spellCheck={false}
      className="w-24 h-[38px] text-center bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-black text-xs text-slate-800 focus:outline-none transition-all shadow-sm"
    />
  );
}
