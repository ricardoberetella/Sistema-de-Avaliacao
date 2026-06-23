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
  
  const alunosDaTurma = alunos
    .filter(a => a.turmaId === turmaAtiva)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  const nomesUC: Record<UCId, string> = {
    FUSI: 'Fundamentos da Usinagem',
    CRD: 'Controle Dimensional',
    LIDT: 'Leitura e Interpretação de Desenho Técnico',
    CIEMA: 'Ciência dos Materiais e Metrologia'
  };

  // Calcula a rubrica e a nota final da UC por predominância e desempate pelo maior valor
  const calcularResultadoPredominanteAlunoUC = (aluno: Aluno, ucId: UCId): { rubrica: string; nota: string } => {
    const avaliacoes = aluno.avaliacoes || {};
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

    if (!avaliouAlguma) return { rubrica: '-', nota: '-' };

    // Ordem crescente: se houver empate, a iteração mantém a maior rubrica avaliada
    const ordemHierarquica: NivelDesempenho[] = ['NSA', 'APO', 'PAR', 'AUT'];
    let rubricaVencedora: NivelDesempenho = 'NSA';
    let maxContagem = -1;

    ordemHierarquica.forEach((nivel) => {
      const qtd = contagem[nivel];
      if (qtd >= maxContagem && qtd > 0) {
        maxContagem = qtd;
        rubricaVencedora = nivel;
      }
    });

    const BureauNotas: Record<NivelDesempenho, string> = {
      NSA: '25',
      APO: '45',
      PAR: '80',
      AUT: '100'
    };

    return {
      rubrica: rubricaVencedora,
      nota: BureauNotas[rubricaVencedora]
    };
  };

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

  const handleEditarAluno = useCallback(async (alunoId: string, nomeAtual: string) => {
    const novoNomePrompt = window.prompt(`Editar nome do aluno:`, nomeAtual);
    if (novoNomePrompt === null) return; 
    
    const nomeValidado = novoNomePrompt.trim().toUpperCase();
    if (!nomeValidado) {
      window.alert("O nome do aluno não pode ficar em branco!");
      return;
    }

    try {
      await updateDoc(doc(db, 'alunos', alunoId), {
        nome: nomeValidado
      });
    } catch (error) {
      console.error("Erro ao editar aluno:", error);
    }
  }, []);

  const handleDefinirRubrica = useCallback(async (alunoId: string, capacidadId: string, nivel: NivelDesempenho | '') => {
    let notaAutomatica = '';
    if (nivel === 'NSA') notaAutomatica = '25';
    else if (nivel === 'APO') notaAutomatica = '45';
    else if (nivel === 'PAR') notaAutomatica = '80';
    else if (nivel === 'AUT') notaAutomatica = '100';

    try {
      await updateDoc(doc(db, 'alunos', alunoId), {
        [`avaliacoes.${capacidadId}`]: nivel,
        [`notasNumericas.${capacidadId}`]: notaAutomatica
      });
    } catch (error) {
      console.error("Erro ao atualizar rubrica e nota:", error);
    }
  }, []);

  const handleMudarNotaNumerica = useCallback(async (alunoId: string, capacidadId: string, valor: string) => {
    try {
      await updateDoc(doc(db, 'alunos', alunoId), {
        [`notasNumericas.${capacidadId}`]: valor
      });
    } catch (error) {
      console.error("Erro ao salvar nota numérica:", error);
    }
  }, []);

  const handleMudarObservacao = useCallback(async (alunoId: string, capacidadId: string, texto: string) => {
    try {
      await updateDoc(doc(db, 'alunos', alunoId), {
        [`observacoes.${capacidadId}`]: texto
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

  const totalGeralRubricasUC = { NSA: 0, APO: 0, PAR: 0, AUT: 0 };
  capacitiesFiltradas.forEach(cap => {
    const c = getContagemRubricas(cap.id);
    totalGeralRubricasUC.NSA += c.NSA;
    totalGeralRubricasUC.APO += c.APO;
    totalGeralRubricasUC.PAR += c.PAR;
    totalGeralRubricasUC.AUT += c.AUT;
  });

  const { NSA, APO, PAR, AUT } = totalGeralRubricasUC;
  const somaGeralAbsoluta = NSA + APO + PAR + AUT;

  const obterPorcentagemGeral = (valor: number) => {
    if (somaGeralAbsoluta === 0) return 0;
    return (valor / somaGeralAbsoluta) * 100;
  };

  const getCorEstiloRubrica = (nivel: string) => {
    switch (nivel) {
      case 'NSA': return 'text-red-600 font-black';
      case 'APO': return 'text-orange-500 font-black';
      case 'PAR': return 'text-blue-600 font-black';
      case 'AUT': return 'text-emerald-600 font-black';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-800 font-sans antialiased">
      
      {/* ESPELHO EXCLUSIVO PARA IMPRESSÃO EM FOLHA ÚNICA A4 */}
      <div className="hidden print:block p-2 bg-white text-black min-h-screen">
        <div className="flex items-center justify-between border-b-2 border-[#004fa3] pb-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 px-3 py-1 rounded-sm font-black text-md italic text-white tracking-tighter">
              SENAI
            </div>
            <div>
              <div className="text-[9px] font-black uppercase text-slate-700 tracking-tight">Mecânico de Usinagem Convencional</div>
              <h1 className="text-sm font-black uppercase tracking-tight text-[#004fa3]">Relatório Oficial de Rendimento</h1>
              <p className="text-[10px] font-bold text-slate-600 uppercase">UC: {ucAtiva} - {nomesUC[ucAtiva]}</p>
            </div>
          </div>
          <div className="text-right text-[10px] font-bold">
            <p className="text-xs font-black text-slate-900">TURMA: {turmaAtiva}</p>
            <p className="text-slate-500">Data: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left uppercase w-8 text-[10px] font-black text-slate-700">Nº</th>
              <th className="text-left uppercase w-52">Estudante</th>
              {capacitiesFiltradas.map(cap => (
                <th key={cap.id} className="text-center uppercase">
                  <div>{cap.codigo.split(' ')[0]}</div>
                  <div className="text-[7px] text-slate-500 font-normal">{cap.codigo.split(' ').slice(1).join(' ')}</div>
                </th>
              ))}
              <th className="text-center uppercase w-24 text-[10px] font-black text-blue-800 bg-slate-50/80 border-l border-slate-200">
                RESULTADO FINAL
              </th>
            </tr>
          </thead>
          <tbody>
            {alunosDaTurma.map((aluno, idx) => {
              const resFinal = calcularResultadoPredominanteAlunoUC(aluno, ucAtiva);
              return (
                <tr key={aluno.id}>
                  <td className="font-bold text-slate-500 text-xs tracking-tight text-left">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="font-bold uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{aluno.nome}</td>
                  {capacitiesFiltradas.map(cap => {
                    const rubrica = aluno.avaliacoes?.[cap.id] || '-';
                    
                    return (
                      <td key={cap.id} className="text-center py-1 border border-slate-200">
                        <div className="flex flex-col items-center justify-center min-h-[28px]">
                          {/* ATUALIZADO: Mostra exclusivamente a rubrica, sem a nota numérica abaixo */}
                          <span className={`text-xs ${getCorEstiloRubrica(rubrica)}`}>
                            {rubrica}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                  {/* Mantido com a Rubrica e Nota acopladas de forma estruturada */}
                  <td className="text-center py-1 bg-slate-50/50 border border-slate-200 font-black">
                    <div className="flex flex-col items-center justify-center min-h-[28px]">
                      <span className={`text-xs ${getCorEstiloRubrica(resFinal.rubrica)}`}>
                        {resFinal.rubrica}
                      </span>
                      {resFinal.nota !== '-' && (
                        <span className={`text-[9px] px-1 rounded-sm mt-0.5 bg-slate-100 font-black ${getCorEstiloRubrica(resFinal.rubrica)}`}>
                          {resFinal.nota}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-8 border-t-2 border-slate-200 pt-4 avoiding-page-break">
          <h3 className="text-[10px] font-black uppercase text-[#004fa3] tracking-wider mb-2">
            Legenda de Competências e Capacidades Técnicas Avaliadas
          </h3>
          <table className="w-full border-collapse border border-slate-200 text-[9px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 p-1.5 text-left font-black uppercase w-20 text-slate-700">Código</th>
                <th className="border border-slate-200 p-1.5 text-left font-black uppercase text-slate-700">Descrição Detalhada da Capacidade Técnica</th>
              </tr>
            </thead>
            <tbody>
              {capacitiesFiltradas.map(cap => (
                <tr key={cap.id} className="hover:bg-slate-50">
                  <td className="border border-slate-200 p-1.5 font-black uppercase text-blue-700 tracking-tight whitespace-nowrap">{cap.codigo}</td>
                  <td className="border border-slate-200 p-1.5 font-medium text-slate-800 leading-snug">{cap.descricao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAINEL DE CONTROLE WEB */}
      <div className="print:hidden">
        {!autenticado ? (
          <div className="min-h-screen bg-[#f4f7fc] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[24px] shadow-xl border border-slate-100 overflow-hidden">
              <div className="bg-[#004fa3] p-8 text-center flex flex-col items-center">
                <div className="bg-red-600 px-5 py-2 rounded-sm skew-x-[-12deg] font-black text-2xl italic text-white inline-block mb-3 shadow">
                  SENAI
                </div>
                <div className="text-blue-100 text-[11px] font-black uppercase tracking-widest mb-1 mt-1">
                  Mecânico de Usinagem Convencional
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
                  <div className="text-blue-200 text-xs font-black uppercase tracking-wider">Mecânico de Usinagem Convencional</div>
                  <h1 className="text-lg md:text-xl font-black uppercase mt-0.5">Sistema de Avaliação</h1>
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
                  <button onClick={() => setVerGraficos(true)} className="px-4 h-9 bg-blue-600 text-white font-black text-[10px] rounded-xl uppercase tracking-wider shadow">📊 Estatísticas</button>
                  <button onClick={() => window.print()} className="px-4 h-9 bg-slate-700 text-white font-black text-[10px] rounded-xl uppercase tracking-wider shadow">PDF 📄</button>
                </div>
                <form onSubmit={handleAddAluno} className="flex items-center gap-3">
                  <input type="text" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="NOME DO ALUNO..." className="w-full sm:w-64 h-[44px] px-4 bg-white border-2 border-red-600 rounded-xl focus:outline-none text-xs font-bold" />
                  <button type="submit" className="h-[44px] px-6 bg-red-600 text-white font-black text-xs rounded-xl uppercase">ADD</button>
                </form>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {capacitiesFiltradas.map((cap) => (
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
                  <div className="bg-white w-full max-w-6xl rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 bg-[#004fa3] text-white flex justify-between items-start">
                      <div>
                        <span className="text-xs font-black text-blue-200 uppercase">{capSelecionada.codigo} - DIÁRIO</span>
                        <h3 className="text-sm font-bold uppercase mt-1">{capSelecionada.descricao}</h3>
                      </div>
                      <button onClick={() => setCapSelecionada(null)} className="text-white bg-black/20 w-8 h-8 rounded-full">✕</button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-4">
                      {alunosDaTurma.map((aluno, index) => (
                        <LinhaAlunoAvaliacao 
                          key={aluno.id}
                          aluno={aluno}
                          index={index + 1} 
                          capacidadeId={capSelecionada.id}
                          handleExcluirAluno={handleExcluirAluno}
                          handleEditarAluno={handleEditarAluno}
                          handleDefinirRubrica={handleDefinirRubrica}
                          handleMudarNotaNumerica={handleMudarNotaNumerica}
                          handleMudarObservacao={handleMudarObservacao}
                        />
                      ))}
                    </div>
                    
                    <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                      <div className="grid grid-cols-4 gap-2 flex-1 max-w-4xl text-[11px] leading-tight text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                        <div><span className="font-black text-red-600 block uppercase">NSA</span>Não consegue executar as operações básicas de forma satisfatória ou segura.</div>
                        <div><span className="font-black text-orange-500 block uppercase">APO</span>Executa demonstrando insegurança e comete erros frequentes.</div>
                        <div><span className="font-black text-blue-600 block uppercase">PAR</span>Executa as operações, mas precisa de orientação pontual do docente.</div>
                        <div><span className="font-black text-emerald-600 block uppercase">AUT</span>Executa com total autonomia e segurança, atingindo precisão dimensional.</div>
                      </div>
                      <button onClick={() => setCapSelecionada(null)} className="px-6 h-[44px] bg-slate-800 text-white font-black text-xs rounded-xl uppercase tracking-wider">Fechar Diário</button>
                    </div>
                  </div>
                </div>
              )}

              {verGraficos && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-white w-full max-w-3xl rounded-[24px] shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                      <div>
                        <h3 className="font-black uppercase text-sm tracking-wider">📊 Estatísticas Analíticas da Turma</h3>
                        <p className="text-xs text-slate-400 font-medium uppercase mt-0.5">Rendimento Acumulado na Unidade Curricular {ucAtiva}</p>
                      </div>
                      <button onClick={() => setVerGraficos(false)} className="text-white bg-white/10 w-8 h-8 rounded-full">✕</button>
                    </div>
                    
                    <div className="p-6 space-y-6 bg-slate-50">
                      {somaGeralAbsoluta === 0 ? (
                        <div className="text-center py-12 text-slate-400 font-bold uppercase text-xs">Nenhuma avaliação realizada nesta Unidade Curricular até o momento.</div>
                      ) : (
                        <div className="space-y-5">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-black uppercase text-slate-700"><span>Autonomia (AUT)</span><span>{AUT} ({obterPorcentagemGeral(AUT).toFixed(1)}%)</span></div>
                            <div className="w-full h-5 bg-slate-200 rounded-lg overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${obterPorcentagemGeral(AUT)}%` }}></div></div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-black uppercase text-slate-700"><span>Parcialmente (PAR)</span><span>{PAR} ({obterPorcentagemGeral(PAR).toFixed(1)}%)</span></div>
                            <div className="w-full h-5 bg-slate-200 rounded-lg overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${obterPorcentagemGeral(PAR)}%` }}></div></div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-black uppercase text-slate-700"><span>Com Apoio (APO)</span><span>{APO} ({obterPorcentagemGeral(APO).toFixed(1)}%)</span></div>
                            <div className="w-full h-5 bg-slate-200 rounded-lg overflow-hidden"><div className="h-full bg-orange-500" style={{ width: `${obterPorcentagemGeral(APO)}%` }}></div></div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-black uppercase text-slate-700"><span>Não Satisfeito (NSA)</span><span>{NSA} ({obterPorcentagemGeral(NSA).toFixed(1)}%)</span></div>
                            <div className="w-full h-5 bg-slate-200 rounded-lg overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${obterPorcentagemGeral(NSA)}%` }}></div></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-slate-100 flex justify-end">
                      <button onClick={() => setVerGraficos(false)} className="px-5 py-2.5 bg-slate-800 text-white font-black text-xs rounded-xl uppercase">Fechar Painel</button>
                    </div>
                  </div>
                </div>
              )}

            </main>
          </div>
        )}
      </div>
    </div>
  );
}
