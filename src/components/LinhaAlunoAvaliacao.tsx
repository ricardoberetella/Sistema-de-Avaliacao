// src/components/LinhaAlunoAvaliacao.tsx
import React from 'react';
import { Aluno, NivelDesempenho } from '../types';
import InputNota from './InputNota';
import TextareaObservacao from './TextareaObservacao';
import { getDescricaoRubrica } from '../utils';

interface LinhaAlunoAvaliacaoProps {
  aluno: Aluno;
  capacidadeId: string;
  handleExcluirAluno: (id: string, nome: string) => void;
  handleMudarNotaNumerica: (alunoId: string, capId: string, valor: string) => void;
  handleDefinirRubrica: (alunoId: string, capId: string, nivel: NivelDesempenho) => void;
  handleMudarObservacao: (alunoId: string, capId: string, texto: string) => void;
}

function LinhaAlunoComponent({
  aluno,
  capacidadeId,
  handleExcluirAluno,
  handleMudarNotaNumerica,
  handleDefinirRubrica,
  handleMudarObservacao
}: LinhaAlunoAvaliacaoProps) {
  const mapaAvaliacoes = aluno.avaliacoes || {};
  const nivelAtual = mapaAvaliacoes[capacidadeId];
  const textoObs = (aluno.observacoes && aluno.observacoes[capacidadeId]) || '';
  const valorNota = (aluno.notasNumericas && aluno.notasNumericas[capacidadeId]) || '';

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] font-black text-slate-400 block">ESTUDANTE</span>
            <span className="text-sm font-black text-slate-900 uppercase">{aluno.nome}</span>
          </div>

          <button
            type="button"
            onClick={() => handleExcluirAluno(aluno.id, aluno.nome)}
            className="p-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase hover:bg-red-100 transition-colors"
          >
            Excluir 🗑️
          </button>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 shrink-0">
          <div className="flex flex-col items-start">
            <span className="text-[9px] font-black text-slate-400 uppercase mb-1">
              Nota (0-100)
            </span>

            <InputNota
              key={`${aluno.id}-${capacidadeId}`}
              valorInicial={String(valorNota)}
              onSalvar={(novoValor) =>
                handleMudarNotaNumerica(aluno.id, capacidadeId, novoValor)
              }
            />
          </div>

          <div className="flex flex-col items-start">
            <span className="text-[9px] font-black text-slate-400 uppercase mb-1">
              Critério SMO
            </span>

            <div className="flex gap-1.5">
              {(['NSA', 'APO', 'PAR', 'AUT'] as NivelDesempenho[]).map((nivel) => (
                <button
                  key={nivel}
                  type="button"
                  onClick={() =>
                    handleDefinirRubrica(aluno.id, capacidadeId, nivel)
                  }
                  className={`px-3 py-2 h-[38px] rounded-xl text-xs font-black transition-all border ${
                    nivelAtual === nivel
                      ? nivel === 'NSA'
                        ? 'bg-red-600 text-white border-red-600'
                        : nivel === 'APO'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : nivel === 'PAR'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  {nivel}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 block mb-1">
          Evidências / Observações
        </label>

        <TextareaObservacao
          valorInicial={textoObs}
          onSalvar={(novoTexto) =>
            handleMudarObservacao(aluno.id, capacidadeId, novoTexto)
          }
        />

        {nivelAtual && (
          <p className="text-[10px] text-slate-400 font-bold italic mt-1">
            Critério ativo:{' '}
            <span className="text-slate-600">
              {getDescricaoRubrica(capacidadeId, nivelAtual)}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default React.memo(LinhaAlunoComponent);
