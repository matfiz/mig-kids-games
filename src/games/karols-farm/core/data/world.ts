import type { FieldDef, Building } from '../types';

export const FIELD_DEFS: FieldDef[] = [
  { id: 1, x: 2, y: 6, width: 3, height: 3, cost: 0 },
  { id: 2, x: 7, y: 6, width: 3, height: 3, cost: 225 },
  { id: 3, x: 12, y: 6, width: 3, height: 3, cost: 600 },
  { id: 4, x: 2, y: 11, width: 4, height: 3, cost: 1500 },
  { id: 5, x: 8, y: 11, width: 4, height: 3, cost: 3750 },
];

export const BUILDINGS: Building[] = [
  { id: 'well', name: 'Studnia', emoji: '\uD83E\uDEA3', x: 1, y: 2, width: 2, height: 2 },
  { id: 'market', name: 'Targ', emoji: '\uD83C\uDFEA', x: 14, y: 2, width: 2, height: 2 },
  { id: 'shop', name: 'Sklep', emoji: '\uD83D\uDED2', x: 8, y: 2, width: 2, height: 2 },
  { id: 'bed', name: 'Łóżko', emoji: '\uD83D\uDECF\uFE0F', x: 11, y: 2, width: 2, height: 2 },
];
