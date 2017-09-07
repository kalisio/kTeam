<template>
  <div v-if="operation === 'create'">
    <k-editor :context="context" service="groups" />
  </div>
  <div v-else-if="operation === 'edit'">
    <k-nav-bar :tabs="navBarTabs()" selected="properties" />
    <k-editor :context="context" service="groups" :id="id" />
  </div>
  <div v-else-if="operation === 'browse'">
    <k-nav-bar :tabs="navBarTabs()" selected="members" />
    <k-grid :context="context" service="users" :actions="memberItemActions()" />
    <k-fab :actions="memberActions()" />
  </div>
  <div v-else>
    <k-grid :context="context" service="groups" :actions="groupItemActions()" />
    <k-fab :actions="groupActions()" />
  </div>
</template>

<script>
import { mixins as kCoreMixins } from 'kCore/client'
import mixins from '../mixins'

export default {
  name: 'k-groups-activity',
  mixins: [
    kCoreMixins.baseActivity,
    mixins.groupActions
  ],
  props: {
    context: {
      type: String,
      default: ''
    },
    operation: {
      type: String,
      default: '',
    },
    id : {
      type: String,
      default: '',
    }
  },
  methods: {
    navBarTabs () {
      return [ 
        { name: 'properties', label: 'Properties', icon: 'description', route: { 
          name: 'groups-activity', params: { context: this.context, operation: 'edit', id: this.id } } 
        },
        { name: 'members', label: 'Members', icon: 'group', route: 
          { name: 'groups-activity', params: { context: this.context, operation: 'browse', id: this.id } } 
        }      
      ]
    },
    groupActions () {
      return this.filterActions(['createGroup'])
    },
    groupItemActions () {
      return this.filterActions(['editGroup', 'browseGroup', 'deleteGroup'])
    },
    memberActions () {
      return this.filterActions(['addGroupMember'])
    },
    memberItemActions () {
      return this.filterActions(['removeGroupMember'])
    }
  },
  created () {
    // Load the required components
    let loadComponent = this.$store.get('loadComponent')
    this.$options.components['k-editor'] = loadComponent('editor/KEditor')
    this.$options.components['k-nav-bar'] = loadComponent('layout/KNavBar')
    this.$options.components['k-grid'] = loadComponent('collection/KGrid')
    this.$options.components['k-fab'] = loadComponent('collection/KFab')
  }
}
</script>