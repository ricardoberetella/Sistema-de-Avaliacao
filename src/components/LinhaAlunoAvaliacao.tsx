// src/components/LinhaAlunoAvaliacao.tsx
import React from 'react';
import { Aluno, NivelDesempenho } from '../types';

interface LinhaAlunoAvaliacaoProps {
  aluno: Aluno;
  capacidadeId: string;
  handleExcluirAluno: (id: string, nome: string) => void;
  handleMudarNotaNumerica: (alunoId: string, capacidadeId: string, valor: string) => void;
  handleDefinirRubrica: (alunoId: string, capacidadeId: string, nivel: NivelDesempenho) => void;
  handleMudarObservacao: (alunoId: string, capacidadeId: string, texto: string) => void;
}

export default function LinhaAlunoAvaliacao({
  aluno,
  capacidadeId,
  handleExcluirAluno,
  handleMudarNotaNumerica,
  handleDefinirRubrica,
  handleMudarObservacao,
}: LinhaAlunoAvaliacaoProps) {
  
  const avaliacoes = aluno.avaliacoes || {};
  const observacoes = aluno.observacoes || {};
  const notasNumericas = aluno.notasNumericas || {};

  const rubricaAtiva = avaliacoes[capacidadeId] || null;
  const obsAtiva = observacoes[capacidadeId] || '';
  const notaAtiva = notasNumericas[capacidadeId] || '';

  const abrirPromptNota = () => {
    const resposta = window.prompt(`Digite a nota de 0 a 100 para ${aluno.nome}:`, notaAtiva);
    
    if (resposta === null) return;

    if (resposta === '') {
      handleMudarNotaNumerica(aluno.id, capacidadeId, '');
      return;
    }

    const num = parseInt(resposta, 10);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      handleMudarNotaNumerica(aluno.id, capacidadeId, num.toString());
    } else {
      window.alert('Por favor, digite um número válido entre 0 e 100.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Estudante</span>
          <span className="text-sm font-black text-slate-800 uppercase">{aluno.nome}</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {/* CRITÉRIOS OFICIAIS SMO - CORRIGIDO AQUI */}
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

          {/* CAMPO DE NOTA SIMPLES */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={abrirPromptNota}
              className="px-3 h-[36px] bg-slate-800 text-white font-black text-[10px] rounded-xl uppercase hover:bg-slate-700 transition-colors"
            >
              Nota
            </button>
            <div className="w-12 h-[36px] bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center font-black text-xs text-slate-800">
              {notaAtiva || '-'}
            </div>
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
          onChange={(e) => handleMudarObservation(aluno.id, capacidadeId, e.target.value)}
          placeholder="Descreva pontos de atenção ou conquistas do estudante nesta capacidade técnica..."
          className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none transition-all resize-none h-20"
        />
      </div>
    </div>
  );
}
