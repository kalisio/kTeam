import _ from 'lodash'
import sift from 'sift'
import makeDebug from 'debug'

const debug = makeDebug('kaelia:kTeam')

// Util function to look for a given resource in a scope
function findResource (scope, query) {
  let results = sift(query, scope)
  return results.length > 0 ? results[0] : null
}

export default {
  update (id, data, params) {
    let query = params.query
    // Make hook usable with query params as well
    let scopeName = data.scope || query.scope // Get scope name first
    return Promise.all(params.subjects.map(subject => {
      // Then retrieve the right scope on the subject
      let scope = _.get(subject, scopeName, [])
      // Then the target resource
      let resource = findResource(scope, { _id: params.resource._id.toString() })
      // On first authorisation create the resource in scope
      if (!resource) {
        resource = {
          name: params.resource.name,
          _id: params.resource._id.toString()
        }
        scope.push(resource)
      }
      // Hooks should have populate subject/resource,
      // now we have to set permissions on the given subject's scope
      resource.permissions = data.permissions || query.permissions
      // This cover the case when we create the scope on the first auth,
      // so that if the caller want to get back the update subject he can have it
      _.set(subject, scopeName, scope)
      return params.subjectsService.patch(subject._id, {
        [scopeName]: scope
      })
      .then(subject => {
        debug('Authorisation ' + data.permissions + ' set for subject ' + subject._id + ' on resource ' + params.resource._id + ' with scope ' + scopeName)
      })
    }))
  },

  remove (id, params) {
    let query = params.query
    let scopeName = query.scope // Get scope name first
    return Promise.all(params.subjects.map(subject => {
      // Then retrieve the right scope on the subject
      let scope = _.get(subject, scopeName, [])
      // Then the target resource
      scope.filter(sift({ _id: params.resource._id.toString() }))
      // This cover the case when we create the scope on the first auth,
      // so that if the caller want to get back the update subject he can have it
      _.set(subject, scopeName, scope)
      return params.subjectsService.patch(subject._id, {
        [scopeName]: scope
      })
      .then(subject => {
        debug('Authorisation unset for subject ' + subject._id + ' on resource ' + params.resource._id + ' with scope ' + scopeName)
      })
    }))
  }
}
