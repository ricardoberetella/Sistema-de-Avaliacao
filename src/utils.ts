// src/utils.ts
import { CapacidadeTecnica, NivelDesempenho } from './types';

export const CAPACIDADES_OFICIAIS: CapacidadeTecnica[] = [
  // --- FUSI - FUNDAMENTOS DA USINAGEM ---
  { id: 'fusi_01', ucId: 'FUSI', codigo: 'CT01', descricao: 'Selecionar ferramentas aplicadas na montagem e desmontagem de elementos de máquina.' },
  { id: 'fusi_02', ucId: 'FUSI', codigo: 'CT02', descricao: 'Relacionar os processos de fabricação à sua aplicação na indústria.' },
  { id: 'fusi_03', ucId: 'FUSI', codigo: 'CT03', descricao: 'Relacionar os tipos de manutenção à sua aplicação na indústria.' },
  { id: 'fusi_04', ucId: 'FUSI', codigo: 'CT04', descricao: 'Elaborar plano de trabalho de acordo com normas e procedimentos de meio ambiente, de saúde e segurança no trabalho.' },
  { id: 'fusi_05', ucId: 'FUSI', codigo: 'CT05', descricao: 'Definir os parâmetros de usinagem de torneamento e fresagem convencional de acordo com as especificações técnicas.' },
  { id: 'fusi_06', ucId: 'FUSI', codigo: 'CT06', descricao: 'Realizar operações de baixa complexidade em torno convencional de acordo com as especificações, normas técnicas e de saúde e segurança no trabalho.' },
  { id: 'fusi_07', ucId: 'FUSI', codigo: 'CT07', descricao: 'Realizar operações de baixa complexidade em fresadora convencional de acordo com as especificações, normas técnicas e de saúde e segurança no trabalho.' },
  { id: 'fusi_08', ucId: 'FUSI', codigo: 'CT08', descricao: 'Realizar operações de furação de acordo com as especificações, normas técnicas e de saúde e segurança no trabalho.' },
  { id: 'fusi_09', ucId: 'FUSI', codigo: 'CT09', descricao: 'Realizar operações de rosqueamento de acordo com as especificações, normas técnicas e de saúde e segurança no trabalho.' },
  { id: 'fusi_10', ucId: 'FUSI', codigo: 'CT10', descricao: 'Realizar operações de ajustagem em peças por meio de ferramentas manuais de acordo com as especificações e normas técnicas e de saúde e segurança no trabalho.' },
  { id: 'fusi_11', ucId: 'FUSI', codigo: 'CT11', descricao: 'Controlar a qualidade das peças usinadas em tornos e fresadoras convencionais, visualmente e por meio de instrumentos de acordo com as especificações técnicas.' },
  { id: 'fusi_12', ucId: 'FUSI', codigo: 'CT12', descricao: 'Aplicar os procedimentos de refrigeração nos processos de torneamento e fresagem convencional.' },

  // --- CRD - CONTROLE DIMENSIONAL ---
  { id: 'crd_01', ucId: 'CRD', codigo: 'CT01', descricao: 'Identificar a importância da metrologia na indústria metalmecânica.' },
  { id: 'crd_02', ucId: 'CRD', codigo: 'CT02', descricao: 'Medir peças com escala.' },
  { id: 'crd_03', ucId: 'CRD', codigo: 'CT03', descricao: 'Medir peças com trena.' },
  { id: 'crd_04', ucId: 'CRD', codigo: 'CT04', descricao: 'Medir peças com paquímetro.' },
  { id: 'crd_05', ucId: 'CRD', codigo: 'CT05', descricao: 'Medir peças no sistema métrico com micrômetro.' },
  { id: 'crd_06', ucId: 'CRD', codigo: 'CT06', descricao: 'Verificar dimensões e perfis com verificadores.' },
  { id: 'crd_07', ucId: 'CRD', codigo: 'CT07', descricao: 'Medir por comparação com relógio apalpador e comparador.' },
  { id: 'crd_08', ucId: 'CRD', codigo: 'CT08', descricao: 'Medir peças com goniômetro.' },

  // --- LIDT - LEITURA E INTERPRETAÇÃO DE DESENHO TÉCNICO ---
  { id: 'lidt_01', ucId: 'LIDT', codigo: 'CT01', descricao: 'Interpretar desenhos técnicos de peças a partir de projetos da metalmecânica.' },
  { id: 'lidt_02', ucId: 'LIDT', codigo: 'CT02', descricao: 'Elaborar croquis de peças em projeção ortogonal e em perspectiva à mão livre, a partir de modelos.' },
  { id: 'lidt_03', ucId: 'LIDT', codigo: 'CT03', descricao: 'Interpretar desenho técnico de montagem de conjunto e subconjuntos a partir de projetos da metalmecânica.' },
  { id: 'lidt_04', ucId: 'LIDT', codigo: 'CT04', descricao: 'Interpretar tolerância dimensional, geométrica e de acabamento superficial em desenho técnico.' },

  // --- CMAT - CIÊNCIA DOS MATERIAIS ---
  { id: 'cmat_01', ucId: 'CMAT', codigo: 'CT01', descricao: 'Identificar componentes da estrutura atômica e a organização da tabela periódica.' },
  { id: 'cmat_02', ucId: 'CMAT', codigo: 'CT02', descricao: 'Identificar a classificação e as propriedades dos materiais.' },
  { id: 'cmat_03', ucId: 'CMAT', codigo: 'CT03', descricao: 'Identificar grandezas físicas.' }
];

export function getDescricaoRubrica(capacidadeId: string, nivel: NivelDesempenho): string {
  switch (nivel) {
    case 'NSA': return 'Não Satisfez os critérios mínimos avaliados.';
    case 'APO': return 'Demonstra dificuldades e necessita de apoio constante do instrutor.';
    case 'PAR': return 'Realiza a atividade de forma parcial, com pequenas oscilações de performance.';
    case 'AUT': return 'Autônomo. Executa a competência com precisão, segurança e sem auxílio.';
    default: return '';
  }
}
