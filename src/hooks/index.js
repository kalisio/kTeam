import { populateSubjects, populateResource } from './authorisation'
import { createOrganisationServices, removeOrganisationServices,
         createOrganisationAuthorisations, removeOrganisationAuthorisations,
         createPrivateOrganisation, removePrivateOrganisation } from './organisation'

let hooks = {
  createOrganisationServices,
  removeOrganisationServices,
  createOrganisationAuthorisations,
  removeOrganisationAuthorisations,
  createPrivateOrganisation,
  removePrivateOrganisation,
  populateSubjects,
  populateResource
}

export default hooks
