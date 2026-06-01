import { CapacidadeTecnica } from './types';

export const CAPACIDADES_OFICIAIS: CapacidadeTecnica[] = [
  // --- FUNDAMENTOS DA USINAGEM (FUSI) ---
  { id: 'fusi_cap1', ucId: 'FUSI', codigo: 'CAP. 01', descricao: 'Selecionar ferramentas aplicadas na montagem e desmontagem de elementos de máquina.' },
  { id: 'fusi_cap2', ucId: 'FUSI', codigo: 'CAP. 02', descricao: 'Relacionar os processos de fabricação à sua aplicação na indústria.' },
  { id: 'fusi_cap3', ucId: 'FUSI', codigo: 'CAP. 03', descricao: 'Relacionar os tipos de manutenção à sua aplicação na indústria.' },
  { id: 'fusi_cap4', ucId: 'FUSI', codigo: 'CAP. 04', descricao: 'Elaborar plano de trabalho de acordo com normas e procedimentos de meio ambiente, de saúde e segurança no trabalho.' },
  { id: 'fusi_cap5', ucId: 'FUSI', codigo: 'CAP. 05', descricao: 'Definir os parâmetros de usinagem de torneamento e fresagem convencional de acordo com as especificações técnicas.' },
  { id: 'fusi_cap6', ucId: 'FUSI', codigo: 'CAP. 06', descricao: 'Realizar operações de baixa complexidade em torno convencional de acordo com as especificações, normas técnicas e de saúde e segurança.' },
  { id: 'fusi_cap7', ucId: 'FUSI', codigo: 'CAP. 07', descricao: 'Realizar operações de baixa complexidade em fresadora convencional de acordo com as especificações, normas técnicas e de saúde e segurança.' },
  { id: 'fusi_cap8', ucId: 'FUSI', codigo: 'CAP. 08', descricao: 'Realizar operações de furação de acordo com as especificações, normas técnicas e de saúde e segurança no trabalho.' },
  { id: 'fusi_cap9', ucId: 'FUSI', codigo: 'CAP. 09', descricao: 'Realizar operações de rosqueamento de acordo com as especificações, normas técnicas e de saúde e segurança no trabalho.' },
  { id: 'fusi_cap10', ucId: 'FUSI', codigo: 'CAP. 10', descricao: 'Controlar a qualidade das peças usinadas em tornos e fresadoras convencionais, visualmente e por meio de instrumentos de acordo com as especificações técnicas.' },
  { id: 'fusi_cap11', ucId: 'FUSI', codigo: 'CAP. 11', descricao: 'Aplicar os procedimentos de refrigeração nos processos de torneamento e fresagem convencional.' },

  // --- CONTROLE DIMENSIONAL (CRD) ---
  { id: 'crd_cap1', ucId: 'CRD', codigo: 'CAP. 01', descricao: 'Identificar a importância da metrologia na indústria metalmecânica.' },
  { id: 'crd_cap2', ucId: 'CRD', codigo: 'CAP. 02', descricao: 'Medir peças com escala.' },
  { id: 'crd_cap3', ucId: 'CRD', codigo: 'CAP. 03', descricao: 'Medir peças com trena.' },
  { id: 'crd_cap4', ucId: 'CRD', codigo: 'CAP. 04', descricao: 'Medir peças com paquímetro.' },
  { id: 'crd_cap5', ucId: 'CRD', codigo: 'CAP. 05', descricao: 'Medir peças no sistema métrico com micrômetro.' },
  { id: 'crd_cap6', ucId: 'CRD', codigo: 'CAP. 06', descricao: 'Verificar dimensões e perfis com verificadores.' },
  { id: 'crd_cap7', ucId: 'CRD', codigo: 'CAP. 07', descricao: 'Medir por comparação com relógio apalpador e comparador.' },
  { id: 'crd_cap8', ucId: 'CRD', codigo: 'CAP. 08', descricao: 'Medir peças com goniômetro.' }
];

export const getDescricaoRubrica = (capId: string, nivel: string): string => {
  // Descrições base voltadas à metrologia e usinagem
  const descricoes: Record<string, string> = {
    NEA: 'Não atendeu aos critérios mínimos de tolerância, segurança ou uso correto do instrumento/equipamento.',
    APO: 'Demonstra execução inicial dependendo de apoio ou correção constante do instrutor técnico.',
    PAR: 'Alcançou o objetivo de medição ou usinagem parcialmente, com desvios aceitáveis na calibração/processo.',
    AUT: 'Demonstra total autonomia, precisão centesimal/dimensional absoluta e domínio completo do critério.'
  };
  return descricoes[nivel] || '';
};
