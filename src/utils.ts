// src/utils.ts
import { CapacidadeTecnica, NivelDesempenho } from './types';

export const CAPACIDADES_OFICIAIS: CapacidadeTecnica[] = [
  // FUSI - Fundamentos da Usinagem
  { id: 'fusi_ct1', codigo: 'FUSI - CT1', descricao: 'CONSTITUIR GEOMETRIAS EM COMPONENTES MECÂNICOS UTILIZANDO TORNOS CONVENCIONAIS.', ucId: 'FUSI' },
  { id: 'fusi_ct2', codigo: 'FUSI - CT2', descricao: 'CONSTITUIR GEOMETRIAS EM COMPONENTES MECÂNICOS UTILIZANDO FRESADORAS CONVENCIONAIS.', ucId: 'FUSI' },
  { id: 'fusi_cs1', codigo: 'FUSI - CS1', descricao: 'DEMONSTRAR ATENÇÃO A DETALHES NAS OPERAÇÕES DE USINAGEM.', ucId: 'FUSI' },
  { id: 'fusi_cs2', codigo: 'FUSI - CS2', descricao: 'TRABALHAR EM EQUIPE RESPEITANDO AS NORMAS DE SEGURANÇA E MEIO AMBIENTE.', ucId: 'FUSI' },

  // CRD - Controle Dimensional
  { id: 'crd_ct1', codigo: 'CRD - CT1', descricao: 'MEDIR COMPONENTES MECÂNICOS UTILIZANDO PAQUÍMETRO COM RESOLUÇÃO DE 0,05MM E 0,02MM.', ucId: 'CRD' },
  { id: 'crd_ct2', codigo: 'CRD - CT2', descricao: 'MEDIR COMPONENTES MECÂNICOS UTILIZANDO MICRÔMETRO MILESIMAL.', ucId: 'CRD' },
  { id: 'crd_cs1', codigo: 'CRD - CS1', descricao: 'DEMONSTRAR RIGOR TÉCNICO NO MANUSEIO DE INSTRUMENTOS DE MEDIÇÃO.', ucId: 'CRD' },

  // LIDT - Leitura e Interpretação de Desenho Técnico
  { id: 'lidt_ct1', codigo: 'LIDT - CT1', descricao: 'INTERPRETAR PROJEÇÕES ORTOGRÁFICAS E CORTES EM DESENHOS MECÂNICOS.', ucId: 'LIDT' },
  { id: 'lidt_ct2', codigo: 'LIDT - CT2', descricao: 'INTERPRETAR TOLERÂNCIAS GEOMÉTRICAS E DIMENSIONAIS EM PROJETOS.', ucId: 'LIDT' },

  // CMAT - Ciência dos Materiais
  { id: 'cmat_ct1', codigo: 'CMAT - CT1', descricao: 'IDENTIFICAR MATERIAIS METÁLICOS SEGUNDO SUAS PROPRIEDADES MECÂNICAS E APLICAÇÕES.', ucId: 'CMAT' }
];

export function getDescricaoRubrica(capacidadeId: string, nivel: NivelDesempenho): string {
  const rubricas: { [key: string]: { [key in NivelDesempenho]: string } } = {
    padrao: {
      NSA: 'Não Atendeu: O estudante não demonstra a capacidade técnica avaliada.',
      APO: 'Atendeu Parcialmente com Orientação: Executa a tarefa apenas se houver intervenção constante do instrutor.',
      PAR: 'Atendeu Parcialmente: Executa de forma autônoma, apresentando pequenas falhas que não comprometem o resultado.',
      AUT: 'Atendeu com Autonomia: Executa a operação com perfeição, precisão e total domínio técnico.'
    }
  };
  return rubricas[capacidadeId]?.[nivel] || rubricas['padrao'][nivel];
}
