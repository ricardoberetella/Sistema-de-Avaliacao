import React, { useState, useEffect } from 'react';
import { TurmaId, UCId, Aluno, CapacidadeTecnica, NivelDesempenho } from './types';
import { CAPACIDADES_OFICIAIS, getDescricaoRubrica } from './utils';
import CapacidadeCard from './components/CapacidadeCard';

// IMPORTAÇÃO DA CONEXÃO DO SUPABASE
import { supabase } from './supabase';

export default function App() {
  const [turmaAtiva, setTurmaAtiva] = useState<TurmaId>('MA');
  const [ucAtiva, setUcAtiva] = useState<UCId>('FUSI');
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [novoNome, setNovoNome] = useState('');
  const [capSelecionada, setCapSelecionada] = useState<CapacidadeTecnica | null>(null);

  const turmasDisponiveis: TurmaId[] = ['MA', 'MB', 'TA', 'TB'];
  
  const capacidadesFiltradas = CAPACIDADES_OFICIAIS.filter(c => c.ucId === ucAtiva);
  const alunosDaTurma = alunos.filter(a => a.turmaId === turmaAtiva);

  // CARREGAMENTO E SINCRONIZAÇÃO EM TEMPO REAL COM O SUPABASE
  useEffect(() => {
    // Busca inicial dos alunos
    const buscarAlunos = async () => {
      const { data, error } = await supabase
        .from('alunos')
        .select('*');
      
      if (error) {
        console.error("Erro ao buscar alunos:", error);
      } else if (data) {
        // Garante que avaliacoes e observacoes comecem como objetos se vierem nulos
        const lista Formatada = data.map((a: any) => ({
          id: String(a.id),
          nome: a.nome,
          turmaId: a.turma_id || a.turmaId,
          avaliacoes: a.avaliacoes || {},
          observacoes: a.observacoes || {}
        }));
        setAlunos(listaFormatada);
      }
    };

    buscarAlunos();

    // Escuta em tempo real se houver alterações no banco do Supabase
    const canalAlunos = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alunos' }, () => {
        buscarAlunos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canalAlunos);
    };
  }, []);

  // ADICIONAR ALUNO NO SUPABASE
  const handleAddAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    try {
      const { error } = await supabase
        .from('alunos')
        .insert([
          {
            nome: novoNome.trim().toUpperCase(),
            turma_id: turmaAtiva, // Ajustado para o padrão snake_case do Supabase
            avaliacoes: {},
            observacoes: {}
          }
        ]);

      if (error) throw error;
      setNovoNome('');
    } catch (error) {
      console.error("Erro ao adicionar aluno no Supabase:", error);
      alert("Erro ao salvar o aluno. Verifique a tabela no Supabase.");
    }
  };

  // DEFINIR RÚBRICA NO SUPABASE
  const handleDefinirRubrica = async (alunoId: string, capacidadeId: string, nivel: NivelDesempenho) => {
    const alunoAlvo = alunos.find(a => a.id === alunoId);
    if (!alunoAlvo) return;

    const notaAtual = alunoAlvo.avaliacoes[capacidadeId];
    const novaNota = notaAtual === nivel ? null : nivel;

    const novasAvaliacoes = { ...alunoAlvo.avaliacoes };
    if (novaNota === null) {
      delete novasAvaliacoes[capacidadeId];
    } else {
      novasAvaliacoes[capacidadeId] = nivel;
    }

    try {
      const { error } = await supabase
        .from('alunos')
        .update({ avaliacoes: novasAvaliacoes })
        .eq('id', alunoId);

      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar rúbrica no Supabase:", error);
    }
  };

  // SALVAR OBSERVAÇÃO TÉCNICA NO SUPABASE
  const handleMudarObservacao = async (alunoId: string, capacidadeId: string, texto: string) => {
    const alunoAlvo = alunos.find(a => a.id === alunoId);
    if (!alunoAlvo) return;

    const novasObservacoes = {
      ...alunoAlvo.observacoes,
      [capacidadeId]: texto
    };

    try {
      const { error } = await supabase
        .from('alunos')
        .update({ observacoes: novasObservacoes })
        .eq('id', alunoId);

      if (error) throw error;
    } catch (error) {
      console.error("Erro ao salvar observação no Supabase:", error);
    }
  };

  const getAlunosAvaliadosCount = (capId: string) => {
    return alunosDaTurma.filter(a => a.avaliacoes[capId]).length;
  };

  const getAlunosAutonomosCount = (capId: string) => {
    return alunosDaTurma.filter(a => a.avaliacoes[capId] === 'AUT').length;
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-800 font-sans antialiased">
      
      {/* HEADER SENAI */}
      <header className="bg-[#004fa3] px-8 py-5 flex flex-col lg:flex-row items-center justify-between shadow-md text-white gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="bg-red-600 px-5 py-2 rounded-sm skew-x-[-12deg] font-black text-2xl tracking-tighter italic">
            SENAI
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-lg md:text-xl font-black uppercase tracking-wider">
              Mecânico de Usinagem Convencional
            </h1>
            
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 justify-center sm:justify-start">
              <button 
                onClick={() => { setUcAtiva('FUSI'); setCapSelecionada(null); }}
                className={`text-xs font-black uppercase tracking-wider transition-all pb-0.5 ${ucAtiva === 'FUSI' ? 'text-white border-b-2 border-white' : 'text-blue-300 hover:text-white'}`}
              >
                FUSI (Usinagem)
              </button>
              <button 
                onClick={() => { setUcAtiva('CRD'); setCapSelecionada(null); }}
                className={`text-xs font-black uppercase tracking-wider transition-all pb-0.5 ${ucAtiva === 'CRD' ? 'text-white border-b-2 border-white' : 'text-blue-300 hover:text-white'}`}
              >
                CRD (Metrologia)
              </button>
              <button 
                onClick={() => { setUcAtiva('LIDT'); setCapSelecionada(null); }}
                className={`text-xs font-black uppercase tracking-wider transition-all pb-0.5 ${ucAtiva === 'LIDT' ? 'text-white border-b-2 border-white' : 'text-blue-300 hover:text-white'}`}
              >
                LIDT (Desenho Técnico)
              </button>
            </div>
          </div>
        </div>

        {/* Seletor de Turma */}
        <div className="bg-[#003670] p-1 rounded-xl flex items-center shadow-inner shrink-0">
          {turmasDisponiveis.map((t) => (
            <button
              key={t}
              onClick={() => { setTurmaAtiva(t); setCapSelecionada(null); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all ${
                turmaAtiva === t ? 'bg-white text-[#004fa3] shadow' : 'text-blue-200 hover:text-white bg-transparent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="p-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black italic text-[#004fa3] uppercase tracking-tight">
              TURMA {turmaAtiva}
            </h2>
            <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
              {ucAtiva === 'FUSI' ? 'Fundamentos da Usinagem' : ucAtiva === 'CRD' ? 'Controle Dimensional' : 'Leitura de Desenho Técnico'}
            </span>
          </div>

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

        {/* CARDS DE CAPACIDADE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {capacidadesFiltradas.map((cap) => (
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

        {/* MODAL COM CAMPO DE OBSERVAÇÃO INDIVIDUAL */}
        {capSelecionada && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-5xl rounded-[24px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
              
              <div className="p-6 bg-[#004fa3] text-white flex justify-between items-start">
                <div className="pr-4">
                  <span className="text-xs font-black text-blue-200 uppercase tracking-widest">{capSelecionada.codigo} - DIÁRIO DE CLASSE ({ucAtiva})</span>
                  <h3 className="text-sm font-bold uppercase mt-1 leading-relaxed text-slate-100">{capSelecionada.descricao}</h3>
                </div>
                <button 
                  onClick={() => setCapSelecionada(null)}
                  className="text-white/80 hover:text-white font-black text-sm bg-black/20 w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-4">
                {alunosDaTurma.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                    Nenhum aluno cadastrado nesta turma. Utilize o campo "ADD" no painel superior.
                  </p>
                ) : (
                  alunosDaTurma.map((aluno) => {
                    const nivelAtual = aluno.avaliacoes[capSelecionada.id];
                    const textoObs = aluno.observacoes[capSelecionada.id] || '';
                    return (
                      <div key={aluno.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[10px] font-black text-slate-400 block tracking-wider">ESTUDANTE</span>
                            <span className="text-sm font-black text-slate-900 uppercase tracking-wide">{aluno.nome}</span>
                          </div>

                          {/* Seleção Rubrica */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto md:w-[480px]">
                            {(['NSA', 'APO', 'PAR', 'AUT'] as NivelDesempenho[]).map((nivel) => {
                              const configCores = {
                                NSA: 'border-red-200 text-red-700 hover:bg-red-50',
                                APO: 'border-amber-200 text-amber-700 hover:bg-amber-50',
                                PAR: 'border-blue-200 text-blue-700 hover:bg-blue-50',
                                AUT: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              };

                              const ativoCores = {
                                NSA: 'bg-red-600 border-red-600 text-white shadow-md',
                                APO: 'bg-amber-500 border-amber-500 text-white shadow-md',
                                PAR: 'bg-blue-600 border-blue-600 text-white shadow-md',
                                AUT: 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                              };

                              const estaAtivo = nivelAtual === nivel;

                              return (
                                <button
                                  key={nivel}
                                  type="button"
                                  title={getDescricaoRubrica(capSelecionada.id, nivel)}
                                  onClick={() => handleDefinirRubrica(aluno.id, capSelecionada.id, nivel)}
                                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center min-h-[50px] ${
                                    estaAtivo ? ativoCores[nivel] : `bg-white ${configCores[nivel]}`
                                  }`}
                                >
                                  <span className="text-xs font-black tracking-wider">{nivel}</span>
                                  <span className={`text-[8px] font-bold block uppercase tracking-tight mt-0.5 ${estaAtivo ? 'text-white/90' : 'text-slate-400'}`}>
                                    {nivel === 'NSA' ? 'Não Satisfez' : nivel === 'APO' ? 'Com Apoio' : nivel === 'PAR' ? 'Parcial' : 'Autônomo'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Campo de Observações Técnicas */}
                        <div className="w-full">
                          <label className="text-[9px] font-black text-slate-400 block tracking-widest uppercase mb-1">
                            Observações e Histórico Técnico do Aluno
                          </label>
                          <textarea
                            value={textoObs}
                            onChange={(e) => handleMudarObservacao(aluno.id, capSelecionada.id, e.target.value)}
                            placeholder="Digite aqui anotações sobre tolerância, comportamento na oficina ou pontos a recuperar..."
                            rows={2}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 resize-y"
                          />
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 bg-white border-t border-slate-100 flex justify-end px-6">
                <button
                  onClick={() => setCapSelecionada(null)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                >
                  Fechar Janela
                </button>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
