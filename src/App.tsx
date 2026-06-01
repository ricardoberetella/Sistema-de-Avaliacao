import React, { useState } from 'react';
import { TURMAS, UNIDADES_CURRICULARES, RUBRICAS_FICHAS } from './utils';
import { TurmaId, UCId, Estudante, AvaliacaoEstudante, NivelDesempenho } from './types';
import SubjectCard from './components/SubjectCard';

export default function App() {
  const [turmaAtiva, setTurmaAtiva] = useState<TurmaId>('MA');
  const [ucSelecionada, setUcSelecionada] = useState<UCId | null>(null);
  
  // Lista de estudantes dinâmica cadastrada pelo usuário
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [novoNome, setNovoNome] = useState('');

  // Filtra as fichas de rubricas disponíveis para a UC selecionada
  const fichasDisponiveis = RUBRICAS_FICHAS.filter(f => f.ucId === ucSelecionada);
  
  // Estado para a rubrica ativa selecionada no campo de seleção
  const [rubricaIdAtiva, setRubricaIdAtiva] = useState<string>('');

  // Estado das avaliações salvas
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoEstudante[]>([]);

  // Atualiza automaticamente a rubrica ativa ao trocar de UC
  React.useEffect(() => {
    if (fichasDisponiveis.length > 0) {
      setRubricaIdAtiva(fichasDisponiveis[0].id);
    } else {
      setRubricaIdAtiva('');
    }
  }, [ucSelecionada]);

  // Estudantes da turma atual
  const estudantesDaTurma = estudantes.filter(e => e.turmaId === turmaAtiva);

  // Rubrica completa que está selecionada no campo
  const rubricaAtual = RUBRICAS_FICHAS.find(r => r.id === rubricaIdAtiva);

  // Ação de Cadastrar Aluno (IDÊNTICO AO PRINT 1 - image_e1e2c4.png)
  const handleAddEstudante = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    const novoAluno: Estudante = {
      id: crypto.randomUUID(),
      nome: novoNome.trim().toUpperCase(),
      turmaId: turmaAtiva
    };

    setEstudantes(prev => [...prev, novoAluno]);
    setNovoNome('');
  };

  // Alternar as notas nas colunas da tabela (NEA, APO, PAR, AUT)
  const handleSelectNivel = (estudanteId: string, criterioId: string, nivel: NivelDesempenho) => {
    if (!ucSelecionada || !rubricaIdAtiva) return;

    setAvaliacoes(prev => {
      const idx = prev.findIndex(a => 
        a.estudanteId === estudanteId && 
        a.turmaId === turmaAtiva && 
        a.ucId === ucSelecionada && 
        a.rubricaId === rubricaIdAtiva
      );

      if (idx > -1) {
        const copia = [...prev];
        const notaAtual = copia[idx].notas[criterioId];
        copia[idx].notas[criterioId] = notaAtual === nivel ? null : nivel;
        return copia;
      } else {
        return [
          ...prev,
          {
            estudanteId,
            turmaId: turmaAtiva,
            ucId: ucSelecionada,
            rubricaId: rubricaIdAtiva,
            notas: { [criterioId]: nivel }
          }
        ];
      }
    });
  };

  const getNotaAtual = (estudanteId: string, criterioId: string): NivelDesempenho | null => {
    const avaliacao = avaliacoes.find(a => 
      a.estudanteId === estudanteId && 
      a.turmaId === turmaAtiva && 
      a.ucId === ucSelecionada && 
      a.rubricaId === rubricaIdAtiva
    );
    return avaliacao ? avaliacao.notas[criterioId] || null : null;
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-slate-800 font-sans antialiased">
      
      {/* SELETOR SUPERIOR DE TURMAS */}
      <header className="relative mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            SISTEMA DE AVALIAÇÃO <span className="text-blue-600">RUBRICAS</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">Padrão Pedagógico de Competências</p>
        </div>

        <div className="flex bg-[#004488] p-1.5 rounded-2xl shadow-md inline-flex self-start sm:self-center">
          {TURMAS.map((turma) => (
            <button
              key={turma.id}
              onClick={() => setTurmaAtiva(turma.id)}
              className={`px-5 py-2 text-sm font-black rounded-xl transition-all duration-150 ${
                turmaAtiva === turma.id
                  ? 'bg-white text-[#004488] shadow-sm'
                  : 'text-slate-300 hover:text-white bg-transparent'
              }`}
            >
              {turma.id}
            </button>
          ))}
        </div>
      </header>

      <main>
        <div className="mb-6 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300">
            Turma Ativa: <span className="text-blue-700">{TURMAS.find(t => t.id === turmaAtiva)?.nome}</span>
          </span>
          {ucSelecionada && (
            <button 
              onClick={() => setUcSelecionada(null)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              &larr; Voltar para as UCs
            </button>
          )}
        </div>

        {/* FLUXO 1: SELEÇÃO DA UNIDADE CURRICULAR */}
        {!ucSelecionada ? (
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Escolha a Unidade Curricular</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {UNIDADES_CURRICULARES.map((uc) => (
                <SubjectCard key={uc.id} uc={uc} onClick={() => setUcSelecionada(uc.id)} />
              ))}
            </div>
          </div>
        ) : (
          
          /* FLUXO 2: TELA DA RUBRICA COM CADASTRO E MATRIZ */
          <div className="space-y-6">
            
            {/* BARRA DE FERRAMENTAS: CADASTRO ALUNO (PRINT 1) E SELEÇÃO DE RUBRICA (PRINT 2) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-6">
              
              {/* COMPONENTE DE CADASTRO DO ALUNO (ESTILIZADO IGUAL À IMAGEM image_e1e2c4.png) */}
              <form onSubmit={handleAddEstudante} className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="NOME DO ALUNO..."
                    className="w-72 h-[52px] px-5 bg-white text-slate-700 placeholder-slate-400 font-bold border-2 border-red-600 rounded-[20px] focus:outline-none shadow-sm text-sm tracking-wide"
                  />
                </div>
                <button
                  type="submit"
                  className="h-[52px] px-8 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-[20px] transition-colors tracking-wider shadow-sm uppercase active:scale-95"
                >
                  ADD
                </button>
              </form>

              {/* CAMPO PARA SELECIONAR A RUBRICA DESEJADA (SOLICITADO DO PRINT 2) */}
              <div className="flex flex-col gap-1 w-full md:w-96">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Selecione a Rubrica Aplicada:</label>
                <select
                  value={rubricaIdAtiva}
                  onChange={(e) => setRubricaIdAtiva(e.target.value)}
                  className="w-full h-[52px] px-4 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  {fichasDisponiveis.map(ficha => (
                    <option key={ficha.id} value={ficha.id}>{ficha.titulo}</option>
                  ))}
                  {fichasDisponiveis.length === 0 && <option>Nenhuma rubrica cadastrada</option>}
                </select>
              </div>
            </div>

            {/* RENDERIZAÇÃO DA TABELA DE RUBRICAS (ESTILIZADA CONFORME image_e1e648.png) */}
            {rubricaAtual ? (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">{rubricaAtual.titulo}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Clique nos cards dos níveis para atribuir ao aluno correspondente.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full table-fixed border-collapse">
                    {/* Cabeçalho Escuro da Tabela Oficial SENAI */}
                    <thead className="bg-[#0f172a] text-white text-xs font-black uppercase tracking-wider">
                      <tr>
                        <th className="p-4 text-left w-64">REFERÊNCIA</th>
                        <th className="p-4 text-left w-72 text-red-400">NEA</th>
                        <th className="p-4 text-left w-72 text-amber-400">APO</th>
                        <th className="p-4 text-left w-72 text-blue-400">PAR</th>
                        <th className="p-4 text-left w-72 text-emerald-400">AUT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700 text-xs">
                      {estudantesDaTurma.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400 font-bold text-sm">
                            Nenhum aluno cadastrado para a {TURMAS.find(t => t.id === turmaAtiva)?.nome} ainda. Adicione acima!
                          </td>
                        </tr>
                      ) : (
                        estudantesDaTurma.map((aluno) => (
                          <React.Fragment key={aluno.id}>
                            {/* Linha separadora identificando o Nome do Aluno sendo avaliado */}
                            <tr className="bg-blue-50/50">
                              <td colSpan={5} className="p-3 font-black text-sm text-blue-900 border-y border-blue-100">
                                AVVALIAÇÃO DE: <span className="underline">{aluno.nome}</span>
                              </td>
                            </tr>
                            
                            {/* Linhas de Critérios para o Aluno */}
                            {rubricaAtual.criterios.map((crit) => {
                              const notaSelecionada = getNotaAtual(aluno.id, crit.id);
                              
                              return (
                                <tr key={crit.id} className="hover:bg-slate-50/50 transition-colors">
                                  {/* Referência da Capacidade */}
                                  <td className="p-4 font-bold text-slate-900 bg-slate-50/30 align-top">
                                    {crit.referencia}
                                  </td>
                                  
                                  {/* Célula NEA */}
                                  <td 
                                    onClick={() => handleSelectNivel(aluno.id, crit.id, 'NEA')}
                                    className={`p-4 align-top cursor-pointer border-l border-slate-100 transition-all ${
                                      notaSelecionada === 'NEA' 
                                        ? 'bg-red-50 text-red-900 border-2 border-red-500 font-semibold shadow-inner' 
                                        : 'hover:bg-slate-100/70 text-slate-600'
                                    }`}
                                  >
                                    {crit.nea}
                                  </td>

                                  {/* Célula APO */}
                                  <td 
                                    onClick={() => handleSelectNivel(aluno.id, crit.id, 'APO')}
                                    className={`p-4 align-top cursor-pointer border-l border-slate-100 transition-all ${
                                      notaSelecionada === 'APO' 
                                        ? 'bg-amber-50 text-amber-900 border-2 border-amber-500 font-semibold shadow-inner' 
                                        : 'hover:bg-slate-100/70 text-slate-600'
                                    }`}
                                  >
                                    {crit.apo}
                                  </td>

                                  {/* Célula PAR */}
                                  <td 
                                    onClick={() => handleSelectNivel(aluno.id, crit.id, 'PAR')}
                                    className={`p-4 align-top cursor-pointer border-l border-slate-100 transition-all ${
                                      notaSelecionada === 'PAR' 
                                        ? 'bg-blue-50 text-blue-900 border-2 border-blue-500 font-semibold shadow-inner' 
                                        : 'hover:bg-slate-100/70 text-slate-600'
                                    }`}
                                  >
                                    {crit.par}
                                  </td>

                                  {/* Célula AUT */}
                                  <td 
                                    onClick={() => handleSelectNivel(aluno.id, crit.id, 'AUT')}
                                    className={`p-4 align-top cursor-pointer border-l border-slate-100 transition-all ${
                                      notaSelecionada === 'AUT' 
                                        ? 'bg-emerald-50 text-emerald-900 border-2 border-emerald-500 font-semibold shadow-inner' 
                                        : 'hover:bg-slate-100/70 text-slate-600'
                                    }`}
                                  >
                                    {crit.aut}
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

          </div>
        )}
      </main>
    </div>
  );
}
