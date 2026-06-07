// src/components/InputNota.tsx
import React, { useState, useEffect } from 'react';

interface InputNotaProps {
  valorInicial: string;
  onSalvar: (val: string) => void;
}

export default function InputNota({ valorInicial, onSalvar }: InputNotaProps) {
  const [localVal, setLocalVal] = useState(valorInicial);

  // Sincroniza o componente caso o valor vindo do Firebase mude externamente
  useEffect(() => {
    setLocalVal(valorInicial);
  }, [valorInicial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    // 1. Permite o ponto ou a vírgula para não travar teclados numéricos de telemóveis/computadores
    input = input.replace('.', ',');

    // 2. Permite digitar livremente apenas números e uma única vírgula
    // (Impede letras ou segundas vírgulas de entrarem no estado e quebrarem o fluxo)
    const partes = input.split(',');
    if (partes.length > 2) return; 

    // Remove qualquer caracter inválido
    const filtrado = input.replace(/[^0-9,]/g, '');
    setLocalVal(filtrado);
  };

  const executarSalvar = () => {
    if (!localVal.trim()) {
      if (valorInicial !== '') onSalvar('');
      return;
    }

    // Converte temporariamente para formato numérico padrão (ponto) para validação matemática
    let stringParaFloat = localVal.replace(',', '.');
    let numero = parseFloat(stringParaFloat);

    if (isNaN(numero)) {
      setLocalVal(valorInicial);
      return;
    }

    // 3. Validação estrita do limite superior: não permite passar de 100
    if (numero > 100) {
      numero = 100;
    }
    // 4. Validação estrita do limite inferior: não permite notas negativas
    if (numero < 0) {
      numero = 0;
    }

    // 5. Ajusta para string limitando a no máximo 3 casas decimais matematicamente
    // Se for um número inteiro (ex: 85), mantém limpo como "85". Se for decimal, limita a 3 casas.
    let valorFinalString = String(Number(numero.toFixed(3))).replace('.', ',');

    setLocalVal(valorFinalString);

    if (valorFinalString !== valorInicial) {
      onSalvar(valorFinalString);
    }
  };

  return (
    <div className="relative">
      <style>{`
        /* Remove de forma absoluta as setas nativas do navegador */
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
