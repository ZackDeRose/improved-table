export type Type =
  | 'Fire'
  | 'Water'
  | 'Grass'
  | 'Rock'
  | 'Electric'
  | 'Holy'
  | 'Dark'
  | 'Arcane'
  | 'Air'
  | 'Toxic'
  | 'Normal';

export interface HeroStats {
  attack: number;
  defense: number;
  speed: number;
  healing: number;
  recovery: number;
  health: number;
}

export const stats: (keyof HeroStats)[] = [
  'attack',
  'defense',
  'speed',
  'healing',
  'recovery',
  'health'
];

export interface Hero {
  name: string;
  types: Type[];
  stats: HeroStats;
}
