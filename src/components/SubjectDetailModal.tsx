import React, { useState } from "react";
import { 
  X, 
  Trash2, 
  Plus, 
  Save, 
  Clock, 
  FileText, 
  Compass, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Calculator, 
  GraduationCap
} from "lucide-react";
import { CurricularUnit, GradingMethod, Evaluation, EvaluationStatus, SubjectStatus } from "../types";
import RubricsSelector from "./RubricsSelector";
import { 
  calculateUnitGrade, 
  calculateAttendancePercentage, 
  determineUnitStatus, 
  calculateMaxPossibleRemainingGrade 
} from "../utils";

interface SubjectDetailModalProps {
  unit: CurricularUnit;
  onClose: () => void;
  onSave: (updatedUnit: CurricularUnit) => void;
}

export default function SubjectDetailModal({ unit, onClose, onSave }: SubjectDetailModalProps) {
  // Estados Locais clonando a Unidade Curricular para alteração rápida sem poluir o pai
  const [name, setName] = useState(unit.name);
  const [code, setCode] = useState(unit.code || "");
  const [teacher, setTeacher] = useState(unit.teacher || "");
  const [workload, setWorkload] = useState(unit.workload);
  const [absenceHours, setAbsenceHours] = useState(unit.absenceHours);
  const [passingGrade, setPassingGrade] = useState(unit.passingGrade);
  const [maxGradeScale, setMaxGradeScale] = useState(unit.maxGradeScale);
  const [gradingMethod, setGradingMethod] = useState<GradingMethod>(unit.gradingMethod);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([...unit.evaluations]);
  const [hasRecovery, setHasRecovery] = useState(unit.hasRecovery);
  const [recoveryGrade, setRecoveryGrade] = useState<number | null>(unit.recoveryGrade);
  const [notes, setNotes] = useState(unit.notes || "");

  // Estado para controlar qual avaliação está sendo avaliada via rubrica
  const [activeRubricEvalId, setActiveRubricEvalId] = useState<string | null>(null);

  // Estado para nova avaliação temporória
  const [showAddEvalForm, setShowAddEvalForm] = useState(false);
  const [newEvalTitle, setNewEvalTitle] = useState("");
  const [newEvalWeight, setNewEvalWeight] = useState(10);
  const [newEvalMaxGrade, setNewEvalMaxGrade] = useState(100);
  const [newEvalUseRubrics, setNewEvalUseRubrics] = useState(true);

  // Cálculos dinâmicos em tempo de digitação
  const tempUnitObj: CurricularUnit = {
    id: unit.id,
    name,
    code,
    teacher,
    workload: Number(workload) || 1,
    absenceHours: Number(absenceHours) || 0,
    passingGrade: Number(passingGrade) || 60,
    maxGradeScale: Number(maxGradeScale) || 100,
    gradingMethod,
    evaluations,
    hasRecovery,
    recoveryGrade: recoveryGrade !== null ? Number(recoveryGrade) : null,
    notes
  };

  const currentGrade = calculateUnitGrade(tempUnitObj);
  const attendance = calculateAttendancePercentage(tempUnitObj);
  const status = determineUnitStatus(tempUnitObj);
  const maxPossibleGrade = calculateMaxPossibleRemainingGrade(tempUnitObj);
  
  // Limites e frequência
  const isAttendanceCritical = attendance < 75;
  const maxAllowedAbsenceHours = Math.floor(tempUnitObj.workload * 0.25);

  // Gerenciamento de Notas nas Avaliações Existentes
  const handleGradeChange = (id: string, gradeStr: string) => {
    setEvaluations(prev => prev.map(e => {
      if (e.id === id) {
        if (gradeStr.trim() === "") {
          return { ...e, gradeReceived: null, status: EvaluationStatus.PENDING };
        }
        const val = Math.max(0, Math.min(e.maxGrade, parseFloat(gradeStr) || 0));
        return { ...e, gradeReceived: val, status: EvaluationStatus.COMPLETED };
      }
      return e;
    }));
  };

  const handleToggleEvalStatus = (id: string) => {
    setEvaluations(prev => prev.map(e => {
      if (e.id === id) {
        const nextStatus = e.status === EvaluationStatus.COMPLETED ? EvaluationStatus.PENDING : EvaluationStatus.COMPLETED;
        return { 
          ...e, 
          status: nextStatus,
          gradeReceived: nextStatus === EvaluationStatus.PENDING ? null : (e.gradeReceived ?? 0)
        };
      }
      return e;
    }));
  };

  const handleRemoveEval = (id: string) => {
    setEvaluations(prev => prev.filter(e => e.id !== id));
  };

  const handleAddEvaluationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvalTitle.trim()) return;

    const newEval: Evaluation = {
      id: "eval-" + Date.now(),
      title: newEvalTitle.trim(),
      weight: Number(newEvalWeight),
      maxGrade: Number(newEvalMaxGrade),
      gradeReceived: null,
      status: EvaluationStatus.PENDING,
      useRubrics: newEvalUseRubrics,
      rubricsSelections: newEvalUseRubrics ? {} : undefined
    };

    setEvaluations(prev => [...prev, newEval]);
    setNewEvalTitle("");
    setShowAddEvalForm(false);
    setNewEvalUseRubrics(true);
  };

  // Salvar tudo de volta ao aplicativo
  const handleSave = () => {
    if (!name.trim()) return;
    onSave(tempUnitObj);
  };

  // Simulação Inteligente de Notas
  const renderSimulatorSection = () => {
    const pendingEvals = evaluations.filter(e => e.status === EvaluationStatus.PENDING);
    const completedEvals = evaluations.filter(e => e.status === EvaluationStatus.COMPLETED && e.gradeReceived !== null);
    
    if (currentGrade >= passingGrade) {
      return (
        <div className="bg-[#28A745]/10 border border-[#28A745]/35 p-5 text-[#28A745] flex items-start gap-3 rounded-none font-sans">
          <CheckCircle2 className="text-[#28A745] shrink-0 mt-0.5" size={17} />
          <div>
            <p className="font-bold text-xs uppercase tracking-wider font-mono">Objetivo Atingido!</p>
            <p className="text-xs mt-1 text-[#28A745]/90">
              Sua nota atual ({currentGrade}) já ultrapassou a média mínima para aprovação ({passingGrade}). Continue mantendo ou elevando suas metas!
            </p>
          </div>
        </div>
      );
    }

    if (pendingEvals.length === 0) {
      if (hasRecovery) {
        return (
          <div className="bg-[#FFC107]/10 border border-[#FFC107]/40 p-5 text-[#7F5F00] flex items-start gap-3 rounded-none">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={17} />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider font-mono">Atenção: Necessário Exame de Recuperação</p>
              <p className="text-xs mt-1">
                Não há mais avaliações regulares pendentes e você possui {currentGrade} de {maxGradeScale} pontos.
                Ative o painel de recuperação abaixo e informe a nota obtida na prova de recuperação para atingir o conceito de aprovação.
              </p>
            </div>
          </div>
        );
      } else {
        return (
          <div className="bg-rose-50 border border-rose-300/40 p-5 text-rose-800 flex items-start gap-3 rounded-none">
            <X className="text-rose-600 shrink-0 mt-0.5 border border-rose-300 rounded-full bg-white font-bold" size={17} />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider font-mono">Reprovação por Nota Regular</p>
              <p className="text-xs mt-1">
                Todas as provas reguladas foram lançadas e você parou em {currentGrade}. Considere contatar a coordenação pedagógica ou tutor do SENAI sobre possibilidades de recuperação escolar.
              </p>
            </div>
          </div>
        );
      }
    }

    const neededPoints = passingGrade - currentGrade;

    if (gradingMethod === GradingMethod.POINTS) {
      // Método de pontos acumulados
      const availablePoints = pendingEvals.reduce((sum, e) => sum + e.maxGrade, 0);
      if (availablePoints < neededPoints) {
        return (
          <div className="bg-rose-50 border border-rose-300/40 p-5 text-rose-800 rounded-none">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={17} />
              <div>
                <p className="font-bold text-xs uppercase tracking-wider font-mono">Inviabilidade de Nota Direta</p>
                <p className="text-xs mt-1">
                  Faltam {neededPoints.toFixed(1)} pontos para atingir {passingGrade}, porém você possui apenas {availablePoints} pontos restantes nas avaliações pendentes.
                  Seria indispensável realizar o Exame de Recuperação para obter aprovação técnica.
                </p>
              </div>
            </div>
          </div>
        );
      }

      // Proporção de aproveitamento necessário
      const percentageRequired = (neededPoints / availablePoints) * 100;
      
      return (
        <div className="bg-[#005DA5]/5 border border-[#005DA5]/20 p-5 text-[#005DA5] rounded-none">
          <div className="flex items-start gap-3">
            <Calculator className="text-[#005DA5] shrink-0 mt-0.5" size={17} />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider font-mono">Simulador de Sucesso Acadêmico</p>
              <p className="text-xs mt-1">
                Faltam <span className="font-bold">{neededPoints.toFixed(1)} pontos</span> de {availablePoints} possíveis distribuídos nas {pendingEvals.length} avaliação(ões) restante(s).
              </p>
              <p className="text-xs mt-2 font-medium">
                Você precisa obter pelo menos <span className="underline font-bold text-sm">{percentageRequired.toFixed(0)}%</span> de aproveitamento geral nas próximas atividades práticas para aprovação direta!
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      // Média Ponderada
      const totalPendingWeight = pendingEvals.reduce((sum, e) => sum + e.weight, 0);
      
      // Quanto vale cada ponto restante na escala?
      const remainingAchievableGrade = pendingEvals.reduce((sum, e) => {
        return sum + maxGradeScale * (e.weight / 100);
      }, 0);

      if (remainingAchievableGrade < neededPoints) {
        return (
          <div className="bg-rose-50 border border-rose-300/40 p-5 text-rose-800 rounded-none">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={17} />
              <div>
                <p className="font-bold text-xs uppercase tracking-wider font-mono">Alerta de Nota Crítica (Ponderado)</p>
                <p className="text-xs mt-1">
                  Mesmo gabaritando os {totalPendingWeight}% de peso restantes, você adicionaria no máximo +{remainingAchievableGrade.toFixed(1)} pontos. Ficará abaixo da média de corte de {passingGrade}, dependendo de recuperação.
                </p>
              </div>
            </div>
          </div>
        );
      }

      const requiredAverageRatio = (neededPoints / remainingAchievableGrade);
      const requiredGradeOutOfScale = requiredAverageRatio * maxGradeScale;

      return (
        <div className="bg-[#005DA5]/5 border border-[#005DA5]/20 p-5 text-[#005DA5] rounded-none">
          <div className="flex items-start gap-3">
            <Calculator className="text-[#005DA5] shrink-0 mt-0.5" size={17} />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider font-mono">Projeção de Sucesso (Ponderada)</p>
              <p className="text-xs mt-1">
                Para passar direto, você precisa tirar em média uma nota mínima equivalente a <span className="underline font-bold text-[#005DA5] font-mono text-sm">{requiredGradeOutOfScale.toFixed(1)} de 10</span> (ou { (requiredAverageRatio * 100).toFixed(0) }%) nas {pendingEvals.length} avaliações que faltam.
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div id="subject-detail-modal-root" className="fixed inset-0 bg-[#1A1C1E]/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white border border-[#E1E4E8] max-w-3xl w-full h-full max-h-[92vh] flex flex-col overflow-hidden rounded-none animate-in scale-in duration-200"
      >
        
        {/* Modal Top Panel Header */}
        <div className="p-6 border-b border-[#E1E4E8] flex justify-between items-center bg-[#F8F9FA] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#005DA5] text-white rounded-none">
              <Compass size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider font-bold text-[#005DA5] uppercase">Avaliação de Rubricas SENAI</span>
              <h2 className="text-lg font-bold text-[#1A1C1E] line-clamp-1 font-sans">{name || "Nova Unidade Curricular"}</h2>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#6C757D] hover:text-[#1A1C1E] font-mono text-xl cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Container Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Seção 1: Configuração Básica da Unidade */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F8F9FA] p-5 border border-[#E1E4E8] rounded-none">
            <div>
              <label className="block text-[10px] font-mono font-bold tracking-wider text-[#6C757D] uppercase mb-1">Título da UC</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Circuitos Eletropneumáticos"
                className="w-full bg-white border border-[#E1E4E8] px-3 py-2 text-xs outline-none text-slate-800 rounded-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold tracking-wider text-[#6C757D] uppercase mb-1">Código / Sigla</label>
              <input 
                type="text" 
                value={code} 
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: AUT-05"
                className="w-full bg-white border border-[#E1E4E8] px-3 py-2 text-xs outline-none text-slate-800 rounded-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold tracking-wider text-[#6C757D] uppercase mb-1 font-mono">Docente Tutor</label>
              <input 
                type="text" 
                value={teacher} 
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="Ex: Prof. José Alencar"
                className="w-full bg-white border border-[#E1E4E8] px-3 py-2 text-xs outline-none text-slate-800 rounded-none font-mono"
              />
            </div>
          </div>

          {/* Seção 2: Frequência, Carga Horária e Nota de Corte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Presença & Faltas */}
            <div className="border border-[#E1E4E8] p-5 rounded-none bg-white shadow-xs">
              <div className="flex items-center gap-2 mb-3.5">
                <Clock className="text-[#005DA5]" size={16} />
                <h4 className="text-xs font-bold text-[#1A1C1E] uppercase font-mono tracking-wider">Controle de Frequência</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#6C757D] uppercase mb-1">Carga Horária (h)</label>
                  <input 
                    type="number" 
                    value={workload} 
                    onChange={(e) => setWorkload(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full border border-[#E1E4E8] px-3 py-1.5 text-slate-800 text-xs rounded-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#6C757D] uppercase mb-1">Faltas Reais (h)</label>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="number" 
                      value={absenceHours} 
                      onChange={(e) => setAbsenceHours(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full border border-[#E1E4E8] px-3 py-1.5 text-slate-800 text-xs rounded-none font-mono"
                    />
                    <button 
                      type="button"
                      onClick={() => setAbsenceHours(prev => prev + 2)}
                      className="px-2 py-1.5 bg-[#F1F3F5] border border-[#E1E4E8] hover:bg-[#E1E4E8] text-[10px] font-bold font-mono rounded-none cursor-pointer"
                      title="+2 horas de falta"
                    >
                      +2h
                    </button>
                  </div>
                </div>
              </div>

              {/* Status de Frequência Com Visualizador */}
              <div className="mt-4 p-3 bg-[#F8F9FA] border border-[#E1E4E8] rounded-none flex justify-between items-center text-xs font-mono">
                <div>
                  <p className="text-slate-600 font-bold">Frequência: <span className={isAttendanceCritical ? "text-rose-600 font-extrabold" : "text-[#005DA5]"}>{attendance}%</span></p>
                  <p className="text-[10px] text-[#6C757D] mt-0.5">Saldo faltas: {maxAllowedAbsenceHours - absenceHours}h restantes</p>
                </div>
                {isAttendanceCritical ? (
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-bold uppercase border border-rose-200">
                    Retido
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[9px] font-bold uppercase border border-sky-200">
                    Regular
                  </span>
                )}
              </div>
            </div>

            {/* Ajuste de Critério e Corte */}
            <div className="border border-[#E1E4E8] p-5 rounded-none bg-white col-span-1 shadow-xs">
              <div className="flex items-center gap-2 mb-3.5">
                <Calculator className="text-[#005DA5]" size={16} />
                <h4 className="text-xs font-bold text-[#1A1C1E] uppercase font-mono tracking-wider">Cálculo de Médias</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#6C757D] uppercase mb-1">Método de Lançamento</label>
                  <select
                    value={gradingMethod}
                    onChange={(e) => setGradingMethod(e.target.value as GradingMethod)}
                    className="w-full border border-[#E1E4E8] px-2 py-1.5 text-slate-800 text-xs rounded-none bg-white outline-none font-mono"
                  >
                    <option value={GradingMethod.POINTS}>Acúmulo de Pontos</option>
                    <option value={GradingMethod.WEIGHTED}>Média Ponderada (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#6C757D] uppercase mb-1">Média de Corte</label>
                  <div className="flex gap-1.5">
                    <input 
                      type="number" 
                      value={passingGrade} 
                      onChange={(e) => setPassingGrade(parseFloat(e.target.value) || 0)}
                      className="w-full border border-[#E1E4E8] px-2 py-1.5 text-slate-800 text-xs rounded-none font-mono"
                    />
                    <select
                      value={maxGradeScale}
                      onChange={(e) => setMaxGradeScale(Number(e.target.value))}
                      className="border border-[#E1E4E8] px-1 py-1.5 text-slate-800 text-xs rounded-none bg-white font-mono"
                    >
                      <option value={10}>Escala 10</option>
                      <option value={100}>Escala 100</option>
                    </select>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-[#6C757D] mt-4 leading-normal bg-[#F8F9FA] p-3 border border-[#E1E4E8] font-mono">
                {gradingMethod === GradingMethod.POINTS 
                  ? "💡 ACÚMULO DE PONTOS: A nota é a soma direta acumulada dos pontos de cada uma das avaliações realizadas." 
                  : "💡 MÉDIA PONDERADA: As notas de 0-10 ou 0-100 são multiplicadas pelos seus pesos percentuais regulados."}
              </p>
            </div>
          </div>

          {/* Seção 3: Simulador de Sucesso */}
          <div id="grade-simulator" className="space-y-1">
            {renderSimulatorSection()}
          </div>

          {/* Seção 4: Lista de Avaliações */}
          <div className="border border-[#E1E4E8] p-5 rounded-none bg-white shadow-xs">
            <div className="flex justify-between items-center mb-4 border-b border-[#F1F3F5] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="text-[#005DA5]" size={16} />
                <h4 className="text-xs font-bold text-[#1A1C1E] uppercase font-mono tracking-wider">Avaliações por Rubrica / Critérios</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAddEvalForm(!showAddEvalForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#005DA5] hover:bg-[#004e8a] text-white text-[11px] font-bold font-mono uppercase tracking-wider rounded-none cursor-pointer transition-colors"
              >
                <Plus size={12} />
                <span>Nova Prática / Prova</span>
              </button>
            </div>

            {/* Form de Adicionar nova avaliação */}
            {showAddEvalForm && (
              <form 
                onSubmit={handleAddEvaluationSubmit}
                className="bg-[#F8F9FA] p-5 border border-[#005DA5]/20 mb-4 space-y-4 rounded-none transition-all duration-200"
              >
                <p className="text-[11px] font-bold text-[#005DA5] uppercase tracking-wider font-mono">Cadastrar Nova Atividade Prática</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-[#6C757D] uppercase mb-1">Título (ex: SA1 - Ensaio Mecânico)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Montagem de Painel Clássico"
                      value={newEvalTitle}
                      onChange={(e) => setNewEvalTitle(e.target.value)}
                      className="w-full bg-white border border-[#E1E4E8] px-3 py-2 text-xs outline-none text-slate-800 rounded-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-[#6C757D] uppercase mb-1">
                      {gradingMethod === GradingMethod.POINTS ? "Pontos Máximos" : "Peso (%)"}
                    </label>
                    <input 
                      type="number" 
                      required
                      min={1}
                      max={100}
                      value={newEvalWeight}
                      onChange={(e) => {
                        setNewEvalWeight(Number(e.target.value));
                        if (gradingMethod === GradingMethod.POINTS) {
                          setNewEvalMaxGrade(Number(e.target.value));
                        }
                      }}
                      className="w-full bg-white border border-[#E1E4E8] px-3 py-2 text-xs outline-none text-slate-800 rounded-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-[#6C757D] uppercase mb-1">Nota Máxima da Atividade</label>
                    <input 
                      type="number" 
                      required
                      min={1}
                      disabled={gradingMethod === GradingMethod.POINTS}
                      value={newEvalMaxGrade}
                      onChange={(e) => setNewEvalMaxGrade(Number(e.target.value))}
                      className="w-full bg-white border border-[#E1E4E8] px-3 py-2 text-xs outline-none text-[#6C757D] rounded-none disabled:opacity-60 font-mono"
                    />
                  </div>
                </div>

                {/* Campo de escolha para avaliar por rubricas */}
                <div className="bg-[#005DA5]/5 p-3.5 border border-[#005DA5]/10 space-y-2">
                  <span className="block text-[10px] font-mono font-bold text-[#005DA5] uppercase tracking-wider">Método de Avaliação do SENAI</span>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900 select-none">
                      <input 
                        type="radio"
                        name="gradingChoice"
                        checked={newEvalUseRubrics}
                        onChange={() => setNewEvalUseRubrics(true)}
                        className="h-4.5 w-4.5 text-[#005DA5] border-slate-300 focus:ring-[#005DA5]"
                      />
                      <span>Avaliar com Rubricas Descritivas (NSA, APO, PAR, AUT)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900 select-none">
                      <input 
                        type="radio"
                        name="gradingChoice"
                        checked={!newEvalUseRubrics}
                        onChange={() => setNewEvalUseRubrics(false)}
                        className="h-4.5 w-4.5 text-[#005DA5] border-slate-300 focus:ring-[#005DA5]"
                      />
                      <span>Lançar Nota Numérica Direta (Sem critérios qualitativos)</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddEvalForm(false)}
                    className="px-4 py-2 border border-[#E1E4E8] text-[#6C757D] font-mono font-bold uppercase rounded-none text-[10px] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#005DA5] text-white font-mono font-bold uppercase rounded-none text-[10px] cursor-pointer hover:bg-[#004e8a]"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            )}

            {/* Listagem de avaliações */}
            {evaluations.length === 0 ? (
              <p className="text-center py-6 text-xs text-[#6C757D] italic font-mono">
                Nenhuma avaliação criada. Clique no botão acima para adicionar uma nova prática de competência escolar do SENAI.
              </p>
            ) : (
              <div className="space-y-4">
                {evaluations.map((evalItem, idx) => {
                  const isRubricsActive = activeRubricEvalId === evalItem.id;
                  const selectedCount = evalItem.rubricsSelections ? Object.keys(evalItem.rubricsSelections).length : 0;
                  
                  return (
                    <div 
                      key={evalItem.id}
                      className="flex flex-col border border-[#E1E4E8] rounded-none bg-[#F8F9FA]/50 p-4 gap-3.5 transition-all"
                    >
                      {/* Linha principal de dados da avaliação */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`h-2.5 w-2.5 rounded-full ${evalItem.status === EvaluationStatus.COMPLETED ? "bg-[#28A745]" : "bg-[#FFC107]"}`} />
                            <h5 className="text-xs font-bold text-[#1A1C1E] font-mono">N{idx + 1}: {evalItem.title}</h5>
                            {evalItem.useRubrics && (
                              <span className="text-[9px] bg-[#005DA5]/10 border border-[#005DA5]/20 text-[#005DA5] px-2 py-0.5 rounded-none font-mono font-bold uppercase tracking-wider">
                                Rubricas Applied
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#6C757D] mt-1 font-mono">
                            {gradingMethod === GradingMethod.POINTS 
                              ? `Pontuação Máxima Acumulada: ${evalItem.weight} pontos`
                              : `Cálculo de 0 a ${evalItem.maxGrade} • Multiplicado por peso de ${evalItem.weight}% da disciplina`}
                          </p>
                          
                          {/* Resumo de Rubricas quando estiver ativo e colapsado */}
                          {evalItem.rubricsSelections && Object.keys(evalItem.rubricsSelections).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2.5">
                              {Object.entries(evalItem.rubricsSelections).map(([key, value]) => {
                                let badgeC = "bg-slate-100 text-[#6C757D] border-slate-200";
                                if (value === "NSA") badgeC = "bg-rose-50 text-rose-700 border-rose-200";
                                else if (value === "APO") badgeC = "bg-amber-50/50 text-amber-700 border-amber-200";
                                else if (value === "PAR") badgeC = "bg-sky-50 text-sky-700 border-[#005DA5]/20";
                                else if (value === "AUT") badgeC = "bg-purple-50 text-purple-700 border-purple-200";
                                
                                let critLabel = key;
                                if (key === "interpretarDesenho") critLabel = "Interp. Desenho";
                                else if (key === "elaborarCroquis") critLabel = "Elab. Croquis";
                                else if (key === "interpretarTolerancia") critLabel = "Tolerâncias";
                                else if (key === "atencaoDetalhes") critLabel = "At. Detalhes";
                                else if (key === "sensoCritico") critLabel = "S. Crítico";

                                return (
                                  <span key={key} className={`text-[9px] font-semibold px-2 py-0.5 rounded-none border ${badgeC}`} title={`${critLabel}: ${value}`}>
                                    {critLabel}: <strong className="font-extrabold">{value}</strong>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto">
                          
                          {/* Campo de escolha: Rubricas vs Nota Direta */}
                          <div className="flex items-center bg-white border border-[#E1E4E8] rounded-none px-2 py-1 select-none">
                            <span className="text-[9px] font-mono font-bold text-[#6C757D] mr-1">MÉTODO:</span>
                            <select
                              value={evalItem.useRubrics ? "rubrics" : "direct"}
                              onChange={(e) => {
                                const useRub = e.target.value === "rubrics";
                                setEvaluations(prev => prev.map(ev => {
                                  if (ev.id === evalItem.id) {
                                    return { 
                                      ...ev, 
                                      useRubrics: useRub,
                                      rubricsSelections: useRub ? (ev.rubricsSelections || {}) : undefined
                                    };
                                  }
                                  return ev;
                                }));
                                if (!useRub && isRubricsActive) {
                                  setActiveRubricEvalId(null);
                                }
                              }}
                              className="bg-transparent border-0 text-[10px] font-mono font-bold text-[#005DA5] cursor-pointer outline-none focus:ring-0 p-0"
                            >
                              <option value="rubrics">Por Rubrica</option>
                              <option value="direct">Nota Direta</option>
                            </select>
                          </div>

                          {/* Botão de abrir/fechar Rubricas */}
                          {evalItem.useRubrics && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveRubricEvalId(isRubricsActive ? null : evalItem.id);
                              }}
                              className={`px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border rounded-none transition-colors ${
                                selectedCount > 0
                                  ? "bg-indigo-50 border-indigo-200 text-indigo-750 hover:bg-indigo-100"
                                  : "bg-white border-[#E1E4E8] hover:bg-[#F8F9FA] text-[#6C757D]"
                              }`}
                              title="Modificar descritores específicos (NSA, APO, PAR, AUT) do SENAI"
                            >
                              <span>Preencher Rubricas</span>
                              {selectedCount > 0 && (
                                <span className="bg-[#005DA5] text-white rounded-full h-4 w-4 flex items-center justify-center text-[9px] font-mono font-bold">
                                  {selectedCount}
                                </span>
                              )}
                            </button>
                          )}

                          {/* Campo de Nota do Aluno (onde o professor define a nota final) */}
                          <div className="flex items-center gap-1 bg-white p-1 rounded-none border border-[#E1E4E8]">
                            <span className="text-[9px] font-mono text-[#6C757D] font-bold px-1 uppercase leading-none">NOTA</span>
                            <input 
                              type="number" 
                              step="0.1"
                              placeholder="Falta"
                              min={0}
                              max={evalItem.maxGrade}
                              value={evalItem.gradeReceived ?? ""}
                              onChange={(e) => handleGradeChange(evalItem.id, e.target.value)}
                              className="w-12 text-center border-0 focus:ring-0 leading-none py-0.5 text-xs font-bold font-mono text-[#1A1C1E] bg-transparent outline-none"
                            />
                            <span className="text-[10px] text-slate-400 pr-1 font-mono">/{evalItem.maxGrade}</span>
                          </div>

                          {/* Botão de Toggle Concluído/Pendente */}
                          <button 
                            type="button"
                            onClick={() => handleToggleEvalStatus(evalItem.id)}
                            className={`px-2 py-1 font-mono text-[9px] font-bold uppercase cursor-pointer border rounded-none ${
                              evalItem.status === EvaluationStatus.COMPLETED 
                                ? "bg-emerald-50 border-emerald-300 text-emerald-800" 
                                : "bg-amber-50 border-amber-300 text-amber-800"
                            }`}
                          >
                            {evalItem.status === EvaluationStatus.COMPLETED ? "Lançada" : "Agendada"}
                          </button>

                          {/* Botão de exclusão */}
                          <button 
                            type="button"
                            onClick={() => handleRemoveEval(evalItem.id)}
                            className="p-1 px-2 border border-transparent hover:border-rose-200 text-[#6C757D] hover:text-rose-600 transition-colors cursor-pointer"
                            title="Deletar avaliação"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Expansão das rubricas interativas */}
                      {isRubricsActive && (
                        <div 
                          className="mt-1 border-t border-[#E1E4E8] pt-4 animate-in fade-in duration-200"
                        >
                          <RubricsSelector
                            maxGrade={evalItem.maxGrade}
                            initialSelection={evalItem.rubricsSelections || {}}
                            initialFinalGrade={evalItem.gradeReceived}
                            onChange={(selection, finalGrade) => {
                              setEvaluations(prev => prev.map(e => {
                                  if (e.id === evalItem.id) {
                                    return {
                                      ...e,
                                      rubricsSelections: selection,
                                      gradeReceived: finalGrade,
                                      status: EvaluationStatus.COMPLETED
                                    };
                                  }
                                  return e;
                                })
                              );
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seção 5: Painel de Recuperação Final */}
          <div className="border border-[#E1E4E8] p-5 rounded-none bg-white shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="text-amber-500" size={17} />
                <h4 className="text-xs font-bold text-[#1A1C1E] uppercase font-mono tracking-wider">Ajuste de Recuperação Paralela</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hasRecovery} 
                  onChange={(e) => {
                    setHasRecovery(e.target.checked);
                    if (!e.target.checked) setRecoveryGrade(null);
                  }}
                  className="sr-only peer" 
                />
                <div id="recovery-toggle-switch" className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-none after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FFC107]"></div>
              </label>
            </div>

            <p className="text-[10px] text-[#6C757D] leading-relaxed font-mono">
              Ative este painel se o discente realizou ou realizará prova de recuperação final para a unidade curricular. Pelo regimento escolar do SENAI, a nota recuperatória substitui de forma compensatória notas anteriores de avaliações se obtiver resultado superior.
            </p>

            {hasRecovery && (
              <div 
                className="mt-4 pt-3.5 border-t border-[#E1E4E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200"
              >
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-xs text-[#1A1C1E] font-bold">Nota da Prova de Recuperação:</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <input 
                    type="number" 
                    step="0.1"
                    min={0}
                    max={maxGradeScale}
                    placeholder="Nota final"
                    value={recoveryGrade ?? ""}
                    onChange={(e) => {
                      const valStr = e.target.value;
                      if (valStr.trim() === "") setRecoveryGrade(null);
                      else setRecoveryGrade(Math.max(0, parseFloat(valStr) || 0));
                    }}
                    className="w-24 text-center border border-[#E1E4E8] px-2 py-1.5 text-xs font-bold font-mono text-slate-800 bg-[#F8F9FA]"
                  />
                  <span className="text-xs text-slate-400">/ {maxGradeScale}</span>
                </div>
              </div>
            )}
          </div>

          {/* Seção 6: Anotações Gerais do Aluno */}
          <div className="border border-[#E1E4E8] p-5 rounded-none bg-white shadow-xs">
            <h4 className="text-xs font-bold text-[#1A1C1E] uppercase font-mono tracking-wider mb-2">Comentários e Parecer Pedagógico</h4>
            <textarea 
              rows={3}
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Descreva detalhes práticos, atitudes profissionais avaliadas, ou observações do desenvolvimento técnico do aluno..."
              className="w-full border border-[#E1E4E8] p-3 text-xs outline-none focus:ring-1 focus:ring-[#005DA5] text-[#1A1C1E] font-sans"
            />
          </div>

        </div>

        {/* Modal Bottom Panel Actions Footer */}
        <div className="p-5 border-t border-[#E1E4E8] bg-[#F8F9FA] flex justify-between items-center shrink-0">
          <div className="text-xs font-mono">
            <span className="text-[#6C757D] uppercase font-bold text-[10px]">Resultado projetado: </span>
            <span className={`font-mono font-bold ${status === SubjectStatus.PASSED ? "text-[#28A745]" : "text-rose-600"}`}>
              {attendance < 75 ? "RETIDO POR FALTAS" : `${currentGrade} pts (${currentGrade >= passingGrade ? "APROVADO" : "CONCORDÂNCIA COMPENSATÓRIA"})`}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E1E4E8] rounded-none hover:bg-[#F1F3F5] text-[#6C757D] font-mono font-bold uppercase text-[10px] cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#005DA5] hover:bg-[#004e8a] text-white font-mono font-bold uppercase text-[10px] cursor-pointer shadow-xs transition-colors"
            >
              <Save size={12} />
              <span>Gravar Dados</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
