// src/components/CapacidadeCard.tsx
import React from 'react';
import { CapacidadeTecnica } from '../types';

interface CapacidadeCardProps {
  capacidade: CapacidadeTecnica;
  contagemRubricas: {
    NSA: number;
    APO: number;
    PAR: number;
    AUT: number;
  };
  totalAlunos: number;
  onClick: () => void;
}

export default function CapacidadeCard({ capacidade, contagemRubricas, totalAlunos, onClick }: CapacidadeCardProps) {
  const avaliados = contagemRubricas.NSA + contagemRubricas.APO + contagemRubricas.PAR + contagemRubricas.AUT;
  const porcentagem = totalAlunos > 0 ? Math.round((avaliados / totalAlunos) * 100) : 0;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[20px] p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between h-[210px] group"
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="bg-blue-50 text-[#004fa3] text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider group-hover:bg-[#004fa3] group-hover:text-white transition-colors">
            {capacidade.codigo}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {avaliados}/{totalAlunos} Alunos
          </span>
        </div>
        <h3 className="text-xs font-bold text-slate-700 leading-relaxed uppercase line-clamp-3">
          {capacidade.descricao}
        </h3>
      </div>

      <div className="pt-3 border-t border-slate-100">
        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1">
          <span>Progresso</span>
          <span className="text-slate-600">{porcentagem}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full transition-all duration-500" 
            style={{ width: `${porcentagem}%` }}
          />
        </div>
      </div>
    </div>
  );
}
