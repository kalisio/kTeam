<template>
  <div>
    <k-grid ref="members" service="members" :actions="actions.member" />
    <k-fab :actions="actions.members" />
    <!-- 
      Router view to enable routing to modals
     -->
    <router-view service="members"></router-view>
  </div>
</template>

<script>
import { mixins as kCoreMixins } from 'kCore/client'
import { Dialog } from 'quasar'

export default {
  name: 'k-members-activity',
  mixins: [
    kCoreMixins.baseActivity
  ],
  props: {
    contextId: {
      type: String,
      required: true
    }
  },
  methods: {  
    refreshActions () {
      this.clearActions()
      if (this.$can('create', 'authorisations', this.contextId, { resource: this.contextId })) {
        this.registerAction('members', { 
          name: 'add-member', 
          label: 'Add', 
          icon: 'person_add', 
          route: { name: 'add-member', params: {} } 
        })
        this.registerAction('members', { 
          name: 'invite-member', 
          label: 'Invite', 
          icon: 'email', 
          route: { name: 'invite-member', params: {} } 
        })
      }
      if (this.$can('remove', 'authorisations', this.contextId, { resource: this.contextId })) {
        this.registerAction('member', { 
          name: 'remove-member', 
          label: 'Remove', 
          icon: 'remove_circle', 
          handler: this.removeMember 
        })
      }
      //if (this.$can('update', 'members', this.contextId, { resource: this.contextId })) {
        this.registerAction('member', { 
          name: 'edit-member', 
          label: 'Edit', 
          icon: 'description', 
          route: { name: 'edit-member', params: { perspective: 'profile' } }
        })
      //}
    },
    removeMember (member) {
      Dialog.create({
        title: 'Remove ' + member.name + '?',
        message: 'Are you sure you want to remove ' + member.name + ' from your organisation ?',
        buttons: [
          'Cancel',
          {
            label: 'Ok',
            handler: () => {
              let authorisationService = this.$api.getService('authorisations')
              authorisationService.remove(this.contextId, {
              query: {
                scope: 'organisations',
                subjects: member._id,
                subjectsService: 'users',
                resourcesService: 'organisations'
              }
            })
            .then(_ => {
              this.$refs.members.refreshCollection()
            })
            }
          }
        ]
      })
    }
  },
  created () {
    // Load the required components
    let loadComponent = this.$store.get('loadComponent')
    this.$options.components['k-grid'] = loadComponent('collection/KGrid')
    this.$options.components['k-fab'] = loadComponent('collection/KFab')
  }
}
</script>