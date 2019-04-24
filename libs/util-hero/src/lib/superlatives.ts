import { Hero, stats, HeroStats } from './hero.interface';

export interface Superlatives {
  highestAttack: string | null;
  lowestAttack: string | null;
  highestDefense: string | null;
  lowestDefense: string | null;
  highestSpeed: string | null;
  lowestSpeed: string | null;
  highestHealth: string | null;
  lowestHealth: string | null;
  highestRecovery: string | null;
  lowestRecovery: string | null;
  highestHealing: string | null;
  lowestHealing: string | null;
}

export function highestKey(key: string) {
  if (stats.includes(key as keyof HeroStats)) {
    const capitalizedStat = key.slice(0, 1).toUpperCase() + key.slice(1);
    return `highest${capitalizedStat}`;
  }
  return null;
}

export function lowestKey(key: string) {
  if (stats.includes(key as keyof HeroStats)) {
    const capitalizedStat = key.slice(0, 1).toUpperCase() + key.slice(1);
    return `lowest${capitalizedStat}`;
  }
  return null;
}

export function createSuperlatives(heroes: {
  [index: string]: Hero;
}): Superlatives {
  const builder = {};
  for (const stat of stats) {
    const capitalized = stat.slice(0, 1).toUpperCase() + stat.slice(1);
    builder[`highest${capitalized}`] = null;
    builder[`lowest${capitalized}`] = null;
  }
  const superlatives = { ...builder } as Superlatives;

  for (const hero of Object.values(heroes)) {
    for (const stat of stats) {
      const highKey = highestKey(stat);
      const lowKey = lowestKey(stat);
      if (
        !superlatives[highKey] ||
        hero.stats[stat] > heroes[superlatives[highKey]].stats[stat]
      ) {
        superlatives[highKey] = hero.name;
      }
      if (
        !superlatives[lowKey] ||
        hero.stats[stat] < heroes[superlatives[lowKey]].stats[stat]
      ) {
        superlatives[lowKey] = hero.name;
      }
    }
  }
  return superlatives;
}
