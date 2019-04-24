import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  createSuperlatives,
  Hero,
  HEROES,
  levelUp,
  Superlatives
} from '@improved-table/util-hero';
import { Observable, Subject, of } from 'rxjs';
import { map, scan, startWith, switchMap, shareReplay } from 'rxjs/operators';
import { Sort, MatPaginator, MatSort, SortDirection } from '@angular/material';

export interface HeroTableModel {
  name: string;
  types: string;
  health: number;
  attack: number;
  defense: number;
  speed: number;
  healing: number;
  recovery: number;
}

export const heroTableModelKeys: (keyof HeroTableModel)[] = [
  'name',
  'types',
  'health',
  'attack',
  'defense',
  'speed',
  'healing',
  'recovery'
];

export function heroToTableModel(hero: Hero): HeroTableModel {
  return {
    name: hero.name,
    types: hero.types.reduce(
      (acc, type, index) => (index === 0 ? type : `${acc}/${type}`),
      ''
    ),
    ...hero.stats
  };
}

export const DEFAULT_SORT: Sort = {
  direction: 'asc',
  active: 'name'
};

export interface Page {
  size: number;
  current: number;
}

export interface PageIndexes {
  startingIndex: number;
  endingIndex: number;
}

export function indexForPage({ size, current }: Page): PageIndexes {
  return {
    startingIndex: size * current,
    endingIndex: size * (current + 1)
  };
}

@Component({
  selector: 'improved-table-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) table: MatSort;
  heroTableModelKeys = heroTableModelKeys;
  columns = [...heroTableModelKeys, 'levelUp'];
  public levelUpEvents$ = new Subject<string>();
  private _heroes$: Observable<{
    [index: string]: Hero;
  }> = this.levelUpEvents$.pipe(
    scan<string, { [index: string]: Hero }>(
      (acc, heroIndex) => ({
        ...acc,
        [heroIndex]: levelUp(acc[heroIndex])
      }),
      HEROES
    ),
    startWith(HEROES),
    shareReplay(1)
  );
  public superlatives$: Observable<Superlatives> = this._heroes$.pipe(
    map(createSuperlatives)
  );
  private sorting$: Observable<Sort>;
  pagingForm = new FormGroup({
    size: new FormControl(5),
    current: new FormControl(0)
  });
  private _paging$: Observable<Page>;
  public search = new FormControl('');
  private _dataPassingSearch$: Observable<
    HeroTableModel[]
  > = this._heroes$.pipe(
    map(obj => Object.values(obj)),
    map(heroes => heroes.map(heroToTableModel)),
    switchMap(tableModels =>
      this.search.valueChanges.pipe(
        startWith(this.search.value),
        map(searchTerm =>
          tableModels.filter(model => {
            for (const key in model) {
              if (
                model[key]
                  .toString()
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              ) {
                return true;
              }
            }
            return false;
          })
        )
      )
    ),
    shareReplay(1)
  );
  public dataOnPage$: Observable<HeroTableModel[]> = of([]);
  public numberOfHeroesPassingSearch$ = this._dataPassingSearch$.pipe(
    map(heroMap => Object.values(heroMap).length)
  );
  public pageSize$: Observable<number> = of(5);

  ngAfterViewInit() {
    this._paging$ = this.paginator.page.pipe(
      map(pageEvent => ({
        current: pageEvent.pageIndex,
        size: pageEvent.pageSize
      })),
      startWith({ current: 0, size: 5 }),
      shareReplay(1)
    );
    this.sorting$ = this.table.sortChange.pipe(
      startWith({ active: '', direction: '' as SortDirection }),
      shareReplay(1)
    );
    this.pageSize$ = this._paging$.pipe(map(paging => paging.size));
    this.dataOnPage$ = this._dataPassingSearch$.pipe(
      switchMap(data =>
        this.sorting$.pipe(
          map(sorting =>
            !sorting.active || sorting.direction === ''
              ? data.sort((a, b) => (a.name > b.name ? 1 : -1))
              : data.sort((a, b) => {
                  let sortMagnitude =
                    a[sorting.active] > b[sorting.active] ? 1 : -1;
                  sortMagnitude *= sorting.direction === 'asc' ? 1 : -1;
                  return sortMagnitude;
                })
          )
        )
      ),
      switchMap(data =>
        this._paging$.pipe(
          map(page => {
            const { startingIndex, endingIndex } = indexForPage(page);
            return data.slice(startingIndex, endingIndex);
          })
        )
      )
    );
  }
}
