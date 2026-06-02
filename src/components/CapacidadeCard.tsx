// src/components/CapacidadeCard.tsx
import React from 'react';
import { CapacidadeTecnica } from '../types';

interface CapacidadeCardProps {
  key: string;
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
  const percentualAvaliado = totalAlunos > 0 ? Math.round((totalAvaliados / totalAlunos) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className="bg-white p-5 rounded-[20px] border border-slate-200 text-left transition-all hover:shadow-md hover:border-blue-400 group flex flex-col justify-between min-h-[210px] w-full"
    >
      <div className="w-full">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-black text-[#004fa3] tracking-wider uppercase bg-blue-50 px-2.5 py-1 rounded-md">
            {capacidade.codigo}
          </span>
          <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-500 transition-colors">
            Mapear Alunos ➔
          </span>
        </div>
        <p className="text-xs font-bold text-slate-700 line-clamp-3 leading-relaxed uppercase">
          {capacidade.descricao}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-black text-slate-400 uppercase">Progresso da Turma:</span>
          <span className="text-[11px] font-black text-slate-700">{totalAvaliados}/{totalAlunos} ({percentualAvaliado}%)</span>
        </div>
        
        {/* Fileira com as 4 Rubricas Oficiais */}
        <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-black">
          <div className="bg-red-50 text-red-700 p-1 rounded-md" title="Não Satisfez">
            <span className="block text-[8px] text-red-400 uppercase">NSA</span>
            {contagemRubricas.NSA}
          </div>
          <div className="bg-amber-50 text-amber-700 p-1 rounded-md" title="Com Apoio">
            <span className="block text-[8px] text-amber-400 uppercase">APO</span>
            {contagemRubricas.APO}
          </div>
          <div className="bg-blue-50 text-blue-700 p-1 rounded-md" title="Parcial">
            <span className="block text-[8px] text-blue-400 uppercase">PAR</span>
            {contagemRubricas.PAR}
          </div>
          <div className="bg-emerald-50 text-emerald-700 p-1 rounded-md" title="Autônomo">
            <span className="block text-[8px] text-emerald-400 uppercase">AUT</span>
            {contagemRubricas.AUT}
          </div>
        </div>
      </div>
    </button>
  );
}
