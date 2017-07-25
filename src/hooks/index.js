import { createOrganisationServices, removeOrganisationServices, createPrivateOrganisation } from './organisation'

let hooks = {
  createOrganisationServices,
  removeOrganisationServices,
  createPrivateOrganisation
}

export default hooks
