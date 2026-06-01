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

export type NivelDesempenho = 'NEA' | 'APO' | 'PAR' | 'AUT';

export interface LinhaCriterio {
  id: string;
  referencia: string;
  nea: string;
  apo: string;
  par: string;
  aut: string;
}

export interface RubricaFicha {
  id: string;
  ucId: UCId;
  titulo: string;
  criterios: LinhaCriterio[];
}

export interface AulaCronograma {
  aula: number;
  data: string;
  conteudo: string;
  estrategia: string;
}

export interface Estudante {
  id: string;
  nome: string;
  turmaId: TurmaId;
}

export interface AvaliacaoEstudante {
  estudanteId: string;
  turmaId: TurmaId;
  ucId: UCId;
  rubricaId: string;
  notas: {
    [criterioId: string]: NivelDesempenho | null;
  };
}
