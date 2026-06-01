import React, { useState } from 'react';
import { TurmaId, Aluno, OperacaoUsinagem } from './types';
import { OPERACOES_FUSI } from './utils';
import OperacaoCard from './components/OperacaoCard';

export default function App() {
  const [turmaAtiva, setTurmaAtiva] = useState<TurmaId>('MA');
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [novoNome, setNovoNome] = useState('');
  
  // Estado para controlar qual card foi clicado para gerenciar os alunos individuais
  const [opSelecionada, setOpSelecionada] = useState<OperacaoUsinagem | null>(null);

  const turmasDisponiveis: TurmaId[] = ['MA', 'MB', 'TA', 'TB'];
  const alunosDaTurma = alunos.filter(a => a.turmaId === turmaAtiva);

  const handleAddAluno = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    const novoAluno: Aluno = {
      id: crypto.randomUUID(),
      nome: novoNome.trim().toUpperCase(),
      turmaId: turmaAtiva,
      operacoesConcluidas: []
    };

    setAlunos(prev => [...prev, novoAluno]);
    setNovoNome('');
  };

  const toggleOperacaoAluno = (alunoId: string, opId: string) => {
    setAlunos(prev => prev.map(aluno => {
      if (aluno.id !== alunoId) return aluno;
      const jaConcluiu = aluno.operacoesConcluidas.includes(opId);
      return {
        ...aluno,
        operacoesConcluidas: jaConcluiu
          ? aluno.operacoesConcluidas.filter(id => id !== opId)
          : [...aluno.operacoesConcluidas, opId]
      };
    }));
  };

  const getContagemConcluidos = (opId: string) => {
    return alunosDaTurma.filter(a => a.operacoesConcluidas.includes(opId)).length;
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-800 font-sans antialiased">
      
      {/* CABEÇALHO AZUL IDÊNTICO AO DA IMAGEM image_e0fda8.png */}
      <header className="bg-[#004fa3] px-8 py-5 flex flex-col md:flex-row items-center justify-between shadow-md text-white gap-4">
        <div className="flex items-center gap-6">
          {/* Logo Estilo SENAI */}
          <div className="bg-red-600 px-5 py-2 rounded-sm skew-x-[-12deg] font-black text-2xl tracking-tighter italic">
            SENAI
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-lg md:text-xl font-black uppercase tracking-wider">
              Mecânico de Usinagem Convencional
            </h1>
            <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mt-0.5">
              Controle de Demonstrações
            </p>
          </div>
        </div>

        {/* Seletor de Turma e Logout da Imagem */}
        <div className="flex items-center gap-4">
          <div className="bg-[#003670] p-1 rounded-xl flex items-center shadow-inner">
            {turmasDisponiveis.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTurmaAtiva(t);
                  setOpSelecionada(null);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all ${
                  turmaAtiva === t
                    ? 'bg-white text-[#004fa3] shadow'
                    : 'text-blue-200 hover:text-white bg-transparent'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {/* Botão de Saída Vermelho */}
          <button className="bg-red-600 hover:bg-red-700 p-2.5 rounded-xl transition-colors shadow">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      </header>

      {/* PAINEL INFERIOR E BARRA DE ADICIONAR ALUNO (image_e0fda8.png) */}
      <main className="p-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black italic text-[#004fa3] uppercase tracking-tight">
              TURMA {turmaAtiva}
            </h2>
            <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
              Painel
            </span>
          </div>

          {/* Form de Cadastro com Input Borda Vermelha e Botão "ADD" */}
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

        {/* GRADE DE CARDS (GRID DE 4 COLUNAS EXATAMENTE COMO NA IMAGEM) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {OPERACOES_FUSI.map((op) => (
            <OperacaoCard
              key={op.id}
              op={op}
              concluidos={getContagemConcluidos(op.id)}
              totalAlunos={alunosDaTurma.length}
              onClick={() => setOpSelecionada(op)}
            />
          ))}
        </div>

        {/* MODAL / ÁREA LATERAL FLUTUANTE PARA MARCAR CONCLUSÃO DE OPERAÇÃO DO ALUNO */}
        {opSelecionada && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white w-full max-w-md rounded-[24px] shadow-xl overflow-hidden border border-slate-100">
              <div className="p-6 bg-[#004fa3] text-white flex justify-between items-start">
                <div>
                  <span className="text-xs font-black text-blue-200 uppercase tracking-widest">{opSelecionada.numero} - {opSelecionada.maquina}</span>
                  <h3 className="text-base font-black uppercase mt-1 leading-tight">{opSelecionada.titulo}</h3>
                </div>
                <button 
                  onClick={() => setOpSelecionada(null)}
                  className="text-white/80 hover:text-white font-bold text-sm bg-black/10 px-2.5 py-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 max-h-[400px] overflow-y-auto">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">Marque os alunos que executaram a demonstração:</p>
                
                {alunosDaTurma.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 text-center py-6">Nenhum aluno cadastrado nesta turma ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {alunosDaTurma.map((aluno) => {
                      const concluido = aluno.operacoesConcluidas.includes(opSelecionada.id);
                      return (
                        <div 
                          key={aluno.id}
                          onClick={() => toggleOperacaoAluno(aluno.id, opSelecionada.id)}
                          className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            concluido 
                              ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-sm' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xs uppercase tracking-wide">{aluno.nome}</span>
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            concluido ? 'bg-[#004fa3] border-[#004fa3] text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {concluido && <span className="text-[10px] font-black">✓</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setOpSelecionada(null)}
                  className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
