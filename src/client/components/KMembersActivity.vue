<template>
  <div>
    <!-- 
      Members collection
     -->
    <k-grid ref="members" service="members" :actions="actions.member" />
    <k-fab :actions="actions.members" />
    <!-- 
      Router view to enable routing to modals
     -->
    <router-view service="members" backRoute="members-activity"></router-view>
  </div>
</template>

<script>
import { mixins as kCoreMixins } from 'kCore/client'
import { Dialog } from 'quasar'

export default {
  name: 'k-members-activity',
  mixins: [kCoreMixins.baseActivity],
  props: {
    contextId: {
      type: String,
      required: true
    }
  },
  methods: {  
    refreshActions () {
      this.clearActions()
      // Tabbar actions
      this.registerTabAction({ name: 'members', label: 'Members', icon: 'description', route: { 
        name: 'members-activity', params: { contextId: this.contextId } } 
      })
      this.registerTabAction({ name: 'groups', label: 'Groups', icon: 'credit_card', route: { 
        name: 'groups-activity', params: { contextId: this.contextId } } 
      })
      this.$store.patch('tabBar', { currentTab: 'members' })
      // Collection actions
      if (this.$can('create', 'authorisations', this.contextId, { resource: this.contextId })) {
        this.registerAction('members', { 
          name: 'add-member', label: 'Add', icon: 'person_add', route: { 
            name: 'add-member', params: {} } 
        })
        this.registerAction('members ', { 
          name: 'invite-member', label: 'Invite', icon: 'email', route: { 
            name: 'invite-member', params: {} } 
        })
      }
      this.registerAction('member', { 
        name: 'remove-member', label: 'Remove', icon: 'remove_circle',
        permissions: { operation: 'remove', service: 'members', context: this.contextId },
        handler: this.removeMember 
      })
      this.registerAction('member', { 
        name: 'edit-member', label: 'Edit', icon: 'description',
        permissions: { operation: 'update', service: 'members', context: this.contextId },
        route: { name: 'edit-member', params: { perspective: 'profile' } }
      })
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