import React from 'react';
import { OperacaoUsinagem } from '../types';

interface OperacaoCardProps {
  op: OperacaoUsinagem;
  concluidos: number;
  totalAlunos: number;
  onClick: () => void;
}

export default function OperacaoCard({ op, concluidos, totalAlunos, onClick }: OperacaoCardProps) {
  const porcentagem = totalAlunos > 0 ? (concluidos / totalAlunos) * 100 : 0;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[190px] active:scale-[0.99]"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-blue-600 font-black text-lg tracking-wider">
            {op.numero}
          </span>
          <span className="text-[10px] font-black tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase">
            {op.maquina}
          </span>
        </div>
        <h3 className="text-slate-800 font-black text-sm uppercase tracking-wide leading-snug max-w-[90%]">
          {op.titulo}
        </h3>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
          <span>Progresso</span>
          <span className="text-slate-500">{concluidos}/{totalAlunos}</span>
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
