export type TurmaId = 'MA' | 'MB' | 'TA' | 'TB';
export type UCId = 'FUSI' | 'CRD' | 'LIDT';
export type NivelDesempenho = 'NEA' | 'APO' | 'PAR' | 'AUT';

export interface CapacidadeTecnica {
  id: string;
  ucId: UCId;
  codigo: string; // Ex: "CAP. 01"
  descricao: string;
}

export interface Aluno {
  id: string;
  nome: string;
  turmaId: TurmaId;
  avaliacoes: {
    [capacidadeId: string]: NivelDesempenho;
  };
}
