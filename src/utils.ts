/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CurricularUnit, GradingMethod, SubjectStatus, EvaluationStatus, Evaluation, Student, SubjectTemplate, Turma, TechnicalCapacityRating } from "./types";

/**
 * Calcula a nota atual acumulada de uma Unidade Curricular.
 * Retorna um valor com base no método de avaliação.
 */
export function calculateUnitGrade(unit: CurricularUnit): number {
  const completedEvaluations = unit.evaluations.filter(
    (e) => e.status === EvaluationStatus.COMPLETED && e.gradeReceived !== null
  );

  if (completedEvaluations.length === 0) {
    return 0;
  }

  let baseGrade = 0;

  if (unit.gradingMethod === GradingMethod.POINTS) {
    // Sistema de acúmulo de pontos: Soma das notas das avaliações realizadas
    baseGrade = completedEvaluations.reduce((sum, e) => sum + (e.gradeReceived || 0), 0);
  } else {
    // Média Ponderada
    baseGrade = completedEvaluations.reduce((sum, e) => {
      const nota = e.gradeReceived || 0;
      const notaNormalizada = (nota / e.maxGrade) * unit.maxGradeScale;
      return sum + notaNormalizada * (e.weight / 100);
    }, 0);
  }

  // Se houver recuperação, ela pode aumentar a nota
  if (unit.hasRecovery && unit.recoveryGrade !== null) {
    baseGrade = Math.max(baseGrade, unit.recoveryGrade);
  }

  return parseFloat(Math.min(baseGrade, unit.maxGradeScale).toFixed(1));
}

/**
 * Calcula a porcentagem de frequência / presença do aluno na Unidade Curricular.
 */
export function calculateAttendancePercentage(unit: CurricularUnit): number {
  if (unit.workload <= 0) return 100;
  const presenceHours = Math.max(0, unit.workload - unit.absenceHours);
  return parseFloat(((presenceHours / unit.workload) * 100).toFixed(1));
}

/**
 * Determina o status atual da Unidade Curricular
 */
export function determineUnitStatus(unit: CurricularUnit): SubjectStatus {
  const attendance = calculateAttendancePercentage(unit);
  
  // No SENAI, frequência abaixo de 75% é REPROVAÇÃO imediata por faltas
  if (attendance < 75) {
    return SubjectStatus.FAILED_ATTENDANCE;
  }

  const finalGrade = calculateUnitGrade(unit);
  const totalEvaluations = unit.evaluations.length;
  const completedEvaluations = unit.evaluations.filter(
    (e) => e.status === EvaluationStatus.COMPLETED
  );

  const allCompleted = totalEvaluations === completedEvaluations.length;

  if (finalGrade >= unit.passingGrade) {
    return SubjectStatus.PASSED;
  }

  if (allCompleted) {
    if (unit.hasRecovery && unit.recoveryGrade !== null && finalGrade < unit.passingGrade) {
      return SubjectStatus.FAILED;
    }
    return unit.hasRecovery ? SubjectStatus.RECOVERY : SubjectStatus.FAILED;
  }

  // Ainda em andamento, mas vamos analisar se está "Em Recuperação" caso tenha notas baixas
  if (unit.hasRecovery && unit.recoveryGrade === null && finalGrade < unit.passingGrade && completedEvaluations.length > 0) {
    const possibleRemainingPoints = calculateMaxPossibleRemainingGrade(unit);
    if (possibleRemainingPoints < unit.passingGrade) {
      return SubjectStatus.RECOVERY;
    }
  }

  return SubjectStatus.ONGOING;
}

/**
 * Calcula a nota máxima que o aluno ainda pode atingir se tirar nota máxima em tudo que falta.
 */
export function calculateMaxPossibleRemainingGrade(unit: CurricularUnit): number {
  const currentGradeWithoutRec = calculateGradeWithoutRecovery(unit);
  const pendingEvaluations = unit.evaluations.filter((e) => e.status === EvaluationStatus.PENDING);

  if (pendingEvaluations.length === 0) {
    return currentGradeWithoutRec;
  }

  let possibleRemaining = 0;

  if (unit.gradingMethod === GradingMethod.POINTS) {
    possibleRemaining = pendingEvaluations.reduce((sum, e) => sum + e.maxGrade, 0);
  } else {
    possibleRemaining = pendingEvaluations.reduce((sum, e) => {
      return sum + unit.maxGradeScale * (e.weight / 100);
    }, 0);
  }

  return parseFloat(Math.min(currentGradeWithoutRec + possibleRemaining, unit.maxGradeScale).toFixed(1));
}

