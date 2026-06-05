// src/App.tsx
import React, { useState, useEffect } from 'react';
import { TurmaId, UCId, Aluno, CapacidadeTecnica, NivelDesempenho } from './types';
import { CAPACIDADES_OFICIAIS, getDescricaoRubrica } from './utils';
import CapacidadeCard from './components/CapacidadeCard';

import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// COMPONENTE DE INPUT BLINDADO: Mantém a digitação na memória local de forma totalmente isolada
function NotaInput({ 
  valorInicial, 
  onSalvar 
}: { 
  valorInicial: string; 
  onSalvar: (valor: string) => void 
}) {
  const [valorLocal, setValorLocal] = useState(valorInicial);

  // Sincroniza se o valor mudar externamente (ex: mudar de aluno ou de capacidade)
  useEffect(() => {
    setValorLocal(valorInicial);
  }, [valorInicial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let limpo = e.target.value.replace(/\D/g, ''); // Permite apenas números inteiros
    
    if (limpo !== '') {
      const num = parseInt(limpo, 10);
      if (num > 100) {
        limpo = '100'; // Define o teto máximo em 100
      }
    }
    
    setValorLocal(limpo);
  };

  const handleBlur = () => {
    onSalvar(valorLocal); // Envia o dado para o Firebase apenas quando sai do campo
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSalvar(valorLocal);
      (e.target as HTMLInputElement).blur(); // Tira o foco ao pressionar Enter
    }
  };

  return (
    <input 
      type="text" 
      inputMode="numeric"
      pattern="[0-9]*"
      value={valorLocal} 
      onChange={handleChange} 
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="0-100" 
      className="w-16 h-8 px-2 bg-slate-50 text-slate-800 text-center font-black border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 text-xs shadow-inner" 
    />
  );
}

