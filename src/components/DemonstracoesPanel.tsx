/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState } from "react";
import { 
  Check, 
  X, 
  Search, 
  Plus, 
  MessageSquare, 
  ArrowRight, 
  Award, 
  Sliders, 
  BookOpen, 
  GraduationCap, 
  HelpCircle,
  FileCheck2,
  Trash2
} from "lucide-react";
import { Turma, Student, CurricularUnit, TechnicalCapacityRating, PerformanceLevel } from "../types";
import { getDefaultCapacitiesForUC } from "../utils";

interface DemonstracoesPanelProps {
  turmas: Turma[];
  selectedTurmaId: string;
  onSelectTurma: (turmaId: string) => void;
  onSaveStudentCapacity: (
    turmaId: string,
    studentId: string,
    ucCode: string,
    capacityId: string,
    rubric: PerformanceLevel | null,
    grade: number | null,
    notes: string
  ) => void;
  onAddStudentToTurma: (turmaId: string, studentName: string, studentRA: string) => void;
  onRemoveStudentFromTurma: (turmaId: string, studentId: string) => void;
}

export default function DemonstracoesPanel({
  turmas,
  selectedTurmaId,
  onSelectTurma,
  onSaveStudentCapacity,
  onAddStudentToTurma,
  onRemoveStudentFromTurma
}: DemonstracoesPanelProps) {
  const activeTurma = turmas.find(t => t.id === selectedTurmaId) || turmas[0];

  // Identifica as UCs da matriz curricular disponíveis para filtro
  const availableUcs = activeTurma?.subjects || [];
  const [selectedUcCode, setSelectedUcCode] = useState<string>(availableUcs[0]?.code || "MUC-TORN");

  const activeUcTemplate = availableUcs.find(u => u.code === selectedUcCode) || availableUcs[0];

  // Busca de alunos para atalho ou lista
  const [studentSearch, setStudentSearch] = useState("");
  const [newStudentName, setNewStudentName] = useState("");

  // Estado para operação selecionada (Mostra lista de alunos da turma para essa OP)
  const [activeOpCode, setActiveOpCode] = useState<string | null>(null);

  // Aluno e Capacidade Ativa sendo avaliados no card modal
  const [evaluatingStudent, setEvaluatingStudent] = useState<Student | null>(null);
  const [evaluatingCapacity, setEvaluatingCapacity] = useState<TechnicalCapacityRating | null>(null);

  // Inputs temporários de avaliação
  const [tempRubric, setTempRubric] = useState<PerformanceLevel | null>(null);
  const [tempGrade, setTempGrade] = useState<string>("");
  const [tempNotes, setTempNotes] = useState<string>("");

  // Recupera as capacidades de todos os alunos para a UC ativa
  const getOpProgress = (opCode: string) => {
    if (!activeTurma || !activeTurma.students) return { evaluated: 0, total: 0 };
    let evaluatedCount = 0;
    const totalStudents = activeTurma.students.length;

    activeTurma.students.forEach(st => {
      const uc = st.units.find(u => u.code === selectedUcCode);
      if (uc && uc.capacidadesTecnicas) {
        const cap = uc.capacidadesTecnicas.find(c => c.code === opCode);
        if (cap && cap.rubric) {
          evaluatedCount++;
        }
      }
    });

    return { evaluated: evaluatedCount, total: totalStudents };
  };

  // Retorna a lista de capacidades técnicas configuradas para a UC atual
  const activeUcCapacities = getDefaultCapacitiesForUC(selectedUcCode);

  const handleOpenEvaluation = (student: Student, originalCap: { code: string; title: string }) => {
    // Localiza a capacidade real do estudante para resgatar valores salvos
    const uc = student.units.find(u => u.code === selectedUcCode);
    let realCap: TechnicalCapacityRating | undefined = uc?.capacidadesTecnicas?.find(c => c.code === originalCap.code);

    if (!realCap) {
      // Cria na hora caso esteja ausente por algum motivo de compatibilidade
      realCap = {
        capacityId: `${selectedUcCode.toLowerCase()}-${originalCap.code.toLowerCase().replace(/\s+/g, '')}`,
        code: originalCap.code,
        title: originalCap.title,
        rubric: null,
        grade: null,
        notes: ""
      };
    }

    setEvaluatingStudent(student);
    setEvaluatingCapacity(realCap);
    setTempRubric(realCap.rubric);
    setTempGrade(realCap.grade !== null && realCap.grade !== undefined ? realCap.grade.toString() : "");
    setTempNotes(realCap.notes || "");
  };

  const handleSaveEvaluation = () => {
    if (!evaluatingStudent || !evaluatingCapacity) return;

    const numericGrade = tempGrade.trim() !== "" ? parseFloat(tempGrade) : null;
    const maxScale = activeUcTemplate?.maxGradeScale || 100;
    const sanitizedGrade = numericGrade !== null ? Math.max(0, Math.min(maxScale, numericGrade)) : null;

    onSaveStudentCapacity(
      activeTurma.id,
      evaluatingStudent.id,
      selectedUcCode,
      evaluatingCapacity.code, // Usamos o código da OP (ex: OP. 01) como indexador primário
      tempRubric,
      sanitizedGrade,
      tempNotes
    );

    // Fecha o card/modal de avaliação do aluno
    setEvaluatingStudent(null);
    setEvaluatingCapacity(null);
  };

  // Adicionar estudante rápido
  const handleQuickAddStudent = () => {
    if (!newStudentName.trim()) return;
    const cleanName = newStudentName.trim();
    // Gera RA sequencial seguro com USI
    const sequentialNum = Math.floor(10 + Math.random() * 89);
    const generatedRa = `2026-USI-${sequentialNum}`;
    
    onAddStudentToTurma(activeTurma.id, cleanName, generatedRa);
    setNewStudentName("");
  };

  const handleQuickRemoveStudent = (stdId: string, name: string) => {
    if (confirm(`Remover aluno "${name}" desta turma de demonstrações?`)) {
      onRemoveStudentFromTurma(activeTurma.id, stdId);
    }
  };

  // Seletas rápidos da imagem
  const classBadges = [
    { code: "MA", label: "MA" },
    { code: "MB", label: "MB" },
    { code: "TA", label: "TA" },
    { code: "TB", label: "TB" },
  ];

  // Descritores gerais do SENAI para rubricas industriais
  const rubricDescriptions = {
    NSA: "Não Atendeu (Apresenta desempenho abaixo do mínimo aceitável ou necessita de orientação constante)",
    APO: "Atendeu Parcialmente com Orientação (Executa a operação com algumas imprecisões e requisita intervenção do docente)",
    PAR: "Atendeu Parcialmente com Autonomia (Maneja equipamentos de usinagem corretamente de forma independente)",
    AUT: "Atendeu Plenamente com Autonomia (Executa a respectiva tarefa com excelente rigor dimensional e asseio operacional)"
  };

  // Filtra estudantes pelo termo de busca
  const filteredStudents = activeTurma?.students?.filter(st => 
    st.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    st.ra.toLowerCase().includes(studentSearch.toLowerCase())
  ) || [];

  return (
    <div id="demonstracoes-panel" className="bg-[#F4F6F9] min-h-screen flex flex-col">
      
      {/* 1. TOPO ESTILIZADO CONFORME BANNER PRINCIPAL DO USUÁRIO */}
      <header className="bg-[#005DA5] text-white py-4 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between shadow-md gap-4">
        <div className="flex items-center gap-4 text-center md:text-left self-stretch md:self-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            {/* Logo do SENAI estilizada */}
            <div className="bg-[#E5121B] text-white font-extrabold text-xl px-4 py-2 italic tracking-tighter skew-x-[-10deg]">
              SENAI
            </div>
            <div>
              <h1 className="text-sm font-black tracking-widest font-mono text-white/95 uppercase uppercase-tight leading-3">
                MECÂNICO DE USINAGEM CONVENCIONAL
              </h1>
              <p className="text-[10px] tracking-wide text-[#A2C7E5] font-semibold uppercase mt-0.5">
                Controle de Demonstrações Práticas
              </p>
            </div>
          </div>
        </div>

        {/* Grupo de botões MA, MB, TA, TB das turmas */}
        <div className="flex items-center gap-2.5 bg-black/15 p-1 rounded-lg border border-white/10 shrink-0">
          <span className="text-[9px] font-bold text-[#A2C7E5] font-mono px-1">CLASSE:</span>
          {classBadges.map(badge => {
            // Acha a turma real mapeada com esse código
            const targetTurma = turmas.find(t => t.code.toUpperCase() === badge.code);
            const isSelected = activeTurma?.code.toUpperCase() === badge.code;
            
            return (
              <button
                key={badge.code}
                onClick={() => {
                  if (targetTurma) {
                    onSelectTurma(targetTurma.id);
                  } else {
                    // Se não existir, alerta ou cria a turma caso o usuário queira
                    alert(`Turma ${badge.code} não instanciada nos cadastros.`);
                  }
                }}
                className={`h-8 w-11 rounded font-bold text-xs font-mono transition-all flex items-center justify-center cursor-pointer ${
                  isSelected 
                    ? "bg-white text-[#005DA5] shadow-sm transform scale-[1.05]" 
                    : "text-white/80 hover:text-white bg-transparent hover:bg-white/10"
                }`}
              >
                {badge.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* 2. SUBBAR FOR CHOSING THE ACTIVE CURRICULAR UNIT */}
      <section className="bg-white border-b border-[#E1E4E8] px-6 md:px-10 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto select-none">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase mr-1">Unidade Curricular:</span>
          {availableUcs.map(uc => {
            const isSelected = selectedUcCode === uc.code;
            return (
              <button
                key={uc.id}
                onClick={() => {
                  setSelectedUcCode(uc.code || "");
                  setActiveOpCode(null);
                }}
                className={`px-3 py-1.5 text-[11px] font-mono font-bold tracking-tight cursor-pointer uppercase transition-all rounded ${
                  isSelected 
                    ? "bg-[#005DA5] text-white" 
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {uc.name}
              </button>
            );
          })}
        </div>

        {/* Quantidade de alunos ativos */}
        <div className="flex items-center gap-2 shrink-0 bg-[#005DA5]/5 px-3 py-1 border border-[#005DA5]/10 rounded font-mono text-[11px] font-bold text-[#005DA5]">
          <GraduationCap size={14} />
          <span>{activeTurma?.students?.length || 0} Estudantes Inscritos</span>
        </div>
      </section>

      {/* 3. CONTEÚDO PRINCIPAL (BUSCA DE ALUNOS E GRID DE OPERAÇÕES) */}
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Painel Cabeçalho da Turma com adição de Aluno Rápido */}
        <div className="bg-white border border-[#E1E4E8] p-5 rounded-none shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#005DA5] tracking-tight uppercase flex items-center gap-2">
              TURMA {activeTurma?.code}
              <span className="text-xs bg-slate-100 text-slate-600 font-mono py-0.5 px-2 font-normal rounded tracking-wide">
                PAINEL OPERACIONAL
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Docente Responsável: <span className="font-semibold text-slate-700">{activeUcTemplate?.teacher || "SENAI Inst."}</span> • Carga: <span className="font-bold font-mono">{activeUcTemplate?.workload || 0}h</span>
            </p>
          </div>

          {/* Quick Search Student and Add student inline */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="NOME DO ALUNO..." 
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAddStudent()}
                className="pl-8 pr-2.5 py-2 w-full sm:w-60 bg-white border border-[#E1E4E8] rounded-none text-xs font-mono text-slate-800 placeholder-slate-400 outline-none focus:border-[#005DA5]"
              />
            </div>
            <button
              onClick={handleQuickAddStudent}
              disabled={!newStudentName.trim()}
              className="px-5 py-2 bg-[#E5121B] hover:bg-[#c40e15] disabled:bg-slate-300 text-white font-mono font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>ADD</span>
            </button>
          </div>
        </div>

        {/* GRID DE CASOS / VISÕES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUNA ESQUERDA: GRID DE ATIVIDADES PRÁTICAS (CARDS DE OPERAÇÕES) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center bg-[#005DA5]/5 p-3.5 border-l-4 border-[#005DA5]">
              <h3 className="font-black text-xs text-slate-800 tracking-wider font-mono uppercase">
                Capacidades Práticas Acadêmicas Avaliadas ({activeUcCapacities.length})
              </h3>
              <span className="text-[10px] font-mono text-slate-500 font-bold">SELECIONE UMA OPERAÇÃO ABAIXO</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeUcCapacities.map((op, idx) => {
                const isSelected = activeOpCode === op.code;
                const { evaluated, total } = getOpProgress(op.code);
                const progressPercent = total > 0 ? (evaluated / total) * 100 : 0;
                
                // Mapeia categoria do tag com base no código da UC
                const catTag = selectedUcCode.includes("MET") ? "METROLOGIA" 
                              : selectedUcCode.includes("TORN") ? "TORNO"
                              : selectedUcCode.includes("FRES") ? "FRESADORA"
                              : selectedUcCode.includes("DTM") ? "DESENHO"
                              : selectedUcCode.includes("CNC") ? "CNC"
                              : "USINAGEM";

                return (
                  <div
                    key={op.code}
                    onClick={() => setActiveOpCode(isSelected ? null : op.code)}
                    className={`bg-white border rounded-none p-4.5 cursor-pointer shadow-xs transition-all relative select-none hover:shadow-md ${
                      isSelected 
                        ? "border-[#005DA5] ring-1 ring-[#005DA5]" 
                        : "border-[#E1E4E8]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-black text-[#005DA5] font-mono leading-none tracking-tight">
                        {op.code}
                      </span>
                      <span className="bg-slate-100 hover:bg-slate-200 text-[#005DA5] text-[9px] font-mono tracking-widest font-bold px-2 py-0.5 max-w-[90px] truncate rounded">
                        {catTag}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-800 leading-tight tracking-normal h-10 flex items-center font-sans">
                      {op.title}
                    </h4>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500">
                        <span>PROGRESSO</span>
                        <span className="text-slate-800 font-mono font-bold">
                          {evaluated}/{total}
                        </span>
                      </div>
                      
                      {/* Barra de progresso */}
                      <div className="w-full h-2.5 bg-slate-100 rounded-none overflow-hidden border border-slate-200/50">
                        <div 
                          className="h-full bg-[#005DA5] transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUNA DIREITA: PAINEL DE ALUNOS PARA A OPERAÇÃO SELECIONADA */}
          <div className="lg:col-span-4 space-y-4">
            
            {activeOpCode ? (
              <div className="bg-white border border-[#005DA5] shadow-sm">
                
                {/* Header do Painel */}
                <div className="p-4 bg-[#005DA5] text-white">
                  <div className="flex justify-between items-start">
                    <span className="bg-[#E5121B] text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase tracking-wider">
                      Ativo: {activeOpCode}
                    </span>
                    <button 
                      onClick={() => setActiveOpCode(null)}
                      className="text-white hover:text-[#A2C7E5] cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <h3 className="font-extrabold text-sm uppercase font-mono tracking-tight text-white mt-1.5 leading-snug">
                    {activeUcCapacities.find(o => o.code === activeOpCode)?.title}
                  </h3>
                </div>

                {/* Filtro de Busca de Alunos dentro do Painel */}
                <div className="p-3 bg-slate-50 border-b border-l border-r border-[#E1E4E8]">
                  <div className="relative">
                    <Search className="absolute left-2 text-slate-400 top-2.5" size={12} />
                    <input 
                      type="text" 
                      placeholder="Pesquisar Aluno..." 
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full bg-white border border-[#E1E4E8] pl-7 pr-2 py-1.5 text-xs font-mono rounded outline-none"
                    />
                  </div>
                </div>

                {/* Lista de Alunos e Classificação */}
                <div className="p-4 border-l border-r border-b border-[#E1E4E8] max-h-[480px] overflow-y-auto divide-y divide-slate-100 space-y-px">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(student => {
                      // Descobre rubrica e nota atual desse estudante para essa op
                      const studentUc = student.units.find(u => u.code === selectedUcCode);
                      const studentCap = studentUc?.capacidadesTecnicas?.find(c => c.code === activeOpCode);
                      
                      const hasEvaluation = !!studentCap?.rubric;
                      const currentRub = studentCap?.rubric;
                      const currentGrade = studentCap?.grade;
                      const currentNotes = studentCap?.notes;

                      // Cores correspondentes
                      let rubClass = "border border-slate-200 text-slate-400 bg-white";
                      if (currentRub === "NSA") rubClass = "bg-rose-50 border-rose-200 text-rose-700 font-bold";
                      if (currentRub === "APO") rubClass = "bg-amber-50 border-amber-200 text-amber-700 font-bold";
                      if (currentRub === "PAR") rubClass = "bg-sky-50 border-sky-200 text-sky-700 font-bold";
                      if (currentRub === "AUT") rubClass = "bg-purple-50 border-purple-200 text-purple-700 font-bold";

                      const opCapObj = activeUcCapacities.find(o => o.code === activeOpCode) || { code: activeOpCode, title: "" };

                      return (
                        <div key={student.id} className="py-3 items-center group/std text-xs transition-colors hover:bg-slate-50/50">
                          <div className="flex justify-between items-start gap-2">
                            {/* Clique no Nome do Aluno para Avaliar */}
                            <div 
                              onClick={() => handleOpenEvaluation(student, opCapObj)}
                              className="flex-1 cursor-pointer pr-1"
                              title={`Clique para avaliar ${student.name} em ${activeOpCode}`}
                            >
                              <p className="font-extrabold text-slate-800 text-xs hover:text-[#005DA5] leading-tight transition-colors">
                                {student.name}
                              </p>
                              <span className="text-[10px] text-slate-450 font-mono tracking-wide">
                                RA: {student.ra}
                              </span>
                            </div>

                            {/* Indicador de Rubrica Salva */}
                            <div className="flex flex-col items-end gap-1 select-none shrink-0">
                              {hasEvaluation ? (
                                <button
                                  onClick={() => handleOpenEvaluation(student, opCapObj)}
                                  className={`px-2 py-0.5 rounded h-5 text-[10px] font-mono uppercase tracking-widest cursor-pointer ${rubClass}`}
                                >
                                  {currentRub}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenEvaluation(student, opCapObj)}
                                  className="h-5 rounded border border-dotted border-slate-300 text-[10px] font-mono text-slate-400 px-2 py-0.5 hover:border-[#005DA5] hover:text-[#005DA5] cursor-pointer bg-white"
                                >
                                  PENDENTE
                                </button>
                              )}

                              {currentGrade !== null && currentGrade !== undefined && (
                                <span className="text-[10px] font-mono text-emerald-600 font-bold">
                                  Nota: {currentGrade}
                                </span>
                              )}
                            </div>

                            {/* Remover estudante rápido */}
                            <button
                              onClick={() => handleQuickRemoveStudent(student.id, student.name)}
                              className="opacity-0 group-hover/std:opacity-100 p-1 text-slate-300 hover:text-red-500 rounded transition-opacity cursor-pointer self-center"
                              title="Remover Aluno"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          {currentNotes && (
                            <p className="text-[10px] text-slate-500 bg-slate-50 p-2 mt-1.5 font-mono border-l-2 border-slate-300 rounded max-h-16 overflow-y-auto">
                              "{currentNotes}"
                            </p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      <HelpCircle size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-xs">Nenhum estudante atende a busca ou cadastro na classe.</p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-white border border-[#E1E4E8] p-6 text-center shadow-xs">
                <FileCheck2 size={40} className="mx-auto text-[#005DA5]/40 mb-3" />
                <h3 className="font-extrabold text-sm uppercase text-slate-800 tracking-wider font-mono">
                  Selecione uma Capacidade Técnica
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Escolha qualquer operação (OP) do grid esquerdo para listar os alunos inscritos na turma e lançar os juízos de descritores de prática do SENAI.
                </p>
              </div>
            )}

            {/* Quadro Informativo de Conceitos */}
            <div className="bg-white border border-[#E1E4E8] p-4.5 space-y-4 shadow-xs">
              <span className="block text-[10px] font-mono font-black text-[#005DA5] uppercase tracking-wider">
                COCEITOS DE RUBRICAS SENAI
              </span>
              <div className="space-y-3 text-[11px] text-slate-600 font-mono">
                <div className="flex gap-2">
                  <span className="bg-rose-50 border border-rose-200 text-rose-700 font-bold px-1.5 py-0.5 rounded text-[10.5px]">NSA</span>
                  <p className="text-[10px] text-slate-500 leading-snug">Não Atendeu. O aluno demonstrou desempenho crítico, com erros recorrentes ou dependência constante do instrutor.</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-amber-50 border border-amber-200 text-amber-700 font-bold px-1.5 py-0.5 rounded text-[10.5px]">APO</span>
                  <p className="text-[10px] text-slate-500 leading-snug">Atendeu Parcialmente com Orientação. O aluno concluiu com o auxílio direto do professor para correção.</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-sky-50 border border-sky-200 text-sky-700 font-bold px-1.5 py-0.5 rounded text-[10.5px]">PAR</span>
                  <p className="text-[10px] text-slate-500 leading-snug">Atendeu Parcialmente com Autonomia. Entregou a peça dentro dos limites tolerados de forma profissional.</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-purple-50 border border-purple-200 text-purple-700 font-bold px-1.5 py-0.5 rounded text-[10.5px]">AUT</span>
                  <p className="text-[10px] text-slate-500 leading-snug">Atendeu com Plena Autonomia. Execução de alto nível, acabamento sob norma técnica e postura laboral exemplar.</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* 4. MODAL / CARD FLUTUANTE DE AVALIAÇÃO DO ESTUDANTE IN-CONTEXT */}
      {evaluatingStudent && evaluatingCapacity && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-white border-2 border-[#005DA5] rounded-none shadow-2xl max-w-lg w-full overflow-hidden transform scale-100 transition-transform">
            
            {/* Header */}
            <div className="p-4 bg-[#005DA5] text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-[#A2C7E5] uppercase font-bold">
                  AVALIAÇÃO DE CAPACIDADE TÉCNICA
                </span>
                <h3 className="font-extrabold text-sm uppercase mt-0.5">
                  {evaluatingCapacity.code} • {evaluatingCapacity.title}
                </h3>
              </div>
              <button 
                onClick={() => { setEvaluatingStudent(null); setEvaluatingCapacity(null); }}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-5">
              
              {/* Identificação Aluno */}
              <div className="bg-[#005DA5]/5 p-3 border-l-4 border-[#005DA5] flex justify-between items-center font-mono">
                <div>
                  <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-bold">Inscrito:</span>
                  <span className="text-xs font-black text-slate-800 uppercase">{evaluatingStudent.name}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-bold">RA Registro:</span>
                  <span className="text-xs text-slate-600 font-mono">{evaluatingStudent.ra}</span>
                </div>
              </div>

              {/* Seletor de Rubricas (4 Níveis) */}
              <div className="space-y-2">
                <span className="block text-[10px] font-mono font-extrabold text-slate-600 uppercase tracking-wider">
                  Selecione o Conceito Qualitativo:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {(["NSA", "APO", "PAR", "AUT"] as PerformanceLevel[]).map(level => {
                    const isSelected = tempRubric === level;
                    
                    let bgActiveClasses = "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600";
                    if (isSelected) {
                      if (level === "NSA") bgActiveClasses = "bg-rose-50 border-rose-500 text-rose-800 font-extrabold ring-1 ring-rose-500";
                      if (level === "APO") bgActiveClasses = "bg-amber-50 border-amber-500 text-amber-800 font-extrabold ring-1 ring-amber-500";
                      if (level === "PAR") bgActiveClasses = "bg-sky-50 border-sky-500 text-sky-800 font-extrabold ring-1 ring-sky-500";
                      if (level === "AUT") bgActiveClasses = "bg-purple-50 border-purple-500 text-purple-800 font-extrabold ring-1 ring-purple-500";
                    }

                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setTempRubric(level)}
                        className={`py-2 text-xs font-mono font-bold uppercase transition-all tracking-widest border rounded cursor-pointer text-center ${bgActiveClasses}`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
                {tempRubric && (
                  <p className="text-[10px] font-mono italic text-[#005DA5] leading-relaxed bg-[#005DA5]/5 p-2 border border-[#005DA5]/10">
                    Descritor: {rubricDescriptions[tempRubric]}
                  </p>
                )}
              </div>

              {/* Nota Numérica Direta */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="block text-[10px] font-mono font-extrabold text-slate-600 uppercase tracking-wider">
                    Nota Quantitativa (opcional):
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Escala: 0 a {activeUcTemplate?.maxGradeScale || 100}
                  </span>
                </div>
                <input 
                  type="number" 
                  step="0.1"
                  min={0}
                  max={activeUcTemplate?.maxGradeScale || 100}
                  placeholder={`Ex: ${activeUcTemplate?.maxGradeScale === 10 ? '8.5' : '85'}`}
                  value={tempGrade}
                  onChange={(e) => setTempGrade(e.target.value)}
                  className="w-full bg-white border border-[#E1E4E8] p-2 text-xs font-mono text-slate-800 outline-none focus:border-[#005DA5]"
                />
              </div>

              {/* Campo para observação */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-mono font-extrabold text-slate-600 uppercase tracking-wider">
                  Campo de Observação (comentário docente):
                </span>
                <textarea 
                  rows={3}
                  placeholder="Ex: Aluno realizou o torneamento cilíndrico aplicando tolerância H7 perfeitamente, porém necessita atentar ao acabamento superficial."
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  className="w-full bg-white border border-[#E1E4E8] p-2 text-xs font-mono text-slate-800 outline-none focus:border-[#005DA5] resize-none"
                />
              </div>

            </div>

            {/* Footer de ações */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => { setEvaluatingStudent(null); setEvaluatingCapacity(null); }}
                type="button"
                className="px-4 py-2 font-mono text-xs font-bold uppercase border border-slate-300 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEvaluation}
                type="button"
                className="px-5 py-2 font-mono text-xs font-bold uppercase bg-[#005DA5] hover:bg-[#004780] text-white cursor-pointer transition-colors"
              >
                Salvar Avaliação
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
