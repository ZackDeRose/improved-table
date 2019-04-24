import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  createSuperlatives,
  Hero,
  HEROES,
  levelUp,
  Superlatives
} from '@improved-table/util-hero';
import { Observable, Subject, of } from 'rxjs';
import {
  map,
  scan,
  startWith,
  switchMap,
  shareReplay,
  publishReplay,
  refCount,
  tap
} from 'rxjs/operators';
import {
  Sort,
  MatPaginator,
  MatSort,
  SortDirection,
  PageEvent
} from '@angular/material';

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

export function levelUpHeroes(startingHeroes: {
  [name: string]: Hero;
}): (
  heroNamesToLevelUp: Observable<string>
) => Observable<{ [name: string]: Hero }> {
  return (heroNamesToLevelUp: Observable<string>) =>
    heroNamesToLevelUp.pipe(
      scan<string, { [index: string]: Hero }>(
        (acc, heroIndex) => ({
          ...acc,
          [heroIndex]: levelUp(acc[heroIndex])
        }),
        startingHeroes
      ),
      startWith(startingHeroes),
      publishReplay(1),
      refCount()
    );
}

export function tableModelPassesSearch(
  searchTerm$: Observable<string>,
  formControl: FormControl
): (
  currentHeroes: Observable<{ [name: string]: Hero }>
) => Observable<HeroTableModel[]> {
  return (currentHeroes: Observable<{ [name: string]: Hero }>) =>
    currentHeroes.pipe(
      map(obj => Object.values(obj)),
      map(heroes => heroes.map(heroToTableModel)),
      switchMap(tableModels =>
        searchTerm$.pipe(
          startWith(formControl.value),
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
      publishReplay(1),
      refCount()
    );
}

export function paginatorToPaging(): (
  pageEvents: Observable<PageEvent>
) => Observable<Page> {
  return (pageEvents: Observable<PageEvent>) =>
    pageEvents.pipe(
      map(pageEvent => ({
        current: pageEvent.pageIndex,
        size: pageEvent.pageSize
      })),
      startWith({ current: 0, size: 5 }),
      publishReplay(1),
      refCount()
    );
}

export function sortinatorToSorting(): (
  sortChangeEvents: Observable<Sort>
) => Observable<Sort> {
  return (sortChangeEvents: Observable<Sort>) =>
    sortChangeEvents.pipe(
      startWith({ active: '', direction: '' as SortDirection }),
      publishReplay(1),
      refCount()
    );
}

export function toDataOnPage(
  sorting: Observable<Sort>,
  paging: Observable<Page>
): (
  dataPassingSearch: Observable<HeroTableModel[]>
) => Observable<HeroTableModel[]> {
  return (dataPassingSearch: Observable<HeroTableModel[]>) =>
    dataPassingSearch.pipe(
      switchMap(data =>
        sorting.pipe(
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
        paging.pipe(
          map(page => {
            const { startingIndex, endingIndex } = indexForPage(page);
            return data.slice(startingIndex, endingIndex);
          })
        )
      )
    );
}

@Component({
  selector: 'improved-table-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) table: MatSort;
  heroTableModelKeys = heroTableModelKeys;
  columns = [...heroTableModelKeys, 'levelUp'];
  public searchForm = new FormControl('');

  // sources of truth
  public levelUpEvents$ = new Subject<string>();
  private _HEROES = HEROES;
  private _searchTerm$: Observable<string>;
  private _paginator$: Observable<PageEvent>; // created in afterViewInit
  private _sortinator$: Observable<Sort>; // created in afterViewInit

  // implementation detail observables
  private _heroes$: Observable<{
    [index: string]: Hero;
  }>;
  private _dataPassingSearch$: Observable<HeroTableModel[]>;
  private _paging$: Observable<Page>;
  private _sorting$: Observable<Sort>;

  // output observables
  public superlatives$: Observable<Superlatives>;
  public dataOnPage$: Observable<HeroTableModel[]>;
  public totalResults$: Observable<number>;
  public pageSize$: Observable<number>;

  ngOnInit() {
    this._heroes$ = this.levelUpEvents$.pipe(levelUpHeroes(this._HEROES));
    this.superlatives$ = this._heroes$.pipe(map(createSuperlatives));
    this._searchTerm$ = this.searchForm.valueChanges;
    this._dataPassingSearch$ = this._heroes$.pipe(
      tableModelPassesSearch(this._searchTerm$, this.searchForm)
    );
    this.totalResults$ = this._dataPassingSearch$.pipe(
      map(heroMap => Object.values(heroMap).length)
    );
  }

  ngAfterViewInit() {
    // init sources of truth that we needed view init for
    this._paginator$ = this.paginator.page;
    this._sortinator$ = this.table.sortChange;

    this._paging$ = this._paginator$.pipe(paginatorToPaging());
    this._sorting$ = this._sortinator$.pipe(sortinatorToSorting());
    this.pageSize$ = this._paging$.pipe(map(paging => paging.size));
    this.dataOnPage$ = this._dataPassingSearch$.pipe(
      toDataOnPage(this._sorting$, this._paging$)
    );
  }
}
