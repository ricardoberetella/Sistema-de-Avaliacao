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
  
  const capacitiesFiltradas = CAPACIDADES_OFICIAIS.filter(c => c.ucId === ucAtiva);
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
          notasNumericas: dados.notasNumericas || {}
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
      console.error("Erro ao salvar nota numérica:", error);
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
  capacitiesFiltradas.forEach(cap => {
    const c = getContagemRubricas(cap.id);
    totalGeralRubricas.NSA += c.NSA;
    totalGeralRubricas.APO += c.APO;
    totalGeralRubricas.PAR += c.PAR;
    totalGeralRubricas.AUT += c.AUT;
  });

  const somaTotalRubricas = totalGeralRubricas.NSA + totalGeralRubricas.APO + totalGeralRubricas.PAR + totalGeralRubricas.AUT;

  const exportarRelatorioPDF = () => {
    const tituloOriginal = document.title;
    document.title = `Relatorio_SENAI_Turma_${turmaAtiva}_${ucAtiva}`;
    window.print();
    document.title = tituloOriginal;
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-800 font-sans antialiased">
      {!autenticado ? (
        <div className="min-h-screen bg-[#f4f7fc] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-[24px] shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-[#004fa3] p-8 text-center">
              <div className="bg-red-600 px-5 py-2 rounded-sm skew-x-[-12deg] font-black text-2xl italic text-white inline-block mb-4 shadow">
                SENAI
              </div>
              <h2 className="text-white text-md font-black uppercase tracking-wider">Sistema de Avaliação</h2>
            </div>
            <form onSubmit={handleLoginSubmit} className="p-8 space-y-6">
              <input
                type="password"
                value={senhaInput}
                onChange={(e) => setSenhaInput(e.target.value)}
                placeholder="Digite a senha..."
                className={`w-full h-[48px] px-4 bg-slate-50 border-2 ${erroLogin ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-500'} text-slate-800 text-center font-black tracking-widest rounded-xl focus:outline-none`}
              />
              <button type="submit" className="w-full h-[48px] bg-[#004fa3] text-white font-black text-xs uppercase tracking-widest rounded-xl">Entrar</button>
            </form>
          </div>
        </div>
      ) : (
        <div>
          <header className="bg-[#004fa3] px-8 py-5 flex flex-col lg:flex-row items-center justify-between shadow-md text-white gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
              <div className="bg-red-600 px-5 py-2 rounded-sm skew-x-[-12deg] font-black text-2xl italic">SENAI</div>
              <div className="text-center lg:text-left flex-1">
                <h1 className="text-lg md:text-xl font-black uppercase">Sistema de Avaliação</h1>
                <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3">
                  {(['FUSI', 'CRD', 'LIDT', 'CIEMA'] as UCId[]).map((sigla) => (
                    <button 
                      key={sigla}
                      onClick={() => { setUcAtiva(sigla); setCapSelecionada(null); }}
                      className={`text-xs font-black uppercase transition-all ${ucAtiva === sigla ? 'text-white border-b-2 border-white' : 'text-blue-300'}`}
                    >
                      {sigla}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-[#003670] p-1 rounded-xl flex items-center">
                {turmasDisponiveis.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTurmaAtiva(t); setCapSelecionada(null); }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-black ${turmaAtiva === t ? 'bg-white text-[#004fa3]' : 'text-blue-200'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button onClick={() => setAutenticado(false)} className="p-2 bg-red-600 text-white font-black text-[10px] rounded-xl uppercase">Sair</button>
            </div>
          </header>

          <main className="p-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black italic text-[#004fa3] uppercase">TURMA {turmaAtiva}</h2>
                <button onClick={() => setVerGraficos(true)} className="px-3 py-1.5 bg-blue-600 text-white font-black text-[10px] rounded-lg uppercase">📊 Estatísticas</button>
                <button onClick={exportarRelatorioPDF} className="px-3 py-1.5 bg-slate-700 text-white font-black text-[10px] rounded-lg uppercase">PDF 📄</button>
              </div>
              <form onSubmit={handleAddAluno} className="flex items-center gap-3">
                <input type="text" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="NOME DO ALUNO..." className="w-full sm:w-64 h-[44px] px-4 bg-white border-2 border-red-600 rounded-xl focus:outline-none text-xs" />
                <button type="submit" className="h-[44px] px-6 bg-red-600 text-white font-black text-xs rounded-xl uppercase">ADD</button>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {capacitiesFiltradas.map((cap) => (
                <CapacidadeCard key={cap.id} capacidade={cap} contagemRubricas={getContagemRubricas(cap.id)} totalAlunos={alunosDaTurma.length} onClick={() => setCapSelecionada(cap)} />
              ))}
            </div>

            {capSelecionada && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white w-full max-w-5xl rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                  <div className="p-6 bg-[#004fa3] text-white flex justify-between items-start">
                    <div>
                      <span className="text-xs font-black text-blue-200 uppercase">{capSelecionada.codigo} - DIÁRIO</span>
                      <h3 className="text-sm font-bold uppercase mt-1">{capSelecionada.descricao}</h3>
                    </div>
                    <button onClick={() => setCapSelecionada(null)} className="text-white bg-black/20 w-8 h-8 rounded-full">✕</button>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-4">
                    {alunosDaTurma.map((aluno) => (
                      <LinhaAlunoAvaliacao 
                        key={aluno.id}
                        aluno={aluno}
                        capacidadeId={capSelecionada.id}
                        handleExcluirAluno={handleExcluirAluno}
                        handleMudarNotaNumerica={handleMudarNotaNumerica}
                        handleDefinirRubrica={handleDefinirRubrica}
                        handleMudarObservacao={handleMudarObservacao}
                      />
                    ))}
                  </div>
                  <div className="p-4 bg-slate-100 flex justify-end">
                    <button onClick={() => setCapSelecionada(null)} className="px-5 py-2 bg-slate-700 text-white font-black text-xs rounded-xl uppercase">Fechar</button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
