module.exports = function (app, options) {
  let db = options.db || app.db
  options.Model = db.collection('groups')
  options.Model.ensureIndex({ name: 1 })
}
