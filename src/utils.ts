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
    id: 'rub_usinagem_convencional',
    ucId: 'FUSI',
    titulo: 'Ficha 01 - Prática de Oficina Mecânica',
    criterios: [
      {
        id: 'c1',
        referencia: 'Realizar operações de baixa complexidade em torno convencional.',
        nea: 'Não consegue executar as operações básicas na tarefa de forma satisfatória ou segura, mesmo com apoio e demonstrações constantes.',
        apo: 'Tenta operar a máquina, mas demonstra insegurança e comete erros frequentes de posicionamento e avanço, necessitando de intervenção constante.',
        par: 'Opera a torno e executa as operações, mas precisa de orientação pontual do docente para corrigir a técnica, ajustar a máquina ou atingir a tolerância.',
        aut: 'Opera o torno com autonomia e segurança, executando todas as operações (facear, tornear, chanfrar, furar) com precisão dimensional e bom acabamento.'
      },
      {
        id: 'c2',
        referencia: 'Zelar pelo uso de equipamentos, instrumentos, ferramentas e materiais.',
        nea: 'Danifica ferramentas ou instrumentos por mau uso ou não demonstra qualquer cuidado com os recursos da oficina, mesmo após repetidas orientações.',
        apo: 'Manuseia os equipamentos de forma descuidada, deixando ferramentas em locais inadequados ou não realizando a limpeza, necessitando de intervenção constante.',
        par: 'Manuseia os equipamentos de forma adequada na maior parte do tempo, mas requer lembretes pontuais sobre a limpeza ou guarda de algum item.',
        aut: 'Manuseia todos os equipamentos, ferramentas e instrumentos com o máximo cuidado, limpando-os e guardando-os corretamente por iniciativa própria.'
      },
      {
        id: 'c3',
        referencia: 'Demonstrar visão sistêmica.',
        nea: 'Não consegue compreender a relação entre as peças ou a importância da sua tarefa para o produto final, mesmo com o conjunto montado para análise.',
        apo: 'Foca apenas na execução da sua peça, demonstrando dificuldade em entender como ela irá interagir com as outras, necessitando de explicações constantes.',
        par: 'Compreende que as peças se montarão, mas precisa de questionamentos para relacionar a precisão dimensional com a funcionalidade do conjunto.',
        aut: 'Compreende e explica com precisão de cada peça individual afeta a montagem e o funcionamento final do subconjunto, propondo melhorias no processo.'
      },
      {
        id: 'c4',
        referencia: 'Elaborar plano de trabalho.',
        nea: 'Não consegue preencher o plano de trabalho, mesmo com auxílio constante, ou deixa a maior parte em branco.',
        apo: 'Preenche o plano de trabalho com a ajuda constante do docente, cometendo erros na sequência de operações e no cálculo de parâmetros.',
        par: 'Elaborar o plano de trabalho com autonomia, necessitando de pequenas correções na seleção de ferramentas ou no refinamento dos parâmetros.',
        aut: 'Elabora o plano de trabalho de forma completa e otimizada, propondo sequências eficientes e justificando a escolha dos parâmetros.'
      },
      {
        id: 'c5',
        referencia: 'Definir os parâmetros de usinagem.',
        nea: 'Não consegue realizar os cálculos de RPM ou avanço, mesmo com fórmulas e auxílio. Insere valores aleatórios ou perigosos na máquina.',
        apo: 'Realiza os cálculos de parâmetros de corte com a supervisão constante do docente, cometendo erros que precisam ser corrigidos.',
        par: 'Calcula os parâmetros de corte de forma autônoma para materiais e operações comuns, utilizando tabelas e fórmulas, necessitando de pequenas correções.',
        aut: 'Define e otimiza os parâmetros de corte para diferentes materiais e ferramentas, justificando as escolhas para obter melhor acabamento e vida útil da ferramenta.'
      },
      {
        id: 'c6',
        referencia: 'Realizar operações de baixa complexidade em fresadora.',
        nea: 'Demonstra grande dificuldade em operar a máquina, apresentando riscos à sua segurança e à do equipamento, mesmo com supervisão direta.',
        apo: 'Realiza as operações com supervisão e intervenção constante do docente para corrigir a postura, a fixação da peça ou o manuseio dos comandos.',
        par: 'Opera a máquina de forma segura e executa as operações corretamente, solicitando auxílio pontual em situações específicas.',
        aut: 'Realiza todas as operações com autonomia, segurança e precisão, otimizando o processo para obter um bom acabamento.'
      },
      {
        id: 'c7',
        referencia: 'Realizar operações de furação.',
        nea: 'Demonstra grande dificuldade em operar a furadeira, com fixação inadequada da peça e uso incorreto da ferramenta, apresentando risco à segurança.',
        apo: 'Realiza operações de furação com supervisão constante, necessitando de auxílio para alinhar o furo, controlar o avanço ou aplicar fluido de corte.',
        par: 'Executa operações de furação de forma segura e autônoma, atingindo as especificações do diâmetro e posição na maioria das vezes, com auxílio pontual.',
        aut: 'Realiza operações de furação (passante, cega, escareada) com autonomia, precisão e segurança, selecionando corretamente brocas e parâmetros.'
      }
    ]
  },
  {
    id: 'rub_crd_pacos',
    ucId: 'CRD',
    titulo: 'Ficha 02 - Uso de Paquímetro e Micrômetro',
    criterios: [
      {
        id: 'crd_1',
        referencia: 'Medição Dimensional Linear',
        nea: 'Não realiza leituras coerentes.',
        apo: 'Medições apresentam desvios frequentes.',
        par: 'Mede corretamente, com pequenos erros de paralaxe.',
        aut: 'Mede com total precisão e agilidade.'
      }
    ]
  }
];
