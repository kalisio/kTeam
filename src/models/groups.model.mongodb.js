module.exports = function (app, options) {
  options.Model = options.db || app.db.collection('groups')
}
