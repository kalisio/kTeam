import makeDebug from 'debug'
import services from './services'
import { Store } from './store'

// We faced a bug in babel so that transform-runtime with export * from 'x' generates import statements in transpiled code
// Tracked here : https://github.com/babel/babel/issues/2877
// We tested the workaround given here https://github.com/babel/babel/issues/2877#issuecomment-270700000 with success so far
export * as hooks from './hooks'
export * from './permissions'

const debug = makeDebug('kalisio:kTeam')

export default function init () {
  const app = this

 // Listen to the 'created' event on the organisation
  const users = app.getService('organisations')
  users.on('created', organisation => {
    Store.set('organisation', organisation)
    // Check whether we need to update the current organisation
    //if (organisation._id === Store.get('user._id')) {
    //  Store.set('organisation', organisation)
    //}
  })

  debug('Initializing kalisio team')

  app.configure(services)
}
