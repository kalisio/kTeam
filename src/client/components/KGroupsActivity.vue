<template>
  <div>
    <!-- 
      Groups collection
     -->
    <k-grid ref="groups" service="groups" :actions="actions.group" />
    <k-fab :actions="actions.groups" />
    <!-- 
      Router view to enable routing to modals
     -->
    <router-view service="groups" backRoute="groups-activity"></router-view>
  </div>
</template>

<script>
import { mixins as kCoreMixins } from 'kCore/client'
import { Dialog } from 'quasar'

export default {
  name: 'k-groups-activity',
  mixins: [kCoreMixins.baseActivity],
  props: {
    contextId: {
      type: String,
      default: ''
    },
    id : {
      type: String,
      default: '',
    },
    perspective: {
      type: String,
      default: '',
    }
  },
  methods: {
    refreshActions () {
      this.clearActions()
      // Tabbar actions
      this.registerTabAction({ name: 'members', label: 'Members', icon: 'description', 
        route: { name: 'members-activity', params: { contextId: this.contextId } } 
      })
      this.registerTabAction({ name: 'groups', label: 'Groups', icon: 'credit_card', 
        route: { name: 'groups-activity', params: { contextId: this.contextId } } 
      })
      this.$store.patch('tabBar', { currentTab: 'groups' })
      // Collection
      if (this.$can('create', 'groups', this.contextId)) {
        this.registerAction('groups', { 
          name: 'create-group', label: 'Create', icon: 'add', 
          route: { name: 'create-group', params: {} }
        })
      }
      this.registerAction('group', { 
        name: 'remove-group', label: 'Remove', icon: 'remove_circle',
        permissions: { operation: 'remove', service: 'groups', context: this.contextId },
        handler: this.removeGroup
      })
      this.registerAction('group', { 
        name: 'edit-group', label: 'Edit', icon: 'description', 
        permissions: { operation: 'update', service: 'groups', context: this.contextId },
        route: { name: 'edit-group', params: { contextId: this.contextId } }
      })
    },
    removeGroup (group) {
      Dialog.create({
        title: 'Remove ' + group.name + '?',
        message: 'Are you sure you want to remove ' + group.name + ' from your organisation ?',
        buttons: [
          'Cancel',
          {
            label: 'Ok',
            handler: () => {
              let groupsService = this.$api.getService('groups')
              groupsService.remove(group._id)
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