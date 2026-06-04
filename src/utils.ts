// src/utils.ts
import { CapacidadeTecnica, NivelDesempenho } from './types';

export const CAPACIDADES_OFICIAIS: CapacidadeTecnica[] = [
  // LIDT - Leitura e Interpretação de Desenho Técnico
  { id: 'lidt-1', ucId: 'LIDT', codigo: 'LIDT - CAP. 1', descricao: 'Interpretar desenhos técnicos de peças a partir de projetos da metalmecânica.' },
  { id: 'lidt-2', ucId: 'LIDT', codigo: 'LIDT - CAP. 2', descricao: 'Elaborar croquis de peças em projeção ortogonal e em perspectiva à mão livre, a partir de modelos.' },
  { id: 'lidt-3', ucId: 'LIDT', codigo: 'LIDT - CAP. 3', descricao: 'Interpretar desenho técnico de montagem de conjunto e subconjuntos a partir de projetos da metalmecânica.' },
  { id: 'lidt-4', ucId: 'LIDT', codigo: 'LIDT - CAP. 4', descricao: 'Interpretar tolerância dimensional, geométrica e de acabamento superficial em desenho técnico.' },

  // CIEMA - Ciências dos Materiais
  { id: 'ciema-1', ucId: 'CIEMA', codigo: 'CIEMA - CAP. 1', descricao: 'Identificar componentes da estrutura atômica e a organização da tabela periódica.' },
  { id: 'ciema-2', ucId: 'CIEMA', codigo: 'CIEMA - CAP. 2', descricao: 'Identificar a classificação e as propriedades dos materiais.' },
  { id: 'ciema-3', ucId: 'CIEMA', codigo: 'CIEMA - CAP. 3', descricao: 'Identificar grandezas físicas.' },

  // CRD - Controle Dimensional
  { id: 'crd-1', ucId: 'CRD', codigo: 'CRD - CAP. 1', descricao: 'Identificar a importância da metrologia na indústria metalmecânica.' },
  { id: 'crd-2', ucId: 'CRD', codigo: 'CRD - CAP. 2', descricao: 'Medir peças com escala.' },
  { id: 'crd-3', ucId: 'CRD', codigo: 'CRD - CAP. 3', descricao: 'Medir peças com trena.' },
  { id: 'crd-4', ucId: 'CRD', codigo: 'CRD - CAP. 4', descricao: 'Medir peças com paquímetro.' },
  { id: 'crd-5', ucId: 'CRD', codigo: 'CRD - CAP. 5', descricao: 'Medir peças no sistema métrico com micrômetro.' },
  { id: 'crd-6', ucId: 'CRD', codigo: 'CRD - CAP. 6', descricao: 'Verificar dimensões e perfis com verificadores.' },
  { id: 'crd-7', ucId: 'CRD', codigo: 'CRD - CAP. 7', descricao: 'Medir por comparação com relógio apalpador e comparador.' },
  { id: 'crd-8', ucId: 'CRD', codigo: 'CRD - CAP. 8', descricao: 'Medir peças com goniômetro.' },

  // FUSI - Fundamentos da Usinagem
  { id: 'fusi-1', ucId: 'FUSI', codigo: 'FUSI - CAP. 1', descricao: 'Selecionar ferramentas aplicadas na montagem e desmontagem de elementos de máquina.' },
  { id: 'fusi-2', ucId: 'FUSI', codigo: 'FUSI - CAP. 2', descricao: 'Relacionar os processos de fabricação à sua aplicação na indústria.' },
  { id: 'fusi-3', ucId: 'FUSI', codigo: 'FUSI - CAP. 3', descricao: 'Relacionar os tipos de manutenção à sua aplicação na indústria.' },
  { id: 'fusi-4', ucId: 'FUSI', codigo: 'FUSI - CAP. 4', descricao: 'Elaborar plano de trabalho de acordo com normas e procedimentos de meio ambiente, de saúde e segurança no trabalho.' },
  { id: 'fusi-5', ucId: 'FUSI', codigo: 'FUSI - CAP. 5', descricao: 'Definir os parâmetros de usinagem de torneamento e fresagem convencional de acordo com as especificações técnicas.' },
  { id: 'fusi-6', ucId: 'FUSI', codigo: 'FUSI - CAP. 6', descricao: 'Realizar operações de baixa complexidade em torno convencional de acordo com as especificações, normas técnicas e de saúde e segurança no trabalho.' },
  { id: 'fusi-7', ucId: 'FUSI', codigo: 'FUSI - CAP. 7', descricao: 'Realizar operações de baixa complexidade em fresadora convencional de acordo com as especificações, normas técnicas e de saúde e segurança no trabalho.' },
  { id: 'fusi-8', ucId: 'FUSI', codigo: 'FUSI - CAP. 8', descricao: 'Realizar operações de furação de acordo com as especificações, normas técnicas e de saúde e segurança no trabalho.' },
  { id: 'fusi-9', ucId: 'FUSI', codigo: 'FUSI - CAP. 9', descricao: 'Realizar operações de rosqueamento de acordo com as especificações, normas técnicas e de saúde e segurança no trabalho.' },
  { id: 'fusi-10', ucId: 'FUSI', codigo: 'FUSI - CAP. 10', descricao: 'Realizar operações de ajustagem em peças por meio de ferramentas manuais de acordo com as especificações e normas técnicas e de saúde e segurança no trabalho.' },
  { id: 'fusi-11', ucId: 'FUSI', codigo: 'FUSI - CAP. 11', descricao: 'Controlar a qualidade das peças usinadas em tornos e fresadoras convencionais, visualmente e por meio de instrumentos de acordo com as especificações técnicas.' },
  { id: 'fusi-12', ucId: 'FUSI', codigo: 'FUSI - CAP. 12', descricao: 'Aplicar os procedimentos de refrigeração nos processos de torneamento e fresagem convencional.' }
];

export function getDescricaoRubrica(capacidadeId: string, nivel: NivelDesempenho): string {
  switch (nivel) {
    case 'NSA': return 'Não alcançou os critérios mínimos estabelecidos para esta capacidade técnica.';
    case 'APO': return 'Demonstra execução da capacidade técnica requerendo constante intervenção ou apoio pedagógico.';
    case 'PAR': return 'Executa as atividades de forma parcialmente autônoma, atendendo às normas técnicas essenciais.';
    case 'AUT': return 'Apresenta total autonomia e precisão na execução da capacidade segundo padrões industriais.';
    default: return '';
  }
}
