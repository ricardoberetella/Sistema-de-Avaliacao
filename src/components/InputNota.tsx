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

    // 1. Transforma qualquer ponto em vírgula para manter o padrão visual
    input = input.replace('.', ',');

    // 2. Permite apenas números e uma única vírgula acompanhada de até 3 casas decimais
    // Se o que o usuário digitou não bater com essa regra, a alteração é rejeitada
    const regexValidacao = /^(100(,0{0,3})?|[0-9]{0,2}(,[0-9]{0,3})?)$/;
    
    if (input === '' || regexValidacao.test(input)) {
      setLocalVal(input);
    }
  };

  const executarSalvar = () => {
    if (localVal !== valorInicial) {
      onSalvar(localVal);
    }
  };

  return (
    <div className="relative">
      <style>{`
        /* Remove setas nativas dos navegadores */
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
