// src/components/LinhaAlunoAvaliacao.tsx
import React from 'react';
import { Aluno, NivelDesempenho } from '../types';

interface LinhaAlunoAvaliacaoProps {
  aluno: Aluno;
  index: number;
  capacidadeId: string;
  handleExcluirAluno: (alunoId: string, nomeAluno: string) => void;
  handleEditarAluno: (alunoId: string, nomeAtual: string) => void;
  handleDefinirRubrica: (alunoId: string, capacidadeId: string, nivel: NivelDesempenho | '') => void;
  handleMudarNotaNumerica: (alunoId: string, capacidadeId: string, valor: string) => void;
  handleMudarObservacao: (alunoId: string, capacidadeId: string, texto: string) => void;
}

export default function LinhaAlunoAvaliacao({
  aluno,
  index,
  capacidadeId,
  handleExcluirAluno,
  handleEditarAluno,
  handleDefinirRubrica,
  handleMudarNotaNumerica,
  handleMudarObservacao,
}: LinhaAlunoAvaliacaoProps) {
  
  const rubricaAtual = aluno.avaliacoes?.[capacidadeId] || null;
  const notaNumerica = aluno.notasNumericas?.[capacidadeId] || '';
  const observacao = aluno.observacoes?.[capacidadeId] || '';

  const rubricas: NivelDesempenho[] = ['NSA', 'APO', 'PAR', 'AUT'];

  const getCorRubrica = (nivel: NivelDesempenho) => {
    switch (nivel) {
      case 'NSA': return 'bg-red-600 text-white border-red-600';
      case 'APO': return 'bg-orange-500 text-white border-orange-500';
      case 'PAR': return 'bg-blue-600 text-white border-blue-600';
      case 'AUT': return 'bg-emerald-600 text-white border-emerald-600';
      default: return 'bg-white text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      
      {/* Cabeçalho da Linha do Aluno */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Estudante</span>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">
            <span className="text-blue-600 mr-1.5">{String(index).padStart(2, '0')}.</span>
            {aluno.nome}
          </h4>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => handleEditarAluno(aluno.id, aluno.nome)}
            className="px-3 h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] rounded-lg uppercase tracking-wider transition-colors flex items-center gap-1"
          >
            ✏️ Editar
          </button>
          <button
            type="button"
            onClick={() => handleExcluirAluno(aluno.id, aluno.nome)}
            className="px-3 h-8 bg-red-5 font-black text-[10px] text-red-600 hover:bg-red-100 rounded-lg uppercase tracking-wider transition-colors"
          >
            Excluir Aluno 🗑️
          </button>
        </div>
      </div>

      {/* Controles de Notas e Rubricas */}
      <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          {rubricas.map((nivel) => {
            const ativo = rubricaAtual === nivel;
            return (
              <button
                key={nivel}
                type="button"
                onClick={() => handleDefinirRubrica(aluno.id, capacidadeId, ativo ? '' : nivel)}
                className={`w-14 h-9 font-black text-xs rounded-xl border-2 uppercase transition-all ${
                  ativo ? getCorRubrica(nivel) : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                }`}
              >
                {nivel}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Nota Numérica (0-100):
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={notaNumerica}
            onChange={(e) => handleMudarNotaNumerica(aluno.id, capacidadeId, e.target.value)}
            className="w-20 h-9 px-3 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-xl font-bold text-center text-xs text-slate-800"
            placeholder="-"
          />
        </div>
      </div>

      {/* Campo de Evidências */}
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
          Evidências / Observações de Desempenho
        </label>
        <textarea
          value={observacao}
          onChange={(e) => handleMudarObservacao(aluno.id, capacidadeId, e.target.value)}
          placeholder="Descreva pontos de atenção ou conquistas do estudante nesta capacidade técnica..."
          className="w-full min-h-[70px] p-3 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-xl text-xs font-medium text-slate-700 placeholder-slate-400 resize-y focus:outline-none"
        />
      </div>

    </div>
  );
}
