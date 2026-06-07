// src/types.ts
export type TurmaId = 'MA' | 'MB' | 'TA' | 'TB';
export type UCId = 'FUSI' | 'CRD' | 'LIDT' | 'CIEMA'; // Alterado de CMAT para CIEMA para bater com o App.tsx

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
  avaliacoes?: {                  // Adicionado o ? para torná-lo opcional e evitar erros se o Firestore retornar vazio
    [capacidadeId: string]: NivelDesempenho;
  };
  observacoes?: {                 // Adicionado o ?
    [capacidadeId: string]: string;
  };
  notasNumericas?: {              // ESSA LINHA FOI ADICIONADA PARA CURAR O ERRO DA BUILD!
    [capacidadeId: string]: string;
  };
}

export type NivelDesempenho = 'NSA' | 'APO' | 'PAR' | 'AUT';
