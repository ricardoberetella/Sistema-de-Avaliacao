/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GradingMethod {
  POINTS = "POINTS", // Acúmulo de Pontos (ex: Avaliação 1 vale 30, Avaliação 2 vale 70 - total 100)
  WEIGHTED = "WEIGHTED", // Média Ponderada (ex: P1 peso 40%, P2 peso 60% - tudo de 0 a 10 ou 100)
}

export enum EvaluationStatus {
  COMPLETED = "COMPLETED", // Realizada
  PENDING = "PENDING", // Agendada / Pendente
}

export type PerformanceLevel = "NSA" | "APO" | "PAR" | "AUT";

export interface RubricSelection {
  interpretarDesenho?: PerformanceLevel;
  elaborarCroquis?: PerformanceLevel;
  interpretarTolerancia?: PerformanceLevel;
  atencaoDetalhes?: PerformanceLevel;
  sensoCritico?: PerformanceLevel;
}

export interface Evaluation {
  id: string;
  title: string;
  description?: string;
  weight: number; // Percentual de peso (0-100) se for WEIGHTED, ou Pontos Máximos se for POINTS
  maxGrade: number; // Nota máxima (Normalmente 10 ou 100 na média ponderada, ou igual ao peso nos pontos)
  gradeReceived: number | null; // Nota obtida (null se pendente)
  status: EvaluationStatus;
  date?: string; // Data da avaliação
  // Rubricas baseadas no SENAI
  useRubrics?: boolean;
  rubricsSelections?: RubricSelection;
}

export enum SubjectStatus {
  ONGOING = "ONGOING", // Em Andamento
  PASSED = "PASSED", // Aprovado
  RECOVERY = "RECOVERY", // Em Recuperação
  FAILED = "FAILED", // Reprovado por Nota
  FAILED_ATTENDANCE = "FAILED_ATTENDANCE", // Reprovado por Faltas (< 75% frequência)
}

export interface CurricularUnit {
  id: string;
  name: string;
  code?: string; // Código da UC (ex: UC01)
  teacher?: string; // Nome do docente
  workload: number; // Carga Horária Total (ex: 80h, 120h)
  absenceHours: number; // Horas de faltas registradas
  passingGrade: number; // Nota de corte (ex: 60 ou 70, ou 6 ou 7)
  maxGradeScale: number; // Escala máxima de notas (ex: 10 ou 100)
  gradingMethod: GradingMethod;
  evaluations: Evaluation[];
  hasRecovery: boolean; // Indica se usou o recurso de recuperação
  recoveryGrade: number | null; // Nota obtida na prova de recuperação
  notes?: string; // Notas de estudo ou anotações
}

export interface SubjectTemplate {
  id: string;
  name: string;
  code?: string;
  teacher?: string;
  workload: number;
  passingGrade: number;
  maxGradeScale: number;
  gradingMethod: GradingMethod;
}

export interface Student {
  id: string;
  name: string;
  ra: string; // Registro Acadêmico
  email?: string;
  units: CurricularUnit[];
}

export interface Turma {
  id: string;
  name: string;
  code: string;
  shift: string;
  students: Student[];
  subjects: SubjectTemplate[];
}

export interface GradeSummaryStats {
  totalUnits: number;
  ongoingCount: number;
  passedCount: number;
  recoveryCount: number;
  failedCount: number;
  overallAverage: number; // Média geral ponderada das UCs concluídas/ativas
  averageAttendance: number; // Frequência média ponderada
}
