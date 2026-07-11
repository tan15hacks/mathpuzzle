import type { DifficultyTier } from '../puzzles/PuzzleTypes';

export type ScreenName =
  | 'splash'
  | 'menu'
  | 'categories'
  | 'levels'
  | 'puzzle'
  | 'daily'
  | 'progress'
  | 'settings'
  | 'about'
  | 'debug';

export interface Route {
  screen: ScreenName;
  categoryId?: string;
  tier?: DifficultyTier;
  puzzleId?: string;
  daily?: boolean;
}

export class Router {
  private history: Route[] = [{ screen: 'splash' }];

  get current(): Route {
    return this.history[this.history.length - 1]!;
  }

  push(route: Route): Route {
    this.history.push(route);
    return route;
  }

  replace(route: Route): Route {
    this.history[this.history.length - 1] = route;
    return route;
  }

  back(): Route | null {
    if (this.history.length <= 1) return null;
    this.history.pop();
    return this.current;
  }

  reset(route: Route): Route {
    this.history = [route];
    return route;
  }
}
