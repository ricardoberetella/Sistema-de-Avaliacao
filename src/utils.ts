import { UnidadeCurricular, TurmaConfig, Estudante } from './types';

export const TURMAS: TurmaConfig[] = [
  { id: 'MA', nome: 'Turma A manhã' },
  { id: 'MB', nome: 'Turma B manhã' },
  { id: 'TA', nome: 'Turma A tarde' },
  { id: 'TB', nome: 'Turma B tarde' },
];

export const UNIDADES_CURRICULARES: UnidadeCurricular[] = [
  { id: 'FUSI', sigla: 'FUSI', nome: 'Fundamentos da Usinagem' },
  { id: 'CRD', sigla: 'CRD', nome: 'Controle Dimensional' },
  { id: 'LIDT', sigla: 'LIDT', nome: 'Leitura e Interpretação de Desenho Técnico' },
];

// Gerando lista de estudantes simulada para testes rápidos de interface
export const ESTUDANTES_INICIAIS: Estudante[] = [
  // Turma MA (Estudantes 1 a 16)
  ...Array.from({ length: 16 }, (_, i) => ({ id: i + 1, nome: `Estudante ${i + 1} (Manhã A)`, turmaId: 'MA' as const })),
  // Turma MB (Estudantes 17 a 32)
  ...Array.from({ length: 16 }, (_, i) => ({ id: i + 17, nome: `Estudante ${i + 17} (Manhã B)`, turmaId: 'MB' as const })),
  // Turma TA
  ...Array.from({ length: 16 }, (_, i) => ({ id: i + 33, nome: `Estudante ${i + 33} (Tarde A)`, turmaId: 'TA' as const })),
  // Turma TB
  ...Array.from({ length: 16 }, (_, i) => ({ id: i + 49, nome: `Estudante ${i + 49} (Tarde B)`, turmaId: 'TB' as const })),
];

// Mock de Rubricas iniciais para cada Unidade Curricular do SENAI
export const RUBRICAS_MOCK = [
  {
    id: 'rub_fusi_1',
    ucId: 'FUSI' as const,
    titulo: 'Operação de Torneamento Cilíndrico Externo',
    criterios: [
      { id: 'fusi_c1', descricao: 'Selecionar ferramentas de corte conforme o material.', tipo: 'tecnica' as const },
      { id: 'fusi_c2', descricao: 'Fixar e alinhar a peça no sistema de fixação com segurança.', tipo: 'tecnica' as const },
      { id: 'fusi_c3', descricao: 'Utilizar EPIs obrigatórios durante a operação.', tipo: 'socioemocional' as const },
      { id: 'fusi_c4', descricao: 'Manter o posto de trabalho limpo e organizado.', tipo: 'organizativa' as const }
    ]
  },
  {
    id: 'rub_crd_1',
    ucId: 'CRD' as const,
    titulo: 'Metrologia Linear com Paquímetro',
    criterios: [
      { id: 'crd_c1', descricao: 'Realizar a leitura de medidas com resolução de 0,05mm.', tipo: 'tecnica' as const },
      { id: 'crd_c2', descricao: 'Zerar e calibrar o instrumento antes do uso.', tipo: 'metodologica' as const },
      { id: 'crd_c3', descricao: 'Evitar erros de paralaxe durante a medição.', tipo: 'tecnica' as const }
    ]
  },
  {
    id: 'rub_lidt_1',
    ucId: 'LIDT' as const,
    titulo: 'Interpretação de Vistas Ortográficas',
    criterios: [
      { id: 'lidt_c1', descricao: 'Identificar a projeção no 1º ou 3º diedro.', tipo: 'tecnica' as const },
      { id: 'lidt_c2', descricao: 'Interpretar linhas de centro, simetria e invisíveis.', tipo: 'tecnica' as const },
      { id: 'lidt_c3', descricao: 'Demonstrar atenção concentrada na leitura de cotas.', tipo: 'socioemocional' as const }
    ]
  }
];
