// src/types.ts

export type TurmaId = 'MA' | 'MB' | 'TA' | 'TB';
export type UCId = 'FUSI' | 'CRD' | 'LIDT' | 'CIEMA';

export interface CapacidadeTecnica {
  id: string;
  codigo: string;
  descricao: string;
  ucId: UCId;
}

export interface Aluno {
  id: string;
  nome: string;
  turmaId: TurmaId;
  avaliacoes?: {
    [capacidadeId: string]: NivelDesempenho;
  };
  observacoes?: {
    [capacidadeId: string]: string;
  };
  notasNumericas?: {
    [capacidadeId: string]: string;
  };
}

export type NivelDesempenho = 'NSA' | 'APO' | 'PAR' | 'AUT';
