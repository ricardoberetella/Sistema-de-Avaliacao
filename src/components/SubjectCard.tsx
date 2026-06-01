/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Clock, 
  User, 
  MapPin, 
  AlertTriangle, 
  Activity, 
  UserCheck, 
  ArrowRight,
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  XOctagon
} from "lucide-react";
import { CurricularUnit, SubjectStatus } from "../types";
import { 
  calculateUnitGrade, 
  calculateAttendancePercentage, 
  determineUnitStatus,
  calculateMaxPossibleRemainingGrade,
  getStatusText
} from "../utils";

interface SubjectCardProps {
  key?: string;
  unit: CurricularUnit;
  onOpenDetail: () => void;
}

export default function SubjectCard({ unit, onOpenDetail }: SubjectCardProps) {
  const currentGrade = calculateUnitGrade(unit);
  const attendance = calculateAttendancePercentage(unit);
  const status = determineUnitStatus(unit);
  const maxPossibleGrade = calculateMaxPossibleRemainingGrade(unit);
  const statusDecor = getStatusText(status);

  // Calcula percentuais para renderizarmos barras de progresso robustas
  const gradePercent = (currentGrade / unit.maxGradeScale) * 100;
  const maxPossiblePercent = (maxPossibleGrade / unit.maxGradeScale) * 100;
  const passingPercent = (unit.passingGrade / unit.maxGradeScale) * 100;

  // Contadores de avaliações
  const totalEvaluations = unit.evaluations.length;
  const completedEvaluations = unit.evaluations.filter(e => e.gradeReceived !== null).length;

  return (
    <div
      id={`subject-card-${unit.id}`}
      className={`bg-white border transition-all duration-200 hover:shadow-sm flex flex-col justify-between rounded-none ${
        status === SubjectStatus.FAILED_ATTENDANCE 
          ? "border-red-300" 
          : status === SubjectStatus.PASSED
            ? "border-[#28A745]/30 hover:border-[#28A745]/60 bg-white"
            : status === SubjectStatus.RECOVERY
              ? "border-amber-300 bg-white"
              : "border-[#E1E4E8] bg-white"
      }`}
    >
      <div className="p-6">
        {/* Header da UC: Código, Status Badge, e Nome */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#F1F3F5] text-[#6C757D] font-bold border border-[#E1E4E8]">
            {unit.code || "Unidade"}
          </span>
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border ${
            status === SubjectStatus.PASSED ? "bg-emerald-50 text-[#28A745] border-[#28A745]/20" :
            status === SubjectStatus.RECOVERY ? "bg-amber-50 text-amber-700 border-amber-300" : "bg-rose-50 text-red-600 border-red-350"
          }`}>
            {statusDecor.text}
          </span>
        </div>

        <h3 className="text-base font-bold text-[#1A1C1E] tracking-tight font-sans">
          {unit.name}
        </h3>

        {/* Docente / Professor */}
        {unit.teacher && (
          <div className="flex items-center gap-1.5 text-xs text-[#6C757D] mt-1.5 font-mono">
            <User size={12} className="shrink-0 text-[#005DA5]" />
            <span className="truncate">{unit.teacher}</span>
          </div>
        )}

        {/* Barra de Progresso Tridimensional Própria (Exclusiva Boletim) */}
        <div className="mt-5 mb-4">
          <div className="flex justify-between items-baseline mb-1.5">
            <div className="flex items-center gap-1 text-xs">
              <span className="font-bold text-[#6C757D] uppercase text-[10px] tracking-wider font-mono">Status:</span>
              <span className="text-[#005DA5] font-mono font-bold">
                {currentGrade}
              </span>
              <span className="text-slate-400 text-[11px] font-mono">/ {unit.maxGradeScale}</span>
            </div>
            
            {/* Se houver exames pendentes, mostra o teto máximo potencial */}
            {completedEvaluations < totalEvaluations && (
              <span className="text-[10px] text-[#6C757D] font-mono">
                Teto Máx: {maxPossibleGrade}
              </span>
            )}
          </div>

          {/* Gráfico de Barras de Progresso Sobrepostas */}
          <div className="relative h-2 w-full bg-[#F1F3F5] rounded-none overflow-hidden" title="Nota atual vs Nota máxima restante">
            {/* 1. Barra Fundo do Potencial Máximo Disponível se tirar nota total */}
            <div 
              className="absolute left-0 top-0 h-full bg-[#E1E4E8]"
              style={{ width: `${Math.min(100, maxPossiblePercent)}%` }}
            />
            
            {/* 2. Barra de Progresso Real da Nota Acumulada */}
            <div 
              className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                status === SubjectStatus.PASSED 
                  ? "bg-[#28A745]" 
                  : status === SubjectStatus.FAILED || status === SubjectStatus.FAILED_ATTENDANCE
                    ? "bg-rose-500"
                    : status === SubjectStatus.RECOVERY
                      ? "bg-[#FFC107]"
                      : "bg-[#005DA5]"
              }`}
              style={{ width: `${Math.min(100, gradePercent)}%` }}
            />

            {/* 3. Indicador Flutuante Ponto de Média de Corte */}
            <div 
              className="absolute h-full w-0.5 bg-red-400 z-10"
              style={{ left: `${passingPercent}%` }}
              title={`Média para passar: ${unit.passingGrade}`}
            />
          </div>

          <div className="flex justify-between text-[9px] text-[#6C757D] mt-1 font-mono">
            <span>0</span>
            <span style={{ marginLeft: `${passingPercent - 15}%` }} className="text-red-500 font-semibold font-mono">
              Nota Corte ({unit.passingGrade})
            </span>
            <span>{unit.maxGradeScale}</span>
          </div>
        </div>

        {/* Sessão de Presença e Carga Horária */}
        <div className="grid grid-cols-2 gap-3 pt-3.5 border-t border-[#F1F3F5]">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-wider text-[#6C757D] uppercase font-bold">Frequência</span>
            <div className="flex items-center gap-1 mt-1 font-mono">
              <span className={`text-xs font-bold ${
                attendance < 75 
                  ? "text-rose-600 font-black animate-pulse" 
                  : "text-[#1A1C1E]"
              }`}>
                {attendance}%
              </span>
              {attendance < 75 && (
                <AlertTriangle size={12} className="text-rose-500 shrink-0" />
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-wider text-[#6C757D] uppercase font-bold">Faltas Reais</span>
            <span className={`text-xs font-mono font-bold mt-1 ${unit.absenceHours > (unit.workload * 0.25) ? "text-rose-600 font-black animate-pulse" : "text-[#1A1C1E]"}`}>
              {unit.absenceHours}h <span className="text-[10px] font-normal text-slate-400">/ {unit.workload * 0.25}h limite</span>
            </span>
          </div>
        </div>

        {/* Recuperação Extra Indicator se ativo */}
        {unit.hasRecovery && (
          <div className="mt-3.5 px-3 py-2 bg-amber-50/60 border border-amber-200/50 text-[11px] text-amber-800 flex justify-between items-center rounded-none font-mono">
            <span className="font-bold uppercase text-[9px]">Aulas de Recuperação</span>
            <span className="font-bold">NF: {unit.recoveryGrade ?? "Pendente"}</span>
          </div>
        )}
      </div>

      {/* Button footer do Card */}
      <div className="px-6 pb-6 pt-0">
        <button 
          onClick={onOpenDetail}
          type="button" 
          id={`btn-open-detail-${unit.id}`}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-[#E1E4E8] bg-[#F8F9FA] hover:bg-[#F1F3F5] text-xs text-[#005DA5] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
        >
          <span>Visualizar Avaliações</span>
          <ArrowRight size={12} className="text-[#005DA5]" />
        </button>
      </div>
    </div>
  );
}
