/* @flow */

export type Action = {
  type: string,
  error?: boolean,
  payload?: any,
  meta?: Object,
};

export type Store = {
  dispatch: (action: Action) => any,
  getState: () => Object,
};

export type Reducer = (state: Object, action: Action) => Object;

export type Middleware = (store: Store) => (next: (action: Action) => any) => (action: Action) => any;
