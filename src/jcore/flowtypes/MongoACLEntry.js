export type MongoACLEntry = {
  userId: string,
  permission: string
} | {
  groupId: string,
  permission: string
} | {
  role: string,
  permission: string
};