function calculateGradeWithoutRecovery(unit: CurricularUnit): number {
  const completedEvaluations = unit.evaluations.filter(
    (e) => e.status === EvaluationStatus.COMPLETED && e.gradeReceived !== null
  );

  if (completedEvaluations.length === 0) return 0;

  let baseGrade = 0;
  if (unit.gradingMethod === GradingMethod.POINTS) {
    baseGrade = completedEvaluations.reduce((sum, e) => sum + (e.gradeReceived || 0), 0);
  } else {
    baseGrade = completedEvaluations.reduce((sum, e) => {
      const nota = e.gradeReceived || 0;
      const notaNormalizada = (nota / e.maxGrade) * unit.maxGradeScale;
      return sum + notaNormalizada * (e.weight / 100);
    }, 0);
  }
  return baseGrade;
}

/**
 * Retorna as capacidades técnicas padrão com base na Unidade Curricular do SENAI.
 */
export function getDefaultCapacitiesForUC(ucNameOrCode: string): { code: string; title: string }[] {
  const norm = (ucNameOrCode || "").toUpperCase();
  if (norm.includes("TORNO") || norm.includes("TORN")) {
    return [
      { code: "OP. 01", title: "FACEAR NO TORNO" },
      { code: "OP. 02", title: "TORNEAR SUPERF. CILÍNDRICA NA PLACA UNIVERSAL" },
      { code: "OP. 03", title: "FACEAR REBAIXO EXTERNO" },
      { code: "OP. 04", title: "CHANFRAR NO TORNO" },
      { code: "OP. 05", title: "FAZER FURO DE CENTRO NO TORNO" },
      { code: "OP. 06", title: "TORNEAR REBAIXO INTERNO" },
      { code: "OP. 07", title: "TORNEAR CANAL EXTERNO" },
      { code: "OP. 08", title: "FURAR NO TORNO COM BROCA HELICOIDAL" },
      { code: "OP. 09", title: "TORNEAR SUPERFÍCIE CÔNICA COM CARRO SUPERIOR" },
      { code: "OP. 10", title: "RECARTILHAR NO TORNO" },
      { code: "OP. 11", title: "ROSQUEAR MANUALMENTE NO TORNO" },
      { code: "OP. 12", title: "AJUSTAR ENCAIXES CILÍNDRICOS E CÔNICOS" },
    ];
  }
  if (norm.includes("METROLOGIA") || norm.includes("MET")) {
    return [
      { code: "OP. 01", title: "LEITURA COM PAQUÍMETRO EM MILÍMETRO (0.05 E 0.02)" },
      { code: "OP. 02", title: "LEITURA COM PAQUÍMETRO EM POLEGADA FRACIONÁRIA" },
      { code: "OP. 03", title: "LEITURA COM MICRÔMETRO CENTESIMAL EXTERNO" },
      { code: "OP. 04", title: "MEDIÇÃO ANGULAR COM GONIÔMETRO DE PRECISÃO" },
      { code: "OP. 05", title: "VERIFICAÇÃO DE EXCENTRICIDADE COM RELÓGIO COMPARADOR" },
      { code: "OP. 06", title: "UTILIZAÇÃO DE SUTAS E CALIBRADORES DE ROSCA" },
    ];
  }
  if (norm.includes("FRESADORA") || norm.includes("FRES")) {
    return [
      { code: "OP. 01", title: "FRESAR SUPERFÍCIE PLANA E FACEAMENTO" },
      { code: "OP. 02", title: "FRESAR REBOUTO E ESQUADREJAMENTO DE PEÇAS" },
      { code: "OP. 03", title: "FRESAR RASGO DE CHAVETA RETANGULAR" },
      { code: "OP. 04", title: "FRESAR CANAL EM 'T'" },
      { code: "OP. 05", title: "FRESAR ÂNGULOS COM CABEÇOTE INCLINÁVEL" },
      { code: "OP. 06", title: "FRESAR ENGRENAGEM COM APARELHO DIVISOR" },
    ];
  }
  if (norm.includes("DESENHO") || norm.includes("DTM")) {
    return [
      { code: "OP. 01", title: "REPRESENTAÇÃO EM PROJEÇÃO ORTOGONAL (1º E 3º DIEDROS)" },
      { code: "OP. 02", title: "APLICAÇÃO DE ESCALAS, LINHAS E LEGENDA PADRONIZADA" },
      { code: "OP. 03", title: "COTAGEM E DIMENSIONAMENTO DE VISTAS" },
      { code: "OP. 04", title: "DETALHAMENTO DE CORTES PLENOS E PARCIAIS" },
      { code: "OP. 05", title: "LEITURA E INTERPRETAÇÃO DE TOLERÂNCIAS DIMENSIONAIS" },
    ];
  }
  if (norm.includes("CÁLCULOS") || norm.includes("CÁLCULO") || norm.includes("TMC")) {
    return [
      { code: "OP. 01", title: "DETERMINAÇÃO DE ROTAÇÃO RPM E AVANÇOS DE CORTE" },
      { code: "OP. 02", title: "CÁLCULOS DE ENCAIXES CILÍNDRICOS E TOLERÂNCIAS ISO" },
      { code: "OP. 03", title: "ESPECIFICAÇÃO DE MATERIAIS DE CORTE" },
      { code: "OP. 04", title: "CÁLCULO DE DIMENSÕES DE ROSCAS" },
    ];
  }
  if (norm.includes("CNC")) {
    return [
      { code: "OP. 01", title: "PREPARO E DEFINIÇÃO DE COORDENADAS ZERO-PEÇA (G54)" },
      { code: "OP. 02", title: "PROGRAMAÇÃO CNC EM CÓDIGO G (TORNEAMENTO G71, G70)" },
      { code: "OP. 03", title: "PRESET DE FERRAMENTAS E SIMULAÇÃO DE PERCURSOS" },
      { code: "OP. 04", title: "OPERAÇÃO E CONTROLE EM PAINEL FANUC/SIEMENS" },
    ];
  }
  return [
    { code: "OP. 01", title: "MONTAGEM E PREPARAÇÃO DOS CONJUNTOS" },
    { code: "OP. 02", title: "OPERAÇÃO PRÁTICA SUPERVISIONADA" },
    { code: "OP. 03", title: "CONTROLE DE QUALIDADE E ACABAMENTO" },
    { code: "OP. 04", title: "MANUTENÇÃO PREVENTIVA E ORGANIZAÇÃO" },
  ];
}

