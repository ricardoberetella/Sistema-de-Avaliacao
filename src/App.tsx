import React, { useState } from 'react';
import { TURMAS, UNIDADES_CURRICULARES, ESTUDANTES_INICIAIS, RUBRICAS_MOCK } from './utils';
import { TurmaId, UCId, AvaliacaoEstudante } from './types';
import SubjectCard from './components/SubjectCard';

export default function App() {
  const [turmaAtiva, setTurmaAtiva] = useState<TurmaId>('MA');
  const [ucSelecionada, setUcSelecionada] = useState<UCId | null>(null);
  
  // Estado para armazenar as avaliações de forma dinâmica
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoEstudante[]>([]);

  // Filtrar estudantes pertencentes apenas à turma selecionada no canto superior
  const estudantesFiltrados = ESTUDANTES_INICIAIS.filter(e => e.turmaId === turmaAtiva);

  // Buscar a rubrica correspondente à UC selecionada
  const rubricaAtiva = RUBRICAS_MOCK.find(r => r.ucId === ucSelecionada);

  // Função para aplicar ou alterar a nota (C / NC) de um estudante em um critério específico
  const handleNotaChange = (estudanteId: number, criterioId: string, valor: 'C' | 'NC') => {
    if (!ucSelecionada) return;

    setAvaliacoes((prev) => {
      const existente = prev.find(
        (a) => a.estudanteId === estudanteId && a.turmaId === turmaAtiva && a.ucId === ucSelecionada
      );

      if (existente) {
        return prev.map((a) =>
          a.estudanteId === estudanteId && a.turmaId === turmaAtiva && a.ucId === ucSelecionada
            ? { ...a, notes: { ...a.notas, [criterioId]: a.notas[criterioId] === valor ? null : valor } }
            : a
        );
      } else {
        return [
          ...prev,
          {
            estudanteId,
            turmaId: turmaAtiva,
            ucId: ucSelecionada,
            notas: { [criterioId]: valor },
          },
        ];
      }
    });
  };

  // Obter o status atual do botão na tabela
  const getNotaStatus = (estudanteId: number, criterioId: string) => {
    const avaliacao = avaliacoes.find(
      (a) => a.estudanteId === estudanteId && a.turmaId === turmaAtiva && a.ucId === ucSelecionada
    );
    return avaliacao?.notas[criterioId] || null;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-800 font-sans">
      
      {/* HEADER DO SITE COM O SELETOR NO CANTO SUPERIOR DIREITO */}
      <header className="relative mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            SISTEMA DE AVALIAÇÃO <span className="text-blue-600">RUBRICAS</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">Metodologia de Ensino SENAI-SP</p>
        </div>

        {/* Seletor Estilo PUEP / Pills Arredondado (idêntico à imagem image_e24766.png) */}
        <div className="flex bg-[#004488] p-1.5 rounded-2xl shadow-md inline-flex self-start sm:self-center">
          {TURMAS.map((turma) => {
            const isActive = turmaAtiva === turma.id;
            return (
              <button
                key={turma.id}
                onClick={() => setTurmaAtiva(turma.id)}
                className={`px-5 py-2 text-sm font-black rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-[#004488] shadow-sm scale-100'
                    : 'text-slate-300 hover:text-white bg-transparent'
                }`}
                title={turma.nome}
              >
                {turma.id}
              </button>
            );
          })}
        </div>
      </header>

      {/* PAINEL PRINCIPAL */}
      <main>
        {/* Status da Seleção */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300">
            Filtro: <span className="text-blue-700">{TURMAS.find(t => t.id === turmaAtiva)?.nome}</span>
          </span>
          {ucSelecionada && (
            <button 
              onClick={() => setUcSelecionada(null)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              &larr; Voltar para Disciplinas
            </button>
          )}
        </div>

        {/* Fluxo 1: Menu de Escolha das 3 UCs */}
        {!ucSelecionada ? (
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Unidades Curriculares Disponíveis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {UNIDADES_CURRICULARES.map((uc) => (
                <SubjectCard
                  key={uc.id}
                  uc={uc}
                  onClick={() => setUcSelecionada(uc.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Fluxo 2: Grade de Avaliação da UC Selecionada */
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">{UNIDADES_CURRICULARES.find(u => u.id === ucSelecionada)?.nome}</h2>
              <p className="text-sm text-slate-500 mt-1">Rubrica Aplicada: <span className="font-semibold text-slate-700">{rubricaAtiva?.titulo}</span></p>
            </div>

            {/* Tabela de Rubricas Dinâmica */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-700 font-bold">
                  <tr>
                    <th className="p-4 min-w-[240px]">Estudante</th>
                    {rubricaAtiva?.criterios.map((crit) => (
                      <th key={crit.id} className="p-4 max-w-[200px] text-xs font-bold border-l border-slate-200">
                        <span className="block text-[10px] uppercase font-black tracking-wider text-blue-600 mb-1">
                          {crit.tipo}
                        </span>
                        {crit.descricao}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                  {estudantesFiltrados.map((estudante) => (
                    <tr key={estudante.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-medium text-slate-900">
                        {estudante.nome}
                      </td>
                      {rubricaAtiva?.criterios.map((crit) => {
                        const status = getNotaStatus(estudante.id, crit.id);
                        return (
                          <td key={crit.id} className="p-4 border-l border-slate-200 text-center valuation-cell">
                            <div className="flex gap-2 justify-center">
                              {/* Botão C - Conseguiu */}
                              <button
                                onClick={() => handleNotaChange(estudante.id, crit.id, 'C')}
                                className={`px-3 py-1.5 text-xs font-black rounded-md transition-all border ${
                                  status === 'C'
                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                }`}
                              >
                                C
                              </button>
                              {/* Botão NC - Não Conseguiu */}
                              <button
                                onClick={() => handleNotaChange(estudante.id, crit.id, 'NC')}
                                className={`px-3 py-1.5 text-xs font-black rounded-md transition-all border ${
                                  status === 'NC'
                                    ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                }`}
                              >
                                NC
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
