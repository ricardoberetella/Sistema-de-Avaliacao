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
  // Mantém o controle do que está sendo digitado sem sofrer interferência do estado do App
  const [valor, setValor] = useState('');

  // Sincroniza o valor do input apenas quando o valor inicial vindo do Firebase mudar externamente
  useEffect(() => {
    setValor(valorInicial || '');
  }, [valorInicial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novo = e.target.value;

    // Permite que o campo fique vazio (usuário apagando com backspace)
    if (novo === '') {
      setValor('');
      return;
    }

    // Filtra e mantém apenas dígitos numéricos (remove letras, pontos, vírgulas)
    const apenasNumeros = novo.replace(/\D/g, '');
    if (apenasNumeros === '') return;

    // Converte para inteiro para validar os limites permitidos (0 a 100)
    const numero = parseInt(apenasNumeros, 10);
    if (!isNaN(numero) && numero >= 0 && numero <= 100) {
      setValor(numero.toString());
    }
  };

  const executarSalvar = () => {
    const valorLimpo = valor.trim();

    // Se o usuário limpou o campo, salva como vazio no banco
    if (valorLimpo === '') {
      if (valorInicial !== '') {
        onSalvar('');
      }
      return;
    }

    const numero = parseInt(valorLimpo, 10);
    if (isNaN(numero)) return;

    // Garante a trava de segurança regulamentar de 0 a 100
    const limitado = Math.max(0, Math.min(100, numero));
    const textoFinal = String(limitado);

    setValor(textoFinal);

    // Só envia para o App/Firebase se o valor de fato mudou, evitando requisições redundantes
    if (textoFinal !== valorInicial) {
      onSalvar(textoFinal);
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={3} // Impede fisicamente digitar mais de 3 caracteres (Teto de 100)
      value={valor}
      onChange={handleChange}
      onBlur={executarSalvar} // Salva apenas ao sair do campo
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          executarSalvar();
          e.currentTarget.blur(); // Remove o foco para aplicar o fechamento visual padrão
        }
      }}
      placeholder="0-100"
      autoComplete="off"
      spellCheck={false}
      className="w-24 h-[38px] text-center bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-black text-xs text-slate-800 focus:outline-none transition-all shadow-sm"
    />
  );
}
