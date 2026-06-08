// src/components/CapacidadeCard.tsx
import React from 'react';
import { CapacidadeTecnica, NivelDesempenho } from '../types';

interface CapacidadeCardProps {
  capacidade: CapacidadeTecnica;
  contagemRubricas: Record<NivelDesempenho, number>;
  totalAlunos: number;
  onClick: () => void;
}

export default function CapacidadeCard({
  capacidade,
  contagemRubricas,
  totalAlunos,
  onClick,
}: CapacidadeCardProps) {
  
  // Calcula o progresso baseado em quantos alunos já têm alguma rubrica definida
  const avaliados = contagemRubricas.NSA + contagemRubricas.APO + contagemRubricas.PAR + contagemRubricas.AUT;
  const porcentagem = totalAlunos > 0 ? Math.round((avaliados / totalAlunos) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white p-5 rounded-[22px] border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 text-left transition-all flex flex-col justify-between min-h-[220px] group"
    >
      {/* Topo do Card */}
      <div className="space-y-2 w-full">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black bg-blue-50 text-[#004fa3] px-2.5 py-1 rounded-md tracking-wider uppercase">
            {capacidade.codigo}
          </span>
          <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-500 transition-colors uppercase">
            Abrir Diário →
          </span>
        </div>
        <p className="text-xs font-bold text-slate-700 line-clamp-3 uppercase leading-relaxed">
          {capacidade.descricao}
        </p>
      </div>

      {/* Indicadores de Rubricas Acumuladas e Progresso da Capacidade */}
      <div className="w-full pt-4 border-t border-slate-100 space-y-3 mt-4">
        
        {/* MINI PAINEL DE RUBRICAS ACUMULADAS DA CAPACIDADE */}
        <div className="grid grid-cols-4 gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-100 text-center">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-red-500">NSA</span>
            <span className="text-xs font-black text-slate-800">{contagemRubricas.NSA}</span>
          </div>
          <div className="flex flex-col border-l border-slate-200">
            <span className="text-[9px] font-black text-orange-500">APO</span>
            <span className="text-xs font-black text-slate-800">{contagemRubricas.APO}</span>
          </div>
          <div className="flex flex-col border-l border-slate-200">
            <span className="text-[9px] font-black text-blue-500">PAR</span>
            <span className="text-xs font-black text-slate-800">{contagemRubricas.PAR}</span>
          </div>
          <div className="flex flex-col border-l border-slate-200">
            <span className="text-[9px] font-black text-emerald-500">AUT</span>
            <span className="text-xs font-black text-slate-800">{contagemRubricas.AUT}</span>
          </div>
        </div>

        {/* BARRA DE PROGRESSO */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
            <span>Progresso</span>
            <span className="text-slate-700">{porcentagem}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: `${porcentagem}%` }}
            />
          </div>
        </div>

      </div>
    </button>
  );
}
