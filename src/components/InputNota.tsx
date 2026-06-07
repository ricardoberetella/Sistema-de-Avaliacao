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
    let input = e.target.value;

    // 1. Padroniza transformando ponto do teclado numérico em vírgula visual
    input = input.replace('.', ',');

    // 2. Remove de imediato qualquer caractere que não seja número ou a própria vírgula
    input = input.replace(/[^0-9,]/g, '');

    // 3. Bloqueia a inserção de mais de uma vírgula
    const partes = input.split(',');
    if (partes.length > 2) {
      input = partes[0] + ',' + partes.slice(1).join('');
    }

    // 4. Regra Matemática Estrita: Corta qualquer dígito que passe de 3 casas decimais
    if (partes.length === 2 && partes[1].length > 3) {
      input = partes[0] + ',' + partes[1].substring(0, 3);
    }

    // 5. Validação Lógica de Faixa (0 a 100):
    // Converte temporariamente para float usando ponto para validar o limite real
    const valorNumerico = parseFloat(input.replace(',', '.'));
    if (!isNaN(valorNumerico) && valorNumerico > 100) {
      input = '100';
    }

    setLocalVal(input);
  };

  const executarSalvar = () => {
    // Só envia para o Firebase se o valor de fato foi alterado
    if (localVal !== valorInicial) {
      onSalvar(localVal);
    }
  };

  return (
    <div className="relative">
      <style>{`
        /* Remove de forma definitiva e absoluta as setas nativas dos navegadores */
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
        placeholder="0,000" 
        className="input-nota-blindado w-24 h-[38px] text-center bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-black text-xs text-slate-800 focus:outline-none transition-all shadow-inner"
      />
    </div>
  );
}
