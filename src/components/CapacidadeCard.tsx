import React from 'react';
import { CapacidadeTecnica } from '../types';

interface CapacidadeCardProps {
  capacidade: CapacidadeTecnica;
  alunosAvaliados: number;
  alunosAutonomos: number;
  totalAlunos: number;
  onClick: () => void;
}

export default function CapacidadeCard({ capacidade, alunosAvaliados, alunosAutonomos, totalAlunos, onClick }: CapacidadeCardProps) {
  // Calcula a porcentagem da barra de progresso dos alunos avaliados na oficina
  const porcentagem = totalAlunos > 0 ? (alunosAvaliados / totalAlunos) * 100 : 0;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[210px] active:scale-[0.99]"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-blue-600 font-black text-lg tracking-wider">
            {capacidade.codigo}
          </span>
          <span className="text-[9px] font-black tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">
            {alunosAutonomos} Autônomos
          </span>
        </div>
        <p className="text-slate-800 font-bold text-xs uppercase tracking-wide leading-snug line-clamp-4">
          {capacidade.descricao}
        </p>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
          <span>Avaliados</span>
          <span className="text-slate-500">{alunosAvaliados}/{totalAlunos}</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-[#004488] h-full transition-all duration-300"
            style={{ width: `${porcentagem}%` }}
          />
        </div>
      </div>
    </div>
  );
}
