// src/utils.ts
import { CapacidadeTecnica, NivelDesempenho } from './types';

export const CAPACIDADES_OFICIAIS: CapacidadeTecnica[] = [
  // FUSI - Fundamentos da Usinagem
  { id: 'fusi_01', codigo: 'CAP. 01', descricao: 'Selecionar ferramentas aplicadas na usinagem de acordo com elementos da máquina.', ucId: 'FUSI' },
  { id: 'fusi_02', codigo: 'CAP. 02', descricao: 'Relacionar os processos de usinagem à sua aplicação na indústria.', ucId: 'FUSI' },
  { id: 'fusi_03', codigo: 'CAP. 03', descricao: 'Relacionar os tipos de manutenção à sua aplicação na indústria.', ucId: 'FUSI' },
  { id: 'fusi_04', codigo: 'CAP. 04', descricao: 'Elaborar o plano de trabalho de usinagem.', ucId: 'FUSI' },
  
  // CRD - Controle Dimensional
  { id: 'crd_01', codigo: 'CAP. 01', descricao: 'Interpretar normas técnicas aplicadas à metrologia dimensional.', ucId: 'CRD' },
  { id: 'crd_02', codigo: 'CAP. 02', descricao: 'Utilizar instrumentos de medição dimensional conforme procedimentos de calibração.', ucId: 'CRD' },
  
  // LIDT - Leitura e Interpretação de Desenho Técnico
  { id: 'lidt_01', codigo: 'CAP. 01', descricao: 'Interpretar projeções ortogonais e cortes em desenhos técnicos mecânicos.', ucId: 'LIDT' },
  { id: 'lidt_02', codigo: 'CAP. 02', descricao: 'Identificar cotagem, tolerâncias geométricas e dimensionais no desenho.', ucId: 'LIDT' }
];

export function getDescricaoRubrica(capacidadeId: string, nivel: NivelDesempenho): string {
  const rubricas: Record<NivelDesempenho, string> = {
    NSA: 'Não Satisfez: O estudante não demonstra o desenvolvimento mínimo da capacidade técnica.',
    APO: 'Com Apoio: Executa a operação necessitando de orientação constante do instrutor.',
    PAR: 'Parcial: Demonstra compreensão prática, mas comete pequenos desvios de tolerância ou processo.',
    AUT: 'Autônomo: Executa a tarefa com precisão técnica, segurança e total independência na oficina.'
  };
  return rubricas[nivel];
}
