import Promise from 'bluebird'
export default Promise.promisify(Meteor.call)
