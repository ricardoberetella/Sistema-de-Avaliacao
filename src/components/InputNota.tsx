// src/components/InputNota.tsx
import React, { useRef, useEffect } from 'react';

interface InputNotaProps {
  valorInicial: string;
  onSalvar: (val: string) => void;
}

export default function InputNota({ valorInicial, onSalvar }: InputNotaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincroniza o valor do input sempre que o valor inicial vindo do banco mudar
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = valorInicial;
    }
  }, [valorInicial]);

  const tratarValidacaoETeclado = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    let val = input.value;

    // 1. Converte ponto em vírgula para a visualização
    val = val.replace('.', ',');

    // 2. Remove tudo o que não for número ou vírgula
    val = val.replace(/[^0-9,]/g, '');

    // 3. Garante apenas uma vírgula no texto todo
    const partes = val.split(',');
    if (partes.length > 2) {
      val = partes[0] + ',' + partes.slice(1).join('');
    }

    // 4. Limita a digitação a no máximo 3 casas decimais
    if (partes.length === 2 && partes[1].length > 3) {
      val = partes[0] + ',' + partes[1].substring(0, 3);
    }

    // 5. Valida matematicamente o teto limite de 100
    const valorNumerico = parseFloat(val.replace(',', '.'));
    if (!isNaN(valorNumerico) && valorNumerico > 100) {
      val = '100';
    }

    input.value = val;
  };

  const dispararSalvar = () => {
    if (inputRef.current) {
      const valorFinal = inputRef.current.value;
      if (valorFinal !== valorInicial) {
        onSalvar(valorFinal);
      }
    }
  };

  return (
    <div className="relative">
      <style>{`
        /* Remove setas nativas de inputs em todos os navegadores */
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
        ref={inputRef}
        type="text"
        inputMode="decimal"
        defaultValue={valorInicial}
        onInput={tratarValidacaoETeclado}
        onBlur={dispararSalvar}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            dispararSalvar();
            e.currentTarget.blur();
          }
        }}
        placeholder="0,000"
        className="input-nota-blindado w-24 h-[38px] text-center bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-black text-xs text-slate-800 focus:outline-none transition-all shadow-inner"
      />
    </div>
  );
}
