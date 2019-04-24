import { Hero } from './hero.interface';

export function levelUp(hero: Hero): Hero {
  const attack = Math.round(hero.stats.attack * (1 + Math.random() / 8));
  const defense = Math.round(hero.stats.defense * (1 + Math.random() / 8));
  const speed = Math.round(hero.stats.speed * (1 + Math.random() / 8));
  const recovery = Math.round(hero.stats.recovery * (1 + Math.random() / 8));
  const healing = Math.round(hero.stats.healing * (1 + Math.random() / 8));
  const health = Math.round(hero.stats.health * (1 + Math.random() / 8));

  const newHero = {
    ...hero,
    stats: {
      attack,
      defense,
      speed,
      recovery,
      healing,
      health
    }
  };

  return newHero;
}
