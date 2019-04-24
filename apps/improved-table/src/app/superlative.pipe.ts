import { Pipe, PipeTransform } from '@angular/core';
import {
  Superlatives,
  HeroStats,
  highestKey,
  lowestKey
} from '@improved-table/util-hero';

@Pipe({
  name: 'superlative'
})
export class SuperlativePipe implements PipeTransform {
  transform(
    heroName: string,
    superlatives: Superlatives,
    stat: keyof HeroStats,
    highestOrLowest: 'highest' | 'lowest'
  ): boolean {
    const key =
      highestOrLowest === 'highest' ? highestKey(stat) : lowestKey(stat);
    return superlatives[key] && superlatives[key] === heroName;
  }
}