/**
 * Gera as unidades curriculares básicas para um aluno.
 */
export function getInitialSENAIData(): CurricularUnit[] {
  const getCaps = (code: string) => {
    return getDefaultCapacitiesForUC(code).map((c) => ({
      capacityId: `${code.toLowerCase()}-${c.code.toLowerCase().replace(/\s+/g, '')}`,
      code: c.code,
      title: c.title,
      rubric: null,
      grade: null,
      notes: ""
    }));
  };

  return [
    {
      id: "uc-met-init",
      name: "Metrologia Dimensional",
      code: "MUC-MET",
      teacher: "Prof. André Valente",
      workload: 60,
      absenceHours: 2,
      passingGrade: 60,
      maxGradeScale: 100,
      gradingMethod: GradingMethod.POINTS,
      evaluations: [
        {
          id: "e-met-1",
          title: "SA1 - Leitura com Paquímetro (0,02 e 0,05mm)",
          description: "Prática com instrumentos reais na bancada de controle dimensional",
          weight: 40,
          maxGrade: 40,
          gradeReceived: 36,
          status: EvaluationStatus.COMPLETED,
          date: "2026-05-10",
        },
        {
          id: "e-met-2",
          title: "SA2 - Medição com Micrômetro de Precisão",
          description: "Leituras micrométricas em eixos torneados de encaixe",
          weight: 30,
          maxGrade: 30,
          gradeReceived: 25,
          status: EvaluationStatus.COMPLETED,
          date: "2026-05-24",
        }
      ],
      hasRecovery: false,
      recoveryGrade: null,
      notes: "Excelente precisão nas leituras dimensionais de micrômetros externos.",
      capacidadesTecnicas: getCaps("MUC-MET")
    },
    {
      id: "uc-torn-init",
      name: "Torno Mecânico Convencional",
      code: "MUC-TORN",
      teacher: "Prof. Vanderlei Souza",
      workload: 180,
      absenceHours: 6,
      passingGrade: 60,
      maxGradeScale: 100,
      gradingMethod: GradingMethod.POINTS,
      evaluations: [
        {
          id: "e-torn-1",
          title: "SA1 - Torneamento Cilíndrico e Faceamento",
          description: "Rebaixos de encaixe com tolerância de centésimos de milímetro",
          weight: 50,
          maxGrade: 50,
          gradeReceived: 42,
          status: EvaluationStatus.COMPLETED,
          date: "2026-05-15",
        }
      ],
      hasRecovery: false,
      recoveryGrade: null,
      notes: "Uso consciente e seguro do torno mecânico convencional.",
      capacidadesTecnicas: getCaps("MUC-TORN")
    }
  ];
}

