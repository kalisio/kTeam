import path from 'path'

module.exports = function () {
  const app = this

  app.createService('organisations', path.join(__dirname, '..', 'models'), path.join(__dirname, '..', 'services'))
}
