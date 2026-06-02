// src/utils.ts
import { CapacidadeTecnica, NivelDesempenho } from './types';

export const CAPACIDADES_OFICIAIS: CapacidadeTecnica[] = [
  // FUSI - Fundamentos da Usinagem
  { id: 'fusi_cap1', codigo: 'CAP.01 (FUSI)', ucId: 'FUSI', descricao: 'Planejar o processo de usinagem convencional determinando ferramentas, parâmetros de corte e sequência operacional.' },
  { id: 'fusi_cap2', codigo: 'CAP.02 (FUSI)', ucId: 'FUSI', descricao: 'Operar torno mecânico convencional realizando operações de faceamento, torneamento cilíndrico, canais e roscas.' },
  { id: 'fusi_cap3', codigo: 'CAP.03 (FUSI)', ucId: 'FUSI', descricao: 'Operar fresadora mecânica convencional realizando superfícies planas, paralelas, esquadrejamento e canais.' },
  { id: 'fusi_cap4', codigo: 'CAP.04 (FUSI)', ucId: 'FUSI', descricao: 'Controlar as dimensões das peças usinadas aplicando técnicas de medição e segurança no trabalho.' },

  // CRD - Controle Dimensional
  { id: 'crd_cap1', codigo: 'CAP.01 (CRD)', ucId: 'CRD', descricao: 'Utilizar paquímetro mecânico e digital com resolução de 0,05mm e 0,02mm na validação de componentes mecânicos.' },
  { id: 'crd_cap2', codigo: 'CAP.02 (CRD)', ucId: 'CRD', descricao: 'Utilizar micrômetro externo com resolução de 0,01mm para medição de eixos e diâmetros de precisão.' },
  { id: 'crd_cap3', codigo: 'CAP.03 (CRD)', ucId: 'CRD', descricao: 'Realizar medições angulares utilizando goniômetro mecânico conforme especificações de desenho.' },

  // LIDT - Leitura e Interpretação de Desenho Técnico
  { id: 'lidt_cap1', codigo: 'CAP.01 (LIDT)', ucId: 'LIDT', descricao: 'Interpretar vistas ortográficas, cortes e seções de conjuntos mecânicos conforme normas ABNT.' },
  { id: 'lidt_cap2', codigo: 'CAP.02 (LIDT)', ucId: 'LIDT', descricao: 'Identificar tolerâncias lineares, geométricas e estados de superfície (rugosidade) em desenhos de fabricação.' },

  // CMAT - Ciência dos Materiais
  { id: 'cmat_cap1', codigo: 'CAP.01 (CMAT)', ucId: 'CMAT', descricao: 'Selecionar materiais metálicos (ferrosos e não-ferrosos) adequados ao processo de usinagem com base em suas propriedades.' },
  { id: 'cmat_cap2', codigo: 'CAP.02 (CMAT)', ucId: 'CMAT', descricao: 'Identificar a influência de tratamentos térmicos na usinabilidade e dureza dos aços operados na oficina.' }
];

export function getDescricaoRubrica(capacidadeId: string, nivel: NivelDesempenho): string {
  const descricoes: Record<NivelDesempenho, string> = {
    NSA: 'Não Satisfez: Não realiza a operação ou exige intervenção total para manter os padrões técnicos de tolerância.',
    APO: 'Com Apoio: Realiza a operação técnica apresentando dúvidas frequentes e necessitando de orientação constante do instrutor.',
    PAR: 'Parcial: Executa a tarefa com segurança, mas comete pequenos desvios de acabamento ou tempo de fabricação estabelecido.',
    AUT: 'Autônomo: Executa a operação com total precisão, respeitando tolerâncias do desenho, normas de segurança e tempo padrão.'
  };
  return descricoes[nivel];
}