export default function App() {
  // Estados para o Controle de Acesso (Login)
  const [senhaInput, setSenhaInput] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [erroLogin, setErroLogin] = useState(false);

  // Estados do Sistema de Avaliação
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

    const mapAvaliacoes = alunoAlvo.avaliacoes || {};
    const notaAtual = mapAvaliacoes[capacidadeId];
    const novaNota = notaAtual === nivel ? null : nivel;

    const novasAvaliacoes = { ...mapAvaliacoes };
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

  const handleMudarNotaNumerica = async (alunoId: string, capacidadeId: string, valorLimpo: string) => {
    const alunoAlvo = alunos.find(a => a.id === alunoId);
    if (!alunoAlvo) return;

    const novasNotasNumericas = {
      ...(alunoAlvo.notasNumericas || {}),
      [capacidadeId]: valorLimpo
    };

    setAlunos(prev => prev.map(a => a.id === alunoId ? { ...a, notasNumericas: novasNotasNumericas } : a));

    try {
      await updateDoc(doc(db, 'alunos', alunoId), {
        notasNumericas: novasNotasNumericas
      });
    } catch (error) {
      console.error("Erro ao salvar nota numérica no Firebase:", error);
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
            <h2 className="text-white text-md font-black uppercase tracking-wider block">Sistema de Avaliação</h2>
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
              {erroLogin && <p className="text-red-600 text-[10px] font-black uppercase tracking-wide text-center mt-1">❌ Senha incorreta! Tente novamente.</p>}
            </div>
            <button type="submit" className="w-full h-[48px] bg-[#004fa3] hover:bg-[#003670] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow shadow-blue-900/20">Entrar no Sistema</button>
          </form>

          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Área Restrita — Documentação Pedagógica Oficial</p>
          </div>
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
          #relatorio-pdf-container { display: block !important; position: relative !important; left: 0 !important; top: 0 !important; width: 100% !important; opacity: 1 !important; pointer-events: auto !important; }
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
            <button onClick={() => setAutenticado(false)} className="p-2 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] rounded-xl tracking-wider uppercase transition-colors shadow-sm" title="Sair do Sistema">Sair 🚪</button>
          </div>
        </header>

        <main className="p-8 max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-black italic text-[#004fa3] uppercase tracking-tight">TURMA {turmaAtiva}</h2>
              <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                {ucAtiva === 'FUSI' ? 'Fundamentos da Usinagem' : ucAtiva === 'CRD' ? 'Controle Dimensional' : ucAtiva === 'LIDT' ? 'Leitura de Desenho Técnico' : 'Ciência dos Materiais'}
              </span>
              <button onClick={() => setVerGraficos(true)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] rounded-lg tracking-wider uppercase flex items-center gap-1 shadow-sm transition-colors">📊 Estatísticas da Turma</button>
              <button onClick={exportarRelatorioPDF} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-black text-[10px] rounded-lg tracking-wider uppercase flex items-center gap-1 shadow-sm transition-colors">Salvar PDF / Imprimir 📄</button>
            </div>

            <form onSubmit={handleAddAluno} className="flex items-center gap-3 w-full sm:w-auto">
              <input type="text" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="NOME DO ALUNO..." className="w-full sm:w-64 h-[44px] px-4 bg-white text-slate-700 placeholder-slate-400 font-bold border-2 border-red-600 rounded-xl focus:outline-none shadow-sm text-xs tracking-wide" />
              <button type="submit" className="h-[44px] px-6 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition-colors tracking-wider uppercase shadow-sm">ADD</button>
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
                  <div className="pr-4">
                    <span className="text-xs font-black text-blue-200 uppercase tracking-widest">{capSelecionada.codigo} - DIÁRIO DE CLASSE ({ucAtiva})</span>
                    <h3 className="text-sm font-bold uppercase mt-1 leading-relaxed text-slate-100">{capSelecionada.descricao}</h3>
                  </div>
                  <button onClick={() => setCapSelecionada(null)} className="text-white/80 hover:text-white font-black text-sm bg-black/20 w-8 h-8 rounded-full flex items-center justify-center shrink-0">✕</button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-4">
                  {alunosDaTurma.length === 0 ? (
                    <p className="text-xs font-bold text-slate-400 text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">Nenhum aluno cadastrado nesta turma. Utilize o campo "ADD" no painel superior.</p>
                  ) : (
                    alunosDaTurma.map((aluno) => {
                      const mapaAvaliacoes = aluno.avaliacoes || {};
                      const mapaNotas = aluno.notasNumericas || {};
                      
                      const nivelAtual = mapaAvaliacoes[capSelecionada.id];
                      const notaNum = mapaNotas[capSelecionada.id] ?? '';
                      const textoObs = (aluno.observacoes && aluno.observacoes[capSelecionada.id]) || '';
                      
                      return (
                        <div key={aluno.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-4">
                              <div>
                                <span className="text-[10px] font-black text-slate-400 block tracking-wider">ESTUDANTE</span>
                                <span className="text-sm font-black text-slate-900 uppercase tracking-wide">{aluno.nome}</span>
                              </div>
                              <button type="button" onClick={() => handleExcluirAluno(aluno.id, aluno.nome)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-black tracking-wider uppercase transition-colors">Excluir Aluno 🗑️</button>
                            </div>

                            <div className="flex flex-col items-end gap-3 shrink-0">
                              <div className="flex flex-wrap gap-1.5">
                                {(['NSA', 'APO', 'PAR', 'AUT'] as NivelDesempenho[]).map((nivel) => (
                                  <button
                                    key={nivel}
                                    onClick={() => handleDefinirRubrica(aluno.id, capSelecionada.id, nivel)}
                                    className={`px-3 py-2 rounded-xl text-xs font-black tracking-tight transition-all border ${nivelAtual === nivel ? nivel === 'NSA' ? 'bg-red-600 text-white border-red-600' : nivel === 'APO' ? 'bg-amber-500 text-white border-amber-500' : nivel === 'PAR' ? 'bg-blue-600 text-white border-blue-600' : 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'}`}
                                  >
                                    {nivel}
                                  </button>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Nota Numérica (0-100):</span>
                                <NotaInput 
                                  valorInicial={notaNum} 
                                  onSalvar={(novoValor) => handleMudarNotaNumerica(aluno.id, capSelecionada.id, novoValor)} 
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-black text-slate-400 block tracking-wider uppercase mb-1">Evidências / Observações de Desempenho</label>
                            {/* NOME DA FUNÇÃO CORRIGIDO DE handleMudarObservation PARA handleMudarObservacao */}
                            <textarea value={textoObs} onChange={(e) => handleMudarObservacao(aluno.id, capSelecionada.id, e.target.value)} placeholder="Descreva pontos de atenção ou conquistas do estudante nesta capacidade técnica..." className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl text-xs focus:outline-none focus:bg-white focus:border-blue-400 transition-all min-h-[70px] placeholder-slate-400" />
                            {nivelAtual && <p className="text-[10px] text-slate-400 font-bold italic mt-1">Critério ativo: <span className="text-slate-600">{getDescricaoRubrica(capSelecionada.id, nivelAtual)}</span></p>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
                  <button onClick={() => setCapSelecionada(null)} className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white font-black text-xs rounded-xl uppercase tracking-wider transition-colors">Fechar Diário</button>
                </div>
              </div>
            </div>
          )}

          {verGraficos && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white w-full max-w-xl rounded-[24px] shadow-2xl overflow-hidden border border-slate-100">
                <div className="p-6 bg-[#004fa3] text-white flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase tracking-wider">📊 Desempenho Consolidado - Turma {turmaAtiva}</h3>
                  <button onClick={() => setVerGraficos(false)} className="text-white/80 hover:text-white font-black text-sm">✕</button>
                </div>
                
                <div className="p-6 space-y-5 bg-white">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Distribuição percentual de critérios na Unidade Curricular ({ucAtiva}):</p>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-black">
                      <span className="text-red-600 tracking-wide">NSA - NÃO SATISFATÓRIO</span>
                      <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-md">{totalGeralRubricas.NSA} ({obterPorcentagem(totalGeralRubricas.NSA)})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-red-600 h-full transition-all duration-500" style={{ width: obterPorcentagem(totalGeralRubricas.NSA) }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-black">
                      <span className="text-amber-500 tracking-wide">APO - COM APOIO</span>
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">{totalGeralRubricas.APO} ({obterPorcentagem(totalGeralRubricas.APO)})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: obterPorcentagem(totalGeralRubricas.APO) }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-black">
                      <span className="text-blue-600 tracking-wide">PAR - PARCIALMENTE AUTÔNOMO</span>
                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">{totalGeralRubricas.PAR} ({obterPorcentagem(totalGeralRubricas.PAR)})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: obterPorcentagem(totalGeralRubricas.PAR) }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-black">
                      <span className="text-emerald-600 tracking-wide">AUT - AUTÔNOMO</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">{totalGeralRubricas.AUT} ({obterPorcentagem(totalGeralRubricas.AUT)})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full transition-all duration-500" style={{ width: obterPorcentagem(totalGeralRubricas.AUT) }} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <span>Total de Rubricas Lançadas:</span>
                    <span className="text-slate-700">{somaTotalRubricas}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                  <button onClick={() => setVerGraficos(false)} className="px-5 py-2 bg-slate-700 text-white font-black text-xs rounded-xl uppercase tracking-wider">Fechar Estatísticas</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CONTAINER DO RELATÓRIO OFICIAL SENAI */}
      <div id="relatorio-pdf-container">
        <div style={{ padding: '20px', color: '#1e293b', fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff' }}>
          <div style={{ border: '3px solid #004fa3', padding: '20px', backgroundColor: '#ffffff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'top' }}>
                    <div style={{ backgroundColor: '#dc2626', color: '#ffffff', fontWeight: '900', display: 'inline-block', padding: '6px 16px', fontSize: '18px', fontStyle: 'italic', letterSpacing: '-1px' }}>SENAI</div>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', color: '#004fa3', margin: '10px 0 4px 0' }}>Pauta de Avaliação por Capacidades Sociais e Técnicas</h2>
                    <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', margin: 0 }}>Habilitação Profissional: Mecânico de Usinagem Convencional</p>
                  </td>
                  <td style={{ textAlign: 'right', verticalAlign: 'top', width: '150px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', margin: '0 0 4px 0' }}>TURMA: <span style={{ color: '#dc2626' }}>{turmaAtiva}</span></p>
                    <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', margin: 0 }}>UC: {ucAtiva}</p>
                  </td>
                </tr>
              </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left', width: '25%' }}>Nome do Aluno</th>
                  {capacidadesFiltradas.map(c => (
                    <th key={c.id} style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>{c.codigo}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alunosDaTurma.map(aluno => (
                  <tr key={aluno.id} style={{ textTransform: 'uppercase' }}>
                    <td style={{ border: '1px solid #cbd5e1', padding: '7px 8px', fontWeight: 'bold', color: '#0f172a' }}>{aluno.nome}</td>
                    {capacidadesFiltradas.map(c => {
                      const seguroAvaliacoes = aluno.avaliacoes || {};
                      const seguroNotasNum = aluno.notasNumericas || {};
                      
                      const v = seguroAvaliacoes[c.id] || '-';
                      const notaNumSalva = seguroNotasNum[c.id] || '';
                      
                      const exibicaoCelula = notaNumSalva ? `${v} (${notaNumSalva})` : v;
                      const isPar = v === 'PAR';
                      const corTexto = v === 'NSA' ? '#b91c1c' : v === 'APO' ? '#b45309' : isPar ? '#1d4ed8' : v === 'AUT' ? '#047857' : '#94a3b8';
                      const corFundo = v === 'NSA' ? '#fef2f2' : v === 'APO' ? '#fffbeb' : v === 'PAR' ? '#eff6ff' : v === 'AUT' ? '#ecfdf5' : '#ffffff';

                      return (
                        <td key={c.id} className={isPar ? 'rubrica-azul-impressao' : ''} style={{ border: '1px solid #cbd5e1', padding: '7px 8px', textAlign: 'center', fontWeight: 'bold', color: corTexto, backgroundColor: corFundo }}>
                          {exibicaoCelula}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