export function getInitialSENAITurmas(): Turma[] {
  const defaultSubjects: SubjectTemplate[] = [
    {
      id: "temp-met",
      name: "Metrologia Dimensional",
      code: "MUC-MET",
      teacher: "Prof. André Valente",
      workload: 60,
      passingGrade: 60,
      maxGradeScale: 100,
      gradingMethod: GradingMethod.POINTS,
    },
    {
      id: "temp-torn",
      name: "Torno Mecânico Convencional",
      code: "MUC-TORN",
      teacher: "Prof. Vanderlei Souza",
      workload: 180,
      passingGrade: 60,
      maxGradeScale: 100,
      gradingMethod: GradingMethod.POINTS,
    },
    {
      id: "temp-dtm",
      name: "Desenho Técnico Mecânico",
      code: "MUC-DTM",
      teacher: "Prof. Thiago Ferreira",
      workload: 80,
      passingGrade: 60,
      maxGradeScale: 10,
      gradingMethod: GradingMethod.WEIGHTED,
    },
    {
      id: "temp-fres",
      name: "Fresadora Convencional",
      code: "MUC-FRES",
      teacher: "Prof. Vanderlei Souza",
      workload: 140,
      passingGrade: 60,
      maxGradeScale: 100,
      gradingMethod: GradingMethod.POINTS,
    },
    {
      id: "temp-tmc",
      name: "Tecnologia Mecânica e Cálculos",
      code: "MUC-TMC",
      teacher: "Prof. Carlos Eduardo",
      workload: 60,
      passingGrade: 60,
      maxGradeScale: 100,
      gradingMethod: GradingMethod.POINTS,
    },
    {
      id: "temp-cnc",
      name: "Máquinas Operatrizes CNC",
      code: "MUC-CNC",
      teacher: "Prof. Roberto Mendes",
      workload: 120,
      passingGrade: 60,
      maxGradeScale: 10,
      gradingMethod: GradingMethod.WEIGHTED,
    }
  ];

  const getCaps = (code: string) => {
    return getDefaultCapacitiesForUC(code).map((c) => ({
      capacityId: `${code.toLowerCase()}-${c.code.toLowerCase().replace(/\s+/g, '')}`,
      code: c.code,
      title: c.title,
      rubric: null,
      grade: null,
      notes: ""
    }));
  };

  const createUnitsForStudent = (studentName: string) => {
    return defaultSubjects.map(sub => {
      const code = sub.code || "";
      const isMetOrTorn = code === "MUC-MET" || code === "MUC-TORN";
      return {
        id: `uc-${sub.id}-${studentName.toLowerCase().replace(/\s+/g, '-')}`,
        name: sub.name,
        code: sub.code,
        teacher: sub.teacher,
        workload: sub.workload,
        absenceHours: Math.floor(Math.random() * 4),
        passingGrade: sub.passingGrade,
        maxGradeScale: sub.maxGradeScale,
        gradingMethod: sub.gradingMethod,
        evaluations: [
          {
            id: `eval-${sub.id}-1`,
            title: "SA1 - Atividade Prática Laboratorial",
            weight: sub.gradingMethod === GradingMethod.POINTS ? sub.maxGradeScale : 100,
            maxGrade: sub.maxGradeScale,
            gradeReceived: Math.floor(sub.maxGradeScale * 0.75) + Math.floor(Math.random() * (sub.maxGradeScale * 0.15)),
            status: EvaluationStatus.COMPLETED,
            date: "2026-05-18"
          }
        ],
        hasRecovery: false,
        recoveryGrade: null,
        notes: "Bom aproveitamento prático em ambiente controlado.",
        capacidadesTecnicas: getCaps(code)
      };
    });
  };

  const classesConfig = [
    { id: "turma-ma", code: "MA", name: "Mecânico de Usinagem - Turma MA (Manhã A)", shift: "Manhã", students: [
      { name: "Ricardo Beretella", ra: "2026-USI-01" },
      { name: "Lucas Almeida", ra: "2026-USI-02" },
      { name: "Gabriel Santos", ra: "2026-USI-03" },
      { name: "Enzo Gabriel Silveira", ra: "2026-USI-04" },
      { name: "Arthur Rodrigues", ra: "2026-USI-05" },
      { name: "Matheus Oliveira", ra: "2026-USI-06" }
    ]},
    { id: "turma-mb", code: "MB", name: "Mecânico de Usinagem - Turma MB (Manhã B)", shift: "Manhã", students: [
      { name: "Bruno Camargo", ra: "2026-USI-11" },
      { name: "Gustavo Silveira", ra: "2026-USI-12" },
      { name: "Daniel Barbosa", ra: "2026-USI-13" },
      { name: "Leonardo Medeiros", ra: "2026-USI-14" },
      { name: "Felipe Andrade", ra: "2026-USI-15" }
    ]},
    { id: "turma-ta", code: "TA", name: "Mecânico de Usinagem - Turma TA (Tarde A)", shift: "Tarde", students: [
      { name: "Matheus Henrique", ra: "2026-USI-21" },
      { name: "Felipe Rodrigues", ra: "2026-USI-22" },
      { name: "Eduardo Costa", ra: "2026-USI-23" },
      { name: "Vinicius Souza", ra: "2026-USI-24" }
    ]},
    { id: "turma-tb", code: "TB", name: "Mecânico de Usinagem - Turma TB (Tarde B)", shift: "Tarde", students: [
      { name: "Pedro Henrique", ra: "2026-USI-31" },
      { name: "Guilherme Silva", ra: "2026-USI-32" },
      { name: "Rafael Oliveira", ra: "2026-USI-33" },
      { name: "Samuel Lima", ra: "2026-USI-34" }
    ]}
  ];

  return classesConfig.map(c => ({
    id: c.id,
    name: c.name,
    code: c.code,
    shift: c.shift,
    subjects: defaultSubjects,
    students: c.students.map((st, idx) => ({
      id: `std-${c.code.toLowerCase()}-${idx}`,
      name: st.name,
      ra: st.ra,
      email: `${st.name.toLowerCase().replace(/\s+/g, '.')}@aluno.senai.br`,
      units: createUnitsForStudent(st.name)
    }))
  }));
}

export function getStatusText(status: SubjectStatus): { text: string; bgClass: string; textClass: string } {
  switch (status) {
    case SubjectStatus.PASSED:
      return { text: "Aprovado", bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200", textClass: "text-emerald-700" };
    case SubjectStatus.ONGOING:
      return { text: "Em Andamento", bgClass: "bg-sky-50 text-sky-700 border-sky-200", textClass: "text-sky-700" };
    case SubjectStatus.RECOVERY:
      return { text: "Em Recuperação", bgClass: "bg-amber-50 text-amber-700 border-amber-200", textClass: "text-amber-700" };
    case SubjectStatus.FAILED:
      return { text: "Reprovado por Nota", bgClass: "bg-rose-50 text-rose-700 border-rose-200", textClass: "text-rose-700" };
    case SubjectStatus.FAILED_ATTENDANCE:
      return { text: "Retido por Faltas", bgClass: "bg-red-50 text-red-700 border-red-300 animate-pulse", textClass: "text-red-700" };
  }
}
