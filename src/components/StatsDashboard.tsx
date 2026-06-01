/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  BookOpen,
  CheckCircle,
  Info
} from "lucide-react";
import { CurricularUnit, SubjectStatus } from "../types";
import { calculateUnitGrade, calculateAttendancePercentage, determineUnitStatus } from "../utils";

interface StatsDashboardProps {
  units: CurricularUnit[];
}

export default function StatsDashboard({ units }: StatsDashboardProps) {
  const totalUnits = units.length;
  
  const subjectsWithStatus = units.map(u => ({
    ...u,
    status: determineUnitStatus(u),
    grade: calculateUnitGrade(u),
    attendance: calculateAttendancePercentage(u)
  }));

  const passedCount = subjectsWithStatus.filter(s => s.status === SubjectStatus.PASSED).length;
  const ongoingCount = subjectsWithStatus.filter(s => s.status === SubjectStatus.ONGOING).length;
  const recoveryCount = subjectsWithStatus.filter(s => s.status === SubjectStatus.RECOVERY).length;
  const failedCount = subjectsWithStatus.filter(
    s => s.status === SubjectStatus.FAILED || s.status === SubjectStatus.FAILED_ATTENDANCE
  ).length;

  // Média acumulada (apenas das UCs concluídas ou que já possuem nota)
  const evaluatedSubjects = subjectsWithStatus.filter(s => s.grade > 0);
  const overallAverage = evaluatedSubjects.length > 0 
    ? evaluatedSubjects.reduce((sum, s) => sum + (s.grade / s.maxGradeScale) * 100, 0) / evaluatedSubjects.length
    : 0;

  // Presença ponderada
  const totalHours = units.reduce((sum, u) => sum + u.workload, 0);
  const totalAbsences = units.reduce((sum, u) => sum + u.absenceHours, 0);
  const averageAttendance = totalHours > 0 
    ? ((totalHours - totalAbsences) / totalHours) * 105 // Pequeno multiplicador visual ou mantendo 100 limitador
    : 100;
  const clampedAttendance = Math.min(100, averageAttendance);

  // Pendências de avaliações (não realizadas / notas pendentes nas UCs ativas)
  const pendenciesCount = units.reduce((sum, u) => {
    return sum + u.evaluations.filter(e => e.gradeReceived === null).length;
  }, 0);

  // Carga Horária Total Cadastrada
  const remainingHours = totalHours;

  return (
    <div id="stats-dashboard" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      
      {/* Card 1: Rendimento */}
      <div
        id="stat-card-average"
        className="bg-white p-5 border-l-4 border-[#005DA5] shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-sm"
      >
        <div>
          <p className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider mb-1">Média Geral</p>
          <p className="text-3xl font-bold text-[#1A1C1E] font-mono">
            {overallAverage > 0 ? `${overallAverage.toFixed(1)}%` : "N/A"}
          </p>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-[#6C757D] font-mono uppercase tracking-tight">
          <TrendingUp size={12} className="text-[#005DA5]" />
          <span>Aprovado: {passedCount} de {totalUnits}</span>
        </div>
      </div>

      {/* Card 2: Frequência */}
      <div
        id="stat-card-attendance"
        className="bg-white p-5 border-l-4 border-[#28A745] shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-sm"
      >
        <div>
          <p className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider mb-1">Frequência Geral</p>
          <p className="text-3xl font-bold text-[#1A1C1E] font-mono">
            {clampedAttendance.toFixed(1)}%
          </p>
        </div>
        <div className="mt-2.5">
          <div className="w-full bg-[#E9ECEF] h-1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#28A745] rounded-full transition-all duration-500"
              style={{ width: `${clampedAttendance}%` }}
            />
          </div>
          <p className="text-[9px] text-[#6C757D] mt-1 font-mono uppercase">Mínimo 75.0% Exigido</p>
        </div>
      </div>

      {/* Card 3: Pendências */}
      <div
        id="stat-card-pendencies"
        className="bg-white p-5 border-l-4 border-[#FFC107] shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-sm"
      >
        <div>
          <p className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider mb-1">Pendências</p>
          <p className="text-3xl font-bold text-[#1A1C1E] font-mono">
            {pendenciesCount < 10 ? `0${pendenciesCount}` : pendenciesCount}
          </p>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-[#6C757D] font-mono uppercase">
          <AlertTriangle size={12} className="text-[#FFC107]" />
          <span>{recoveryCount > 0 ? `${recoveryCount} em recuperação` : "Sob controle acadêmico"}</span>
        </div>
      </div>

      {/* Card 4: Carga Total Horária */}
      <div
        id="stat-card-hours"
        className="bg-white p-5 border-l-4 border-[#17A2B8] shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-sm"
      >
        <div>
          <p className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider mb-1">Aulas Totais</p>
          <p className="text-3xl font-bold text-[#1A1C1E] font-mono">
            {remainingHours}h
          </p>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-[#6C757D] font-mono uppercase">
          <BookOpen size={12} className="text-[#17A2B8]" />
          <span>{totalUnits} Unidades Curriculares</span>
        </div>
      </div>

    </div>
  );
}
