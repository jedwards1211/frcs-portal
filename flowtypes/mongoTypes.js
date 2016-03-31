/* @flow */

export type SortSpecifier = {[field: string]: Object | number};

export type AggregationPipeline = Array<Object>;

export type AggregationOptions = {
  explain?: boolean,
  allowDiskUse?: boolean,
  cursor?: {batchSize: number},
  bypassDocumentValidation?: boolean,
  readConcern?: {level: 'local' | 'majority'}
};

export type AggregationCursor = {
  hasNext: () => boolean,
  next: () => Object,
  toArray: () => Object[],
  forEach: (iteratee: (doc: Object) => any) => void,
  map: (iteratee: (doc: Object) => any) => any[],
  objsLeftInBatch: () => number,
  itcount: () => number,
  pretty: () => void
};
