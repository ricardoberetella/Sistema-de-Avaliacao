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
  if (norm.includes("FUSI") || norm.includes("FUNDAMENTOS") || norm.includes("USINAGEM")) {
    return [
      { code: "OP. 01", title: "RECONHECER MATERIAIS METÁLICOS E NÃO-METÁLICOS" },
      { code: "OP. 02", title: "IDENTIFICAR FERRAMENTAS E ACESSÓRIOS DE CORTE" },
      { code: "OP. 03", title: "DETERMINAR VELOCIDADE DE CORTE E ROTAÇÃO RPM" },
      { code: "OP. 04", title: "APLICAR NORMAS DE SEGURANÇA E NR12 NA OFICINA" },
      { code: "OP. 05", title: "INTERPRETAR LEIS DE FORMAÇÃO DOS CAVACOS" },
    ];
  }
  if (norm.includes("LIDT") || norm.includes("LEITURA") || norm.includes("DESENHO")) {
    return [
      { code: "OP. 01", title: "INTERPRETAR PERSPECTIVAS E PROJEÇÕES ORTOGONAIS" },
      { code: "OP. 02", title: "IDENTIFICAR LINHAS, SÍMBOLOS E LEGENDA PADRONIZADA" },
      { code: "OP. 03", title: "LEITURA DE COTAGENS E ESCALAS DE DESENHOS" },
      { code: "OP. 04", title: "INTERPRETAR DETALHES DE CORTES E SEÇÕES" },
      { code: "OP. 05", title: "LEITURA DE INDICAÇÕES DE ACABAMENTO SUPERFICIAL E TOLERÂNCIAS" },
    ];
  }
  if (norm.includes("CRD") || norm.includes("CONTROLE") || norm.includes("DIMENSIONAL") || norm.includes("METROLOGIA")) {
    return [
      { code: "OP. 01", title: "LEITURA E MEDIÇÃO COM PAQUÍMETRO EM MILÍMETRO E POLEGADA" },
      { code: "OP. 02", title: "LEITURA E MEDIÇÃO COM MICRÔMETRO CENTESIMAL / MILESIMAL" },
      { code: "OP. 03", title: "UTILIZAR RELÓGIO COMPARADOR E APALPADOR" },
      { code: "OP. 04", title: "MEDIÇÃO COM GONIÔMETRO DE PRECISÃO" },
      { code: "OP. 05", title: "VERIFICAÇÃO DA RUGOSIDADE DE SUPERFÍCES" },
    ];
  }
  if (norm.includes("CNC")) {
    return [
      { code: "OP. 01", title: "INTERPRETAR PROGRAMAS CNC BASEADOS EM CÓDIGOS G E M" },
      { code: "OP. 02", title: "REALIZAR PRESET DE FERRAMENTAS E REFERENCIAMENTO ZERO-PEÇA" },
      { code: "OP. 03", title: "SIMULAR PERCURSOS DE FERRAMENTA EM SOFTWARE CNC" },
      { code: "OP. 04", title: "PREPARAR FIXAÇÃO E OPERAR O TORNO/CENTRO DE USINAGEM CNC" },
      { code: "OP. 05", title: "OPERAR PAINEL CNC FANUC/SIEMENS E REALIZAR AJUSTES DE CORRETOR" },
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
      id: "uc-fusi-init",
      name: "Fundamentos da Usinagem",
      code: "FUSI",
      teacher: "Prof. Vanderlei Souza",
      workload: 80,
      absenceHours: 2,
      passingGrade: 60,
      maxGradeScale: 100,
      gradingMethod: GradingMethod.POINTS,
      evaluations: [
        {
          id: "e-fusi-1",
          title: "SA1 - Teorias de Formação de Cavaco",
          description: "Prática em conceitos físicos e ângulos do gume da ferramenta",
          weight: 45,
          maxGrade: 45,
          gradeReceived: 38,
          status: EvaluationStatus.COMPLETED,
          date: "2026-05-12",
        },
        {
          id: "e-fusi-2",
          title: "SA2 - Parâmetros de Velocidade e Avanço",
          description: "Especificação de rotações para diferentes materiais e ferramentas",
          weight: 55,
          maxGrade: 55,
          gradeReceived: 48,
          status: EvaluationStatus.COMPLETED,
          date: "2026-05-25",
        }
      ],
      hasRecovery: false,
      recoveryGrade: null,
      notes: "Sabe aplicar perfeitamente as leis fundamentais de corte de metais.",
      capacidadesTecnicas: getCaps("FUSI")
    },
    {
      id: "uc-lidt-init",
      name: "Leitura e Interpretação de Desenho Técnico",
      code: "LIDT",
      teacher: "Prof. Thiago Ferreira",
      workload: 100,
      absenceHours: 4,
      passingGrade: 60,
      maxGradeScale: 100,
      gradingMethod: GradingMethod.POINTS,
      evaluations: [
        {
          id: "e-lidt-1",
          title: "SA1 - Projeção Ortogonal de Peças Mecânicas",
          description: "Determinação de 1º e 3º diédros na prancheta de desenho",
          weight: 50,
          maxGrade: 50,
          gradeReceived: 45,
          status: EvaluationStatus.COMPLETED,
          date: "2026-05-14",
        },
        {
          id: "e-lidt-2",
          title: "SA2 - Cotagem e Leitura de Desenho de Conjunto",
          description: "Interpretação de desenhos montados com listagem de peças",
          weight: 50,
          maxGrade: 50,
          gradeReceived: 42,
          status: EvaluationStatus.COMPLETED,
          date: "2026-05-28",
        }
      ],
      hasRecovery: false,
      recoveryGrade: null,
      notes: "Excelente interpretação espacial e respeito aos padrões ABNT de linhas.",
      capacidadesTecnicas: getCaps("LIDT")
    }
  ];
}

