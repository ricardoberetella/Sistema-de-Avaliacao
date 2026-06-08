// src/components/InputNota.tsx
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
    setValor(valorInicial || '');
  }, [valorInicial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novo = e.target.value;

    // 1. Permite campo vazio para que o usuário possa apagar com Backspace
    if (novo === '') {
      setValor('');
      return;
    }

    // 2. Remove qualquer caractere que não seja número (bloqueia letras, pontos e vírgulas)
    const apenasNumeros = novo.replace(/\D/g, '');
    if (apenasNumeros === '') return;

    // 3. Converte para inteiro e valida o teto da escala SENAI (máximo 100)
    const numero = parseInt(apenasNumeros, 10);
    if (!isNaN(numero) && numero >= 0 && numero <= 100) {
      setValor(numero.toString());
    }
  };

  const salvar = () => {
    if (valor.trim() === '') {
      onSalvar('');
      return;
    }

    const numero = parseInt(valor, 10);
    if (isNaN(numero)) return;

    // Garante os limites de segurança de 0 a 100
    const limitado = Math.max(0, Math.min(100, numero));
    const textoFinal = String(limitado);

    setValor(textoFinal);
    onSalvar(textoFinal);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={3} // Impede digitar mais de 3 caracteres (o máximo é 100)
      value={valor}
      onChange={handleChange}
      onBlur={salvar}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          // Tira o foco do input para acionar o salvamento visual padrão do sistema
          e.currentTarget.blur();
        }
      }}
      placeholder="0-100"
      autoComplete="off"
      spellCheck={false}
      className="w-24 h-[38px] text-center bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-black text-xs text-slate-800 focus:outline-none"
    />
  );
}
