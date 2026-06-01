import { UnidadeCurricular, TurmaConfig, RubricaFicha } from './types';

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

export const RUBRICAS_FICHAS: RubricaFicha[] = [
  {
    id: 'rub_fusi_oficial',
    ucId: 'FUSI',
    titulo: 'Matriz Oficial de Capacidades Técnicas - FUSI',
    criterios: [
      {
        id: 'fusi_cap1',
        referencia: '1. Selecionar ferramentas aplicadas na montagem e desmontagem de elementos de máquina.',
        nea: 'Não identifica as ferramentas manuais/portáteis adequadas ou danifica elementos de fixação/transmissão no processo.',
        apo: 'Seleciona ferramentas com auxílio direto, confundindo aplicações de elementos de vedação ou apoio.',
        par: 'Seleciona e utiliza as ferramentas de forma correta, mas necessita de consultas pontuais a tabelas ou orientações.',
        aut: 'Seleciona e opera ferramentas manuais, elétricas ou pneumáticas com total autonomia, preservando a integridade dos elementos.'
      },
      {
        id: 'fusi_cap2',
        referencia: '2. Relacionar os processos de fabricação à sua aplicação na indústria.',
        nea: 'Não diferencia processos de manufatura subtrativa, aditiva, injeção ou conformação mecânica.',
        apo: 'Compreende os conceitos gerais, mas confunde aplicações práticas entre retificação, fresamento e torneamento.',
        par: 'Relaciona a maioria dos processos à sua aplicação industrial, necessitando de mediação em conceitos complexos (ex: conformação).',
        aut: 'Distingue e justifica com clareza a aplicação de cada processo de fabricação (injeção, conformação, aditiva e subtrativa) na indústria.'
      },
      {
        id: 'fusi_cap3',
        referencia: '3. Relacionar os tipos de manutenção à sua aplicação na indústria.',
        nea: 'Não diferencia os conceitos básicos de ocorrências (defeito/falha) ou as intervenções de manutenção.',
        apo: 'Identifica a manutenção corretiva e preventiva, mas apresenta dificuldades em caracterizar a preditiva e a prescritiva.',
        par: 'Associa os tipos de manutenção às suas aplicações, cometendo pequenos equívocos na interpretação da documentação técnica.',
        aut: 'Relaciona perfeitamente as manutenções preventiva, corretiva, preditiva e emergencial às demandas da planta industrial.'
      },
      {
        id: 'fusi_cap4',
        referencia: '4. Elaborar plano de trabalho de acordo com normas e procedimentos de meio ambiente, de saúde e segurança no trabalho.',
        nea: 'Não elabora o plano de trabalho ou ignora riscos mecânicos/físicos, deixando de preencher a ART/APR.',
        apo: 'Elabora o plano de trabalho sob constante supervisão, omitindo pontos cruciais de segregação de resíduos ou normas regulamentadoras.',
        par: 'Monta o plano de trabalho de forma autônoma, demandando pequenos ajustes na análise preliminar de risco (APR) ou no cronograma.',
        aut: 'Elabora planos de trabalho completos e otimizados, mapeando riscos (ART/APR), EPIs/EPCs e o descarte correto de resíduos.'
      },
      {
        id: 'fusi_cap5',
        referencia: '5. Definir os parâmetros de usinagem de torneamento e fresagem convencional de acordo com as especificações técnicas.',
        nea: 'Não realiza os cálculos técnicos de RPM, velocidade de corte (Vc), avanço (f) ou profundidade (ap).',
        apo: 'Calcula os parâmetros cometendo erros frequentes de conversão ou aplicação de tabelas de materiais/geometria.',
        par: 'Define os parâmetros corretamente por meio de fórmulas, necessitando de validação pontual para o número de dentes (z) ou raio de ponta.',
        aut: 'Calcula e define perfeitamente RPM, Vc, avanço e ap com base na geometria da ferramenta e material da peça com autonomia.'
      },
      {
        id: 'fusi_cap6',
        referencia: '6. Realizar operações de baixa complexidade em torno convencional de acordo com as especificações, normas técnicas e de saúde e segurança.',
        nea: 'Opera o torno horizontal colocando em risco a sua segurança ou integridade do equipamento (placas, bedame, ferramentas).',
        apo: 'Executa torneamento/faceamento externo com erros de conicidade ou acabamento, demandando intervenção constante para corrigir postura.',
        par: 'Realiza as operações no torno de forma segura, necessitando de ajustes pontuais no posicionamento do carro superior ou acessórios.',
        aut: 'Executa operações de torneamento e faceamento com total autonomia, precisão dimensional, respeito às normas e excelente acabamento.'
      },
      {
        id: 'fusi_cap7',
        referencia: '7. Realizar operações de baixa complexidade em fresadora convencional de acordo com as especificações, normas técnicas e de saúde e segurança.',
        nea: 'Demonstra imperícia ao operar a fresadora universal/ferramenteira, ignorando riscos térmicos/mecânicos ou fixação da morsa.',
        apo: 'Realiza fresamento de faces com cabeçote ou fresa de topo, mas comete erros na utilização de calços ou profundidade de corte.',
        par: 'Opera a fresadora com segurança, precisando de auxílio pontual na montagem do setup de acessórios ou alinhamento de cantoneiras.',
        aut: 'Realiza operações de fresamento plano e paralelo com total autonomia, aplicando técnicas corretas de fixação e segurança.'
      },
      {
        id: 'fusi_cap8',
        referencia: '8. Realizar operações de furação de acordo com as especificações, normas técnicas e de saúde e segurança no trabalho.',
        nea: 'Não fixa a peça na morsa da furadeira, utiliza brocas incorretas ou ignora o uso de buchas de redução, gerando riscos.',
        apo: 'Efetua furações na furadeira de coluna/bancada, mas erra no alinhamento do centro ou avanço manual da ferramenta.',
        par: 'Realiza a furação respeitando as especificações e normas, necessitando de intervenção pontual apenas na seleção do fluido ou escareado.',
        aut: 'Executa furações helicoidais e de centro de forma autônoma, precisa e segura em furadeiras de bancada, piso ou radial.'
      },
      {
        id: 'fusi_cap9',
        referencia: '9. Realizar operações de rosqueamento de acordo com as especificações, normas técnicas e de saúde e segurança no trabalho.',
        nea: 'Não realiza os cálculos para diâmetro de broca de rosca, quebra machos/cossinetes ou ignora o uso de desandadores adequados.',
        apo: 'Executa rosqueamento manual, porém não mantém o alinhamento perpendicular ou erra o passo da rosca triangular.',
        par: 'Realiza o rosqueamento interno ou externo de forma satisfatória, precisando de lembretes sobre a quebra de cavaco ou lubrificação.',
        aut: 'Calcula, prepara e executa rosqueamento manual e em máquina com machos e cossinetes perfeitamente alinhados e sem avarias.'
      },
      {
        id: 'fusi_cap10',
        referencia: '10. Controlar a qualidade das peças usinadas em tornos e fresadoras convencionais, visualmente e por meio de instrumentos.',
        nea: 'Ignora rebarbas, oxidações ou riscos na inspeção visual e falha em preencher a ficha de autoinspeção.',
        apo: 'Identifica falhas visuais básicas, mas demonstra insegurança nas técnicas de medição dimensional no torno ou fresa.',
        par: 'Realiza o controle de qualidade dimensional e visual de forma autônoma, restando pequenas dúvidas no preenchimento do relatório.',
        aut: 'Inspeciona visualmente e mede com precisão todas as cotas das peças, preenchendo a ficha de autoinspeção com rigor técnico.'
      },
      {
        id: 'fusi_cap11',
        referencia: '11. Aplicar os procedimentos de refrigeração nos processos de torneamento e fresagem convencional.',
        nea: 'Usa fluidos inadequados para o material ou negligencia totalmente a refrigeração, acelerando o desgaste da ferramenta.',
        apo: 'Aplica fluidos de corte apenas quando orientado, demonstrando desconhecimento sobre os mecanismos de lubrificação.',
        par: 'Executa os procedimentos de refrigeração corretamente, necessitando de orientação para misturas ou descarte ambiental do fluido.',
        aut: 'Aplica perfeitamente as técnicas e propriedades de refrigeração adequadas para cada par de material/ferramenta com total autonomia.'
      }
    ]
  },
  {
    id: 'rub_crd_exemplo',
    ucId: 'CRD',
    titulo: 'Matriz de Exemplo - Controle Dimensional',
    criterios: [
      {
        id: 'crd_c1',
        referencia: '1. Medição Linear com Instrumentos de Escala',
        nea: 'Não faz leituras coerentes.',
        apo: 'Apresenta desvios frequentes.',
        par: 'Mede corretamente, com pequenas dúvidas.',
        aut: 'Mede com total precisão e autonomia.'
      }
    ]
  }
];