export function getInitialSENAITurmas(): Turma[] {
  const defaultSubjects: SubjectTemplate[] = [
    {
      id: "temp-fusi",
      name: "Fundamentos da Usinagem",
      code: "FUSI",
      teacher: "Prof. Vanderlei Souza",
      workload: 80,
      passingGrade: 60,
      maxGradeScale: 100,
      gradingMethod: GradingMethod.POINTS,
    },
    {
      id: "temp-lidt",
      name: "Leitura e Interpretação de Desenho Técnico",
      code: "LIDT",
      teacher: "Prof. Thiago Ferreira",
      workload: 100,
      passingGrade: 60,
      maxGradeScale: 100,
      gradingMethod: GradingMethod.POINTS,
    },
    {
      id: "temp-crd",
      name: "Controle Dimensional",
      code: "CRD",
      teacher: "Prof. André Valente",
      workload: 60,
      passingGrade: 60,
      maxGradeScale: 100,
      gradingMethod: GradingMethod.POINTS,
    },
    {
      id: "temp-cnc",
      name: "Programação e Operação CNC",
      code: "CNC",
      teacher: "Prof. Roberto Mendes",
      workload: 120,
      passingGrade: 60,
      maxGradeScale: 100,
      gradingMethod: GradingMethod.POINTS,
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
            weight: 50,
            maxGrade: 50,
            gradeReceived: Math.floor(50 * 0.75) + Math.floor(Math.random() * (50 * 0.2)),
            status: EvaluationStatus.COMPLETED,
            date: "2026-05-18"
          },
          {
            id: `eval-${sub.id}-2`,
            title: "SA2 - Avaliação de Conhecimento",
            weight: 50,
            maxGrade: 50,
            gradeReceived: Math.floor(50 * 0.70) + Math.floor(Math.random() * (50 * 0.25)),
            status: EvaluationStatus.COMPLETED,
            date: "2026-05-28"
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
