import { permissions } from 'kCore/common'

// Hook computing organisation abilities for a given user
export function defineOrganisationAbilities (subject, can, cannot) {
  if (subject) {
    // Create new organisations
    can('service', 'organisations')
    can('create', 'organisations')
    can('service', 'authorisations')

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
          can(['read', 'update'], 'members', { context: organisation._id })
        }
        if (role >= permissions.Roles.manager) {
          // The unique identifier of a service is its path not its name.
          // Indeed we have for instance a 'groups' service in each organisation.
          can('service', organisation._id.toString() + '/groups')
          can('create', 'groups', { context: organisation._id })
          can(['read', 'update'], 'members', { context: organisation._id })
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
