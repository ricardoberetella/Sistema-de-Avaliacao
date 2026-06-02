// src/types.ts

// Identificadores de Turmas: MDU-M (Manhã: MA/MB) e MDU-T (Tarde: TA/TB)
export type TurmaId = 'MA' | 'MB' | 'TA' | 'TB';

// Unidades Curriculares: Fundamentos de Usinagem, Controle Dimensional e Desenho Técnico
export type UCId = 'FUSI' | 'CRD' | 'LIDT';

// Níveis de Desempenho (Rúbricas da Série Metódica Ocupacional)
// NSA: Não Satisfez | APO: Com Apoio | PAR: Parcial | AUT: Autônomo
export type NivelDesempenho = 'NSA' | 'APO' | 'PAR' | 'AUT';

export interface CapacidadeTecnica {
  id: string;
  ucId: UCId;
  codigo: string;
  descricao: string;
}

export interface Aluno {
  id: string; // ID gerado automaticamente pelo Firebase Firestore na nuvem
  nome: string;
  turmaId: TurmaId;
  avaliacoes: {
    [capacidadeId: string]: NivelDesempenho;
  };
  observacoes: {
    [capacidadeId: string]: string; // Histórico técnico e anotações de tolerância/oficina por capacidade
  };
}
