export type TurmaId = 'MA' | 'MB' | 'TA' | 'TB';

export interface OperacaoUsinagem {
  id: string;
  numero: string; // Ex: "OP. 01"
  titulo: string; // Ex: "FACEAR NO TORNO"
  maquina: 'TORNO' | 'FRESA' | 'FURADEIRA' | 'BANCADA';
}

export interface Aluno {
  id: string;
  nome: string;
  turmaId: TurmaId;
  operacoesConcluidas: string[]; // IDs das operações validadas
}
