/* @flow */

import {Iterable} from 'immutable'
import _ from 'lodash'

export default function FakeImmutable(value: mixed) {
  if (Iterable.isIterable(value)) return value
  if (value instanceof Object) return new _FakeImmutable(value)
  return value
}

class _FakeImmutable {
  obj: Object;
  constructor(obj: Object) {
    this.obj = obj
  }
  /* flow-issue(jcore-portal) */
  get size(): number {
    return _.size(this.obj)
  }
  get(key: any): any {
    return FakeImmutable(_.get(this.obj, [key]))
  }
  has(key: any): boolean {
    return _.has(this.obj, [key])
  }
  getIn(path: any[]): any {
    return FakeImmutable(_.get(this.obj, path))
  }
  hasIn(path: any[]): boolean {
    return _.has(this.obj, path)
  }
  toJS(): Object {
    return this.obj
  }
  toArray(): Array<any> {
    if (Array.isArray(this.obj)) return this.obj.map(FakeImmutable)
    return _.values(this.obj).map(FakeImmutable)
  }
  toObject(): Object {
    return _.mapValues(this.obj, FakeImmutable)
  }
  entries: () => any = function* () {
    for (let [key, value] of this.obj.entries()) yield [key, FakeImmutable(value)]
  };
  values: () => any = function* () {
    for (let value of this.obj.values()) yield FakeImmutable(value)
  };
  keys: () => any = function* () {
    yield* this.obj.keys()
  };
  map: Function = (...args) => {
    if (Array.isArray(this.obj)) return FakeImmutable(this.obj.map(...args))
    return FakeImmutable(_.mapValues(this.obj, ...args))
  };
  filter: Function = (...args) => {
    if (Array.isArray(this.obj)) return FakeImmutable(this.obj.filter(...args))
    return FakeImmutable(_.pickBy(this.obj, ...args))
  };
  groupBy(iteratee: Function) {
    return FakeImmutable(_.groupBy(this.obj, iteratee))
  }
}

