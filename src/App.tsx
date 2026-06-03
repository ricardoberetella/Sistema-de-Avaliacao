// src/App.tsx
import React, { useState, useEffect } from 'react';
import { TurmaId, UCId, Aluno, CapacidadeTecnica, NivelDesempenho } from './types';
import { CAPACIDADES_OFICIAIS, getDescricaoRubrica } from './utils';
import CapacidadeCard from './components/CapacidadeCard';

import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// Importação ajustada e compatível com o empacotador moderno do Vite
import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';

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

  const handleMudarObservacao = async (alunoId: string, capacidadeId: string, texto: string) => {
    const alunoAlvo = alunos.find(a => a.id === alunoId);
    if (!alunoAlvo) return;

    const novasObservacoes = {
      ...(alunoAlvo.observacoes || {}),
      [capacidadeId]: texto
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

  const totalGeralRubricas = { NSA: 0, APO: 0, PAR: 0, AUT: 0 };
  capacidadesFiltradas.forEach(cap => {
    const c = getContagemRubricas(cap.id);
    totalGeralRubricas.NSA += c.NSA;
    totalGeralRubricas.APO += c.APO;
    totalGeralRubricas.PAR += c.PAR;
    totalGeralRubricas.AUT += c.AUT;
  });

  const exportarRelatorioPDF = () => {
    const elemento = document.getElementById('relatorio-pdf-container');
    if (!elemento) return;

    const opt = {
      margin: 10,
      filename: `Relatorio_SENAI_Turma_${turmaAtiva}_${ucAtiva}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    elemento.classList.remove('hidden');
    
    // Execução segura da biblioteca de PDF
    const worker = html2pdf();
    worker.set(opt).from(elemento).save().then(() => {
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
              {(([ 'FUSI', 'CRD', 'LIDT', 'CMAT' ] as UCId[])).map((sigla) => (
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
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-black tracking-wider uppercase transition-colors"
                            >
                              Excluir Aluno 🗑️
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {(['NSA', 'APO', 'PAR', 'AUT'] as NivelDesempenho[]).map((nivel) => (
                              <button
                                key={nivel}
                                onClick={() => handleDefinirRubrica(aluno.id, capSelecionada.id, nivel)}
                                className={`px-3 py-2 rounded-xl text-xs font-black tracking-tight transition-all border ${
                                  nivelAtual === nivel
                                    ? nivel === 'NSA' ? 'bg-red-600 text-white border-red-600'
                                      : nivel === 'APO' ? 'bg-amber-500 text-white border-amber-500'
                                      : nivel === 'PAR' ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                                }`}
                              >
                                {nivel}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-slate-400 block tracking-wider uppercase mb-1">
                            Evidências / Observações de Desempenho
                          </label>
                          <textarea
                            value={textoObs}
                            onChange={(e) => handleMudarObservacao(aluno.id, capSelecionada.id, e.target.value)}
                            placeholder="Descreva pontos de atenção ou conquistas do estudante nesta capacidade técnica..."
                            className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl text-xs focus:outline-none focus:bg-white focus:border-blue-400 transition-all min-h-[70px] placeholder-slate-400"
                          />
                          {nivelAtual && (
                            <p className="text-[10px] text-slate-400 font-bold italic mt-1">
                              Critério ativo: <span className="text-slate-600">{getDescricaoRubrica(capSelecionada.id, nivelAtual)}</span>
                            </p>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setCapSelecionada(null)}
                  className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white font-black text-xs rounded-xl uppercase tracking-wider transition-colors"
                >
                  Fechar Diário
                </button>
              </div>

            </div>
          </div>
        )}

        {verGraficos && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-3xl rounded-[24px] shadow-2xl overflow-hidden border border-slate-100">
              <div className="p-6 bg-[#004fa3] text-white flex justify-between items-center">
                <h3 className="text-base font-black uppercase tracking-wider">📊 Estatísticas Consolidadas - Turma {turmaAtiva}</h3>
                <button onClick={() => setVerGraficos(false)} className="text-white/80 hover:text-white font-black text-sm">✕</button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                    <span className="block text-xs font-black text-red-500 uppercase tracking-wider">NSA</span>
                    <span className="text-3xl font-black text-red-700">{totalGeralRubricas.NSA}</span>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                    <span className="block text-xs font-black text-amber-600 uppercase tracking-wider">APO</span>
                    <span className="text-3xl font-black text-amber-700">{totalGeralRubricas.APO}</span>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <span className="block text-xs font-black text-blue-500 uppercase tracking-wider">PAR</span>
                    <span className="text-3xl font-black text-blue-700">{totalGeralRubricas.PAR}</span>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                    <span className="block text-xs font-black text-emerald-500 uppercase tracking-wider">AUT</span>
                    <span className="text-3xl font-black text-emerald-700">{totalGeralRubricas.AUT}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button onClick={() => setVerGraficos(false)} className="px-5 py-2 bg-slate-700 text-white font-black text-xs rounded-xl uppercase tracking-wider">Fechar</button>
              </div>
            </div>
          </div>
        )}

        {/* Container Oculto do Relatório PDF Estruturado */}
        <div id="relatorio-pdf-container" className="hidden p-10 bg-white text-slate-900 w-[297mm]">
          <div className="border-4 border-[#004fa3] p-6">
            <div className="flex justify-between items-center border-b-2 border-slate-300 pb-4 mb-6">
              <div>
                <span className="bg-red-600 text-white font-black px-4 py-1 italic tracking-tighter text-xl">SENAI</span>
                <h2 className="text-xl font-black uppercase text-[#004fa3] mt-2">Pauta de Avaliação por Capacidades Sociais e Técnicas</h2>
                <p className="text-xs font-bold text-slate-500 uppercase">Habilitação Profissional: Mecânico de Usinagem Convencional</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-700">TURMA: <span className="text-red-600">{turmaAtiva}</span></p>
                <p className="text-xs font-black text-slate-500">UC: {ucAtiva}</p>
              </div>
            </div>

            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-black uppercase">
                  <th className="border border-slate-300 p-2 text-left w-1/4">Nome do Aluno</th>
                  {capacidadesFiltradas.map(c => (
                    <th key={c.id} className="border border-slate-300 p-2 text-center" title={c.descricao}>
                      {c.codigo}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alunosDaTurma.map(aluno => (
                  <tr key={aluno.id} className="hover:bg-slate-50 font-bold uppercase">
                    <td className="border border-slate-300 p-2 text-slate-800">{aluno.nome}</td>
                    {capacidadesFiltradas.map(c => {
                      const v = aluno.avaliacoes?.[c.id] || '-';
                      return (
                        <td key={c.id} className={`border border-slate-300 p-2 text-center font-black ${
                          v === 'NSA' ? 'text-red-600 bg-red-50' :
                          v === 'APO' ? 'text-amber-600 bg-amber-50' :
                          v === 'PAR' ? 'text-blue-600 bg-blue-50' :
                          v === 'AUT' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300'
                        }`}>
                          {v}
                        </td>
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
