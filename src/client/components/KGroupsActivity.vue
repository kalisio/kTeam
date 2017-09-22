<template>
  <div>
    <!--
      Manage routing
    -->
    <div v-if="operation === 'manage'">
      <k-nav-bar :tabs="navBarTabs()" :selected="perspective" />
      <div v-if="perspective === 'properties'">
        <k-editor :context="context" service="groups" :id="id" />
      </div>
      <div v-else-if="perspective === 'danger-zone'">
        <k-group-dz :context="context" :id="id" />
      </div>
      <div v-else>
        <k-grid ref="membersGrid" :context="context" service="users" :base-query="membersGridQuery" :actions="memberItemActions()" />
        <k-fab :actions="memberActions()" />
      </div>
    </div>
    <!--
      Default routing
    -->
    <div v-else>
      <k-grid ref="groupsGrid" :context="context" service="groups" :actions="groupItemActions()" />
      <k-fab :actions="groupActions()" />
    </div>

    <!-- 
      Create group dialog
    -->
    <k-popup-editor ref="createGroupDialog" 
      title="Create a new Group ?" 
      :context="context" 
      service="groups" 
    />
    <!-- 
      Add member dialog
     -->
    <k-authoriser ref="addMemberDialog" 
      title="Select the member to add"
      scope="groups"
      :resource-id="id"
      :resource-service="`${this.context}/groups`"
      :query="usersQuery"
      @authorised="refreshMembers"
    />
    <!-- 
      Remove member dialog
     -->
    <k-confirm ref="confirmRemoveDialog" 
      :title="`Are you sure you want to remove \'${selectionName}\' ?`"
      action="Remove"
      :prevent="{ capture: selectionName, label: 'Please enter the name of this member to confim the deletion' }" 
      @confirmed="removeMemberConfirmed" 
    />
  </div>
</template>

<script>
import { mixins as kCoreMixins } from 'kCore/client'

export default {
  name: 'k-groups-activity',
  mixins: [kCoreMixins.baseActivity],
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
  computed: {
    selectionName () {
      return this.selection ? this.selection.name : ''
    },
    membersGridQuery () {
      return { 'groups._id': this.id }
    },
    usersQuery () {
      return { 'organisations._id': { $in: [this.context] }, 'groups._id': { $nin: [this.id] } }
    }
  },
  data () {
    return {
      selection: null
    }
  },
  methods: {
    refreshMembers () {
      this.$refs.membersGrid.refresh()
    },
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
    },
    createGroup () {
      this.$refs.createGroupDialog.open()
    },
    manageGroupProperties (group) {
      this.$router.push({ 
        name: 'groups-activity', 
        params: { context: this.context, operation: 'manage', id: group._id, perspective: 'properties' } 
      })
    },
    manageGroupMembers (group) {
      this.$router.push({ 
        name: 'groups-activity', 
        params: { context: this.context, operation: 'manage', id: group._id, perspective: 'members' } 
      })
    },
    addGroupMember () {
      this.$refs.addMemberDialog.open()
    },
    removeGroupMember (member) {
      this.selection = member
      this.$refs.confirmRemoveDialog.open()
    },
    removeMemberConfirmed () {
      this.$refs.confirmRemoveDialog.close()
      let authorisationService = this.$api.getService('authorisations')
      authorisationService.remove(this.id, {
        query: {
          scope: 'groups',
          subjects: this.selection._id,
          subjectsService: 'users',
          resourcesService: this.context + '/groups'
        }
      })
      .then(_ => {
        this.refreshMembers()
      })
    }
  },
  created () {
    // Load the required components
    let loadComponent = this.$store.get('loadComponent')
    this.$options.components['k-editor'] = loadComponent('editor/KEditor')
    this.$options.components['k-popup-editor'] = loadComponent('editor/KPopupEditor')
    this.$options.components['k-nav-bar'] = loadComponent('layout/KNavBar')
    this.$options.components['k-grid'] = loadComponent('collection/KGrid')
    this.$options.components['k-fab'] = loadComponent('collection/KFab')
    this.$options.components['k-group-dz'] = loadComponent('KGroupDZ')
    this.$options.components['k-confirm'] = loadComponent('frame/KConfirm')
    this.$options.components['k-authoriser'] = loadComponent('KAuthoriser')
    // Register the action
    this.registerAction('createGroup', { label: 'Create', icon: 'add' })
    this.registerAction('manageGroupProperties', { label: 'Manage', icon: 'description' })
    this.registerAction('manageGroupMembers', { label: 'Manage', icon: 'group' })
    this.registerAction('addGroupMember', { label: 'Add', icon: 'add' })
    this.registerAction('removeGroupMember', { label: 'Remove', icon: 'remove_circle' })
  }
}
</script>