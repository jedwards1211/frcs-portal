/* @flow */

export type QueryHandle = {
  stop(): void
};

export type ObserveCallbacks = {
  added?: (document: Object) => any,
  addedAt?: (document: Object, atIndex: number, before: string) => any,
  changed?: (newDocument: Object, oldDocument: Object) => any,
  changedAt?: (newDocument: Object, oldDocument: Object, atIndex: number) => any,
  removed?: (oldDocument: Object) => any,
  removedAt?: (oldDocument: Object, atIndex: number) => any,
  movedTo?: (document: Object, fromIndex: number, toIndex: number, before: string) => any
};

export type ObserveChangesCallbacks = {
  added?: (id: string, fields: Object) => any,
  addedBefore?: (id: string, fields: Object, before: string) => any,
  changed?: (id: string, fields: Object) => any,
  movedBefore?: (id: string, before: string) => any,
  removed?: (id: string) => any
};

export type SortSpecifier = {[field: string]: number} | Array<string | [string, 'asc' | 'desc']>;

export type Transform = (document: Object) => Object;
export type Selector = Object | Mongo.ObjectID | string;
export type QueryOptions = {
  sort?: SortSpecifier,
  skip?: number,
  limit?: number,
  fields?: {[field: string]: number},
  reactive?: boolean,
  transform?: Transform
};
export type UpdateOptions = {
  multi?: boolean,
  upsert?: boolean
};

export type AllowOptions = {
  insert?: (userId: string, doc: Object) => ?boolean,
  update?: (userId: string, doc: Object, fieldNames: string[], modifier: Object) => ?boolean,
  remove?: (userId: string, doc: Object) => ?boolean,
  fetch?: string[],
  transform?: Transform
};

export type SubscriptionHandle = {
  stop(): void,
  ready(): boolean,
  subscriptionId: string
};
