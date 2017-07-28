import _ from 'lodash'

function populateObject (serviceField, idField, nameServiceAs, nameIdAs) {
  return function (hook) {
    let app = hook.app
    let data = hook.data
    let params = hook.params
    let query = params.query

    // Check if not already done
    if (typeof _.get(params, nameIdAs || idField) === 'object') return Promise.resolve(hook)

    // Get service where we can find the object to populate
    // Make hook usable with query params as well
    let service = _.get(data, serviceField) || _.get(query, serviceField) // Name first
    service = app.getService(service) // Then real object
    // Then the object ID
    let id = _.get(data, idField) || _.get(query, idField)

    if (!service) {
      throw new Error(`Cannot find the ${serviceField} to dynamically populate.`)
    }
    if (!id) {
      throw new Error(`Cannot find the ${idField} to dynamically populate.`)
    }

    // Set the retrieved service on the same field or given one in hook params
    _.set(params, nameServiceAs || serviceField, service)

    return service.get(id).then(object => {
      if (!object) {
        throw new Error(`Cannot find object with id ${id} to dynamically populate.`)
      }
      // Set the retrieved object on the same field or given one in hook params
      _.set(params, nameIdAs || idField, object)
      return hook
    })
  }
}

function populateObjects (serviceField, idField, nameServiceAs, nameIdAs) {
  return function (hook) {
    let app = hook.app
    let data = hook.data
    let params = hook.params
    let query = params.query

    // Check if not already done
    if (Array.isArray(_.get(params, nameIdAs || idField))) return Promise.resolve(hook)

    // Get service where we can find the object to populate
    // Make hook usable with query params as well
    let serviceName = _.get(data, serviceField) || _.get(query, serviceField)
    let service = app.getService(serviceName)

    if (!service) {
      throw new Error(`Cannot find the service for ${serviceField} = ${serviceName} to dynamically populate.`)
    }

    // Set the retrieved service on the same field or given one in hook params
    _.set(params, nameServiceAs || serviceField, service)

    // Then the object ID
    let id = _.get(data, idField) || _.get(query, idField)
    // If no ID given we perform a find, no pagination to be sure we get all objects
    if (!id) {
      return service.find({ paginate: false }).then(objects => {
        // console.log(objects)
        // Set the retrieved objects on the same field or given one in hook params
        _.set(params, nameIdAs || idField, objects)
        return hook
      })
    } else {
      return service.get(id).then(object => {
        if (!object) {
          throw new Error(`Cannot find object for ${idField} = ${id} to dynamically populate.`)
        }
        // Set the retrieved object on the same field or given one in hook params
        _.set(params, nameIdAs || idField, [object])
        return hook
      })
    }
  }
}

export function populateSubjects (hook) {
  if (hook.type !== 'before') {
    throw new Error(`The 'populateSubject' hook should only be used as a 'before' hook.`)
  }

  return populateObjects('subjectsService', 'subjects')(hook)
}

export function populateResource (hook) {
  if (hook.type !== 'before') {
    throw new Error(`The 'populateResource' hook should only be used as a 'before' hook.`)
  }

  return populateObject('resourcesService', 'resource')(hook)
}
