import { createOrganisationServices, removeOrganisationServices, createPrivateOrganisation, removePrivateOrganisation } from './organisation'

let hooks = {
  createOrganisationServices,
  removeOrganisationServices,
  createPrivateOrganisation,
  removePrivateOrganisation
}

export default hooks
