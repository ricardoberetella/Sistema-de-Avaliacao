import { OperacaoUsinagem } from './types';

export const OPERACOES_FUSI: OperacaoUsinagem[] = [
  { id: 'op_01', numero: 'OP. 01', titulo: 'FACEAR NO TORNO', maquina: 'TORNO' },
  { id: 'op_02', numero: 'OP. 02', titulo: 'FAZER FURO DE CENTRO', maquina: 'TORNO' },
  { id: 'op_03', numero: 'OP. 03', titulo: 'TORNEAR SUPERFÍCIE CILÍNDRICA', maquina: 'TORNO' },
  { id: 'op_04', numero: 'OP. 04', titulo: 'CHANFRAR NO TORNO', maquina: 'TORNO' },
  { id: 'op_05', numero: 'OP. 05', titulo: 'FRESAR SUPERFÍCIES PARALELAS', maquina: 'FRESA' },
  { id: 'op_06', numero: 'OP. 06', titulo: 'FRESAR SUPERFÍCIES PERPENDICULARES (ESQUADREJAR)', maquina: 'FRESA' },
  { id: 'op_07', numero: 'OP. 07', titulo: 'CORTAR NO TORNO (BEDAME / SANGRAMENTO)', maquina: 'TORNO' },
  { id: 'op_08', numero: 'OP. 08', titulo: 'FRESAR REBAIXOS E CANAIS', maquina: 'FRESA' },
  { id: 'op_09', numero: 'OP. 09', titulo: 'ROSCAR COM COSSINETE NO TORNO', maquina: 'TORNO' },
  { id: 'op_10', numero: 'OP. 10', titulo: 'FURAÇÃO EM FURADEIRA DE COLUNA', maquina: 'FURADEIRA' },
  { id: 'op_11', numero: 'OP. 11', titulo: 'ROSCAR MANUALMENTE COM MACHO NA BANCADA', maquina: 'BANCADA' },
  { id: 'op_12', numero: 'OP. 12', titulo: 'FURAÇÃO COORDENADA NA FRESADORA', maquina: 'FRESA' },
  { id: 'op_13', numero: 'OP. 13', titulo: 'AJUSTAGEM MANUAL E LIMAGEM TÉCNICA', maquina: 'BANCADA' },
  { id: 'op_14', numero: 'OP. 14', titulo: 'MONTAGEM E AJUSTES DE INTERFERÊNCIA', maquina: 'BANCADA' }
];
