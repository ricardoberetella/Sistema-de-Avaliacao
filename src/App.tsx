import React, { useState } from 'react';
import { TURMAS, UNIDADES_CURRICULARES, RUBRICAS_FICHAS, CRONOGRAMA_FUSI } from './utils';
import { TurmaId, UCId, Estudante, AvaliacaoEstudante, NivelDesempenho } from './types';
import SubjectCard from './components/SubjectCard';

export default function App() {
  const [turmaAtiva, setTurmaAtiva] = useState<TurmaId>('MA');
  const [ucSelecionada, setUcSelecionada] = useState<UCId | null>(null);
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [novoNome, setNovoNome] = useState('');
  const [rubricaIdAtiva, setRubricaIdAtiva] = useState<string>('');
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoEstudante[]>([]);
  const [exibirCronograma, setExibirCronograma] = useState<boolean>(false);

  const fichasDisponiveis = RUBRICAS_FICHAS.filter(f => f.ucId === ucSelecionada);

  React.useEffect(() => {
    if (fichasDisponiveis.length > 0) {
      setRubricaIdAtiva(fichasDisponiveis[0].id);
    } else {
      setRubricaIdAtiva('');
    }
  }, [ucSelecionada]);

  const estudantesDaTurma = estudantes.filter(e => e.turmaId === turmaAtiva);
  const rubricaAtual = RUBRICAS_FICHAS.find(r => r.id === rubricaIdAtiva);

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
    const alignment = avaliacoes.find(a => 
      a.estudanteId === estudanteId && 
      a.turmaId === turmaAtiva && 
      a.ucId === ucSelecionada && 
      a.rubricaId === rubricaIdAtiva
    );
    return alignment ? alignment.notas[criterioId] || null : null;
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-slate-800 font-sans antialiased pb-24">
      
      <header className="relative mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            SISTEMA DE AVALIAÇÃO <span className="text-blue-600">RUBRICAS</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">Metodologia Ocupacional SENAI</p>
        </div>

        <div className="flex bg-[#004488] p-1.5 rounded-2xl shadow-md inline-flex self-start sm:self-center">
          {TURMAS.map((turma) => (
            <button
              key={turma.id}
              onClick={() => setTurmaAtiva(turma.id)}
              className={`px-5 py-2 text-sm font-black rounded-xl transition-all duration-150 ${
                turmaAtiva === turma.id ? 'bg-white text-[#004488] shadow-sm' : 'text-slate-300 hover:text-white'
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
            Filtro: <span className="text-blue-700">{TURMAS.find(t => t.id === turmaAtiva)?.nome}</span>
          </span>
          {ucSelecionada && (
            <div className="flex gap-4">
              <button 
                onClick={() => setExibirCronograma(!exibirCronograma)}
                className="text-xs font-bold text-slate-600 bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 shadow-sm"
              >
                {exibirCronograma ? 'Ocultar Cronograma' : 'Ver Cronograma (60 Aulas)'}
              </button>
              <button onClick={() => setUcSelecionada(null)} className="text-xs font-bold text-blue-600 self-center hover:underline">
                &larr; Voltar para as UCs
              </button>
            </div>
          )}
        </div>

        {!ucSelecionada ? (
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Unidades Curriculares</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {UNIDADES_CURRICULARES.map((uc) => (
                <SubjectCard key={uc.id} uc={uc} onClick={() => setUcSelecionada(uc.id)} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Visualização Condicional do Cronograma Vinculado */}
            {exibirCronograma && ucSelecionada === 'FUSI' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-h-96 overflow-y-auto animate-fadeIn">
                <h3 className="text-sm font-black text-slate-900 uppercase border-b border-slate-200 pb-2 mb-4 tracking-wider">
                  Cronograma MSEP - Fundamentos da Usinagem
                </h3>
                <div className="space-y-3">
                  {CRONOGRAMA_FUSI.map((item) => (
                    <div key={item.aula} className="text-xs flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-1">
                      <span className="font-bold text-blue-700 min-w-[90px]">Aula {item.aula} ({item.data})</span>
                      <span className="text-slate-700 flex-1 px-2 font-medium">{item.conteudo}</span>
                      <span className="text-slate-500 italic bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{item.estrategia}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-6">
              <form onSubmit={handleAddEstudante} className="flex items-center gap-3">
                <input
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="NOME DO ALUNO..."
                  className="w-72 h-[52px] px-5 bg-white text-slate-700 placeholder-slate-400 font-bold border-2 border-red-600 rounded-[20px] focus:outline-none text-sm tracking-wide"
                />
                <button type="submit" className="h-[52px] px-8 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-[20px] tracking-wider uppercase active:scale-95">
                  ADD
                </button>
              </form>

              <div className="flex flex-col gap-1 w-full md:w-96">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Selecione a Rubrica Desejada:</label>
                <select
                  value={rubricaIdAtiva}
                  onChange={(e) => setRubricaIdAtiva(e.target.value)}
                  className="w-full h-[52px] px-4 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-700 focus:outline-none cursor-pointer"
                >
                  {fichasDisponiveis.map(ficha => (
                    <option key={ficha.id} value={ficha.id}>{ficha.titulo}</option>
                  ))}
                </select>
              </div>
            </div>

            {rubricaAtual && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full table-fixed border-collapse">
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
                            Nenhum aluno cadastrado para a {TURMAS.find(t => t.id === turmaAtiva)?.nome}.
                          </td>
                        </tr>
                      ) : (
                        estudantesDaTurma.map((aluno) => (
                          <React.Fragment key={aluno.id}>
                            <tr className="bg-blue-50/40">
                              <td colSpan={5} className="p-3 font-black text-sm text-blue-900 border-y border-blue-100">
                                ALUNO: <span className="underline">{aluno.nome}</span>
                              </td>
                            </tr>
                            {rubricaAtual.criterios.map((crit) => {
                              const notaSelecionada = getNotaAtual(aluno.id, crit.id);
                              return (
                                <tr key={crit.id} className="hover:bg-slate-50/40 transition-colors">
                                  <td className="p-4 font-bold text-slate-900 bg-slate-50/30 align-top">
                                    {crit.referencia}
                                  </td>
                                  {(['NEA', 'APO', 'PAR', 'AUT'] as NivelDesempenho[]).map((nivel) => {
                                    const cores = {
                                      NEA: 'bg-red-50 text-red-900 border-red-500',
                                      APO: 'bg-amber-50 text-amber-900 border-amber-500',
                                      PAR: 'bg-blue-50 text-blue-900 border-blue-500',
                                      AUT: 'bg-emerald-50 text-emerald-900 border-emerald-500',
                                    };
                                    return (
                                      <td
                                        key={nivel}
                                        onClick={() => handleSelectNivel(aluno.id, crit.id, nivel)}
                                        className={`p-4 align-top cursor-pointer border-l border-slate-100 transition-all ${
                                          notaSelecionada === nivel ? `${cores[nivel]} border-2 font-bold shadow-inner` : 'hover:bg-slate-200/50 text-slate-600'
                                        }`}
                                      >
                                        {crit[nivel.toLowerCase() as keyof Omit<typeof crit, 'id' | 'referencia'>]}
                                      </td>
                                    );
                                  })}
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
            )}
          </div>
        )}
      </main>
    </div>
  );
}
