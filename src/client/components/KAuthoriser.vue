<template>
  <k-dialog ref="dialog" :title="title" :actions="['Authorize']" @action-triggered="onActionTriggered">
    <div slot="dialog-content" class="column xs-gutter">
      <k-autocomplete :services="subjectSearchServices()" @item-selected="onSubjectSelected" />
      <div class="row justify-around">
        <div>
          As 
        </div>
        <div>
          <q-option-group
            inline
            color="secondary"
            type="radio"
            v-model="permission"
            :options="permissions" />
        </div>
      </div>
    </div>
  </k-dialog>
</template>

<script>
import { QBtn, QOptionGroup } from 'quasar'

export default {
  name: 'k-authoriser',
  components: {
    QOptionGroup,
    QBtn
  },
  props: {
    title: {
      type: String,
      default: 'Authorise...'
    },
    scope: {
      type: String,
      required: true
    },
    resourceId: {
      type: String,
      required: true
    },
    resourceService: {
      type: String,
      required: true
    },
    permissions: {
      type: Array,
      default: function () {
        return [
          { label: 'Member', value: 'member' },
          { label: 'Manager', value: 'manager' },
          { label: 'Owner', value: 'owner' }
        ]
      }
    },
    query: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data () {
    return {
      permission: 'member',
      subject: null
    }
  },
  methods: {
    onActionTriggered () {
      // Close this dialog
      let authorisationService = this.$api.getService('authorisations')
      authorisationService.create({
        scope: this.scope,
        permissions: this.permission,
        subjects: this.subject._id,
        subjectsService: 'users',
        resource: this.resourceId,
        resourcesService: this.resourceService
      })
      .then(_ => {
        this.$emit('authorised')
      })
      this.close()
    },
    open () {
      this.$refs.dialog.open()
    },
    close () {
      this.$refs.dialog.close()
    },
    subjectSearchServices () {
      let services = [{
        service: 'users',
        baseQuery: this.query,
        field: 'name',
        icon: 'user'
      }]
      return services
    },
    onSubjectSelected (subject) {
      this.subject = subject
    }
  },
  created () {
    // Load the required components
    let loadComponent = this.$store.get('loadComponent')
    this.$options.components['k-dialog'] = loadComponent('frame/KDialog')
    this.$options.components['k-autocomplete'] = loadComponent('collection/KAutocomplete')
  }
}
</script>