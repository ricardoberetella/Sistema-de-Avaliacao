import React from 'react';
import { UnidadeCurricular } from '../types';

interface SubjectCardProps {
  uc: UnidadeCurricular;
  onClick: () => void;
}

export default function SubjectCard({ uc, onClick }: SubjectCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between border-l-4 border-l-blue-600 active:scale-[0.98]"
    >
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
          {uc.sigla}
        </span>
        <h3 className="text-lg font-bold text-slate-800 mt-3">{uc.nome}</h3>
      </div>
      <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
        <span>Matriz SENAI por Níveis</span>
        <span className="text-blue-600 font-semibold">
          Abrir Avaliação &rarr;
        </span>
      </div>
    </div>
  );
}
