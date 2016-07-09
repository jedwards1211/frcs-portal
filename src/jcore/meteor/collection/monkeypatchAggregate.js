Mongo.Collection.prototype.aggregate = function (pipeline, options) {
  var coll = this.rawCollection()
  return Meteor.wrapAsync(coll.aggregate.bind(coll))(pipeline, options)
}
