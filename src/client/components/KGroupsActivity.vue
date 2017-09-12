<template>
  <div>
    <!--
      Create routing
    -->
    <div v-if="operation === 'create'">
      <k-editor :context="context" service="groups" />
    </div>
    <!--
      Manage routing
    -->
    <div v-else-if="operation === 'manage'">
      <k-nav-bar :tabs="navBarTabs()" :selected="perspective" />
      <div v-if="perspective === 'properties'">
        <k-editor :context="context" service="groups" :id="id" />
      </div>
      <div v-else-if="perspective === 'danger-zone'">
        <k-group-dz :context="context" service="groups" :id="id" />
      </div>
      <div v-else>
        <k-grid :context="context" service="users" :actions="memberItemActions()" />
        <k-fab :actions="memberActions()" />
      </div>
    </div>
    <!--
      Default routing
    -->
    <div v-else>
      <k-grid :context="context" service="groups" :actions="groupItemActions()" />
      <k-fab :actions="groupActions()" />
    </div>

    <!--
      Modal used to add a member
    -->
    <k-authoriser ref="authoriser" />
  </div>
</template>

<script>
import { mixins as kCoreMixins } from 'kCore/client'
import KAuthoriser from './KAuthoriser.vue'
import mixins from '../mixins'

export default {
  name: 'k-groups-activity',
  components: {
    KAuthoriser
  },
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
    },
    perspective: {
      type: String,
      default: '',
    }
  },
  data () {
    return {
      member: ''
    }
  },
  methods: {
    navBarTabs () {
      return [ 
        { name: 'properties', label: 'Properties', icon: 'description', route: { 
          name: 'groups-activity', params: { context: this.context, operation: 'manage', id: this.id, perspective: 'properties' } } 
        },
        { name: 'members', label: 'Members', icon: 'group', route: 
          { name: 'groups-activity', params: { context: this.context, operation: 'manage', id: this.id, perspective: 'members' } } 
        },
        { name: 'danger-zone', label: 'Danger Zone', icon: 'warning', route: 
          { name: 'groups-activity', params: { context: this.context, operation: 'manage', id: this.id, perspective: 'danger-zone' } } 
        }     
      ]
    },
    groupActions () {
      return this.filterActions(['createGroup'])
    },
    groupItemActions () {
      return this.filterActions(['manageGroupProperties', 'manageGroupMembers'])
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
    this.$options.components['k-group-dz'] = loadComponent('KGroupDZ')
  }
}
</script>