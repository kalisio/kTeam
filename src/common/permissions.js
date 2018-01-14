import { permissions } from 'kCore/common'
import _ from 'lodash'

// Hook computing organisation abilities for a given user
export function defineOrganisationAbilities (subject, can, cannot) {
  if (subject) {
    // Create new organisations
    can('service', 'organisations')
    can('create', 'organisations')

    if (subject.organisations) {
      subject.organisations.forEach(organisation => {
        // Generic rules for resources
        permissions.defineResourceRules(subject, organisation, 'organisations', can)
        // Specific rules for organisations
        const role = permissions.Roles[organisation.permissions]
        if (role >= permissions.Roles.member) {
          // The unique identifier of a service is its path not its name.
          // Indeed we have for instance a 'groups' service in each organisation.
          can('service', organisation._id.toString() + '/members')
          can('read', 'members', { context: organisation._id })
          can('service', organisation._id.toString() + '/tags')
          can('read', 'tags', { context: organisation._id })
          can('service', organisation._id.toString() + '/groups')
          if (role < permissions.Roles.manager) {
            can('read', 'groups', { context: organisation._id })
          }
        }
        if (role >= permissions.Roles.manager) {
          // The unique identifier of a service is its path not its name.
          // Indeed we have for instance a 'groups' service in each organisation.
          can('update', 'members', { context: organisation._id })
          can('create', 'groups', { context: organisation._id })
          can(['create', 'remove'], 'tags', { context: organisation._id })
        }
      })
    }
  }
}

// Hook computing group abilities for a given user
export function defineGroupAbilities (subject, can, cannot) {
  if (subject) {
    if (subject.groups) {
      subject.groups.forEach(group => {
        // Generic rules for resources
        permissions.defineResourceRules(subject, group, 'groups', can)
        // No specific rules for groups
      })
    }
  }
}

// Helper functions to find the members of a given organisation
export function findMembersOfOrganisation (userService, organisationId, role) {
  return permissions.findSubjectsForResource(userService, 'organisations', organisationId, role)
}

// Helper functions to find the members of a given group
export function findMembersOfGroup (memberService, groupId, role) {
  return permissions.findSubjectsForResource(memberService, 'groups', groupId, role)
}

export function getRoleForOrganisation (user, organisationId) {
  let result = _.find(user.organisations, { '_id': organisationId })
  if (!_.isUndefined(result)) return result.permissions
  return undefined
}

export function getRoleForGroup (user, organisationId, groupId) {
  let result = _.find(user.groups, { 'context': organisationId, '_id': groupId })
  if (!_.isUndefined(result)) return result.permissions
  return undefined
}
