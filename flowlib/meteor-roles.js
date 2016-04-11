type User = string | {_id: string};

declare module RolesGlobal {
  declare function createRole(name: string): void;

  declare function addRolesToParent(roles: string | string[],
                                    parentRole: string): void;

  declare function removeRolesFromParent(roles: string | string[],
                                         parentRole: string): void;

  declare function addUsersToRoles(users: User | User[],
                                   roles: string | string[],
                                   options?: {
                                     partition?: string,
                                     ifExists?: boolean
                                   }): void;

  declare function setUserRoles(users: User | User[],
                                roles: string | string[],
                                options?: {
                                  partition?: string,
                                  ifExists?: boolean
                                }): void;

  declare function removeUsersFromRoles(users: User | User[],
                                        roles: string | string[],
                                        options?: {
                                          partition?: string
                                        }): void;

  declare function userIsInRole(user: User,
                                roles: string | string[],
                                options?: string | {
                                  partition?: string,
                                  anyPartition?: boolean
                                }): boolean;

  declare function getRolesForUser(user: User,
                                   options?: {
                                     partition?: string,
                                     anyPartition?: boolean,
                                     fullObjects?: boolean,
                                     onlyAssigned: boolean
                                   }): any[];

  declare function getAllRoles(queryOptions?: Object): Mongo.Cursor;

  declare function getUsersInRole(roles: string | string[],
                                  options?: string | {
                                    partition?: string,
                                    anyPartition?: boolean,
                                    queryOptions?: Object
                                  }): Mongo.Cursor;

  declare function getPartitionsForUser(user: User,
                                        roles: string | string[]): any[];

  declare function renamePartition(oldName: string,
                                   newName: string): void;

  declare function removePartition(name: string): void;
}

declare var Roles: $Exports<'RolesGlobal'>;
