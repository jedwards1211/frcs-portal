declare module RolesGlobal {
  declare function userIsInRole(user: any, roleName: string) : boolean;
}

declare var Roles: $Exports<'RolesGlobal'>;
