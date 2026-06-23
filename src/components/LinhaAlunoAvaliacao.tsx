// src/components/LinhaAlunoAvaliacao.tsx
import React from 'react';
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

  // Função interna para calcular a média de cada Unidade Curricular do aluno
  const obtenerMediasPorUC = () => {
    const notas = aluno.notasNumericas || {};
    const acumulador: Record<string, { soma: number; qtd: number }> = {
      FUSI: { soma: 0, qtd: 0 },
      CRD: { soma: 0, qtd: 0 },
      LIDT: { soma: 0, qtd: 0 },
      CIEMA: { soma: 0, qtd: 0 },
    };

    CAPACIDADES_OFICIAIS.forEach((cap) => {
      const notaStr = notas[cap.id];
      if (notaStr && notaStr.trim() !== '') {
        const valorFloat = parseFloat(notaStr.replace(',', '.'));
        if (!isNaN(valorFloat) && acumulador[cap.ucId]) {
          acumulador[cap.ucId].soma += valorFloat;
          acumulador[cap.ucId].qtd += 1;
        }
      }
    });

    const resultado: Record<string, string> = {};
    Object.keys(acumulador).forEach((uc) => {
      const dados = acumulador[uc];
      if (dados.qtd > 0) {
        const media = dados.soma / dados.qtd;
        resultado[uc] = String(Math.round(media));
      } else {
        resultado[uc] = '-';
      }
    });

    return resultado;
  };

  const medias = obtenerMediasPorUC();

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

  // Mapeamento de notas baseado na rubrica selecionada
  const obterNotaPorRubrica = (nivel: NivelDesempenho | '') => {
    switch (nivel) {
      case 'NSA': return '25';
      case 'APO': return '45';
      case 'PAR': return '80';
      case 'AUT': return '100';
      default: return '';
    }
  };

  // Centraliza o clique para despachar a rubrica e a nota equivalente ao mesmo tempo
  const handleCliqueRubrica = (nivel: NivelDesempenho) => {
    const jaEstaAtivo = rubricaAtual === nivel;
    const novoNivel = jaEstaAtivo ? '' : nivel;
    const novaNota = obterNotaPorRubrica(novoNivel);

    handleDefinirRubrica(aluno.id, capacidadeId, novoNivel);
    handleMudarNotaNumerica(aluno.id, capacidadeId, novaNota);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      
      {/* Cabeçalho da Linha do Aluno */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Estudante</span>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">
            <span className="text-blue-600 mr-1.5">{String(index).padStart(2, '0')}.</span>
            {aluno.nome}
          </h4>
        </div>

        {/* Bloco de Médias por UC */}
        <div className="flex flex-wrap gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          {(['FUSI', 'CRD', 'LIDT', 'CIEMA'] as const).map((uc) => (
            <div key={uc} className="text-center px-2.5 py-1 bg-white rounded-lg shadow-2xs border border-slate-200/60">
              <span className="text-[9px] font-black text-slate-400 block tracking-tight">{uc}</span>
              <span className="text-xs font-black text-slate-700">{medias[uc]}</span>
            </div>
          ))}
        </div>

        {/* Botões de Ação */}
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

      {/* Controles de Notas e Rubricas */}
      <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          {rubricas.map((nivel) => {
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

        {/* Campo de Nota Automática Atualizado */}
        <div className="flex items-center gap-2 bg-slate-50 px-4 h-9 rounded-xl border border-slate-200">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Nota Automática:
          </span>
          <span className={`text-sm font-black tracking-tight min-w-[28px] text-center ${getCorTextoRubrica(rubricaAtual)}`}>
            {notaNumerica || '-'}
          </span>
        </div>
      </div>

      {/* Campo de Evidências */}
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
          Evidências / Observações de Desempenho
        </label>
        <textarea
          value={observacao}
          onChange={(e) => handleMudarObservacao(aluno.id, capacidadId, e.target.value)}
          placeholder="Descreva pontos de atenção ou conquistas do estudante nesta capacidade técnica..."
          className="w-full min-h-[70px] p-3 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-xl text-xs font-medium text-slate-700 placeholder-slate-400 resize-y focus:outline-none"
        />
      </div>

    </div>
  );
}
