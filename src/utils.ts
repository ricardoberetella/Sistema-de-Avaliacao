import { CapacidadeTecnica } from './types';

export const CAPACIDADES_FUSI: CapacidadeTecnica[] = [
  { id: 'fusi_cap1', codigo: 'CAP. 01', descricao: 'Selecionar ferramentas aplicadas na montagem e desmontagem de elementos de máquina.' },
  { id: 'fusi_cap2', codigo: 'CAP. 02', descricao: 'Relacionar os processos de fabricação à sua aplicação na indústria.' },
  { id: 'fusi_cap3', codigo: 'CAP. 03', descricao: 'Relacionar os tipos de manutenção à sua aplicação na indústria.' },
  { id: 'fusi_cap4', codigo: 'CAP. 04', descricao: 'Elaborar plano de trabalho de acordo com normas e procedimentos de meio ambiente, de saúde e segurança no trabalho.' },
  { id: 'fusi_cap5', codigo: 'CAP. 05', descricao: 'Definir os parâmetros de usinagem de torneamento e fresagem convencional de acordo com as especificações técnicas.' },
  { id: 'fusi_cap6', codigo: 'CAP. 06', descricao: 'Realizar operações de baixa complexidade em torno convencional de acordo com as especificações, normas técnicas e de saúde e segurança.' },
  { id: 'fusi_cap7', codigo: 'CAP. 07', descricao: 'Realizar operações de baixa complexidade em fresadora convencional de acordo com as especificações, normas técnicas e de saúde e segurança.' },
  { id: 'fusi_cap8', codigo: 'CAP. 08', descricao: 'Realizar operações de furação de acordo com as especificações, normas técnicas e de saúde e segurança no trabalho.' },
  { id: 'fusi_cap9', codigo: 'CAP. 09', descricao: 'Realizar operações de rosqueamento de acordo com as especificações, normas técnicas e de saúde e segurança no trabalho.' },
  { id: 'fusi_cap10', codigo: 'CAP. 10', descricao: 'Controlar a qualidade das peças usinadas em tornos e fresadoras convencionais, visualmente e por meio de instrumentos de acordo com as especificações técnicas.' },
  { id: 'fusi_cap11', codigo: 'CAP. 11', descricao: 'Aplicar os procedimentos de refrigeração nos processos de torneamento e fresagem convencional.' }
];

// Detalhes da rubrica relativa para exibição no painel de avaliação
export const DETALHES_RUBRICAS: Record<string, Record<string, string>> = {
  fusi_cap1: {
    NEA: 'Não identifica as ferramentas adequadas ou danifica elementos no processo.',
    APO: 'Seleciona ferramentas com auxílio direto e confunde aplicações.',
    PAR: 'Seleciona e utiliza corretamente, mas necessita de consultas pontuais.',
    AUT: 'Seleciona e opera ferramentas com total autonomia e preserva os elementos.'
  },
  fusi_cap6: {
    NEA: 'Opera o torno horizontal colocando em risco a sua segurança ou do equipamento.',
    APO: 'Executa torneamento com erros de conicidade, demandando intervenção constante.',
    PAR: 'Realiza as operações de forma segura, necessitando de pequenos ajustes.',
    AUT: 'Executa operações com total autonomia, precisão dimensional e excelente acabamento.'
  },
  fusi_cap7: {
    NEA: 'Demonstra imperícia na fresadora, ignorando riscos ou fixação incorreta.',
    APO: 'Realiza fresamento de faces, mas comete erros na profundidade ou calços.',
    PAR: 'Opera a fresadora com segurança, precisando de auxílio pontual no setup.',
    AUT: 'Realiza operações de fresamento com total autonomia e técnicas corretas.'
  }
};

// Função auxiliar para retornar a rubrica padrão caso não esteja mapeada detalhadamente acima
export const getDescricaoRubrica = (capId: string, nivel: string): string => {
  if (DETALHES_RUBRICAS[capId] && DETALHES_RUBRICAS[capId][nivel]) {
    return DETALHES_RUBRICAS[capId][nivel];
  }
  const descricoesPadrao: Record<string, string> = {
    NEA: 'Não atendeu aos critérios mínimos de desempenho e segurança da capacidade.',
    APO: 'Demonstra execução inicial com apoio constante da instrução técnica.',
    PAR: 'Alcançou o objetivo de forma parcial, com pequenas ressalvas no processo.',
    AUT: 'Demonstra total autonomia, precisão técnica e domínio na capacidade alcançada.'
  };
  return descricoesPadrao[nivel];
};
