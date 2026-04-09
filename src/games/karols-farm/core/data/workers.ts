import type { WorkerTierDef } from '../types';

export const WORKER_TIERS: WorkerTierDef[] = [
  {
    tier: 0,
    name: 'Pomocnik',
    cost: 375,
    speed: 1.3,
    waterMax: 3,
    carryCapacity: 1,
    color: '#4488ff',
  },
  {
    tier: 1,
    name: 'Robotnik',
    cost: 1050,
    speed: 2.0,
    waterMax: 6,
    carryCapacity: 2,
    color: '#ff8844',
  },
  {
    tier: 2,
    name: 'Specjalista',
    cost: 2700,
    speed: 2.8,
    waterMax: 10,
    carryCapacity: 4,
    color: '#44bb44',
  },
  {
    tier: 3,
    name: 'Ekspert',
    cost: 7500,
    speed: 3.8,
    waterMax: 16,
    carryCapacity: 7,
    color: '#aa44ff',
  },
  {
    tier: 4,
    name: 'Mistrz',
    cost: 18000,
    speed: 5.0,
    waterMax: 25,
    carryCapacity: 12,
    color: '#ffcc00',
  },
];
