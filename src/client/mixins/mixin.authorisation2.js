import logger from 'loglevel'
import { Events } from 'quasar'
import { Store } from 'kCore/client'

let authorisationMixin = {
  props: {
    scope: {
      type: String,
      required
    },
    subjectService: {
      type: String,
      default: 'users'
    },
    resourceId: {
      type: Number,
      required
    },
    resourceService: {
      type: String,
      required
    }
  },
  methods: {
    create (subjectId, permission) {
      return this.authorisationService.create({
        scope: this.scope,
        permissions: permission,
        subjects: this.subjectId.toString(),
        subjectsService: this.subjectService,
        resource: this.resourceId.toString(),
        resourcesService: this.resourceService
      })
    },
    remove (subjectId) {
      return authorisationService.remove(this.resourceId, {
        query: {
          scope: this.scope,
          subjects: this.subjectId.toString(),
          subjectsService: this.subjectService,
          resourcesService: this.resourceService
        }
      })
    }
  },
  created () {
    this.authorisationService = this.$api.getService('authorisations')
  }
}

Store.set('mixins.authorisation', authorisationMixin)

export default authorisationMixin
