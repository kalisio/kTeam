import logger from 'loglevel'

// We faced a bug in babel so that transform-runtime with export * from 'x' generates import statements in transpiled code
// Tracked here : https://github.com/babel/babel/issues/2877
// We tested the workaround given here https://github.com/babel/babel/issues/2877#issuecomment-270700000 with success so far
export * from '../common'
export * from './guards'
export * as mixins from './mixins'

export default function init () {
  const api = this

  logger.debug('Initializing kalisio team')

  api.declareService('organisations')
  api.declareService('authorisations')
  api.declareService('members', { context: true })
  api.declareService('groups', { context: true })
}
