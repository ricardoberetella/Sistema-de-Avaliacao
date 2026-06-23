// src/components/LinhaAlunoAvaliacao.tsx
import React, { useMemo } from 'react';
import { Aluno, NivelDesempenho } from '../types';
import { CAPACIDADES_OFICIAIS } from '../utils';

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

// Listas e mapas isolados fora do componente para otimização de memória
const RUBRICAS_LISTA: NivelDesempenho[] = ['NSA', 'APO', 'PAR', 'AUT'];

// Alterado de 'MAPA' para 'MAP'
const UCS_LISTA = ['FUSI', 'CRD', 'LIDT', 'MAP'] as const;

const NOTAS_MAPEADAS: Record<NivelDesempenho, string> = {
  NSA: '25',
  APO: '45',
  PAR: '80',
  AUT: '100'
};

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

  const resultadosUcs = useMemo(() => {
    const avaliacoes = aluno.avaliacoes || {};
    
    // Inicialização da estrutura trocada para MAP
    const resultado: Record<string, { rubrica: string; nota: string }> = {
      FUSI: { rubrica: '-', nota: '-' },
      CRD: { rubrica: '-', nota: '-' },
      LIDT: { rubrica: '-', nota: '-' },
      MAP: { rubrica: '-', nota: '-' }
    };

    UCS_LISTA.forEach((ucId) => {
      const contagem: Record<NivelDesempenho, number> = { NSA: 0, APO: 0, PAR: 0, AUT: 0 };
      let avaliouAlguma = false;

      CAPACIDADES_OFICIAIS.forEach((cap) => {
        if (cap.ucId === ucId) {
          const r = avaliacoes[cap.id];
          if (r === 'NSA' || r === 'APO' || r === 'PAR' || r === 'AUT') {
            contagem[r]++;
            avaliouAlguma = true;
          }
        }
      });

      if (!avaliouAlguma) return;

      let rubricaVencedora: NivelDesempenho = 'NSA';
      let maxContagem = -1;

      RUBRICAS_LISTA.forEach((nivel) => {
        const qtd = contagem[nivel];
        if (qtd >= maxContagem && qtd > 0) {
          maxContagem = qtd;
          rubricaVencedora = nivel;
        }
      });

      resultado[ucId] = {
        rubrica: rubricaVencedora,
        nota: NOTAS_MAPEADAS[rubricaVencedora]
      };
    });

    return resultado;
  }, [aluno.avaliacoes]);

  const getCorRubrica = (nivel: NivelDesempenho) => {
    switch (nivel) {
      case 'NSA': return 'bg-red-600 text-white border-red-600';
      case 'APO': return 'bg-orange-500 text-white border-orange-500';
      case 'PAR': return 'bg-blue-600 text-white border-blue-600';
      case 'AUT': return 'bg-emerald-600 text-white border-emerald-600';
      default: return 'bg-white text-slate-600 border-slate-200';
    }
  };

  const getCorTextoRubrica = (nivel: string | null) => {
    switch (nivel) {
      case 'NSA': return 'text-red-600';
      case 'APO': return 'text-orange-500';
      case 'PAR': return 'text-blue-600';
      case 'AUT': return 'text-emerald-600';
      default: return 'text-slate-400';
    }
  };

  const handleCliqueRubrica = (nivel: NivelDesempenho) => {
    const jaEstaAtivo = rubricaAtual === nivel;
    const novoNivel = jaEstaAtivo ? '' : nivel;
    const novaNota = novoNivel ? NOTAS_MAPEADAS[novoNivel] : '';

    handleDefinirRubrica(aluno.id, capacidadeId, novoNivel);
    handleMudarNotaNumerica(aluno.id, capacidadId => capacidadeId, novaNota);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Estudante</span>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">
            <span className="text-blue-600 mr-1.5">{String(index).padStart(2, '0')}.</span>
            {aluno.nome}
          </h4>
        </div>

        <div className="flex flex-wrap gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          {UCS_LISTA.map((uc) => (
            <div key={uc} className="text-center px-3 py-1 bg-white rounded-lg shadow-2xs border border-slate-200/60 min-w-[54px]">
              <span className="text-[9px] font-black text-slate-400 block tracking-tight">{uc}</span>
              <div className="flex flex-col items-center justify-center mt-0.5 leading-none">
                <span className={`text-[10px] font-black ${getCorTextoRubrica(resultadosUcs[uc].rubrica)}`}>
                  {resultadosUcs[uc].rubrica}
                </span>
                <span className="text-[9px] font-bold text-slate-500 mt-0.5">
                  {resultadosUcs[uc].nota}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 self-start lg:self-center">
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

      <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          {RUBRICAS_LISTA.map((nivel) => {
            const ativo = rubricaAtual === nivel;
            return (
              <button
                key={nivel}
                type="button"
                onClick={() => handleCliqueRubrica(nivel)}
                className={`w-14 h-9 font-black text-xs rounded-xl border-2 uppercase transition-all ${
                  ativo ? getCorRubrica(nivel) : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                }`}
              >
                {nivel}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-4 h-9 rounded-xl border border-slate-200">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Nota Automática:
          </span>
          <span className={`text-sm font-black tracking-tight min-w-[28px] text-center ${getCorTextoRubrica(rubricaAtual)}`}>
            {notaNumerica || '-'}
          </span>
        </div>
      </div>

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
