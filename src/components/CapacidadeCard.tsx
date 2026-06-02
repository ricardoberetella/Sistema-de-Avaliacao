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

export default function CapacidadeCard({
  capacidade,
  contagemRubricas,
  totalAlunos,
  onClick
}: CapacidadeCardProps) {
  
  const totalAvaliados = contagemRubricas.NSA + contagemRubricas.APO + contagemRubricas.PAR + contagemRubricas.AUT;
  const porcentagemAgendada = totalAlunos > 0 ? Math.round((totalAvaliados / totalAlunos) * 100) : 0;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[20px] p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between min-h-[210px] group"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="bg-blue-50 text-[#004fa3] text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase group-hover:bg-[#004fa3] group-hover:text-white transition-colors">
            {capacidade.codigo}
          </span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
            {porcentagemAgendada}% Avaliado
          </span>
        </div>

        <p className="text-xs font-bold text-slate-700 line-clamp-3 leading-relaxed uppercase">
          {capacidade.descricao}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="grid grid-cols-4 gap-1 text-center">
          <div className="bg-red-50 p-1.5 rounded-lg border border-red-100">
            <span className="block text-[9px] font-black text-red-500 uppercase tracking-tighter">NSA</span>
            <span className="text-xs font-black text-red-700">{contagemRubricas.NSA}</span>
          </div>
          <div className="bg-amber-50 p-1.5 rounded-lg border border-amber-100">
            <span className="block text-[9px] font-black text-amber-600 uppercase tracking-tighter">APO</span>
            <span className="text-xs font-black text-amber-700">{contagemRubricas.APO}</span>
          </div>
          <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-100">
            <span className="block text-[9px] font-black text-blue-500 uppercase tracking-tighter">PAR</span>
            <span className="text-xs font-black text-blue-700">{contagemRubricas.PAR}</span>
          </div>
          <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
            <span className="block text-[9px] font-black text-emerald-500 uppercase tracking-tighter">AUT</span>
            <span className="text-xs font-black text-emerald-700">{contagemRubricas.AUT}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
