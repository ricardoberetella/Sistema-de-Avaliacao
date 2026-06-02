// src/types.ts
export type TurmaId = 'MA' | 'MB' | 'TA' | 'TB';
export type UCId = 'FUSI' | 'CRD' | 'LIDT' | 'CMAT';

export type NivelDesempenho = 'NSA' | 'APO' | 'PAR' | 'AUT';

export interface CapacidadeTecnica {
  id: string;
  ucId: UCId;
  codigo: string;
  descricao: string;
}

export interface Aluno {
  id: string;
  nome: string;
  turmaId: TurmaId;
  avaliacoes: {
    [capacidadeId: string]: NivelDesempenho;
  };
  observacoes: {
    [capacidadeId: string]: string;
  };
}
