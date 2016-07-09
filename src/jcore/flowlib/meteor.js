/* eslint-disable no-unused-vars */

import type {
  QueryHandle,
  ObserveCallbacks,
  ObserveChangesCallbacks,
  Transform,
  Selector,
  QueryOptions,
  UpdateOptions,
  AllowOptions,
  SubscriptionHandle
} from '../flowtypes/meteorTypes'

import type {
  AggregationPipeline,
  AggregationOptions,
  AggregationCursor,
  Modifier
} from '../flowtypes/mongoTypes'

declare module NpmGlobal {
  declare function require(module: string): any;
}

declare var Npm: $Exports<'NpmGlobal'>;

type MatchPattern = any;

declare module TrackerGlobal {
  declare class Computation {
    stop(): void;
  }
  declare function autorun(runFunc: (comp: Computation) => any,
                           options?: {onError: (error: Error) => any}): Computation;
  declare function nonreactive(func: Function): void;
}

declare var Tracker: $Exports<'TrackerGlobal'>;

declare module MatchGlobal {
  declare function test(value: any, pattern: MatchPattern): boolean;
  declare function Optional(pattern: MatchPattern): MatchPattern;
  declare function ObjectIncluding(shape: {[key: string]: MatchPattern}): MatchPattern;
  declare var Any: MatchPattern;
  declare var Integer: MatchPattern;
  declare function OneOf(...patterns: MatchPattern[]): MatchPattern;
  declare function Where(condition: (value: any) => boolean): MatchPattern;
}

declare var Match: $Exports<'MatchGlobal'>;

declare function check(value: any, pattern: MatchPattern): void;

declare module MongoGlobal {
  declare class Cursor {
    count(): number;
    fetch(): Object[];
    forEach(callback: (doc: Object, index: number, cursor: Cursor) => any, thisArg?: any): void;
    map(callback: (doc: Object, index: number, cursor: Cursor) => any, thisArg?: any): Object[];
    observe(callbacks: ObserveCallbacks): QueryHandle;
    observeChanges(callbacks: ObserveChangesCallbacks): QueryHandle;
  }
  declare class ObjectID {
    constructor(hexString: string): void;
  }
  declare class Collection {
    _name: string;
    constructor(name: string, options?: {connection?: Object, transform?: Transform}): void;
    _ensureIndex(index: {[field: string]: number | 'Hashed' | 'Text' | '2dsphere' | '2d'}): void;
    find(selector?: Selector, opts?: QueryOptions): Cursor;
    findOne(selector?: Selector, opts?: QueryOptions): ?Object;
    insert(document:Object, callback?: (error: ?Error, id?: string) => any): string;
    update(selector: Selector, modifier: Modifier, options?: UpdateOptions, callback?: (error: ?Error, numAffected?: number) => any): number;
    upsert(selector: Selector, modifier: Modifier, options?: UpdateOptions, callback?: (error: ?Error, numAffected?: number) => any): {numberAffected: ?number, insertedId: ?string};
    remove(selector: Selector, callback?: (error: ?Error) => any): number;
    allow(options: AllowOptions): void;
    deny(options: AllowOptions): void;
    rawCollection(): Object;
    rawDatabase(): Object;
    attachSchema(schema: MatchPattern): void;
    aggregate(pipeline: AggregationPipeline, options?: AggregationOptions): AggregationCursor;
  }
}

declare var Mongo: $Exports<'MongoGlobal'>;

var StandardError = Error

declare module MeteorGlobal {
  declare class LiveQueryHandle {}
  declare class Error {}
  declare var rootPath: string; // from the ostrio:meteor-root package
  declare var absolutePath: string; // from the ostrio:meteor-root package
  declare var users: Mongo.Collection;
  declare var settings: Object;
  declare var isClient: boolean;
  declare var isServer: boolean;
  declare var isCordova: boolean;
  declare function sleep(delay: number): void;
  declare function user() : Object;
  declare function userId() : string;
  declare function loggingIn(): boolean;
  declare function loginWithPassword(user: string, password: string, callback?: (error: ?StandardError) => any): void;
  declare function logout(callback?: (error: ?StandardError) => any): void;
  declare function logoutOtherClients(callback?: (error: ?StandardError) => any): void;
  declare function call(method: string, ...args: any[]): any;
  declare function publish(handle: string, callback: Function): ?Mongo.Cursor | ?Array<Mongo.Cursor>;
  declare function subscribe(handle: string, ...args: any[]): SubscriptionHandle;
  declare function methods(methods: {[methodName: string]: Function}): void;
  declare function wrapAsync(callback: Function): Function;
  declare function bindEnvironment(func: Function): Function;
}

declare var Meteor: $Exports<'MeteorGlobal'>;

declare module AccountsGlobal {
  declare function createUser(options: {
    username?: string,
    email?: string,
    password?: string,
    profile?: Object
  }, callback?: (err?: Error) => any): string;
  declare function findUserByUsername(username: string): ?{_id: string};
  declare function findUserByEmail(email: string): ?{_id: string};
  declare function setUsername(userId: string, newUsername: string): void;
  declare function setPassword(userId: string, newPassword: string, options?: {logout?: boolean}): void;
  declare function forgotPassword(options: {email: string}, callback?: (error?: Error) => any): void;
  declare function changePassword(oldPassword: string, newPassword: string, callback?: (error?: Error) => any): void;
  declare function resetPassword(token: string, newPassword: string, callback?: (error?: Error) => any): void;
  declare function _hashPassword(password: string): mixed; // I haven't actually checked what type it returns
  declare function sendResetPasswordEmail(userId: string, email?: string): void;
  declare function sendEnrollmentEmail(userId: string, email?: string): void;
  declare function sendVerificationEmail(userId: string, email?: string): void;
  declare function onResetPasswordLink(callback: (token: string, done: Function) => any): void;
  declare function onEnrollmentLink(callback: (token: string, done: Function) => any): void;
  declare function onEmailVerificationLink(callback: (token: string, done: Function) => any): void;
  declare function addEmail(userId: string, newEmail: string, verified?: boolean): void;
  declare function removeEmail(userId: string, email: string): void;
  declare function verifyEmail(token: string, callback?: (error?: Error) => any): void;
  declare function registerLoginHandler(loginRequest: Object): ?{userId: string};
  declare function callLoginMethod(options: {methodArguments: any[], userCallback?: Function}): void;
}

declare var Accounts: $Exports<'AccountsGlobal'>;

declare var WebApp: Object;
