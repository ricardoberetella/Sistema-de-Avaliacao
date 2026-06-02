import React, { useState, useEffect } from 'react';
import { TurmaId, UCId, Aluno, CapacidadeTecnica, NivelDesempenho } from './types';
import { CAPACIDADES_OFICIAIS, getDescricaoRubrica } from './utils';
import CapacidadeCard from './components/CapacidadeCard';

import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// @ts-ignore
import html2pdf from 'html2pdf.js';

export default function App() {
  const [turmaAtiva, setTurmaAtiva] = useState<TurmaId>('MA');
  const [ucAtiva, setUcAtiva] = useState<UCId>('FUSI');
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [novoNome, setNovoNome] = useState('');
  const [capSelecionada, setCapSelecionada] = useState<CapacidadeTecnica | null>(null);
  const [verGraficos, setVerGraficos] = useState(false);

  const turmasDisponiveis: TurmaId[] = ['MA', 'MB', 'TA', 'TB'];
  
  const capacidadesFiltradas = CAPACIDADES_OFICIAIS.filter(c => c.ucId === ucAtiva);
  const alunosDaTurma = alunos.filter(a => a.turmaId === turmaAtiva);

  useEffect(() => {
    const colRef = collection(db, 'alunos');
    
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const listaAlunos: Aluno[] = [];
      snapshot.forEach((docSnap) => {
        const dados = docSnap.data();
        listaAlunos.push({
          id: docSnap.id,
          nome: dados.nome || '',
          turmaId: dados.turmaId || 'MA',
          avaliacoes: dados.avaliacoes || {},
          observacoes: dados.observacoes || {}
        });
      });
      listaAlunos.sort((a, b) => a.nome.localeCompare(b.nome));
      setAlunos(listaAlunos);
    }, (error) => {
      console.error("Erro no Firestore:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleAddAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    const idGerado = crypto.randomUUID();
    const nomeFormatado = novoNome.trim().toUpperCase();
    
    setNovoNome('');

    try {
      await setDoc(doc(db, 'alunos', idGerado), {
        nome: nomeFormatado,
        turmaId: turmaAtiva,
        avaliacoes: {},
        observacoes: {}
      });
    } catch (error) {
      console.error("Erro ao adicionar aluno:", error);
    }
  };

  const handleExcluirAluno = async (alunoId: string, nomeAluno: string) => {
    const confirmar = window.confirm(`Deseja realmente excluir o aluno ${nomeAluno} do sistema? Esta ação removerá todas as notas dele.`);
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, 'alunos', alunoId));
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
    }
  };

  const handleDefinirRubrica = async (alunoId: string, capacidadeId: string, nivel: NivelDesempenho) => {
    const alunoAlvo = alunos.find(a => a.id === alunoId);
    if (!alunoAlvo) return;

    const notaAtual = alunoAlvo.avaliacoes?.[capacidadeId];
    const novaNota = notaAtual === nivel ? null : nivel;

    const novasAvaliacoes = { ...(alunoAlvo.avaliacoes || {}) };
    if (novaNota === null) {
      delete novasAvaliacoes[capacidadeId];
    } else {
      novasAvaliacoes[capacidadeId] = nivel;
    }

    setAlunos(prev => prev.map(a => a.id === alunoId ? { ...a, avaliacoes: novasAvaliacoes } : a));

    try {
      await updateDoc(doc(db, 'alunos', alunoId), {
        avaliacoes: novasAvaliacoes
      });
    } catch (error) {
      console.error("Erro ao atualizar rubrica:", error);
    }
  };

  const handleMudarObservacao = async (alunoId: string, capacidadId: string, texto: string) => {
    const alunoAlvo = alunos.find(a => a.id === alunoId);
    if (!alunoAlvo) return;

    const novasObservacoes = {
      ...(alunoAlvo.observacoes || {}),
      [capacidadId]: texto
    };

    setAlunos(prev => prev.map(a => a.id === alunoId ? { ...a, observacoes: novasObservacoes } : a));

    try {
      await updateDoc(doc(db, 'alunos', alunoId), {
        observacoes: novasObservacoes
      });
    } catch (error) {
      console.error("Erro ao salvar observação:", error);
    }
  };

  // Retorna o objeto com a contagem exata das 4 rubricas para uma capacidade específica
  const getContagemRubricas = (capId: string) => {
    const contagem = { NSA: 0, APO: 0, PAR: 0, AUT: 0 };
    alunosDaTurma.forEach(a => {
      const nota = a.avaliacoes?.[capId];
      if (nota === 'NSA' || nota === 'APO' || nota === 'PAR' || nota === 'AUT') {
        contagem[nota]++;
      }
    });
    return contagem;
  };

  // Consolidação de estatísticas da UC para a tela de gráficos
  const totalGeralRubricas = { NSA: 0, APO: 0, PAR: 0, AUT: 0 };
  capacidadesFiltradas.forEach(cap => {
    const c = getContagemRubricas(cap.id);
    totalGeralRubricas.NSA += c.NSA;
    totalGeralRubricas.APO += c.APO;
    totalGeralRubricas.PAR += c.PAR;
    totalGeralRubricas.AUT += c.AUT;
  });
  const somaTotalNotas = totalGeralRubricas.NSA + totalGeralRubricas.APO + totalGeralRubricas.PAR + totalGeralRubricas.AUT;

  // Função robusta para exportação de Relatório PDF Padrão SENAI
  const exportarRelatorioPDF = () => {
    const elemento = document.getElementById('relatorio-pdf-container');
    if (!elemento) return;

    const nomeDaUc = ucAtiva === 'FUSI' ? 'Fundamentos da Usinagem' : ucAtiva === 'CRD' ? 'Controle Dimensional' : ucAtiva === 'LIDT' ? 'Leitura de Desenho Técnico' : 'Ciência dos Materiais';

    const opt = {
      margin: 10,
      filename: `Relatorio_SENAI_Turma_${turmaAtiva}_${ucAtiva}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    // Exibe temporariamente a div oculta do PDF antes do print
    elemento.classList.remove('hidden');
    html2pdf().set(opt).from(elemento).save().then(() => {
      elemento.classList.add('hidden');
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-800 font-sans antialiased">
      
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
              {(['FUSI', 'CRD', 'LIDT', 'CMAT'] as UCId[]).map((sigla) => (
                <button 
                  key={sigla}
                  onClick={() => { setUcAtiva(sigla); setCapSelecionada(null); }}
                  className={`text-xs font-black uppercase tracking-wider transition-all pb-0.5 ${ucAtiva === sigla ? 'text-white border-b-2 border-white' : 'text-blue-300 hover:text-white'}`}
                >
                  {sigla === 'FUSI' ? 'FUSI (Usinagem)' : sigla === 'CRD' ? 'CRD (Metrologia)' : sigla === 'LIDT' ? 'LIDT (Desenho)' : 'CMAT (Materiais)'}
                </button>
              ))}
            </div>
          </div>
        </div>

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

      <main className="p-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-black italic text-[#004fa3] uppercase tracking-tight">
              TURMA {turmaAtiva}
            </h2>
            <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
              {ucAtiva === 'FUSI' ? 'Fundamentos da Usinagem' : ucAtiva === 'CRD' ? 'Controle Dimensional' : ucAtiva === 'LIDT' ? 'Leitura de Desenho Técnico' : 'Ciência dos Materiais'}
            </span>
            
            {/* Botões Analíticos de Gráficos e Exportação */}
            <button
              onClick={() => setVerGraficos(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] rounded-lg tracking-wider uppercase flex items-center gap-1 shadow-sm transition-colors"
            >
              📊 Estatísticas da Turma
            </button>
            <button
              onClick={exportarRelatorioPDF}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-black text-[10px] rounded-lg tracking-wider uppercase flex items-center gap-1 shadow-sm transition-colors"
            >
              Doc. PDF 📄
            </button>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {capacidadesFiltradas.map((cap) => (
            <CapacidadeCard
              key={cap.id}
              capacidade={cap}
              contagemRubricas={getContagemRubricas(cap.id)}
              totalAlunos={alunosDaTurma.length}
              onClick={() => setCapSelecionada(cap)}
            />
          ))}
        </div>

        {/* --- MODAL DIÁRIO DE CLASSE (LANÇAMENTO DE NOTAS E EXCLUSÃO) --- */}
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
                    const nivelAtual = aluno.avaliacoes ? aluno.avaliacoes[capSelecionada.id] : undefined;
                    const textoObs = (aluno.observacoes && aluno.observacoes[capSelecionada.id]) || '';
                    return (
                      <div key={aluno.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-[10px] font-black text-slate-400 block tracking-wider">ESTUDANTE</span>
                              <span className="text-sm font-black text-slate-900 uppercase tracking-wide">{aluno.nome}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleExcluirAluno(aluno.id, aluno.nome)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center justify-center text-xs"
                              title="Excluir Aluno"
                            >
                              🗑️
                            </button>
                          </div>

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

                        <div className="w-full">
                          <label className="text-[9px] font-black text-slate-400 block tracking-widest uppercase mb-1">
                            Observações e Histórico Técnico do Aluno
                          </label>
                          <textarea
                            value={textoObs}
                            onChange={(e) => handleMudarObservacao(aluno.id, capSelecionada.id, e.target.value)}
                            placeholder="Digite aqui anotações sobre tolerância, comportamento na oficina..."
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

        {/* --- MODAL DE GRÁFICOS E ESTATÍSTICAS DA TURMA --- */}
        {verGraficos && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-2xl rounded-[24px] shadow-2xl p-6 border border-slate-100 relative">
              <button 
                onClick={() => setVerGraficos(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
              
              <h3 className="text-xl font-black text-[#004fa3] mb-1 uppercase tracking-tight">📊 Estatísticas Analíticas</h3>
              <p className="text-xs font-bold text-slate-400 uppercase mb-6">Turma {turmaAtiva} • {ucAtiva}</p>
              
              {somaTotalNotas === 0 ? (
                <p className="text-center text-xs font-bold text-slate-400 py-8 bg-slate-50 rounded-xl border border-dashed">Nenhuma avaliação realizada nesta Unidade Curricular ainda.</p>
              ) : (
                <div className="space-y-4">
                  {(['AUT', 'PAR', 'APO', 'NSA'] as NivelDesempenho[]).map(nivel => {
                    const qtd = totalGeralRubricas[nivel];
                    const pct = Math.round((qtd / somaTotalNotas) * 100);
                    
                    const coresBarra = {
                      AUT: 'bg-emerald-600',
                      PAR: 'bg-blue-600',
                      APO: 'bg-amber-500',
                      NSA: 'bg-red-600'
                    };

                    const nomesNivel = { AUT: 'Autônomo (AUT)', PAR: 'Parcial (PAR)', APO: 'Com Apoio (APO)', NSA: 'Não Satisfez (NSA)' };

                    return (
                      <div key={nivel} className="space-y-1">
                        <div className="flex justify-between text-xs font-black text-slate-700">
                          <span>{nomesNivel[nivel]}</span>
                          <span>{qtd} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner">
                          <div className={`h-full ${coresBarra[nivel]} transition-all`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="text-right pt-4 border-t text-[10px] font-black text-slate-400 uppercase">
                    Total de avaliações computadas nesta UC: {somaTotalNotas}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- ESTRUTURA OCULTA IMPRESSA NO RELATÓRIO PDF --- */}
        <div id="relatorio-pdf-container" className="hidden p-8 bg-white text-slate-900 font-sans w-[297mm]">
          <div className="border-4 border-[#004fa3] p-6 rounded-xl space-y-6">
            <div className="flex justify-between items-center border-b-4 border-red-600 pb-4">
              <div>
                <span className="bg-red-600 text-white px-4 py-1 text-xl font-black tracking-tight italic rounded-sm">SENAI</span>
                <h2 className="text-xl font-black uppercase mt-2 tracking-wide text-[#004fa3]">Pauta de Avaliação Por Rubricas</h2>
              </div>
              <div className="text-right text-xs font-black uppercase text-slate-500">
                <p>Curso: Mecânico de Usinagem</p>
                <p>Turma: {turmaAtiva} • UC: {ucAtiva}</p>
              </div>
            </div>

            <table className="w-full text-[10px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase font-black">
                  <th className="border border-slate-300 p-2 text-left w-1/3">Estudante</th>
                  {capacidadesFiltradas.map(c => (
                    <th key={c.id} className="border border-slate-300 p-2 text-center" title={c.descricao}>{c.codigo}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alunosDaTurma.map(aluno => (
                  <tr key={aluno.id} className="hover:bg-slate-50 font-bold uppercase text-slate-800">
                    <td className="border border-slate-300 p-2 text-left font-black">{aluno.nome}</td>
                    {capacidadesFiltradas.map(c => {
                      const nota = aluno.avaliacoes?.[c.id] || '-';
                      return (
                        <td key={c.id} className={`border border-slate-300 p-2 text-center font-black text-xs ${
                          nota === 'AUT' ? 'text-emerald-600' : nota === 'PAR' ? 'text-blue-600' : nota === 'APO' ? 'text-amber-600' : nota === 'NSA' ? 'text-red-600' : 'text-slate-300'
                        }`}>{nota}</td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
