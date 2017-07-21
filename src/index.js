import makeDebug from 'debug'
import services from './services'
// A shorter version of all of this should be the following
/*
export * as hooks from './hooks'
export * from './service'
*/
// However for now we face a bug in babel so that transform-runtime with export * from 'x' generates import statements in transpiled code
// Tracked here : https://github.com/babel/babel/issues/2877
import { createOrganisationServices, removeOrganisationServices } from './hooks'
export let hooks = { createOrganisationServices, removeOrganisationServices }

const debug = makeDebug('kaelia:kTeam')

export default function init () {
  const app = this

  debug('Initializing kaelia team')
  app.configure(services)
}
