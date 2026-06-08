// src/components/LinhaAlunoAvaliacao.tsx
import React from 'react';
import { Aluno, NivelDesempenho } from '../types';

interface LinhaAlunoAvaliacaoProps {
  aluno: Aluno;
  capacidadeId: string;
  handleExcluirAluno: (id: string, nome: string) => void;
  handleDefinirRubrica: (alunoId: string, capacidadeId: string, nivel: NivelDesempenho) => void;
  handleMudarObservacao: (alunoId: string, capacidadeId: string, texto: string) => void;
}

export default function LinhaAlunoAvaliacao({
  aluno,
  capacidadeId,
  handleExcluirAluno,
  handleDefinirRubrica,
  handleMudarObservacao,
}: LinhaAlunoAvaliacaoProps) {
  
  const avaliacoes = aluno.avaliacoes || {};
  const observacoes = aluno.observacoes || {};

  const rubricaAtiva = avaliacoes[capacidadeId] || null;
  const obsAtiva = observacoes[capacidadeId] || '';

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Estudante</span>
          <span className="text-sm font-black text-slate-800 uppercase">{aluno.nome}</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {/* CRITÉRIOS OFICIAIS SMO */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(['NSA', 'APO', 'PAR', 'AUT'] as NivelDesempenho[]).map((nivel) => {
              const ativo = rubricaAtiva === nivel;
              let corAtivo = 'bg-blue-600 text-white';
              if (nivel === 'AUT') corAtivo = 'bg-emerald-600 text-white';
              if (nivel === 'NSA') corAtivo = 'bg-slate-600 text-white';

              return (
                <button
                  key={nivel}
                  type="button"
                  onClick={() => handleDefinirRubrica(aluno.id, capacidadeId, nivel)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${ativo ? corAtivo : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  {nivel}
                </button>
              );
            })}
          </div>

          {/* EXCLUIR ESTUDANTE */}
          <button
            type="button"
            onClick={() => handleExcluirAluno(aluno.id, aluno.nome)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-xs font-bold uppercase"
          >
            Excluir 🗑️
          </button>
        </div>
      </div>

      {/* EVIDÊNCIAS / OBSERVAÇÕES */}
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Evidências / Observações de Desempenho</label>
        <textarea
          value={obsAtiva}
          onChange={(e) => handleMudarObservacao(aluno.id, capacidadeId, e.target.value)}
          placeholder="Descreva pontos de atenção ou conquistas do estudante nesta capacidade técnica..."
          className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none transition-all resize-none h-20"
        />
      </div>
    </div>
  );
}
