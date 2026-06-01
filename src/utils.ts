/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CurricularUnit, GradingMethod, SubjectStatus, EvaluationStatus, Evaluation, Student, SubjectTemplate, Turma } from "./types";

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
    // Média Ponderada: Cada nota é multiplicada por Peso / 100
    // Se as avaliações ainda não estiverem todas prontas, calculamos proporcionalmente
    // de acordo com os pesos das avaliações concluídas, ou absoluto sobre o total do semestre.
    // No SENAI, o absoluto é muito comum (ex: se somar tudo no fim do semestre tem que dar >= 60).
    // Faremos o cálculo absoluto (soma ponderada direta):
    baseGrade = completedEvaluations.reduce((sum, e) => {
      const nota = e.gradeReceived || 0;
      // Normalizar nota se estiver em escala diferente
      const notaNormalizada = (nota / e.maxGrade) * unit.maxGradeScale;
      return sum + notaNormalizada * (e.weight / 100);
    }, 0);
  }

  // Se houver recuperação, ela pode aumentar a nota
  if (unit.hasRecovery && unit.recoveryGrade !== null) {
    // Em muitas escolas do SENAI, a nota da recuperação substitui a nota final ou a menor nota para atingir a média.
    // Vamos adotar: se a nota da recuperação for maior que a nota base, a nota final vira a recuperação (porém limitada à média para passar, ou o maior se a escola permitir).
    // Para conveniência do aluno, deixaremos a recuperação substituir a nota base caso seja maior.
    baseGrade = Math.max(baseGrade, unit.recoveryGrade);
  }

  // Limitando a nota ao teto da escala (ex: 100 ou 10)
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
    // Se acabou tudo e não atingiu a nota mínima, está em situação crítica de Recuperação ou Reprovado se não houver recuperação disponível
    if (unit.hasRecovery && unit.recoveryGrade !== null && finalGrade < unit.passingGrade) {
      return SubjectStatus.FAILED;
    }
    return unit.hasRecovery ? SubjectStatus.RECOVERY : SubjectStatus.FAILED;
  }

  // Ainda em andamento, mas vamos analisar se está "Em Recuperação" caso tenha notas baixas
  if (unit.hasRecovery && unit.recoveryGrade === null && finalGrade < unit.passingGrade && completedEvaluations.length > 0) {
    // Se o potencial máximo de pontos restantes não for suficiente para passar, o aluno já cai em recuperação
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
    // Projetar peso das avaliações pendentes
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
 * Gera dados iniciais para o aplicativo com UCs típicas do curso de Eletromecânica/Industrial do SENAI.
 */
export function getInitialSENAIData(): CurricularUnit[] {
  return [
    {
      id: "uc-1",
      name: "Metrologia Dimensional",
      code: "MUC-MET",
      teacher: "Prof. André Valente",
      workload: 60,
      absenceHours: 4,
      passingGrade: 60,
      maxGradeScale: 100,
      gradingMethod: GradingMethod.POINTS,
      evaluations: [
        {
          id: "e1-1",
          title: "SA1 - Leitura com Paquímetro (0,02 e 0,05mm)",
          description: "Prática com instrumentos reais na bancada de controle dimensional",
          weight: 40,
          maxGrade: 40,
          gradeReceived: 36,
          status: EvaluationStatus.COMPLETED,
          date: "2026-05-10",
        },
        {
          id: "e1-2",
          title: "SA2 - Medição com Micrômetro de Precisão",
          description: "Leituras micrométricas em eixos torneados de encaixe",
          weight: 30,
          maxGrade: 30,
          gradeReceived: 25,
          status: EvaluationStatus.COMPLETED,
          date: "2026-05-24",
        },
        {
          id: "e1-3",
          title: "SA3 - Goniômetro e Relógio Comparador",
          description: "Leitura de inclinação angular e verificação de excentricidade de peças",
          weight: 30,
          maxGrade: 30,
          gradeReceived: null,
          status: EvaluationStatus.PENDING,
          date: "2026-06-15",
        },
      ],
      hasRecovery: false,
      recoveryGrade: null,
      notes: "Excelente habilidade e precisão no uso do paquímetro instrumental.",
    },
    {
      id: "uc-2",
      name: "Torno Mecânico Convencional",
      code: "MUC-TORN",
      teacher: "Prof. Vanderlei Souza",
      workload: 180,
      absenceHours: 12,
      passingGrade: 60,
      maxGradeScale: 100,
      gradingMethod: GradingMethod.POINTS,
      evaluations: [
        {
          id: "e2-1",
          title: "SA1 - Torneamento Cilíndrico e Faceamento",
          description: "Desbaste e acabamento sob tolerância padrão em aço 1020",
          weight: 30,
          maxGrade: 30,
          gradeReceived: 27,
          status: EvaluationStatus.COMPLETED,
          date: "2026-05-12",
        },
        {
          id: "e2-2",
          title: "SA2 - Rosqueamento Manual e Recartilhamento",
          description: "Rosca triangular com ferramenta de aço rápido e recartilhado cruzado",
          weight: 40,
          maxGrade: 40,
          gradeReceived: 35,
          status: EvaluationStatus.COMPLETED,
          date: "2026-05-28",
        },
        {
          id: "e2-3",
          title: "SA3 - Torneamento Cônico e Canal Interno",
          description: "Ajustagem fina de acoplamento cônico no torno mecânico",
          weight: 30,
          maxGrade: 30,
          gradeReceived: null,
          status: EvaluationStatus.PENDING,
          date: "2026-06-18",
        },
      ],
      hasRecovery: false,
      recoveryGrade: null,
      notes: "Sempre utilizar óculos de segurança e jaleco fechado na área operacional do torno mecânico.",
    },
    {
      id: "uc-3",
      name: "Desenho Técnico Mecânico",
      code: "MUC-DTM",
      teacher: "Prof. Thiago Ferreira",
      workload: 80,
      absenceHours: 2,
      passingGrade: 60,
      maxGradeScale: 10,
      gradingMethod: GradingMethod.WEIGHTED,
      evaluations: [
        {
          id: "e3-1",
          title: "SA1 - Projeção Ortogonal de Sólidos",
          description: "Esboços manuais e desenho instrumental das vistas principais",
          weight: 50,
          maxGrade: 10,
          gradeReceived: 8.5,
          status: EvaluationStatus.COMPLETED,
          date: "2026-04-22",
        },
        {
          id: "e3-2",
          title: "SA2 - Cotagem e Cortes de Elementos",
          description: "Desenho de peças complexas com furos e roscas em corte pleno",
          weight: 50,
          maxGrade: 10,
          gradeReceived: 9.0,
          status: EvaluationStatus.COMPLETED,
          date: "2026-05-15",
        },
      ],
      hasRecovery: false,
      recoveryGrade: null,
      notes: "Bons traçados lineares e excelente preenchimento de hachuras padronizadas NBR.",
    },
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

  return [
    {
      id: "turma-1",
      name: "Mecânico de Usinagem - Turma A (Manhã) - Monte Alto",
      code: "MUC-MONTEALTO-AM",
      shift: "Manhã",
      subjects: defaultSubjects,
      students: [
        {
          id: "std-11",
          name: "Ricardo Beretella",
          ra: "2026-USI-05",
          email: "ricardo.beretella@aluno.senai.br",
          units: [
            {
              id: "uc-11-1",
              name: "Metrologia Dimensional",
              code: "MUC-MET",
              teacher: "Prof. André Valente",
              workload: 60,
              absenceHours: 0,
              passingGrade: 60,
              maxGradeScale: 100,
              gradingMethod: GradingMethod.POINTS,
              evaluations: [
                {
                  id: "e1-11",
                  title: "SA1 - Leitura com Paquímetro (0,02 e 0,05mm)",
                  description: "Prática instrumental com peças torneadas de precisão",
                  weight: 40,
                  maxGrade: 40,
                  gradeReceived: 38,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-10",
                },
                {
                  id: "e1-12",
                  title: "SA2 - Medição com Micrômetro de Precisão",
                  description: "Leitura rápida e precisa de micrômetro externo",
                  weight: 30,
                  maxGrade: 30,
                  gradeReceived: 27,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-24",
                },
                {
                  id: "e1-13",
                  title: "SA3 - Goniômetro e Relógio Comparador",
                  weight: 30,
                  maxGrade: 30,
                  gradeReceived: null,
                  status: EvaluationStatus.PENDING,
                  date: "2026-06-15",
                },
              ],
              hasRecovery: false,
              recoveryGrade: null,
              notes: "Uso exemplar dos instrumentos. Cuidado primoroso nos encaixes de eixos.",
            },
            {
              id: "uc-11-2",
              name: "Torno Mecânico Convencional",
              code: "MUC-TORN",
              teacher: "Prof. Vanderlei Souza",
              workload: 180,
              absenceHours: 8,
              passingGrade: 60,
              maxGradeScale: 100,
              gradingMethod: GradingMethod.POINTS,
              evaluations: [
                {
                  id: "e2-11",
                  title: "SA1 - Torneamento Cilíndrico e Faceamento",
                  description: "Rebaixos de encaixe com tolerância de centésimos",
                  weight: 30,
                  maxGrade: 30,
                  gradeReceived: 28,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-12",
                },
                {
                  id: "e2-12",
                  title: "SA2 - Rosqueamento Manual e Recartilhamento",
                  description: "Usinagem de rosca métrica em aço rápido",
                  weight: 40,
                  maxGrade: 40,
                  gradeReceived: 36,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-28",
                },
                {
                  id: "e2-13",
                  title: "SA3 - Torneamento Cônico e Canal Interno",
                  weight: 30,
                  maxGrade: 30,
                  gradeReceived: null,
                  status: EvaluationStatus.PENDING,
                  date: "2026-06-18",
                }
              ],
              hasRecovery: false,
              recoveryGrade: null,
              notes: "Muito cuidadoso com a limpeza dos fusos e barramento do torno.",
            },
            {
              id: "uc-11-3",
              name: "Desenho Técnico Mecânico",
              code: "MUC-DTM",
              teacher: "Prof. Thiago Ferreira",
              workload: 80,
              absenceHours: 2,
              passingGrade: 60,
              maxGradeScale: 10,
              gradingMethod: GradingMethod.WEIGHTED,
              evaluations: [
                {
                  id: "e3-11",
                  title: "SA1 - Projeção Ortogonal de Sólidos",
                  weight: 50,
                  maxGrade: 10,
                  gradeReceived: 8.5,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-04-22",
                },
                {
                  id: "e3-12",
                  title: "SA2 - Cotagem e Cortes de Elementos",
                  weight: 50,
                  maxGrade: 10,
                  gradeReceived: 9.0,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-15",
                },
              ],
              hasRecovery: false,
              recoveryGrade: null,
              notes: "Usa corretamente a lapiseira 0.5 e 0.7 para diferenciar traçados das arestas.",
            },
            {
              id: "uc-11-4",
              name: "Fresadora Convencional",
              code: "MUC-FRES",
              teacher: "Prof. Vanderlei Souza",
              workload: 140,
              absenceHours: 2,
              passingGrade: 60,
              maxGradeScale: 100,
              gradingMethod: GradingMethod.POINTS,
              evaluations: [
                {
                  id: "e4-11",
                  title: "SA1 - Fresagem de Superfície Plana e Esquadrejamento",
                  description: "Uso do cabeçote fresador e fixação de placa morsa",
                  weight: 40,
                  maxGrade: 40,
                  gradeReceived: 35,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-18",
                },
                {
                  id: "e4-12",
                  title: "SA2 - Rasgos de Chaveta e Canal T",
                  weight: 60,
                  maxGrade: 60,
                  gradeReceived: null,
                  status: EvaluationStatus.PENDING,
                  date: "2026-06-25",
                }
              ],
              hasRecovery: false,
              recoveryGrade: null,
              notes: "Excelente cálculo do avanço por dente na fresagem periférica.",
            },
            {
              id: "uc-11-5",
              name: "Tecnologia Mecânica e Cálculos",
              code: "MUC-TMC",
              teacher: "Prof. Carlos Eduardo",
              workload: 60,
              absenceHours: 0,
              passingGrade: 60,
              maxGradeScale: 100,
              gradingMethod: GradingMethod.POINTS,
              evaluations: [
                {
                  id: "e5-11",
                  title: "SA1 - Cálculos de Parâmetros de Usinagem (RPM/Av)",
                  description: "Prova teórica de grandezas e velocidade de corte",
                  weight: 50,
                  maxGrade: 50,
                  gradeReceived: 45,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-02",
                },
                {
                  id: "e5-12",
                  title: "SA2 - Elementos de Fixação e Tratamentos Térmicos",
                  weight: 50,
                  maxGrade: 50,
                  gradeReceived: 42,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-20",
                }
              ],
              hasRecovery: false,
              recoveryGrade: null,
              notes: "Excelente raciocínio lógico em cálculos de roscas e rotação ideal.",
            },
            {
              id: "uc-11-6",
              name: "Máquinas Operatrizes CNC",
              code: "MUC-CNC",
              teacher: "Prof. Roberto Mendes",
              workload: 120,
              absenceHours: 4,
              passingGrade: 60,
              maxGradeScale: 10,
              gradingMethod: GradingMethod.WEIGHTED,
              evaluations: [
                {
                  id: "e6-11",
                  title: "SA1 - Programação de Percurso CNC (Código G)",
                  description: "Construção de bloco de códigos e simulação gráfica",
                  weight: 50,
                  maxGrade: 10,
                  gradeReceived: 8.5,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-19",
                },
                {
                  id: "e6-12",
                  title: "SA2 - Operação de Painel CNC Fanuc e Preset",
                  weight: 50,
                  maxGrade: 10,
                  gradeReceived: null,
                  status: EvaluationStatus.PENDING,
                  date: "2026-06-20",
                }
              ],
              hasRecovery: false,
              recoveryGrade: null,
              notes: "Muito competente na lógica do ciclo de rosamento e desbaste G71.",
            }
          ]
        },
        {
          id: "std-12",
          name: "Otávio Augusto",
          ra: "2026-USI-08",
          email: "otavio.augusto@aluno.senai.br",
          units: [
            {
              id: "uc-12-1",
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
                  id: "e1-21",
                  title: "SA1 - Leitura com Paquímetro (0,02 e 0,05mm)",
                  weight: 40,
                  maxGrade: 40,
                  gradeReceived: 18, // Nota inicial baixa
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-10",
                },
                {
                  id: "e1-22",
                  title: "SA2 - Medição com Micrômetro de Precisão",
                  weight: 30,
                  maxGrade: 30,
                  gradeReceived: 21,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-24",
                },
                {
                  id: "e1-23",
                  title: "SA3 - Goniômetro e Relógio Comparador",
                  weight: 30,
                  maxGrade: 30,
                  gradeReceived: 15,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-06-15",
                },
              ],
              hasRecovery: true, // Recuperado!
              recoveryGrade: 68,
              notes: "Recuperação bem sucedida. Teve melhorias nítidas na interpretação da polegada fracionária no nônio.",
            },
            {
              id: "uc-12-2",
              name: "Torno Mecânico Convencional",
              code: "MUC-TORN",
              teacher: "Prof. Vanderlei Souza",
              workload: 180,
              absenceHours: 52, // Faltoso! > 25% faltas (limite 45h). Ficou com 71.1% frequência! RETIDO.
              passingGrade: 60,
              maxGradeScale: 100,
              gradingMethod: GradingMethod.POINTS,
              evaluations: [
                {
                  id: "e2-21",
                  title: "SA1 - Torneamento Cilíndrico e Faceamento",
                  weight: 30,
                  maxGrade: 30,
                  gradeReceived: 25,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-12",
                },
                {
                  id: "e2-22",
                  title: "SA2 - Rosqueamento Manual e Recartilhamento",
                  weight: 40,
                  maxGrade: 40,
                  gradeReceived: null,
                  status: EvaluationStatus.PENDING,
                  date: "2026-05-28",
                },
                {
                  id: "e2-23",
                  title: "SA3 - Torneamento Cônico e Canal Interno",
                  weight: 30,
                  maxGrade: 30,
                  gradeReceived: null,
                  status: EvaluationStatus.PENDING,
                  date: "2026-06-18",
                }
              ],
              hasRecovery: false,
              recoveryGrade: null,
              notes: "⚠️ ATENÇÃO: Aluno ultrapassou o limite máximo de faltas permitido regimentalmente (45h para esta UC). Situação pedagógica crítica.",
            },
            {
              id: "uc-12-3",
              name: "Desenho Técnico Mecânico",
              code: "MUC-DTM",
              teacher: "Prof. Thiago Ferreira",
              workload: 80,
              absenceHours: 6,
              passingGrade: 60,
              maxGradeScale: 10,
              gradingMethod: GradingMethod.WEIGHTED,
              evaluations: [
                {
                  id: "e3-21",
                  title: "SA1 - Projeção Ortogonal de Sólidos",
                  weight: 50,
                  maxGrade: 10,
                  gradeReceived: 6.5,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-04-22",
                },
                {
                  id: "e3-22",
                  title: "SA2 - Cotagem e Cortes de Elementos",
                  weight: 50,
                  maxGrade: 10,
                  gradeReceived: 7.0,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-15",
                },
              ],
              hasRecovery: false,
              recoveryGrade: null,
              notes: "Entrega croquis funcionais, mas precisa usar o compasso com mais firmeza.",
            }
          ]
        },
        {
          id: "std-13",
          name: "Enzo Gabriel Silveira",
          ra: "2026-USI-12",
          email: "enzo.gabriel@aluno.senai.br",
          units: [
            {
              id: "uc-13-1",
              name: "Metrologia Dimensional",
              code: "MUC-MET",
              teacher: "Prof. André Valente",
              workload: 60,
              absenceHours: 0,
              passingGrade: 60,
              maxGradeScale: 100,
              gradingMethod: GradingMethod.POINTS,
              evaluations: [
                {
                  id: "e1-31",
                  title: "SA1 - Leitura com Paquímetro (0,02 e 0,05mm)",
                  weight: 40,
                  maxGrade: 40,
                  gradeReceived: 39,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-10",
                },
                {
                  id: "e1-32",
                  title: "SA2 - Medição com Micrômetro de Precisão",
                  weight: 30,
                  maxGrade: 30,
                  gradeReceived: 29,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-24",
                },
                {
                  id: "e1-33",
                  title: "SA3 - Goniômetro e Relógio Comparador",
                  weight: 30,
                  maxGrade: 30,
                  gradeReceived: null,
                  status: EvaluationStatus.PENDING,
                  date: "2026-06-15",
                },
              ],
              hasRecovery: false,
              recoveryGrade: null,
              notes: "Nível acadêmico excepcional, ótima destreza instrumental e asseio com materiais.",
            },
            {
              id: "uc-13-2",
              name: "Torno Mecânico Convencional",
              code: "MUC-TORN",
              teacher: "Prof. Vanderlei Souza",
              workload: 180,
              absenceHours: 4,
              passingGrade: 60,
              maxGradeScale: 100,
              gradingMethod: GradingMethod.POINTS,
              evaluations: [
                {
                  id: "e2-31",
                  title: "SA1 - Torneamento Cilíndrico e Faceamento",
                  weight: 30,
                  maxGrade: 30,
                  gradeReceived: 29,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-12",
                },
                {
                  id: "e2-32",
                  title: "SA2 - Rosqueamento Manual e Recartilhamento",
                  weight: 40,
                  maxGrade: 40,
                  gradeReceived: 38,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-28",
                },
                {
                  id: "e2-33",
                  title: "SA3 - Torneamento Cônico e Canal Interno",
                  weight: 30,
                  maxGrade: 30,
                  gradeReceived: null,
                  status: EvaluationStatus.PENDING,
                  date: "2026-06-18",
                }
              ],
              hasRecovery: false,
              recoveryGrade: null,
              notes: "Muito proativo nas oficinas. Auxilia os colegas de classe voluntariamente.",
            }
          ]
        }
      ]
    },
    {
      id: "turma-2",
      name: "Mecânico de Usinagem - Turma B (Tarde) - Monte Alto",
      code: "MUC-MONTEALTO-BT",
      shift: "Tarde",
      subjects: defaultSubjects,
      students: [
        {
          id: "std-21",
          name: "Matheus Henrique",
          ra: "2026-USI-201",
          email: "matheus.henrique@aluno.senai.br",
          units: [
            {
              id: "uc-21-1",
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
                  id: "e1-41",
                  title: "SA1 - Leitura com Paquímetro (0,02 e 0,05mm)",
                  weight: 40,
                  maxGrade: 40,
                  gradeReceived: 35,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-10",
                },
                {
                  id: "e1-42",
                  title: "SA2 - Medição com Micrômetro de Precisão",
                  weight: 30,
                  maxGrade: 30,
                  gradeReceived: 23,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-24",
                }
              ],
              hasRecovery: false,
              recoveryGrade: null,
            },
            {
              id: "uc-21-2",
              name: "Desenho Técnico Mecânico",
              code: "MUC-DTM",
              teacher: "Prof. Thiago Ferreira",
              workload: 80,
              absenceHours: 0,
              passingGrade: 60,
              maxGradeScale: 10,
              gradingMethod: GradingMethod.WEIGHTED,
              evaluations: [
                {
                  id: "e3-41",
                  title: "SA1 - Projeção Ortogonal de Sólidos",
                  weight: 50,
                  maxGrade: 10,
                  gradeReceived: 7.5,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-04-22",
                },
                {
                  id: "e3-42",
                  title: "SA2 - Cotagem e Cortes de Elementos",
                  weight: 50,
                  maxGrade: 10,
                  gradeReceived: 8.5,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-15",
                }
              ],
              hasRecovery: false,
              recoveryGrade: null,
            }
          ]
        },
        {
          id: "std-22",
          name: "Felipe Rodrigues",
          ra: "2026-USI-202",
          email: "felipe.rodrigues@aluno.senai.br",
          units: [
            {
              id: "uc-22-1",
              name: "Metrologia Dimensional",
              code: "MUC-MET",
              teacher: "Prof. André Valente",
              workload: 60,
              absenceHours: 8,
              passingGrade: 60,
              maxGradeScale: 100,
              gradingMethod: GradingMethod.POINTS,
              evaluations: [
                {
                  id: "e1-51",
                  title: "SA1 - Leitura com Paquímetro (0,02 e 0,05mm)",
                  weight: 40,
                  maxGrade: 40,
                  gradeReceived: 21,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-10",
                },
                {
                  id: "e1-52",
                  title: "SA2 - Medição com Micrômetro de Precisão",
                  weight: 30,
                  maxGrade: 30,
                  gradeReceived: 18,
                  status: EvaluationStatus.COMPLETED,
                  date: "2026-05-24",
                }
              ],
              hasRecovery: true,
              recoveryGrade: 65,
              notes: "Atingiu conceito de suficiência ao concluir a recuperação com bons resultados.",
            }
          ]
        }
      ]
    }
  ];
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
