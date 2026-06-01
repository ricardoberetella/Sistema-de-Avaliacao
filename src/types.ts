export type TurmaId = 'MA' | 'MB' | 'TA' | 'TB';

export interface TurmaConfig {
  id: TurmaId;
  nome: string;
}

export type UCId = 'FUSI' | 'CRD' | 'LIDT';

export interface UnidadeCurricular {
  id: UCId;
  sigla: string;
  nome: string;
}

export interface Criterio {
  id: string;
  descricao: string;
  tipo: 'tecnica' | 'socioemocional' | 'organizativa' | 'metodologica';
}

export interface Rubrica {
  id: string;
  ucId: UCId;
  titulo: string;
  criterios: Criterio[];
}

export interface Estudante {
  id: number;
  nome: string;
  turmaId: TurmaId;
}

export interface AvaliacaoEstudante {
  estudanteId: number;
  turmaId: TurmaId;
  ucId: UCId;
  notas: {
    [criterioId: string]: 'C' | 'NC' | null; // C = Conseguiu, NC = Não Conseguiu
  };
}
