<template>
  <div>
    <!-- 
      Groups collection
    -->
    <k-grid service="groups" :renderer="renderer" :actions="actions.group" />
    <!-- 
      Router view to enable routing to modals
    -->
    <router-view service="groups" :router="router()"></router-view>
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
  data () {
    return {
      renderer: { 
        component: 'KGroupCard', 
        props: {
          options: {
            avatar: { size: 96 }
          }
        } 
      }
    }
  },
  methods: {
    router () {
      return { 
        onApply: { name: 'groups-activity', params: { contextId: this.contextId } },
        onDismiss: { name: 'groups-activity', params: { contextId: this.contextId } }
      }
    },
    refreshActivity () {
      this.clearActivity()
      this.setTitle(this.$store.get('context.name'))
      // Tabbar actions
      this.registerTabAction({ 
        name: 'members', label: 'Members', icon: 'group',
        route: { name: 'members-activity', params: { contextId: this.contextId } } 
      })
      this.registerTabAction({ 
        name: 'groups', label: 'Groups', icon: 'group_work',
        route: { name: 'groups-activity', params: { contextId: this.contextId } },
        default: true
      })
      // Fab actions
      if (this.$can('create', 'groups', this.contextId)) {
        this.registerFabAction({ 
          name: 'create-group', label: 'Create a group', icon: 'add', 
          route: { name: 'create-group', params: { contextId: this.contextId } }
        })
      }
      // Item actions
      this.registerAction('group', { 
        name: 'edit-group', label: 'Edit', icon: 'description', scope: 'pane',
        permissions: { operation: 'update', service: 'groups', context: this.contextId },
        route: { name: 'edit-group', params: { contextId: this.contextId } }
      }),
      this.registerAction('group', { 
        name: 'remove-group', label: 'Remove', icon: 'remove_circle', scope: 'menu',
        permissions: { operation: 'remove', service: 'groups', context: this.contextId },
        handler: this.removeGroup
      })
    },
    removeGroup (group) {
      Dialog.create({
        title: 'Remove ' + group.name + '?',
        message: 'Are you sure you want to remove ' + group.name + ' from your organisation ?',
        buttons: [
          {
            label: 'Ok',
            handler: () => {
              let groupsService = this.$api.getService('groups')
              groupsService.remove(group._id)
            }
          },
          'Cancel'
        ]
      })
    }
  },
  created () {
    // Load the required components
    this.$options.components['k-grid'] = this.$load('collection/KGrid')
  }
}
</script>