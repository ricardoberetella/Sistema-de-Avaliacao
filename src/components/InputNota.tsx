// src/components/InputNota.tsx
import React, { useState, useEffect } from 'react';

interface InputNotaProps {
  valorInicial: string;
  onSalvar: (val: string) => void;
}

export default function InputNota({ valorInicial, onSalvar }: InputNotaProps) {
  const [localVal, setLocalVal] = useState(valorInicial);

  // Mantém o campo atualizado se os dados mudarem no banco de dados
  useEffect(() => {
    setLocalVal(valorInicial);
  }, [valorInicial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    // 1. Substitui ponto por vírgula para manter o padrão visual do teclado numérico
    input = input.replace('.', ',');

    // 2. Permite digitar livremente apenas números e uma única vírgula
    const partes = input.split(',');
    if (partes.length > 2) return; 

    // Remove qualquer caractere que não seja número ou vírgula
    const filtrado = input.replace(/[^0-9,]/g, '');
    setLocalVal(filtrado);
  };

  const executarSalvar = () => {
    if (!localVal.trim()) {
      if (valorInicial !== '') onSalvar('');
      return;
    }

    // Converte temporariamente para ponto para fazer as validações matemáticas do JavaScript
    let stringParaFloat = localVal.replace(',', '.');
    let numero = parseFloat(stringParaFloat);

    if (isNaN(numero)) {
      setLocalVal(valorInicial);
      return;
    }

    // 3. Validação do limite superior (Teto de 100)
    if (numero > 100) numero = 100;
    
    // 4. Validação do limite inferior (Sem notas negativas)
    if (numero < 0) numero = 0;

    // 5. Arredonda e limita a no máximo 3 casas decimais usando lógica matemática estável
    let valorFinalString = String(Number(numero.toFixed(3))).replace('.', ',');

    setLocalVal(valorFinalString);

    // Só envia para o Firebase se o valor realmente mudou
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
