import React, { useState } from 'react';
import { TurmaId, Aluno, CapacidadeTecnica, NivelDesempenho } from './types';
import { CAPACIDADES_FUSI, getDescricaoRubrica } from './utils';
import CapacidadeCard from './components/CapacidadeCard';

export default function App() {
  const [turmaAtiva, setTurmaAtiva] = useState<TurmaId>('MA');
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [novoNome, setNovoNome] = useState('');
  const [capSelecionada, setCapSelecionada] = useState<CapacidadeTecnica | null>(null);

  const turmasDisponiveis: TurmaId[] = ['MA', 'MB', 'TA', 'TB'];
  const alunosDaTurma = alunos.filter(a => a.turmaId === turmaAtiva);

  const handleAddAluno = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    const novoAluno: Aluno = {
      id: crypto.randomUUID(),
      nome: novoNome.trim().toUpperCase(),
      turmaId: turmaAtiva,
      avaliacoes: {}
    };

    setAlunos(prev => [...prev, novoAluno]);
    setNovoNome('');
  };

  const handleDefinirRubrica = (alunoId: string, capacidadeId: string, nivel: NivelDesempenho) => {
    setAlunos(prev => prev.map(aluno => {
      if (aluno.id !== alunoId) return aluno;
      
      const notaAtual = aluno.avaliacoes[capacidadeId];
      return {
        ...aluno,
        avaliacoes: {
          ...aluno.avaliacoes,
          // Se clicar no mesmo nível, desmarca (volta a ficar em branco)
          [capacidadeId]: notaAtual === nivel ? undefined : nivel
        }
      };
    }));
  };

  // Estatísticas para os indicadores do Card
  const getAlunosAvaliadosCount = (capId: string) => {
    return alunosDaTurma.filter(a => a.avaliacoes[capId]).length;
  };

  const getAlunosAutonomosCount = (capId: string) => {
    return alunosDaTurma.filter(a => a.avaliacoes[capId] === 'AUT').length;
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-800 font-sans antialiased">
      
      {/* CABEÇALHO ESTILO SENAI */}
      <header className="bg-[#004fa3] px-8 py-5 flex flex-col md:flex-row items-center justify-between shadow-md text-white gap-4">
        <div className="flex items-center gap-6">
          <div className="bg-red-600 px-5 py-2 rounded-sm skew-x-[-12deg] font-black text-2xl tracking-tighter italic">
            SENAI
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-lg md:text-xl font-black uppercase tracking-wider">
              Mecânico de Usinagem Convencional
            </h1>
            <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mt-0.5">
              Capacidades Técnicas Alcançadas
            </p>
          </div>
        </div>

        {/* Seletor de Turmas */}
        <div className="flex items-center gap-4">
          <div className="bg-[#003670] p-1 rounded-xl flex items-center shadow-inner">
            {turmasDisponiveis.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTurmaAtiva(t);
                  setCapSelecionada(null);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all ${
                  turmaAtiva === t ? 'bg-white text-[#004fa3] shadow' : 'text-blue-200 hover:text-white bg-transparent'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="p-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black italic text-[#004fa3] uppercase tracking-tight">
              TURMA {turmaAtiva}
            </h2>
            <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
              MATRIZ FUSI
            </span>
          </div>

          {/* Cadastro de Alunos */}
          <form onSubmit={handleAddAluno} className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="NOME DO ALUNO..."
              className="w-full sm:w-64 h-[44px] px-4 bg-white text-slate-700 placeholder-slate-400 font-bold border-2 border-red-600 rounded-xl focus:outline-none shadow-sm text-xs tracking-wide"
            />
            <button
              type="submit"
              className="h-[44px] px-6 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition-colors tracking-wider uppercase shadow-sm"
            >
              ADD
            </button>
          </form>
        </div>

        {/* PAINEL DE CARDS DAS CAPACIDADES TÉCNICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {CAPACIDADES_FUSI.map((cap) => (
            <CapacidadeCard
              key={cap.id}
              capacidade={cap}
              alunosAvaliados={getAlunosAvaliadosCount(cap.id)}
              alunosAutonomos={getAlunosAutonomosCount(cap.id)}
              totalAlunos={alunosDaTurma.length}
              onClick={() => setCapSelecionada(cap)}
            />
          ))}
        </div>

        {/* PAINEL FLUTUANTE: SELEÇÃO DA RUBRICA RELATIVA POR ALUNO */}
        {capSelecionada && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-4xl rounded-[24px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
              
              {/* Topo do Painel */}
              <div className="p-6 bg-[#004fa3] text-white flex justify-between items-start">
                <div className="pr-4">
                  <span className="text-xs font-black text-blue-200 uppercase tracking-widest">{capSelecionada.codigo} - MATRIZ DE DESEMPENHO</span>
                  <h3 className="text-sm font-bold uppercase mt-1 leading-relaxed text-slate-100">{capSelecionada.descricao}</h3>
                </div>
                <button 
                  onClick={() => setCapSelecionada(null)}
                  className="text-white/80 hover:text-white font-black text-sm bg-black/20 w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Lista Deslizante de Alunos para Atribuição de Níveis */}
              <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-4">
                {alunosDaTurma.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                    Nenhum aluno cadastrado nesta turma. Utilize o campo "ADD" no painel superior.
                  </p>
                ) : (
                  alunosDaTurma.map((aluno) => {
                    const nivelAtual = aluno.avaliacoes[capSelecionada.id];
                    return (
                      <div key={aluno.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="lg:w-1/4">
                          <span className="text-xs font-black text-slate-400 block tracking-wider">ESTUDANTE</span>
                          <span className="text-sm font-black text-slate-900 uppercase tracking-wide">{aluno.nome}</span>
                        </div>

                        {/* Botões Multisseleção da Rubrica Relativa (NEA, APO, PAR, AUT) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
                          {(['NEA', 'APO', 'PAR', 'AUT'] as NivelDesempenho[]).map((nivel) => {
                            const configCores = {
                              NEA: 'border-red-200 text-red-700 hover:bg-red-50 active:bg-red-100',
                              APO: 'border-amber-200 text-amber-700 hover:bg-amber-50 active:bg-amber-100',
                              PAR: 'border-blue-200 text-blue-700 hover:bg-blue-50 active:bg-blue-100',
                              AUT: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100'
                            };

                            const ativoCores = {
                              NEA: 'bg-red-600 border-red-600 text-white shadow-md shadow-red-100',
                              APO: 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-100',
                              PAR: 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100',
                              AUT: 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100'
                            };

                            const estaAtivo = nivelAtual === nivel;

                            return (
                              <button
                                key={nivel}
                                type="button"
                                title={getDescricaoRubrica(capSelecionada.id, nivel)}
                                onClick={() => handleDefinirRubrica(aluno.id, capSelecionada.id, nivel)}
                                className={`p-2.5 rounded-xl border text-center transition-all duration-150 flex flex-col items-center justify-center min-h-[55px] ${
                                  estaAtivo ? ativoCores[nivel] : `bg-white ${configCores[nivel]}`
                                }`}
                              >
                                <span className="text-xs font-black tracking-wider">{nivel}</span>
                                <span className={`text-[9px] font-medium block mt-0.5 truncate max-w-full px-1 ${estaAtivo ? 'text-white/90' : 'text-slate-400'}`}>
                                  {nivel === 'NEA' ? 'Não Atendeu' : nivel === 'APO' ? 'Com Apoio' : nivel === 'PAR' ? 'Parcial' : 'Autônomo'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Base / Rodapé */}
              <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center px-6">
                <span className="text-[10px] text-slate-400 font-bold italic">💡 Dica: Passe o mouse ou segure o botão para ler o critério completo da rubrica.</span>
                <button
                  onClick={() => setCapSelecionada(null)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
