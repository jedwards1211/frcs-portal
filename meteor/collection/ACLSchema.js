export const ACLEntry = Match.OneOf({
  user: String,
  permission: String,
}, {
  group: String,
  permission: String,
  partition: Match.Optional(String)
}, {
  role: String,
  permission: String,
  partition: Match.Optional(String)
});

export default [ACLEntry];
