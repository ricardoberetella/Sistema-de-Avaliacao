/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  HelpCircle, 
  SlidersHorizontal, 
  Filter, 
  CloudLightning,
  UserCheck,
  AlertCircle,
  Printer,
  List,
  LayoutGrid,
  FileSpreadsheet,
  Users,
  Trash2,
  Settings,
  ArrowLeft,
  Clock,
  LogOut
} from "lucide-react";
import { CurricularUnit, SubjectStatus, GradingMethod, Student, SubjectTemplate, Turma, PerformanceLevel } from "./types";
import { getInitialSENAIData, getInitialSENAITurmas, determineUnitStatus, calculateAttendancePercentage, calculateUnitGrade, getStatusText, getDefaultCapacitiesForUC } from "./utils";
import StatsDashboard from "./components/StatsDashboard";
import SubjectCard from "./components/SubjectCard";
import SubjectDetailModal from "./components/SubjectDetailModal";

const LOCAL_STORAGE_KEY = "boletim_senai_data_v2";

export default function App() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [isManagingRegistry, setIsManagingRegistry] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<"boletim" | "demonstracoes">("boletim");

  // Estados para modal de cadastro de aluno com nome e menu de escolha da turma
  const [showQuickAddStudentModal, setShowQuickAddStudentModal] = useState<boolean>(false);
  const [quickStudentName, setQuickStudentName] = useState<string>("");
  const [quickStudentTurmaId, setQuickStudentTurmaId] = useState<string>("");

  const [selectedUnit, setSelectedUnit] = useState<CurricularUnit | null>(null);
  
  // Estados para Busca e Filtro de Status
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Estado para formulário simplificado de Nova Unidade Curricular (UC)
  const [showAddUnitForm, setShowAddUnitForm] = useState(false);
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitCode, setNewUnitCode] = useState("");
  const [newUnitTeacher, setNewUnitTeacher] = useState("");
  const [newUnitWorkload, setNewUnitWorkload] = useState(80);
  const [newUnitPassingGrade, setNewUnitPassingGrade] = useState(60);
  const [newUnitMaxScale, setNewUnitMaxScale] = useState(100);
  const [newUnitMethod, setNewUnitMethod] = useState<GradingMethod>(GradingMethod.POINTS);

  // Formulário de Nova Turma
  const [newTurmaName, setNewTurmaName] = useState("");
  const [newTurmaCode, setNewTurmaCode] = useState("");
  const [newTurmaShift, setNewTurmaShift] = useState("Tarde");

  // Formulário de Novo Aluno/Estudante
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentRA, setNewStudentRA] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");

  // Estado para adicionar aluno rapidamente a partir do cabeçalho
  const [newStudentNameForQuickAdd, setNewStudentNameForQuickAdd] = useState("");

  const handleQuickAddStudentAtTop = () => {
    if (!newStudentNameForQuickAdd.trim()) return;
    if (!selectedTurmaId) return;

    const targetTurma = turmas.find(t => t.id === selectedTurmaId);
    if (!targetTurma) return;

    const nextIndex = (targetTurma.students?.length || 0) + 1;
    const paddedIndex = nextIndex < 10 ? `0${nextIndex}` : `${nextIndex}`;
    const generatedRA = `2026-USI-${paddedIndex}`;

    handleQuickAddStudentToTurma(selectedTurmaId, newStudentNameForQuickAdd.trim(), generatedRA);
    setNewStudentNameForQuickAdd("");

    // Automatically set the newly created student as the active student
    // Let's deduce is student active
    setTimeout(() => {
      const updatedTurmasSaved = localStorage.getItem("boletim_senai_turmas_v3");
      if (updatedTurmasSaved) {
        try {
          const parsed = JSON.parse(updatedTurmasSaved);
          const tMatch = parsed.find((x: any) => x.id === selectedTurmaId);
          if (tMatch && tMatch.students && tMatch.students.length > 0) {
            // Find the student with matching RA or matching name recently added
            const addedStudent = tMatch.students.find((s: any) => s.name === newStudentNameForQuickAdd.trim() || s.ra === generatedRA);
            if (addedStudent) {
              setSelectedStudentId(addedStudent.id);
            } else {
              setSelectedStudentId(tMatch.students[tMatch.students.length - 1].id);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }, 50);
  };

  // Formulário de Nova Matéria (SubjectTemplate) na Turma
  const [newSubName, setNewSubName] = useState("");
  const [newSubCode, setNewSubCode] = useState("");
  const [newSubTeacher, setNewSubTeacher] = useState("");
  const [newSubWorkload, setNewSubWorkload] = useState(80);
  const [newSubPassingGrade, setNewSubPassingGrade] = useState(60);
  const [newSubMaxScale, setNewSubMaxScale] = useState(100);
  const [newSubMethod, setNewSubMethod] = useState<GradingMethod>(GradingMethod.POINTS);

  const LOCAL_STORAGE_TURMAS_KEY = "boletim_senai_turmas_v3";

  // Carregar turmas e fazer migração se houver dados v2
  useEffect(() => {
    const savedTurmas = localStorage.getItem(LOCAL_STORAGE_TURMAS_KEY);
    if (savedTurmas) {
      try {
        const parsed = JSON.parse(savedTurmas);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTurmas(parsed);
          setSelectedTurmaId(parsed[0].id);
          if (parsed[0].students && parsed[0].students.length > 0) {
            setSelectedStudentId(parsed[0].students[0].id);
          }
          return;
        }
      } catch (e) {
        console.error("Falha ao parsear turmas do localStorage", e);
      }
    }

    // Tentar migrar do v2 se existir dados
    const savedOldData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedOldData) {
      try {
        const parsedOld = JSON.parse(savedOldData);
        if (Array.isArray(parsedOld) && parsedOld.length > 0) {
          const migratedTurma: Turma = {
            id: "turma-migrada-" + Date.now(),
            name: "Mecânico de Usinagem (Antigo)",
            code: "MUC-MIG-01",
            shift: "Tarde",
            subjects: [
              {
                id: "temp-met-3",
                name: "Metrologia Dimensional",
                code: "MUC-MET",
                teacher: "Prof. André Valente",
                workload: 60,
                passingGrade: 60,
                maxGradeScale: 100,
                gradingMethod: GradingMethod.POINTS,
              }
            ],
            students: [
              {
                id: "std-migrado",
                name: "João Silva (Migrado)",
                ra: "2026-0041",
                email: "joao.silva@aluno.senai.br",
                units: parsedOld
              }
            ]
          };
          const list = [migratedTurma, ...getInitialSENAITurmas().filter(t => t.id !== "turma-1")];
          setTurmas(list);
          setSelectedTurmaId(migratedTurma.id);
          setSelectedStudentId("std-migrado");
          localStorage.setItem(LOCAL_STORAGE_TURMAS_KEY, JSON.stringify(list));
          return;
        }
      } catch (err) {
        console.error("Falha ao migrar dados v2", err);
      }
    }

    // Caso contrário seeder original
    const defaults = getInitialSENAITurmas();
    setTurmas(defaults);
    if (defaults.length > 0) {
      setSelectedTurmaId(defaults[0].id);
      if (defaults[0].students && defaults[0].students.length > 0) {
        setSelectedStudentId(defaults[0].students[0].id);
      }
    }
    localStorage.setItem(LOCAL_STORAGE_TURMAS_KEY, JSON.stringify(defaults));
  }, []);

  const saveAllTurmas = (updatedTurmas: Turma[]) => {
    setTurmas(updatedTurmas);
    localStorage.setItem(LOCAL_STORAGE_TURMAS_KEY, JSON.stringify(updatedTurmas));
  };

  const saveAllUnits = (updatedUnits: CurricularUnit[]) => {
    if (!selectedTurmaId || !selectedStudentId) return;
    const nextTurmas = turmas.map(t => {
      if (t.id === selectedTurmaId) {
        return {
          ...t,
          students: t.students.map(s => {
            if (s.id === selectedStudentId) {
              return {
                ...s,
                units: updatedUnits
              };
            }
            return s;
          })
        };
      }
      return t;
    });
    saveAllTurmas(nextTurmas);
  };

  const handleSaveStudentCapacity = (
    turmaId: string,
    studentId: string,
    ucCode: string,
    capacityCode: string,
    rubric: PerformanceLevel | null,
    grade: number | null,
    notes: string
  ) => {
    const nextTurmas = turmas.map(t => {
      if (t.id === turmaId) {
        return {
          ...t,
          students: t.students.map(s => {
            if (s.id === studentId) {
              return {
                ...s,
                units: s.units.map(u => {
                  if (u.code === ucCode) {
                    const caps = u.capacidadesTecnicas || [];
                    const capExists = caps.some(c => c.code === capacityCode);
                    
                    const updatedCaps = capExists
                      ? caps.map(c => c.code === capacityCode ? { ...c, rubric, grade, notes } : c)
                      : [
                          ...caps,
                          {
                            capacityId: `${ucCode.toLowerCase()}-${capacityCode.toLowerCase().replace(/\s+/g, '')}`,
                            code: capacityCode,
                            title: capacityCode,
                            rubric,
                            grade,
                            notes
                          }
                        ];

                    return {
                      ...u,
                      capacidadesTecnicas: updatedCaps
                    };
                  }
                  return u;
                })
              };
            }
            return s;
          })
        };
      }
      return t;
    });

    saveAllTurmas(nextTurmas);
  };

  const handleQuickAddStudentToTurma = (turmaId: string, studentName: string, studentRA: string) => {
    const targetTurma = turmas.find(t => t.id === turmaId);
    if (!targetTurma) return;

    const instantiatedUnits = targetTurma.subjects.map(sub => {
      const code = sub.code || "";
      const caps = getDefaultCapacitiesForUC(code).map(c => ({
        capacityId: `${code.toLowerCase()}-${c.code.toLowerCase().replace(/\s+/g, '')}`,
        code: c.code,
        title: c.title,
        rubric: null,
        grade: null,
        notes: ""
      }));

      return {
        id: "uc-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
        name: sub.name,
        code: sub.code,
        teacher: sub.teacher,
        workload: sub.workload,
        absenceHours: 0,
        passingGrade: sub.passingGrade,
        maxGradeScale: sub.maxGradeScale,
        gradingMethod: sub.gradingMethod,
        evaluations: [
          {
            id: "eval-" + Date.now(),
            title: "SA1 - Atividade Diagnóstica",
            weight: sub.gradingMethod === GradingMethod.POINTS ? sub.maxGradeScale : 100,
            maxGrade: sub.maxGradeScale,
            gradeReceived: null,
            status: "PENDING" as any
          }
        ],
        hasRecovery: false,
        recoveryGrade: null,
        notes: "Estudante inserido.",
        capacidadesTecnicas: caps
      };
    });

    const newStd: Student = {
      id: "std-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      name: studentName,
      ra: studentRA,
      email: `${studentName.toLowerCase().replace(/\s+/g, ".")}@aluno.senai.br`,
      units: instantiatedUnits
    };

    const nextTurmas = turmas.map(t => {
      if (t.id === turmaId) {
        return {
          ...t,
          students: [...t.students, newStd]
        };
      }
      return t;
    });

    saveAllTurmas(nextTurmas);
    if (selectedTurmaId === turmaId) {
      setSelectedStudentId(newStd.id);
    }
  };

  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickStudentName.trim() || !quickStudentTurmaId) return;

    const targetTurma = turmas.find(t => t.id === quickStudentTurmaId);
    if (!targetTurma) return;

    // RA format standard: USI-XX sequencial count
    const nextIndex = (targetTurma.students?.length || 0) + 1;
    const paddedIndex = nextIndex < 10 ? `0${nextIndex}` : `${nextIndex}`;
    const generatedRA = `2026-USI-${paddedIndex}`;

    // Add student with automatically instantiated classes
    handleQuickAddStudentToTurma(quickStudentTurmaId, quickStudentName.trim(), generatedRA);

    // Reset fields and focus
    setQuickStudentName("");
    setShowQuickAddStudentModal(false);
    setIsManagingRegistry(false); // return to bulletin card view
    setSelectedTurmaId(quickStudentTurmaId);
  };

  const handleQuickRemoveStudentFromTurma = (turmaId: string, studentId: string) => {
    const nextTurmas = turmas.map(t => {
      if (t.id === turmaId) {
        return {
          ...t,
          students: t.students.filter(s => s.id !== studentId)
        };
      }
      return t;
    });

    saveAllTurmas(nextTurmas);

    if (selectedStudentId === studentId) {
      const targetT = nextTurmas.find(t => t.id === selectedTurmaId);
      if (targetT && targetT.students && targetT.students.length > 0) {
        setSelectedStudentId(targetT.students[0].id);
      } else {
        setSelectedStudentId("");
      }
    }
  };

  const activeTurma = turmas.find(t => t.id === selectedTurmaId) || turmas[0];
  const activeStudent = activeTurma?.students?.find(s => s.id === selectedStudentId) || activeTurma?.students?.[0];
  const units = activeStudent?.units || [];

  const handleSelectTurma = (turmaId: string) => {
    setSelectedTurmaId(turmaId);
    const targetTurma = turmas.find(t => t.id === turmaId);
    if (targetTurma && targetTurma.students && targetTurma.students.length > 0) {
      setSelectedStudentId(targetTurma.students[0].id);
    } else {
      setSelectedStudentId("");
    }
  };

  // Cadastra nova unidade curricular (UC) diretamente para o estudante ativo
  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;

    const newUC: CurricularUnit = {
      id: "uc-" + Date.now(),
      name: newUnitName.trim(),
      code: newUnitCode.trim().toUpperCase() || undefined,
      teacher: newUnitTeacher.trim() || undefined,
      workload: Number(newUnitWorkload) || 80,
      absenceHours: 0,
      passingGrade: Number(newUnitPassingGrade) || 60,
      maxGradeScale: Number(newUnitMaxScale) || 100,
      gradingMethod: newUnitMethod,
      evaluations: [
        {
          id: "eval-default-" + Date.now(),
          title: "SA1 - Atividade Prática de Encerramento",
          weight: newUnitMethod === GradingMethod.POINTS ? Number(newUnitMaxScale) : 100,
          maxGrade: Number(newUnitMaxScale),
          gradeReceived: null,
          status: "PENDING" as any
        }
      ],
      hasRecovery: false,
      recoveryGrade: null,
      notes: "Inicie cadastrando práticas ou aplicando rubricas do SENAI."
    };

    const nextList = [...units, newUC];
    saveAllUnits(nextList);

    // Limpar campos
    setNewUnitName("");
    setNewUnitCode("");
    setNewUnitTeacher("");
    setNewUnitWorkload(80);
    setNewUnitPassingGrade(60);
    setNewUnitMaxScale(100);
    setNewUnitMethod(GradingMethod.POINTS);
    setShowAddUnitForm(false);
  };

  // Salvar alterações de uma UC em modal de detalhe
  const handleUpdateUnit = (updatedUnit: CurricularUnit) => {
    const nextList = units.map(u => u.id === updatedUnit.id ? updatedUnit : u);
    saveAllUnits(nextList);
    setSelectedUnit(null);
  };

  // Remover uma UC
  const handleDeleteUnit = (id: string) => {
    if (confirm("Deseja realmente remover esta Unidade Curricular? Todos os dados de notas e faltas serão excluídos.")) {
      const nextList = units.filter(u => u.id !== id);
      saveAllUnits(nextList);
      setSelectedUnit(null);
    }
  };

  // FILTRO
  const filteredUnits = units.filter(u => {
    const normalSearch = searchTerm.toLowerCase();
    const nameMatch = u.name.toLowerCase().includes(normalSearch) || 
                      (u.code && u.code.toLowerCase().includes(normalSearch)) ||
                      (u.teacher && u.teacher.toLowerCase().includes(normalSearch));

    if (!nameMatch) return false;

    if (statusFilter === "ALL") return true;
    
    const computedStatus = determineUnitStatus(u);
    if (statusFilter === "PASSED" && computedStatus === SubjectStatus.PASSED) return true;
    if (statusFilter === "ONGOING" && computedStatus === SubjectStatus.ONGOING) return true;
    if (statusFilter === "RECOVERY" && computedStatus === SubjectStatus.RECOVERY) return true;
    if (statusFilter === "FAILED" && (computedStatus === SubjectStatus.FAILED || computedStatus === SubjectStatus.FAILED_ATTENDANCE)) return true;

    return false;
  });

  // Restaurar dados padrão de demonstração para o usuário testar (tudo de novo)
  const handleResetDefaults = () => {
    if (confirm("Aviso: Isso irá redefinir todas as turmas, alunos e notas para os dados de exemplo institucional do SENAI. Continuar?")) {
      const defaults = getInitialSENAITurmas();
      saveAllTurmas(defaults);
      if (defaults.length > 0) {
        setSelectedTurmaId(defaults[0].id);
        if (defaults[0].students && defaults[0].students.length > 0) {
          setSelectedStudentId(defaults[0].students[0].id);
        }
      }
    }
  };

  // Turmas/Alunos handlers adicionais
  const handleCreateTurma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTurmaName.trim() || !newTurmaCode.trim()) return;

    const newT: Turma = {
      id: "turma-" + Date.now(),
      name: newTurmaName.trim(),
      code: newTurmaCode.trim().toUpperCase(),
      shift: newTurmaShift,
      students: [],
      subjects: []
    };

    const nextList = [...turmas, newT];
    saveAllTurmas(nextList);
    setSelectedTurmaId(newT.id);
    setSelectedStudentId(""); // sem alunos inicialmente

    setNewTurmaName("");
    setNewTurmaCode("");
  };

  const handleDeleteTurma = (id: string) => {
    if (turmas.length <= 1) {
      alert("É necessário manter pelo menos uma turma cadastrada no portal.");
      return;
    }
    if (confirm("Gostaria de excluir esta turma? Todos os estudantes e boletins serão apagados permanentemente.")) {
      const nextList = turmas.filter(t => t.id !== id);
      saveAllTurmas(nextList);
      
      const first = nextList[0];
      setSelectedTurmaId(first.id);
      if (first.students && first.students.length > 0) {
        setSelectedStudentId(first.students[0].id);
      } else {
        setSelectedStudentId("");
      }
    }
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentRA.trim() || !selectedTurmaId) return;

    if (activeTurma.students.some(s => s.ra === newStudentRA.trim())) {
      alert("Este Registro Acadêmico (RA) já está cadastrado nesta turma.");
      return;
    }

    // Instanciar aluno com as disciplinas padrão da turma
    const instantiatedUnits: CurricularUnit[] = activeTurma.subjects.map(sub => ({
      id: "uc-" + Date.now() + "-" + Math.random().toString(36).substr(2, 3),
      name: sub.name,
      code: sub.code,
      teacher: sub.teacher,
      workload: sub.workload,
      absenceHours: 0,
      passingGrade: sub.passingGrade,
      maxGradeScale: sub.maxGradeScale,
      gradingMethod: sub.gradingMethod,
      evaluations: [
        {
          id: "eval-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
          title: "SA1 - Atividade Diagnóstica",
          weight: sub.gradingMethod === GradingMethod.POINTS ? sub.maxGradeScale : 100,
          maxGrade: sub.maxGradeScale,
          gradeReceived: null,
          status: "PENDING" as any
        }
      ],
      hasRecovery: false,
      recoveryGrade: null,
      notes: "Inicie lançando avaliações ou atividades."
    }));

    const newStd: Student = {
      id: "std-" + Date.now(),
      name: newStudentName.trim(),
      ra: newStudentRA.trim(),
      email: newStudentEmail.trim() || `${newStudentName.trim().toLowerCase().replace(/\s+/g, ".")}@aluno.senai.br`,
      units: instantiatedUnits
    };

    const nextTurmas = turmas.map(t => {
      if (t.id === selectedTurmaId) {
        return {
          ...t,
          students: [...t.students, newStd]
        };
      }
      return t;
    });

    saveAllTurmas(nextTurmas);
    setSelectedStudentId(newStd.id);

    setNewStudentName("");
    setNewStudentRA("");
    setNewStudentEmail("");
  };

  const handleDeleteStudent = (stdId: string) => {
    if (confirm("Confirmar remoção de aluno e todo o boletim dele?")) {
      const nextTurmas = turmas.map(t => {
        if (t.id === selectedTurmaId) {
          return {
            ...t,
            students: t.students.filter(s => s.id !== stdId)
          };
        }
        return t;
      });
      saveAllTurmas(nextTurmas);

      const targetT = nextTurmas.find(t => t.id === selectedTurmaId);
      if (targetT && targetT.students && targetT.students.length > 0) {
        setSelectedStudentId(targetT.students[0].id);
      } else {
        setSelectedStudentId("");
      }
    }
  };

  const handleCreateSubjectTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !selectedTurmaId) return;

    const newTemp: SubjectTemplate = {
      id: "temp-" + Date.now(),
      name: newSubName.trim(),
      code: newSubCode.trim().toUpperCase() || undefined,
      teacher: newSubTeacher.trim() || undefined,
      workload: Number(newSubWorkload) || 80,
      passingGrade: Number(newSubPassingGrade) || 60,
      maxGradeScale: Number(newSubMaxScale) || 100,
      gradingMethod: newSubMethod
    };

    // Atualiza turma com nova matéria curricular E atualiza todos os alunos existentes nela!
    const updatedTurmas = turmas.map(t => {
      if (t.id === selectedTurmaId) {
        const instantiateForStudent = (studentId: string): CurricularUnit => ({
          id: "uc-" + Date.now() + "-" + studentId.substr(-3) + "-" + Math.random().toString(36).substr(2, 3),
          name: newTemp.name,
          code: newTemp.code,
          teacher: newTemp.teacher,
          workload: newTemp.workload,
          absenceHours: 0,
          passingGrade: newTemp.passingGrade,
          maxGradeScale: newTemp.maxGradeScale,
          gradingMethod: newTemp.gradingMethod,
          evaluations: [
            {
              id: "eval-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
              title: "SA1 - Atividade Diagnóstica",
              weight: newTemp.gradingMethod === GradingMethod.POINTS ? newTemp.maxGradeScale : 100,
              maxGrade: newTemp.maxGradeScale,
              gradeReceived: null,
              status: "PENDING" as any
            }
          ],
          hasRecovery: false,
          recoveryGrade: null,
          notes: "Criada via matriz curricular da turma."
        });

        return {
          ...t,
          subjects: [...t.subjects, newTemp],
          students: t.students.map(s => ({
            ...s,
            units: [...s.units, instantiateForStudent(s.id)]
          }))
        };
      }
      return t;
    });

    saveAllTurmas(updatedTurmas);

    setNewSubName("");
    setNewSubCode("");
    setNewSubTeacher("");
    setNewSubWorkload(80);
    setNewSubPassingGrade(60);
    setNewSubMaxScale(100);
    setNewSubMethod(GradingMethod.POINTS);
  };

  const handleDeleteSubjectTemplate = (tempId: string) => {
    if (confirm("Confirmar exclusão desta matéria da grade da turma e dos boletins de todos os estudantes?")) {
      const targetTemp = activeTurma.subjects.find(s => s.id === tempId);
      if (!targetTemp) return;

      const updatedTurmas = turmas.map(t => {
        if (t.id === selectedTurmaId) {
          return {
            ...t,
            subjects: t.subjects.filter(s => s.id !== tempId),
            students: t.students.map(s => ({
              ...s,
              units: s.units.filter(u => u.name !== targetTemp.name && u.code !== targetTemp.code)
            }))
          };
        }
        return t;
      });

      saveAllTurmas(updatedTurmas);
    }
  };

  // Média Geral baseada nas avaliações finalizadas
  const evaluatedSubjectsForHeader = units.map(u => ({
    grade: calculateUnitGrade(u),
    maxScale: u.maxGradeScale
  })).filter(s => s.grade > 0);
  
  const overallAveragePercent = evaluatedSubjectsForHeader.length > 0
    ? (evaluatedSubjectsForHeader.reduce((sum, s) => sum + (s.grade / s.maxScale) * 100, 0) / evaluatedSubjectsForHeader.length)
    : 0;

  return (
    <div id="boletim-app-wrapper" className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans text-[#1A1C1E] antialiased">
      
      {/* 1. TOP HEADER BRANDEADO SENAI - COMPATÍVEL COM A IMAGEM FORNECIDA */}
      <header className="w-full bg-[#005DA5] text-white flex flex-col md:flex-row items-center justify-between px-6 py-4 md:py-3 shadow-md gap-4 shrink-0 border-b-4 border-[#004A85] select-none">
        
        {/* Left red slanted parallelogram container with SENAI */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-between md:justify-start">
          <div 
            onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); setIsManagingRegistry(false); }}
            className="bg-[#E52E2E] px-8 py-3.5 transform -skew-x-12 select-none font-black text-3xl tracking-tighter italic text-white flex items-center justify-center cursor-pointer hover:bg-[#c22020] transition-colors shadow-lg"
            style={{ minWidth: "140px" }}
          >
            SENAI
          </div>
        </div>

        {/* Center Text displaying course name and rubrics system */}
        <div className="text-center flex flex-col flex-1">
          <h1 className="text-xl md:text-2xl font-black tracking-wider text-white uppercase font-sans drop-shadow-xs">
            MECÂNICO DE USINAGEM CONVENCIONAL
          </h1>
          <span className="text-xs md:text-sm text-[#A2C7E5] font-bold uppercase tracking-[0.2em] font-mono mt-0.5">
            SISTEMA DE AVALIAÇÃO - RUBRICAS
          </span>
        </div>

        {/* Right selectable Turma pills capsule and logout button */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end shrink-0">
          <div className="bg-[#003B6B] p-1.5 rounded-2xl flex items-center gap-2.5 shadow-inner border border-[#002f56]">
            {turmas.map(t => {
              const isSelected = selectedTurmaId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTurma(t.id)}
                  type="button"
                  className={`px-5 py-2.5 text-xs font-black uppercase transition-all duration-150 cursor-pointer ${
                    isSelected 
                      ? "bg-white text-[#005DA5] shadow-md font-black rounded-xl" 
                      : "text-[#589BD1] hover:text-white font-black"
                  }`}
                >
                  {t.code}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleResetDefaults}
            title="Redefinir Dados para o Padrão do Curso"
            className="bg-[#E52E2E] text-white p-2.5 hover:bg-[#c22020] transition-all rounded-lg flex items-center justify-center cursor-pointer shadow-md shrink-0"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* 2. SUB-HEADER BAR WITH ACTIVE CLASS LABEL & QUICK STUDENT ADD (EXACT REPLICA OF THE DRAWING IN IMAGE) */}
      <div className="bg-[#F1F3F5] border-b border-[#E1E4E8] px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-[#005DA5] uppercase tracking-wide flex items-center gap-2 italic">
            TURMA {activeTurma ? activeTurma.code : "MA"}
          </h2>
          <button 
            type="button"
            onClick={() => setIsManagingRegistry(!isManagingRegistry)}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded shadow-2xs border border-slate-300 transition-all cursor-pointer"
          >
            {isManagingRegistry ? "📋 Boletim" : "⚙️ Painel"}
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input 
            type="text"
            placeholder="NOME DO ALUNO..."
            value={newStudentNameForQuickAdd}
            onChange={(e) => setNewStudentNameForQuickAdd(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleQuickAddStudentAtTop();
              }
            }}
            className="bg-white border border-[#DDE1E5] px-4 py-2 text-xs text-slate-800 rounded shadow-inner w-full sm:w-72 focus:outline-none focus:ring-1 focus:ring-[#005DA5] font-mono tracking-wide"
          />
          <button 
            type="button"
            onClick={handleQuickAddStudentAtTop}
            className="bg-[#E52E2E] hover:bg-[#c22020] text-white text-xs font-black uppercase tracking-wider px-6 py-2.5 rounded transition-all shadow-md cursor-pointer shrink-0"
          >
            ADD
          </button>
        </div>
      </div>

      {/* Inner body wrapper to keep side-by-side design */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">

        {/* Sidebar Corporativo - Sleek Theme */}
        <aside className="w-full md:w-64 bg-[#005DA5] flex flex-col text-white shrink-0 shadow-md">
        <div className="p-6 md:p-8 flex items-center justify-between md:block shrink-0">
          <div 
            onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); setIsManagingRegistry(false); }}
            className="text-2xl font-bold tracking-tighter flex items-center gap-2 italic underline decoration-4 underline-offset-4 cursor-pointer select-none animate-pulse"
          >
            SENAI
            <span className="text-xs font-normal bg-white/20 px-2 py-0.5 rounded italic">Portal</span>
          </div>
          <button
            onClick={() => { setIsManagingRegistry(false); setShowAddUnitForm(true); }}
            type="button"
            className="md:hidden flex items-center gap-1.5 bg-white/25 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded cursor-pointer"
          >
            <Plus size={14} />
            <span>Adicionar UC</span>
          </button>
        </div>

        {/* CONFIGURAÇÃO E CADASTROS */}
        <div className="px-6 pb-6 pt-4 border-b border-white/10 space-y-3 shrink-0 bg-black/10">
          <button
            onClick={() => {
              if (turmas.length > 0) {
                setQuickStudentTurmaId(selectedTurmaId || turmas[0].id);
              }
              setShowQuickAddStudentModal(true);
            }}
            type="button"
            className="w-full bg-[#E57A00] hover:bg-[#c26700] text-white text-[10px] font-bold uppercase tracking-widest font-mono py-2.5 rounded-none transition-colors duration-200 select-none cursor-pointer text-center block shadow-sm"
          >
            👤 Cadastro de Aluno
          </button>

          <button
            onClick={() => setIsManagingRegistry(true)}
            type="button"
            className="w-full bg-white/15 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest font-mono py-2.5 rounded-none transition-colors duration-200 select-none cursor-pointer text-center block"
          >
            ✏️ Gerenciar Cadastro
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold px-4 pb-2 font-mono">Filtros do Boletim</p>
          <button
            onClick={() => { setStatusFilter("ALL"); setIsManagingRegistry(false); }}
            type="button"
            className={`w-full text-left p-3.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
              !isManagingRegistry && statusFilter === "ALL" ? "bg-white/10 text-white font-semibold" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${!isManagingRegistry && statusFilter === "ALL" ? "bg-white" : "bg-white/40"}`}></div>
              <span>Todas as Notas</span>
            </div>
            <span className="text-xs bg-white/15 px-2 py-0.5 rounded font-mono text-white/90">{units.length}</span>
          </button>

          <button
            onClick={() => { setStatusFilter("ONGOING"); setIsManagingRegistry(false); }}
            type="button"
            className={`w-full text-left p-3.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
              !isManagingRegistry && statusFilter === "ONGOING" ? "bg-white/10 text-white font-semibold" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${!isManagingRegistry && statusFilter === "ONGOING" ? "bg-sky-400" : "bg-white/40"}`}></div>
              <span>Cursando</span>
            </div>
          </button>

          <button
            onClick={() => { setStatusFilter("PASSED"); setIsManagingRegistry(false); }}
            type="button"
            className={`w-full text-left p-3.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
              !isManagingRegistry && statusFilter === "PASSED" ? "bg-white/10 text-white font-semibold" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${!isManagingRegistry && statusFilter === "PASSED" ? "bg-emerald-400" : "bg-white/40"}`}></div>
              <span>Aprovados</span>
            </div>
          </button>

          <button
            onClick={() => { setStatusFilter("RECOVERY"); setIsManagingRegistry(false); }}
            type="button"
            className={`w-full text-left p-3.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
              !isManagingRegistry && statusFilter === "RECOVERY" ? "bg-white/10 text-white font-semibold" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${!isManagingRegistry && statusFilter === "RECOVERY" ? "bg-amber-400" : "bg-white/40"}`}></div>
              <span>Em Recuperação</span>
            </div>
          </button>

          <button
            onClick={() => { setStatusFilter("FAILED"); setIsManagingRegistry(false); }}
            type="button"
            className={`w-full text-left p-3.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
              !isManagingRegistry && statusFilter === "FAILED" ? "bg-white/10 text-white font-semibold" : "hover:bg-white/5 text-white/80"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${!isManagingRegistry && statusFilter === "FAILED" ? "bg-red-400" : "bg-white/40"}`}></div>
              <span>Retidos</span>
            </div>
          </button>
        </nav>

        <div className="p-6 bg-black/15 text-xs text-white/50 text-center uppercase tracking-widest font-mono shrink-0">
          v.3.0.0 Institutional Portal
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {isManagingRegistry ? (
          
          /* =========================================================================
             A. PAINEL INSTITUCIONAL DE CADASTRO (TURMAS, ALUNOS & MATRIZ CURRICULAR)
             ========================================================================= */
          <>
            <header className="h-auto md:h-20 bg-white border-b border-[#E1E4E8] px-6 py-4 md:py-0 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="text-center sm:text-left">
                <h1 className="text-xl font-bold text-[#1A1C1E] tracking-tight flex items-center gap-2 justify-center sm:justify-start">
                  <Users className="text-[#005DA5]" size={20} />
                  <span>Configuração e Matrícula Acadêmica</span>
                </h1>
                <p className="text-sm text-[#6C757D]">Gerenciamento de classes, estudantes e matrizes do SENAI</p>
              </div>
              
              <button
                onClick={() => setIsManagingRegistry(false)}
                type="button"
                className="flex items-center gap-1.5 bg-[#005DA5] hover:bg-[#004e8a] text-white font-mono text-[11px] font-bold uppercase tracking-widest px-4 py-2 transition-all cursor-pointer shadow-xs"
              >
                <ArrowLeft size={13} />
                <span>Voltar ao Boletim</span>
              </button>
            </header>

            <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-8">
              
              {/* Grid de 3 Colunas: 1. Turmas | 2. Alunos | 3. Disciplinas */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* 1. TURMAS */}
                <div className="bg-white border border-[#E1E4E8] rounded-none shadow-xs flex flex-col h-full">
                  <div className="p-4 bg-[#F1F3F5] border-b border-[#E1E4E8] flex justify-between items-center">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A1C1E] font-mono flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#005DA5] inline-block"></span>
                      1. Turmas Ativas
                    </h3>
                    <span className="font-mono text-xs font-semibold text-[#005DA5]">{turmas.length} Classes</span>
                  </div>

                  {/* Cadastro de nova turma */}
                  <div className="p-4 border-b border-[#E1E4E8] bg-slate-50/50">
                    <form onSubmit={handleCreateTurma} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-wider font-mono">Nome do Curso / Habilitação</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Ex: Mecânico de Usinagem" 
                          value={newTurmaName}
                          onChange={(e) => setNewTurmaName(e.target.value)}
                          className="w-full bg-white border border-[#E1E4E8] p-2 text-xs rounded-none font-mono text-slate-800 focus:ring-1 focus:ring-[#005DA5] outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-wider font-mono">Código Turma</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Ex: MUC-2026-T1" 
                            value={newTurmaCode}
                            onChange={(e) => setNewTurmaCode(e.target.value)}
                            className="w-full bg-white border border-[#E1E4E8] p-2 text-xs rounded-none font-mono text-slate-800 uppercase focus:ring-1 focus:ring-[#005DA5] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-wider font-mono">Turno</label>
                          <select
                            value={newTurmaShift}
                            onChange={(e) => setNewTurmaShift(e.target.value)}
                            className="w-full bg-white border border-[#E1E4E8] p-2 text-xs rounded-none font-mono text-slate-800 focus:ring-1 focus:ring-[#005DA5] outline-none cursor-pointer"
                          >
                            <option value="Manhã">Manhã</option>
                            <option value="Tarde">Tarde</option>
                            <option value="Noite">Noite</option>
                          </select>
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        className="w-full bg-[#005DA5] hover:bg-[#004e8a] text-white font-mono text-[10px] font-bold uppercase tracking-widest py-2 rounded-none transition cursor-pointer"
                      >
                        + Salvar Nova Turma
                      </button>
                    </form>
                  </div>

                  {/* Listagem das Turmas */}
                  <div className="divide-y divide-[#F1F3F5] overflow-y-auto max-h-[380px]">
                    {turmas.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => handleSelectTurma(t.id)}
                        className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                          selectedTurmaId === t.id ? "bg-[#005DA5]/5 border-l-4 border-[#005DA5]" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="min-w-0 pr-3">
                          <p className="font-bold text-xs text-[#1A1C1E] uppercase tracking-tight truncate">{t.name}</p>
                          <p className="text-[10px] text-[#6C757D] font-mono uppercase mt-1">
                            Cód: {t.code} • Turno: {t.shift}
                          </p>
                          <p className="text-[10px] text-[#005DA5] font-mono mt-1 flex items-center gap-1.5 font-bold">
                            <Users size={11} className="text-[#005DA5]" />
                            {t.students?.length || 0} Estudantes matriculados
                          </p>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteTurma(t.id); }}
                          type="button" 
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-rose-50 cursor-pointer transition-colors"
                          title="Excluir Turma"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. ALUNOS DA TURMA */}
                <div className="bg-white border border-[#E1E4E8] rounded-none shadow-xs flex flex-col h-full">
                  <div className="p-4 bg-[#F1F3F5] border-b border-[#E1E4E8] flex justify-between items-center">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A1C1E] font-mono flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-600 inline-block"></span>
                      2. Estudantes ({activeTurma?.code || "---"})
                    </h3>
                    <span className="font-mono text-xs font-semibold text-emerald-600">{activeTurma?.students?.length || 0} Matriculados</span>
                  </div>

                  {/* Cadastro de novo aluno */}
                  <div className="p-4 border-b border-[#E1E4E8] bg-slate-50/50">
                    <form onSubmit={handleCreateStudent} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-wider font-mono">Nome Acadêmico Completo</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Ex: Ricardo Beretella" 
                          value={newStudentName}
                          onChange={(e) => setNewStudentName(e.target.value)}
                          className="w-full bg-white border border-[#E1E4E8] p-2 text-xs rounded-none font-mono text-slate-800 focus:ring-1 focus:ring-emerald-600 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-wider font-mono">Registro Aluno (RA)</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Ex: 2026-1044" 
                            value={newStudentRA}
                            onChange={(e) => setNewStudentRA(e.target.value)}
                            className="w-full bg-white border border-[#E1E4E8] p-2 text-xs rounded-none font-mono text-slate-800 uppercase focus:ring-1 focus:ring-emerald-600 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-wider font-mono">Email do Aluno</label>
                          <input 
                            type="email" 
                            placeholder="Ex: ricardo.beretella20@gmail.com" 
                            value={newStudentEmail}
                            onChange={(e) => setNewStudentEmail(e.target.value)}
                            className="w-full bg-white border border-[#E1E4E8] p-2 text-xs rounded-none font-mono text-slate-800 focus:ring-1 focus:ring-emerald-600 outline-none"
                          />
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-bold uppercase tracking-widest py-2 rounded-none transition cursor-pointer"
                        disabled={!selectedTurmaId}
                      >
                        + Cadastrar Aluno
                      </button>
                    </form>
                  </div>

                  {/* Listagem dos Estudantes de Turma */}
                  <div className="divide-y divide-[#F1F3F5] overflow-y-auto max-h-[380px]">
                    {activeTurma?.students && activeTurma.students.length > 0 ? (
                      activeTurma.students.map(s => (
                        <div 
                          key={s.id} 
                          onClick={() => setSelectedStudentId(s.id)}
                          className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                            selectedStudentId === s.id ? "bg-emerald-50 border-l-4 border-emerald-600" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="min-w-0 pr-3">
                            <p className="font-bold text-xs text-[#1A1C1E]">{s.name}</p>
                            <p className="text-[10px] text-[#6C757D] font-mono uppercase mt-1">
                              RA: {s.ra} • Email: {s.email}
                            </p>
                            <p className="text-[10px] text-zinc-500 font-mono mt-1">
                              {s.units?.length || 0} disciplinas no boletim pessoal
                            </p>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteStudent(s.id); }}
                            type="button" 
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-rose-50 cursor-pointer transition-colors"
                            title="Excluir Aluno"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-zinc-400 text-xs font-mono">
                        Nenhum aluno matriculado na turma {activeTurma?.code}. Use o formulário acima!
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. MATRIZ / MATÉRIAS CURRICULARES */}
                <div className="bg-white border border-[#E1E4E8] rounded-none shadow-xs flex flex-col h-full">
                  <div className="p-4 bg-[#F1F3F5] border-b border-[#E1E4E8] flex justify-between items-center">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A1C1E] font-mono flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-amber-500 inline-block"></span>
                      3. Matriz Curricular ({activeTurma?.code || "---"})
                    </h3>
                    <span className="font-mono text-xs font-semibold text-amber-600">{activeTurma?.subjects?.length || 0} UCs</span>
                  </div>

                  {/* Cadastro de Unidade Curricular Template */}
                  <div className="p-4 border-b border-[#E1E4E8] bg-slate-50/50">
                    <form onSubmit={handleCreateSubjectTemplate} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-wider font-mono">Nome da Unidade Curricular (UC)</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Ex: Instalações Elétricas" 
                          value={newSubName}
                          onChange={(e) => setNewSubName(e.target.value)}
                          className="w-full bg-white border border-[#E1E4E8] p-2 text-xs rounded-none font-mono text-slate-800 focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-wider font-mono">Docente / Tutor designado</label>
                          <input 
                            type="text" 
                            placeholder="Ex: Prof. Pedro Santos" 
                            value={newSubTeacher}
                            onChange={(e) => setNewSubTeacher(e.target.value)}
                            className="w-full bg-white border border-[#E1E4E8] p-2 text-xs rounded-none font-mono text-slate-800 focus:ring-1 focus:ring-amber-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-wider font-mono">Sigla / Código UC</label>
                          <input 
                            type="text" 
                            placeholder="Ex: ELT-04" 
                            value={newSubCode}
                            onChange={(e) => setNewSubCode(e.target.value)}
                            className="w-full bg-white border border-[#E1E4E8] p-2 text-xs rounded-none font-mono text-slate-800 uppercase focus:ring-1 focus:ring-amber-500 outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-wider font-mono">Carga (h)</label>
                          <input 
                            type="number" 
                            min={1}
                            required
                            value={newSubWorkload}
                            onChange={(e) => setNewSubWorkload(Number(e.target.value) || 40)}
                            className="w-full bg-white border border-[#E1E4E8] p-2 text-xs rounded-none font-mono text-slate-800 focus:ring-1 focus:ring-amber-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-wider font-mono">Média Passagem</label>
                          <input 
                            type="number" 
                            min={1}
                            required
                            value={newSubPassingGrade}
                            onChange={(e) => setNewSubPassingGrade(Number(e.target.value) || 60)}
                            className="w-full bg-white border border-[#E1E4E8] p-2 text-xs rounded-none font-mono text-slate-800 focus:ring-1 focus:ring-amber-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-wider font-mono">Escala</label>
                          <select
                            value={newSubMaxScale}
                            onChange={(e) => setNewSubMaxScale(Number(e.target.value))}
                            className="w-full bg-white border border-[#E1E4E8] p-2 text-xs rounded-none font-mono text-slate-800 focus:ring-1 focus:ring-amber-500 outline-none cursor-pointer"
                          >
                            <option value={100}>Escala 100</option>
                            <option value={10}>Escala 10</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-wider font-mono">Regra de Fechamento</label>
                        <select
                          value={newSubMethod}
                          onChange={(e) => setNewSubMethod(e.target.value as GradingMethod)}
                          className="w-full bg-white border border-[#E1E4E8] p-2 text-xs rounded-none font-mono text-slate-800 focus:ring-1 focus:ring-amber-500 outline-none cursor-pointer"
                        >
                          <option value={GradingMethod.POINTS}>Acúmulo de Pontos Direto</option>
                          <option value={GradingMethod.WEIGHTED}>Média Ponderada (%)</option>
                        </select>
                      </div>
                      <button 
                        type="submit" 
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-mono text-[10px] font-bold uppercase tracking-widest py-2 rounded-none transition cursor-pointer"
                        disabled={!selectedTurmaId}
                      >
                        + Vincular UC na Grade Geral
                      </button>
                    </form>
                  </div>

                  {/* Listagem das Disciplinas de Turma */}
                  <div className="divide-y divide-[#F1F3F5] overflow-y-auto max-h-[380px]">
                    {activeTurma?.subjects && activeTurma.subjects.length > 0 ? (
                      activeTurma.subjects.map(sub => (
                        <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="min-w-0 pr-3">
                            <p className="font-bold text-xs text-[#1A1C1E]">{sub.name}</p>
                            <p className="text-[10px] text-[#6C757D] font-mono uppercase mt-1">
                              Sigla: {sub.code || "UC"} • Horas: {sub.workload}h
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              <span className="text-[9px] uppercase font-mono font-[#6C757D] font-bold bg-[#F1F3F5] border border-[#E1E4E8] px-1.5 py-0.5">
                                Tutor: {sub.teacher || "Matriz"}
                              </span>
                              <span className="text-[9px] uppercase font-mono font-bold bg-amber-50 text-amber-700 border border-amber-250 px-1.5 py-0.5">
                                {sub.gradingMethod === GradingMethod.POINTS ? "Acúmulo Pts" : "Média Ponderada"}
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteSubjectTemplate(sub.id)}
                            type="button" 
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-rose-50 cursor-pointer transition-colors"
                            title="Excluir disciplina da matriz"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-zinc-400 text-xs font-mono">
                        Nenhuma UC vinculada à grade desta turma. Adicione acima!
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Status Bar / Academic Footer */}
            <footer className="h-10 bg-white border-t border-[#E1E4E8] px-6 sm:px-8 flex items-center justify-between text-[10px] text-[#9BA1A7] uppercase tracking-[0.2em] font-mono shrink-0 select-none">
              <div className="flex items-center gap-4">
                <span>Modo Admin Portal</span>
                <span className="hidden sm:inline">•</span>
                <span>Unidade: Curitiba - PR</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Base de Dados Local Ativa e Sincronizada</span>
              </div>
            </footer>
          </>

        ) : (

          /* =========================================================================
             B. VISÃO DO EXCEL CONTROLE DO BOLETIM (ALUNO ATIVO)
             ========================================================================= */
          <>
            {/* Header Elegante */}
            <header className="h-auto md:h-20 bg-white border-b border-[#E1E4E8] px-6 py-4 md:py-0 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
              <div className="text-center md:text-left py-2">
                <h1 className="text-xl font-bold text-[#1A1C1E] tracking-tight">Boletim de Avaliações</h1>
                <p className="text-sm text-[#6C757D]">
                  {activeStudent ? `${activeStudent.name} • RA: ${activeStudent.ra}` : "Nenhum estudante matriculado nesta turma"}
                </p>
              </div>

              {/* Controles de Seleção Integrados no Topo (Estudante Selecionado) de Usinagem SENAI */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="w-full sm:w-72 text-left">
                  <span className="block text-[8px] text-[#6C757D] uppercase font-bold tracking-widest font-mono mb-1">Estudante Ativo</span>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E1E4E8] text-xs px-2.5 py-1.5 outline-none rounded-none font-mono cursor-pointer hover:bg-[#F1F3F5] transition-all text-slate-800"
                  >
                    {activeTurma?.students && activeTurma.students.length > 0 ? (
                      activeTurma.students.map(s => (
                        <option key={s.id} value={s.id} className="text-slate-800 bg-white font-sans">
                          {s.name} ({s.ra})
                        </option>
                      ))
                    ) : (
                      <option value="" className="text-slate-800 bg-white font-sans">Sem alunos cadastrados</option>
                    )}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-[#6C757D] tracking-wider mb-0.5">Aproveitamento Geral</p>
                  <p className="text-2xl font-mono font-bold text-[#005DA5]">{overallAveragePercent.toFixed(1)}%</p>
                </div>
                <div 
                  className="w-10 h-10 rounded-full bg-[#E9ECEF] flex items-center justify-center font-bold text-[#495057] text-sm border border-[#E1E4E8] select-none cursor-pointer hover:bg-[#DDE1E5] shrink-0"
                  title="Mudar cadastro"
                  onClick={() => setIsManagingRegistry(true)}
                >
                  {activeStudent ? activeStudent.name.substr(0, 2).toUpperCase() : "US"}
                </div>
              </div>
            </header>

            {/* Scrollable Container */}
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-8">
              
              {/* Quick Stats Dashboard */}
              <StatsDashboard units={units} />

              {/* Subheader: Search bar, View switch & Add Unit Button */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 border border-[#E1E4E8] rounded-none">
                
                {/* Campo de Busca */}
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-2.5 text-[#6C757D]" size={15} />
                  <input 
                    type="text" 
                    placeholder="Buscar unidade curricular..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E1E4E8] placeholder-[#6C757D]/60 text-slate-800 text-xs rounded-none pl-9 pr-4 py-2 focus:ring-1 focus:ring-[#005DA5] focus:bg-white outline-none transition-all font-mono"
                  />
                </div>

                {/* Alternador de Visualização & Ação de Cadastro */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                  
                  {/* Opções de visualização */}
                  <div className="bg-[#F1F3F5] p-1 border border-[#E1E4E8] flex gap-1">
                    <button
                      type="button"
                      onClick={() => setViewMode("table")}
                      className={`px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                        viewMode === "table" 
                          ? "bg-white text-[#005DA5] shadow-xs" 
                          : "text-[#6C757D] hover:text-[#1A1C1E] bg-transparent"
                      }`}
                    >
                      <List size={12} />
                      <span>Lista Técnica</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                        viewMode === "grid" 
                          ? "bg-white text-[#005DA5] shadow-xs" 
                          : "text-[#6C757D] hover:text-[#1A1C1E] bg-transparent"
                      }`}
                    >
                      <LayoutGrid size={12} />
                      <span>Cards</span>
                    </button>
                  </div>

                  {/* Botão Nova UC pessoal */}
                  <button
                    onClick={() => setShowAddUnitForm(true)}
                    type="button"
                    className="flex items-center gap-1.5 bg-[#005DA5] hover:bg-[#004e8a] text-white font-mono text-[11px] font-bold uppercase tracking-widest px-4 py-2 transition-all cursor-pointer shadow-xs"
                    disabled={!activeStudent}
                  >
                    <Plus size={13} />
                    <span>Nova Unidade</span>
                  </button>

                </div>

              </div>

              {/* Form Modal de Criação (Local para o estudante ativo) */}
              {showAddUnitForm && (
                <div className="fixed inset-0 bg-[#1A1C1E]/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-in fade-in duration-200">
                  <div className="bg-white max-w-lg w-full p-6 border border-[#E1E4E8] shadow-lg flex flex-col space-y-4 rounded-none animate-in scale-in duration-200">
                    
                    <div className="flex justify-between items-center pb-2 border-b border-[#E1E4E8]">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="text-[#005DA5]" size={18} />
                        <h3 className="font-bold text-sm uppercase tracking-wider text-[#1A1C1E] font-mono">Nova Disciplina para o Aluno</h3>
                      </div>
                      <button 
                        onClick={() => setShowAddUnitForm(false)}
                        className="p-1 text-[#6C757D] hover:text-[#1A1C1E] text-lg font-mono cursor-pointer"
                      >
                        &times;
                      </button>
                    </div>

                    <form onSubmit={handleCreateUnit} className="space-y-4 text-xs">
                      
                      <div className="space-y-1">
                        <label className="block font-bold text-[#6C757D] uppercase tracking-wider text-[10px] font-mono">Nome da Unidade Curricular (UC)</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ex: Circuitos Lógicos e Eletrônica"
                          value={newUnitName}
                          onChange={(e) => setNewUnitName(e.target.value)}
                          className="w-full bg-[#F8F9FA] border border-[#E1E4E8] p-2.5 text-slate-800 outline-none text-xs rounded-none font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block font-bold text-[#6C757D] uppercase tracking-wider text-[10px] font-mono">Código / Sigla</label>
                          <input 
                            type="text" 
                            placeholder="Ex: AUT-04"
                            value={newUnitCode}
                            onChange={(e) => setNewUnitCode(e.target.value)}
                            className="w-full bg-[#F8F9FA] border border-[#E1E4E8] p-2.5 text-slate-800 outline-none text-xs rounded-none font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-[#6C757D] uppercase tracking-wider text-[10px] font-mono">Docente / Tutor</label>
                          <input 
                            type="text" 
                            placeholder="Ex: Prof. Pedro Mendes"
                            value={newUnitTeacher}
                            onChange={(e) => setNewUnitTeacher(e.target.value)}
                            className="w-full bg-[#F8F9FA] border border-[#E1E4E8] p-2.5 text-slate-800 outline-none text-xs rounded-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="block font-bold text-[#6C757D] uppercase tracking-wider text-[10px] font-mono">Carga Horária (h)</label>
                          <input 
                            type="number" 
                            min={1} 
                            value={newUnitWorkload}
                            onChange={(e) => setNewUnitWorkload(parseInt(e.target.value) || 40)}
                            className="w-full bg-[#F8F9FA] border border-[#E1E4E8] p-2.5 text-slate-800 outline-none text-xs rounded-none font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-[#6C757D] uppercase tracking-wider text-[10px] font-mono">Média de Corte</label>
                          <input 
                            type="number" 
                            min={1} 
                            value={newUnitPassingGrade}
                            onChange={(e) => setNewUnitPassingGrade(parseInt(e.target.value) || 60)}
                            className="w-full bg-[#F8F9FA] border border-[#E1E4E8] p-2.5 text-slate-800 outline-none text-xs rounded-none font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-[#6C757D] uppercase tracking-wider text-[10px] font-mono">Escala de Nota</label>
                          <select
                            value={newUnitMaxScale}
                            onChange={(e) => setNewUnitMaxScale(Number(e.target.value))}
                            className="w-full bg-[#F8F9FA] border border-[#E1E4E8] p-2.5 text-slate-800 outline-none text-xs rounded-none font-mono"
                          >
                            <option value={100}>Escala 100</option>
                            <option value={10}>Escala 10</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-bold text-[#6C757D] uppercase tracking-wider text-[10px] font-mono">Método de Avaliação primário</label>
                        <select
                          value={newUnitMethod}
                          onChange={(e) => setNewUnitMethod(e.target.value as GradingMethod)}
                          className="w-full bg-[#F8F9FA] border border-[#E1E4E8] p-2.5 text-slate-800 outline-none text-xs rounded-none font-mono"
                        >
                          <option value={GradingMethod.POINTS}>Acúmulo de Pontos Direto</option>
                          <option value={GradingMethod.WEIGHTED}>Média Ponderada por Peso (%)</option>
                        </select>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          type="button" 
                          onClick={() => setShowAddUnitForm(false)}
                          className="px-4 py-2 border border-[#E1E4E8] hover:bg-[#F8F9FA] text-[#6C757D] font-mono font-bold uppercase rounded-none transition cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit" 
                          className="px-5 py-2 bg-[#005DA5] hover:bg-[#004e8a] text-white font-mono font-bold uppercase rounded-none transition cursor-pointer"
                        >
                          Salvar Disciplina
                        </button>
                      </div>

                    </form>

                  </div>
                </div>
              )}

              {/* Renderização de Conteúdo Baseado no Tipo de Visão */}
              {filteredUnits.length === 0 ? (
                <div className="bg-white border border-[#E1E4E8] p-12 text-center rounded-none max-w-lg mx-auto">
                  <SlidersHorizontal className="mx-auto text-[#6C757D] mb-3" size={32} />
                  <h3 className="font-bold text-[#1A1C1E] text-sm uppercase tracking-wide font-mono">Nenhuma Unidade Encontrada</h3>
                  <p className="text-xs text-[#6C757D] mt-2 leading-relaxed">
                    Não encontramos disciplinas ou unidades curriculares cadastradas no boletim de {activeStudent ? activeStudent.name : "Ninguém"}. Matrize matérias na aba "Gerenciar Cadastro".
                  </p>
                </div>
              ) : viewMode === "table" ? (
                
                /* Visualização Principal: Tabela Sleek de Avaliação do Course */
                <div className="bg-white border border-[#E1E4E8] rounded-none shadow-xs flex flex-col overflow-x-auto select-none animate-in fade-in duration-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F1F3F5] border-b border-[#E1E4E8] font-mono text-[11px] uppercase tracking-wider text-[#6C757D]">
                        <th className="px-6 py-4 font-bold">Unidade Curricular</th>
                        <th className="px-4 py-4 text-center font-bold">Rubricas / Ns</th>
                        <th className="px-4 py-4 text-center font-bold">Frequência</th>
                        <th className="px-4 py-4 text-center font-bold font-mono">Média Obtida</th>
                        <th className="px-6 py-4 text-right font-bold">Situação Final</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F3F5] text-xs">
                      {filteredUnits.map((u) => {
                        const uGrade = calculateUnitGrade(u);
                        const uAttendance = calculateAttendancePercentage(u);
                        const uStatus = determineUnitStatus(u);
                        const statusTextInfo = getStatusText(uStatus);
                        
                        return (
                          <tr 
                            key={u.id} 
                            className="hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                            onClick={() => setSelectedUnit(u)}
                          >
                            <td className="px-6 py-4">
                              <div className="font-bold text-[#1A1C1E] text-sm">{u.name}</div>
                              <div className="text-[10px] text-[#6C757D] font-mono uppercase mt-0.5">
                                {u.code || "REGULADO"} • Carga {u.workload}h • Tutor: {u.teacher || "SENAI Docente"}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <div className="flex justify-center items-center gap-1.5 flex-wrap">
                                {u.evaluations.map((ev, idx) => (
                                  <span 
                                    key={ev.id} 
                                    className={`text-[9px] px-1.5 py-0.5 font-mono font-bold border rounded ${
                                      ev.gradeReceived !== null 
                                        ? "bg-[#005DA5]/10 text-[#005DA5] border-[#005DA5]/20" 
                                        : "bg-[#F1F3F5] text-[#6C757D] border-[#E1E4E8]"
                                    }`}
                                    title={ev.title}
                                  >
                                    E{idx + 1}: {ev.gradeReceived ?? "--"}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center font-mono">
                              <span className={`font-bold ${uAttendance < 75 ? "text-red-600" : "text-[#1A1C1E]"}`}>
                                {uAttendance.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center font-mono font-bold text-[#005DA5] text-sm">
                              {uGrade} <span className="text-[10px] font-normal text-[#6C757D]">/ {u.maxGradeScale}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`text-[11px] font-bold uppercase tracking-tighter ${
                                uStatus === SubjectStatus.PASSED ? "text-[#28A745]" : 
                                uStatus === SubjectStatus.RECOVERY ? "text-[#FFC107]" : "text-red-500"
                              }`}>
                                {statusTextInfo.text}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Grid Footer da Tabela */}
                  <div className="p-4 bg-[#F8F9FA] border-t border-[#E1E4E8] flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="text-[11px] text-[#6C757D] font-mono">
                      Sincronizado com os servidores escolares às {new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleResetDefaults}
                        type="button"
                        className="px-4 py-1.5 bg-[#E9ECEF] hover:bg-[#DDE1E5] text-[#495057] text-[11px] font-bold uppercase tracking-widest font-mono transition-all cursor-pointer"
                      >
                        Restaurar Tudo
                      </button>
                      <button 
                        onClick={() => window.print()}
                        type="button"
                        className="px-4 py-1.5 bg-[#005DA5] hover:bg-[#004f8c] text-white text-[11px] font-bold uppercase tracking-widest font-mono transition-all cursor-pointer shadow-xs"
                      >
                        PDF / Imprimir
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                
                /* Visualização Clássica por Painéis */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
                  {filteredUnits.map(unit => (
                    <SubjectCard 
                      key={unit.id} 
                      unit={unit} 
                      onOpenDetail={() => setSelectedUnit(unit)} 
                    />
                  ))}
                </div>
              )}

            </div>

            {/* Status Bar / Academic Footer */}
            <footer className="h-10 bg-white border-t border-[#E1E4E8] px-6 sm:px-8 flex items-center justify-between text-[10px] text-[#9BA1A7] uppercase tracking-[0.2em] font-mono shrink-0 select-none">
              <div className="flex items-center gap-4">
                <span>Unidade: Monte Alto - SP</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Turma: {activeTurma ? activeTurma.code : "USI-2026-MA"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#28A745]"></span>
                <span>Acompanhamento Acadêmico Ativo</span>
              </div>
            </footer>
          </>
        )}

      </main>
    </div>

    {/* Modal de Detalhe e Edição de Nota quando selecionado */}
      {selectedUnit && (
        <SubjectDetailModal 
          unit={selectedUnit} 
          onClose={() => setSelectedUnit(null)} 
          onSave={handleUpdateUnit} 
        />
      )}

      {/* Modal de Cadastro de Aluno com nome e menu de escolha da turma */}
      {showQuickAddStudentModal && (
        <div className="fixed inset-0 bg-[#1A1C1E]/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full p-6 border border-[#E1E4E8] shadow-lg flex flex-col space-y-4 rounded-none animate-in scale-in duration-200">
            
            <div className="flex justify-between items-center pb-2 border-b border-[#E1E4E8]">
              <div className="flex items-center gap-2">
                <Users className="text-[#005DA5]" size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider text-[#1A1C1E] font-mono">Cadastrar Novo Aluno</h3>
              </div>
              <button 
                onClick={() => setShowQuickAddStudentModal(false)}
                className="p-1 text-[#6C757D] hover:text-[#1A1C1E] text-lg font-mono cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRegisterStudent} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="block font-bold text-[#6C757D] uppercase tracking-wider text-[10px] font-mono">Nome do Aluno</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: João Silva da Cruz"
                  value={quickStudentName}
                  onChange={(e) => setQuickStudentName(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E1E4E8] p-2.5 text-slate-800 outline-none text-xs rounded-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#6C757D] uppercase tracking-wider text-[10px] font-mono">Turma de Destino</label>
                <select
                  value={quickStudentTurmaId}
                  onChange={(e) => setQuickStudentTurmaId(e.target.value)}
                  className="w-[#100%] bg-[#F8F9FA] border border-[#E1E4E8] p-2.5 text-slate-800 outline-none text-xs rounded-none font-mono cursor-pointer"
                >
                  {turmas.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setShowQuickAddStudentModal(false)}
                  className="px-4 py-2 bg-[#E9ECEF] hover:bg-[#DDE1E5] text-[#495057] font-mono text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#005DA5] hover:bg-[#004e8a] text-white font-mono text-[11px] font-bold uppercase tracking-wider cursor-pointer shadow-xs"
                >
                  Cadastrar Aluno
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
