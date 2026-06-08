// src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { TurmaId, UCId, Aluno, CapacidadeTecnica, NivelDesempenho } from './types';
import { CAPACIDADES_OFICIAIS } from './utils';
import CapacidadeCard from './components/CapacidadeCard';
import LinhaAlunoAvaliacao from './components/LinhaAlunoAvaliacao';

import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function App() {
  const [senhaInput, setSenhaInput] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [erroLogin, setErroLogin] = useState(false);

  const [turmaAtiva, setTurmaAtiva] = useState<TurmaId>('MA');
  const [ucAtiva, setUcAtiva] = useState<UCId>('FUSI');
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [novoNome, setNovoNome] = useState('');
  const [capSelecionada, setCapSelecionada] = useState<CapacidadeTecnica | null>(null);
  const [verGraficos, setVerGraficos] = useState(false);

  const turmasDisponiveis: TurmaId[] = ['MA', 'MB', 'TA', 'TB'];
  
  const capacidadesFiltradas = CAPACIDADES_OFICIAIS.filter(c => c.ucId === ucAtiva);
  const alunosDaTurma = alunos.filter(a => a.turmaId === turmaAtiva);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (senhaInput === 'ianes662') {
      setAutenticado(true);
      setErroLogin(false);
    } else {
      setErroLogin(true);
      setSenhaInput('');
    }
  };

  useEffect(() => {
    if (!autenticado) return;

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
          observacoes: dados.observacoes || {},
          notasNumericas: dados.notasNumericas || dados.notesNumericas || {}
        });
      });
      listaAlunos.sort((a, b) => a.nome.localeCompare(b.nome));
      setAlunos(listaAlunos);
    }, (error) => {
      console.error("Erro no Firestore:", error);
    });

    return () => unsubscribe();
  }, [autenticado]);

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
        observacoes: {},
        notasNumericas: {}
      });
    } catch (error) {
      console.error("Erro ao adicionar aluno:", error);
    }
  };

  const handleExcluirAluno = useCallback(async (alunoId: string, nomeAluno: string) => {
    const confirmar = window.confirm(`Deseja realmente excluir o aluno ${nomeAluno}?`);
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, 'alunos', alunoId));
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
    }
  }, []);

  const handleDefinirRubrica = useCallback(async (alunoId: string, capacidadeId: string, nivel: NivelDesempenho) => {
    setAlunos(prev => prev.map(a => {
      if (a.id === alunoId) {
        const mapAvaliacoes = a.avaliacoes || {};
        const notaAtual = mapAvaliacoes[capacidadeId];
        const novaNota = notaAtual === nivel ? null : nivel;
        const novasAvaliacoes = { ...mapAvaliacoes };
        
        if (novaNota === null) {
          delete novasAvaliacoes[capacidadeId];
        } else {
          novasAvaliacoes[capacidadeId] = nivel;
        }
        
        return { ...a, avaliacoes: novasAvaliacoes };
      }
      return a;
    }));

    try {
      await updateDoc(doc(db, 'alunos', alunoId), {
        [`avaliacoes.${capacidadeId}`]: nivel
      });
    } catch (error) {
      console.error("Erro ao atualizar rubrica:", error);
    }
  }, []);

  const handleMudarObservacao = useCallback(async (alunoId: string, capacidadeId: string, texto: string) => {
    setAlunos(prev => prev.map(a => {
      if (a.id === alunoId) {
        return { ...a, observacoes: { ...(a.observacoes || {}), [capacidadeId]: texto } };
      }
      return a;
    }));

    try {
      await updateDoc(doc(db, 'alunos', alunoId), {
        [`observacoes.${capacidadeId}`]: texto
      });
    } catch (error) {
      console.error("Erro ao salvar observação:", error);
    }
  }, []);

  const handleMudarNotaNumerica = useCallback(async (alunoId: string, capacidadeId: string, valor: string) => {
    setAlunos(prev => prev.map(a => {
      if (a.id === alunoId) {
        return { ...a, notasNumericas: { ...(a.notasNumericas || {}), [capacidadeId]: valor } };
      }
      return a;
    }));

    try {
      await updateDoc(doc(db, 'alunos', alunoId), {
        [`notasNumericas.${capacidadeId}`]: valor
      });
    } catch (error) {
      console.error("Erro ao salvar valor da nota:", error);
    }
  }, []);

  const getContagemRubricas = (capId: string) => {
    const contagem: Record<NivelDesempenho, number> = { NSA: 0, APO: 0, PAR: 0, AUT: 0 };
    alunosDaTurma.forEach(a => {
      const mapa = a.avaliacoes || {};
      const nota = mapa[capId];
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

  const somaTotalRubricas = totalGeralRubricas.NSA + totalGeralRubricas.APO + totalGeralRubricas.PAR + totalGeralRubricas.AUT;

  const obterPorcentagem = (valor: number) => {
    if (somaTotalRubricas === 0) return '0%';
    return `${((valor / somaTotalRubricas) * 100).toFixed(1)}%`;
  };

  const exportarRelatorioPDF = () => {
    const tituloOriginal = document.title;
    document.title = `Relatorio_SENAI_Turma_${turmaAtiva}_${ucAtiva}`;
    window.print();
    document.title = tituloOriginal;
  };

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-[#f4f7fc] flex items-center justify-center p-4 antialiased font-sans">
        <div className="w-full max-w-md bg-white rounded-[24px] shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-[#004fa3] p-8 text-center relative">
            <div className="bg-red-600 px-5 py-2 rounded-sm skew-x-[-12deg] font-black text-2xl tracking-tighter italic text-white inline-block mb-4 shadow">
              SENAI
            </div>
            <h2 className="text-white text-md font-black uppercase tracking-wider block">Sistema de Evaluation</h2>
            <p className="text-blue-200 text-xs mt-1 font-bold">Mecânico de Usinagem Convencional</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Chave de Acesso do Instrutor</label>
              <input
                type="password"
                value={senhaInput}
                onChange={(e) => setSenhaInput(e.target.value)}
                placeholder="Digite a senha..."
                className={`w-full h-[48px] px-4 bg-slate-50 border-2 ${erroLogin ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-500'} text-slate-800 text-center font-black tracking-widest rounded-xl focus:outline-none transition-all shadow-inner text-sm`}
                autoFocus
              />
              {erroLogin && <p className="text-red-600 text-[10px] font-black uppercase tracking-wide text-center mt-1">❌ Senha incorreta!</p>}
            </div>
            <button type="submit" className="w-full h-[48px] bg-[#004fa3] hover:bg-[#003670] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all">Entrar no Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-800 font-sans antialiased layout-normal">
      <style>{`
        #relatorio-pdf-container { display: none; }
        @media print {
          .conteudo-tela { display: none !important; }
          body { background-color: #ffffff !important; }
          #relatorio-pdf-container { display: block !important; position: relative !important; width: 100% !important; }
          .rubrica-azul-impressao { color: #000000 !important; }
          @page { size: A4 landscape; margin: 10mm; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <div className="conteudo-tela">
        <header className="bg-[#004fa3] px-8 py-5 flex flex-col lg:flex-row items-center justify-between shadow-md text-white gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
            <div className="bg-red-600 px-5 py-2 rounded-sm skew-x-[-12deg] font-black text-2xl tracking-tighter italic shrink-0 hidden sm:block">SENAI</div>
            <div className="text-center mx-auto lg:mx-0 lg:text-left flex-1">
              <h1 className="text-lg md:text-xl font-black uppercase tracking-wider block">Sistema de Avaliação</h1>
              <p className="text-blue-200 text-xs md:text-sm font-bold uppercase tracking-wide mt-0.5 block">Mecânico de Usinagem Convencional</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 justify-center lg:justify-start">
                {(['FUSI', 'CRD', 'LIDT', 'CIEMA'] as UCId[]).map((sigla) => (
                  <button 
                    key={sigla}
                    onClick={() => { setUcAtiva(sigla); setCapSelecionada(null); }}
                    className={`text-xs font-black uppercase tracking-wider transition-all pb-0.5 ${ucAtiva === sigla ? 'text-white border-b-2 border-white' : 'text-blue-300 hover:text-white'}`}
                  >
                    {sigla === 'FUSI' ? 'FUSI (Usinagem)' : sigla === 'CRD' ? 'CRD (Metrologia)' : sigla === 'LIDT' ? 'LIDT (Desenho)' : 'CIEMA (Materiais)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-center sm:justify-end">
            <div className="bg-[#003670] p-1 rounded-xl flex items-center shadow-inner">
              {turmasDisponiveis.map((t) => (
                <button
                  key={t}
                  onClick={() => { setTurmaAtiva(t); setCapSelecionada(null); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all ${turmaAtiva === t ? 'bg-white text-[#004fa3] shadow' : 'text-blue-200 hover:text-white bg-transparent'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button onClick={() => setAutenticado(false)} className="p-2 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] rounded-xl tracking-wider uppercase transition-colors shadow-sm">Sair 🚪</button>
          </div>
        </header>

        <main className="p-8 max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-black italic text-[#004fa3] uppercase tracking-tight">TURMA {turmaAtiva}</h2>
              <button onClick={() => setVerGraficos(true)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] rounded-lg tracking-wider uppercase flex items-center gap-1 shadow-sm">📊 Estatísticas</button>
              <button onClick={exportarRelatorioPDF} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-black text-[10px] rounded-lg tracking-wider uppercase flex items-center gap-1 shadow-sm">Salvar PDF 📄</button>
            </div>

            <form onSubmit={handleAddAluno} className="flex items-center gap-3 w-full sm:w-auto">
              <input type="text" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="NOME DO ALUNO..." className="w-full sm:w-64 h-[44px] px-4 bg-white text-slate-700 placeholder-slate-400 font-bold border-2 border-red-600 rounded-xl focus:outline-none text-xs tracking-wide" />
              <button type="submit" className="h-[44px] px-6 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl tracking-wider uppercase">ADD</button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {capacidadesFiltradas.map((cap) => (
              <CapacidadeCard key={cap.id} capacidade={cap} contagemRubricas={getContagemRubricas(cap.id)} totalAlunos={alunosDaTurma.length} onClick={() => setCapSelecionada(cap)} />
            ))}
          </div>

          {capSelecionada && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white w-full max-w-5xl rounded-[24px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
                <div className="p-6 bg-[#004fa3] text-white flex justify-between items-start">
                  <div>
                    <span className="text-xs font-black text-blue-200 uppercase tracking-widest">{capSelecionada.codigo} - DIÁRIO DE CLASSE</span>
                    <h3 className="text-sm font-bold uppercase mt-1 text-slate-100">{capSelecionada.descricao}</h3>
                  </div>
                  <button onClick={() => setCapSelecionada(null)} className="text-white/80 hover:text-white font-black text-sm bg-black/20 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-4">
                  {alunosDaTurma.length === 0 ? (
                    <p className="text-xs font-bold text-slate-400 text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">Nenhum aluno cadastrado.</p>
                  ) : (
                    alunosDaTurma.map((aluno) => (
                      <LinhaAlunoAvaliacao 
                        key={aluno.id}
                        aluno={aluno}
                        capacidadeId={capSelecionada.id}
                        handleExcluirAluno={handleExcluirAluno}
                        handleMudarNotaNumerica={handleMudarNotaNumerica}
                        handleDefinirRubrica={handleDefinirRubrica}
                        handleMudarObservacao={handleMudarObservacao}
                      />
                    ))
                  )}
                </div>

                <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
                  <button onClick={() => setCapSelecionada(null)} className="px-5 py-2 bg-slate-700 text-white font-black text-xs rounded-xl uppercase">Fechar Diário</button>
                </div>
              </div>
            </div>
          )}

          {verGraficos && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white w-full max-w-xl rounded-[24px] shadow-2xl overflow-hidden">
                <div className="p-6 bg-[#004fa3] text-white flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase">📊 Desempenho Consolidado - Turma {turmaAtiva}</h3>
                  <button onClick={() => setVerGraficos(false)} className="text-white/80 font-black text-sm">✕</button>
                </div>
                <div className="p-6 space-y-5 bg-white">
                  {(['NSA', 'APO', 'PAR', 'AUT'] as NivelDesempenho[]).map((nivel) => (
                    <div key={nivel} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-black">
                        <span>{nivel}</span>
                        <span>{totalGeralRubricas[nivel]} ({obterPorcentagem(totalGeralRubricas[nivel])})</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className="bg-[#004fa3] h-full" style={{ width: obterPorcentagem(totalGeralRubricas[nivel]) }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                  <button onClick={() => setVerGraficos(false)} className="px-5 py-2 bg-slate-700 text-white font-black text-xs rounded-xl uppercase">Fechar</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <div id="relatorio-pdf-container">
        <div style={{ padding: '20px', backgroundColor: '#ffffff' }}>
          <h2 style={{ color: '#004fa3' }}>SENAI - Pauta de Avaliação ({turmaAtiva})</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left' }}>Aluno</th>
                {capacidadesFiltradas.map(c => <th key={c.id} style={{ border: '1px solid #cbd5e1', padding: '8px' }}>{c.codigo}</th>)}
              </tr>
            </thead>
            <tbody>
              {alunosDaTurma.map(aluno => (
                <tr key={aluno.id}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px', fontWeight: 'bold' }}>{aluno.nome}</td>
                  {capacidadesFiltradas.map(c => {
                    const seguroAvaliacoes = aluno.avaliacoes || {};
                    return <td key={c.id} style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>{seguroAvaliacoes[c.id] || '-'}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
