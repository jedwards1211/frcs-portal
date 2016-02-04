/* @flow */

export type Action = {
  type: string,
  error?: boolean,
  payload?: ?any,
  meta?: Object,
};

export type Store<S> = {
  dispatch: (action: Action) => ?any,
  getState: () => S,
};

export type Reducer<S> = (state: S, action: Action) => ?any;

export type Middleware = (store: Store) => (next: (action: Action) => ?any) => (action: Action) => ?any;
