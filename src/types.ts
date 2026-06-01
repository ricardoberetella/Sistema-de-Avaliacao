export type TurmaId = 'MA' | 'MB' | 'TA' | 'TB';
export type UCId = 'FUSI' | 'CRD' | 'LIDT';
export type NivelDesempenho = 'NSA' | 'APO' | 'PAR' | 'AUT'; // NEA alterado para NSA

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
    [capacidadeId: string]: string; // Campo de anotação por capacidade técnica/UC
  };
}
