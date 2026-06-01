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
  { id: 'crd_cap1', ucId: 'CRD', codigo: 'CAP. 01', descricao: 'Interpretar desenhos técnicos de peças a partir de projetos da metalmecânica.' },
  { id: 'crd_cap2', ucId: 'CRD', codigo: 'CAP. 02', descricao: 'Elaborar croquis de peças em projeção ortogonal e em perspectiva à mão livre, a partir de modelos.' },
  { id: 'crd_cap3', ucId: 'CRD', codigo: 'CAP. 03', descricao: 'Interpretar desenho técnico de montagem de conjunto e subconjuntos a partir de projetos da metalmecânica.' },
  { id: 'crd_cap4', ucId: 'CRD', codigo: 'CAP. 04', descricao: 'Interpretar tolerância dimensional, geométrica e de acabamento superficial em desenho técnico.' }
];

export const getDescricaoRubrica = (capId: string, nivel: string): string => {
  const descricoes: Record<string, string> = {
    NEA: 'Não atendeu aos critérios mínimos de leitura geométrica, interpretação de normas técnicas ou especificações do projeto.',
    APO: 'Identifica vistas elementares ou cotas simples apenas sob auxílio direto da instrução técnica.',
    PAR: 'Analisa o desenho ou monta croquis de forma autônoma, restando dúvidas pontuais em tolerâncias complexas (GD&T) ou conjuntos.',
    AUT: 'Demonstra leitura imediata, domínio absoluto de projeções, simbologias de rugosidade e interpretação rigorosa de projetos sem erros.'
  };
  return descricoes[nivel] || '';
};
