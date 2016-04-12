export default [
  Match.OneOf({
    user: String,
    permission: String
  }, {
    group: String,
    permission: String
  }, {
    role: String,
    permission: String
  })
];
