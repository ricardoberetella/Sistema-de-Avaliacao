// src/components/CapacidadeCard.tsx
import React from 'react';
import { CapacidadeTecnica } from '../types';

interface CapacidadeCardProps {
  key: string; // Adicionado para resolver o erro TS2322 do build
  capacidade: CapacidadeTecnica;
  alunosAvaliados: number;
  alunosAutonomos: number;
  totalAlunos: number;
  onClick: () => void;
}

export default function CapacidadeCard({
  capacidade,
  alunosAvaliados,
  alunosAutonomos,
  totalAlunos,
  onClick
}: CapacidadeCardProps) {
  // Evita divisão por zero se a turma estiver vazia
  const percentualAvaliado = totalAlunos > 0 ? Math.round((alunosAvaliados / totalAlunos) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className="bg-white p-6 rounded-[20px] border border-slate-200 text-left transition-all hover:shadow-md hover:border-blue-400 group flex flex-col justify-between min-h-[180px] w-full"
    >
      <div>
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

      <div className="mt-4 pt-3 border-t border-slate-100 w-full grid grid-cols-2 gap-2 text-center">
        <div className="bg-slate-50 p-2 rounded-xl">
          <span className="text-[9px] font-black text-slate-400 block tracking-tight uppercase">AVALIADOS</span>
          <span className="text-xs font-black text-slate-800">{alunosAvaliados}/{totalAlunos} ({percentualAvaliado}%)</span>
        </div>
        <div className="bg-emerald-50 p-2 rounded-xl">
          <span className="text-[9px] font-black text-emerald-600 block tracking-tight uppercase">AUTÔNOMOS</span>
          <span className="text-xs font-black text-emerald-700">{alunosAutonomos}</span>
        </div>
      </div>
    </button>
  );
}
