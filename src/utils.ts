import { UnidadeCurricular, TurmaConfig, RubricaFicha, AulaCronograma } from './types';

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

export const CRONOGRAMA_FUSI: AulaCronograma[] = [
  { aula: 1, data: '26/01/2026', conteudo: 'Operações de Torno: Organizar ambiente; Facear no torno; Furo de centro.', estrategia: 'Tarefa: Eixo 4 Corpos. Prática de fixação e faceamento.' },
  { aula: 2, data: '28/01/2026', conteudo: 'Operações de Torno: Tornear superfície cilíndrica; Chanfrar; Fluidos de corte.', estrategia: 'Tarefa: Eixo 4 Corpos. Prática de desbaste e medição.' },
  { aula: 3, data: '29/01/2026', conteudo: 'Torneamento Convencional: Definir parâmetros; Torneamento; Parâmetros de corte/ferramenta.', estrategia: 'Exposição dialogada: Apresentação da SA2 e cálculos técnicos.' },
  { aula: 4, data: '02/02/2026', conteudo: 'Fresagem Convencional: Selecionar ferramentas; Fresagem; Parâmetros de corte.', estrategia: 'Tarefa: Bloco Fresado. Setup da fresadora e cálculos de RPM.' },
  { aula: 5, data: '04/02/2026', conteudo: 'Fresagem Convencional: Fresagem (Operações); Facear; Superfícies paralelas.', estrategia: 'Tarefa: Bloco Fresado. Esquadrejamento e faceamento.' },
  { aula: 6, data: '05/02/2026', conteudo: 'Plano de Trabalho: Elaborar plano de trabalho; Processos; Segurança; Meio Ambiente.', estrategia: 'Análise de desenhos técnicos e folhas de processo (Fresagem).' },
  { aula: 7, data: '09/02/2026', conteudo: 'Operações de Torno: Tornear superfície cilíndrica; Cortar no torno (Bedame).', estrategia: 'Tarefa: Eixo 4 Corpos. Acabamento e sangramento (corte).' },
  { aula: 8, data: '11/02/2026', conteudo: 'Operações de Torno: Inspeção dimensional; Refrigeração; Zelar pelo equipamento.', estrategia: 'Tarefa: Eixo 4 Corpos. Controle final e organização.' },
  { aula: 9, data: '12/02/2026', conteudo: 'Metrologia Industrial: Controle de qualidade; Inspeção dimensional; Instrumentos.', estrategia: 'Teoria sobre Metrologia aplicada e tolerâncias ISO.' },
  { aula: 10, data: '19/02/2026', conteudo: 'Fresagem Convencional: Fresagem (Rebaixos); Superfícies perpendiculares.', estrategia: 'Tarefa: Bloco Fresado. Usinagem de rebaixos e controle.' },
  { aula: 11, data: '23/02/2026', conteudo: 'Fresagem Convencional: Aplicar refrigeração; Fresagem (Operações avançadas).', estrategia: 'Tarefa: Bloco Fresado. Prática de acabamento em fresa.' },
  { aula: 12, data: '25/02/2026', conteudo: 'Tecnologia de Roscas: Rosqueamento (Definição, Ferramentas); Roscar com Cossinete.', estrategia: 'Teoria de cálculos para furação de roscas e tipos de roscas.' },
  { aula: 13, data: '26/02/2026', conteudo: 'Operações de Torno: Tornear cilíndrica; Roscar com cossinete no torno.', estrategia: 'Tarefa: Eixo Roscado. Tornear diâmetro e executar roscagem.' },
  { aula: 14, data: '02/03/2026', conteudo: 'Operações de Furação: Furação; Roscar manualmente com macho na bancada.', estrategia: 'Tarefa: Manípulo. Furação em furadeira e rosca manual.' },
  { aula: 15, data: '04/03/2026', conteudo: 'Elementos de Máquina: Elementos de máquina; Visão sistêmica; Planejar ações.', estrategia: 'Desafio 1: Planejamento do Calculador de Usinagem.' },
  { aula: 16, data: '05/03/2026', conteudo: 'Operações de Torno: Parâmetros de usinagem; Tornear superfície cilíndrica; Facear.', estrategia: 'Desafio 1: Início da base cilíndrica (Torno).' },
  { aula: 17, data: '09/03/2026', conteudo: 'Fresagem Convencional: Fresagem de superfícies planas e esquadrejamento.', estrategia: 'Desafio 1: Preparação do bloco principal (Fresadora).' },
  { aula: 18, data: '11/03/2026', conteudo: 'Ajustagem Mecânica: Revisão de tolerâncias; Ajustagem mecânica (Definição).', estrategia: 'Estudo de ajustes e folgas para montagem do Desafio 1.' },
  { aula: 19, data: '12/03/2026', conteudo: 'Operações de Torno: Tornear cilíndrica; Furo de centro; Chanfrar.', estrategia: 'Desafio 1: Usinagem de eixos internos e pinos (Torno).' },
  { aula: 20, data: '16/03/2026', conteudo: 'Fresagem Convencional: Fresagem de rebaixos e canais com fresa de topo.', estrategia: 'Desafio 1: Detalhes do corpo principal (Fresadora).' },
  { aula: 21, data: '18/03/2026', conteudo: 'Furação e Rosqueamento: Processos de furação e rosqueamento (Normas).', estrategia: 'Estudo técnico sobre furação coordenada e tabelas de roscas.' },
  { aula: 22, data: '19/03/2026', conteudo: 'Operações de Furação: Furação; Rosqueamento manual e no torno.', estrategia: 'Desafio 1: Furação e rosqueamento de componentes.' },
  { aula: 23, data: '23/03/2026', conteudo: 'Fresagem e Controle: Furação em fresadora; Controle de qualidade.', estrategia: 'Desafio 1: Furação coordenada do corpo do calculador.' },
  { aula: 24, data: '25/03/2026', conteudo: 'Manutenção e Segurança: Manutenção preventiva; Segurança do trabalho; Meio Ambiente.', estrategia: 'Teoria sobre descarte de resíduos e lubrificação de máquinas.' },
  { aula: 25, data: '26/03/2026', conteudo: 'Operações de Torno: Tornear cilíndrica; Inspeção com micrômetro.', estrategia: 'Desafio 1: Acabamento de diâmetros críticos (Torno).' },
  { aula: 26, data: '30/03/2026', conteudo: 'Fresagem Convencional: Fresagem; Superfícies paralelas e perpendiculares.', estrategia: 'Desafio 1: Acabamento final das faces do bloco.' },
  { aula: 27, data: '01/04/2026', conteudo: 'Qualidade Industrial: Relatórios técnicos; Controle de processos; Organização.', estrategia: 'Documentação de controle de qualidade (Teoria).' },
  { aula: 28, data: '06/04/2026', conteudo: 'Ajustagem Mecânica: Ajustagem manual; Rebarbação; Limagem técnica.', estrategia: 'Desafio 1: Ajustagem manual das peças para encaixe.' },
  { aula: 29, data: '08/04/2026', conteudo: 'Montagem e Teste: Inspeção visual; Verificação funcional de conjuntos.', estrategia: 'Desafio 1: Pré-montagem e detecção de interferências.' },
  { aula: 30, data: '09/04/2026', conteudo: 'Torneamento Convencional: Revisão Geral: Torneamento Convencional.', estrategia: 'Debate técnico: Soluções para problemas em torneamento.' },
  { aula: 31, data: '13/04/2026', conteudo: 'Operações de Torno: Tornear; Chanfrar; Roscar com cossinete.', estrategia: 'Tarefa Reforço: Repetição do Eixo Roscado.' },
  { aula: 32, data: '15/04/2026', conteudo: 'Fresagem e Qualidade: Fresar; Furação de precisão; Qualidade.', estrategia: 'Tarefa Reforço: Ajuste de blocos paralelos.' },
  { aula: 33, data: '16/04/2026', conteudo: 'Fresamento e Ajustagem: Revisão Geral: Fresamento e Ajustagem.', estrategia: 'Debate técnico: Otimização de tempo no setup de máquinas.' },
  { aula: 34, data: '20/04/2026', conteudo: 'Operações de Torno: Prática Supervisionada Avançada (Torneamento).', estrategia: 'Desafio 1: Refino dimensional das peças cilíndricas.' },
  { aula: 35, data: '22/04/2026', conteudo: 'Fresagem Convencional: Prática Supervisionada Avançada (Fresamento).', estrategia: 'Desafio 1: Refino dimensional do bloco fresado.' },
  { aula: 36, data: '23/04/2026', conteudo: 'Gestão de Oficina: Gestão de Ferramental e Almoxarifado técnico.', estrategia: 'Organização e controle de vida útil das ferramentas.' },
  { aula: 37, data: '27/04/2026', conteudo: 'Montagem Industrial: Montagem de conjuntos; Elementos de máquina.', estrategia: 'Teoria de montagem e tipos de ajustes (Prensado/Folga).' },
  { aula: 38, data: '29/04/2026', conteudo: 'Controle de Qualidade: Controle da qualidade das peças; Inspeção dimensional.', estrategia: 'Avaliação dimensional total (Micrômetro).' },
  { aula: 39, data: '30/04/2026', conteudo: 'Operações de Torno: Tornear; Facear; Furo de centro (Novas peças).', estrategia: 'Tarefa Extra: Início de peça auxiliar (Base castanha).' },
  { aula: 40, data: '04/05/2026', conteudo: 'Segurança Industrial: Manutenção; Segurança do trabalho (NR-12).', estrategia: 'Teoria sobre proteções e dispositivos de emergência.' },
  { aula: 41, data: '06/05/2026', conteudo: 'Fresagem Convencional: Fresar; Rebaixos; Furação (Novas peças).', estrategia: 'Tarefa Extra: Usinagem de base auxiliar (Fresadora).' },
  { aula: 42, data: '07/05/2026', conteudo: 'Operações de Torno: Tornear cilíndrica; Roscar com cossinete.', estrategia: 'Prática de roscagem em diferentes diâmetros.' },
  { aula: 43, data: '11/05/2026', conteudo: 'Tecnologia de Materiais: Parâmetros avançados (Materiais especiais).', estrategia: 'Estudo de tabelas para Aço Inox e Bronze (Teoria).' },
  { aula: 44, data: '13/05/2026', conteudo: 'Fresagem Convencional: Fresagem de superfícies perpendiculares.', estrategia: 'Prática de esquadrejamento de precisão.' },
  { aula: 45, data: '14/05/2026', conteudo: 'Operações de Torno: Cortar no torno (Bedame); Abrir canais.', estrategia: 'Operações de sangramento e canais técnicos.' },
  { aula: 46, data: '18/05/2026', conteudo: 'Gestão da Qualidade: Relatórios de Não Conformidade; Ações corretivas.', estrategia: 'Como documentar erros e recuperar peças (Teoria).' },
  { aula: 47, data: '20/05/2026', conteudo: 'Ajustagem Mecânica: Rosquear manual com macho na bancada.', estrategia: 'Prática intensiva de roscagem em furos cegos.' },
  { aula: 48, data: '21/05/2026', conteudo: 'Ajustagem Mecânica: Ajustagem mecânica: Limagem plana.', estrategia: 'Prática de ajustagem ao banco (precisão manual).' },
  { aula: 49, data: '25/05/2026', conteudo: 'Elementos de Máquina: Elementos de fixação e transmissão (Teoria).', estrategia: 'Estudo sobre chavetas e eixos estriados.' },
  { aula: 50, data: '27/05/2026', conteudo: 'Montagem e Qualidade: Controle dimensional de conjuntos montados.', estrategia: 'Testes funcionais e ajustes de interferência.' },
  { aula: 51, data: '28/05/2026', conteudo: 'Operações de Torno: Torneamento: Prática de acabamento superficial.', estrategia: 'Foco em rugosidade e brilho no torno.' },
  { aula: 52, data: '01/06/2026', conteudo: 'Revisão Técnica: Preparação para Avaliação Final (Teoria).', estrategia: 'Revisão integral dos conteúdos dos Blocos 1, 2 e 3.' },
  { aula: 53, data: '03/06/2026', conteudo: 'Fresagem Convencional: Fresagem: Prática de acabamento (Cabeçote).', estrategia: 'Foco em planeza e acabamento superficial.' },
  { aula: 54, data: '08/06/2026', conteudo: 'Oficina de Finalização: Conclusão de peças pendentes do semestre.', estrategia: 'Prática de Oficina Final (Arremates).' },
  { aula: 55, data: '10/06/2026', conteudo: 'Desenvolvimento Profissional: Ética Profissional e Postura no Trabalho.', estrategia: 'Atitudes, responsabilidade e zelo com patrimônio.' },
  { aula: 56, data: '11/06/2026', conteudo: 'Manutenção e Zelo: Limpeza Técnico e Conservação.', estrategia: 'Limpeza profunda e lubrificação das máquinas.' },
  { aula: 57, data: '15/06/2026', conteudo: 'Organização Industrial: Organização do ambiente (5S).', estrategia: 'Organização de armários e entrega de ferramentas.' },
  { aula: 58, data: '17/06/2026', conteudo: 'Gestão de Processos: Revisão Geral de Processos e Documentação.', estrategia: 'Conferência de diários e fichas técnicas.' },
  { aula: 59, data: '18/06/2026', conteudo: 'Encerramento Letivo: Feedback Final e Divulgação de Notas.', estrategia: 'Encerramento letivo em sala de aula.' },
  { aula: 60, data: '22/06/2026', conteudo: 'Avaliação de Resultados: Entrega Final das Peças e Avaliação de Resultados.', estrategia: 'Finalização de todas as atividades de oficina.' },
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
        apo: 'Identifica a manutenção corretiva e preventiva, mas apresenta dificuldades em determinar a preditiva e a prescritiva.',
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
        referencia: '10. Controlar a qualidade das peças usinadas em tornos e fresadoras convencionais, visualmente e por meio de instrumentos de acordo com as especificações técnicas.',
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
  }
];
