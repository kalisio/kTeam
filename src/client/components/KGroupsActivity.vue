<template>
  <div>
    <!--
      Manage routing
    -->
    <div v-if="operation === 'edit'">
      <k-nav-bar :tabs="actions.tab" :selected="perspective" />
      <div v-if="perspective === 'properties'">
        <k-editor service="groups" :id="id" />
      </div>
      <div v-else-if="perspective === 'danger-zone'">
        <k-group-dz :contextId="contextId" :id="id" />
      </div>
      <div v-else>
        <k-grid ref="membersGrid" service="users" :base-query="membersGridQuery" :actions="actions.member" />
        <k-fab :actions="actions.members" />
      </div>
    </div>
    <!--
      Default routing
    -->
    <div v-else>
      <k-grid ref="groupsGrid" service="groups" :actions="actions.group" />
      <k-fab :actions="actions.groups" />
    </div>

    <!-- 
      Create group dialog
    -->
    <k-popup-editor ref="createGroupDialog" 
      title="Create a new Group ?" 
      service="groups" 
    />
    <!-- 
      Add group member dialog
     -->
    <k-authoriser ref="addMemberDialog" 
      title="Select the member to add"
      scope="groups"
      :resource-id="id"
      :resource-service="`${this.contextId}/groups`"
      :query="usersQuery"
      @authorised="refreshMembers"
    />
    <!-- 
      Remove group member dialog
     -->
    <k-confirm ref="removeMemberDialog" 
      :title="`Are you sure you want to remove '${selectionName}' ?`"
      action="Yes"
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
    contextId: {
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
      return { 'organisations._id': { $in: [this.contextId] }, 'groups._id': { $nin: [this.id] }, $select: ['profile'] }
    }
  },
  data () {
    return {
      selection: null
    }
  },
  methods: {
    refreshActions () {
      this.clearActions()
      if (this.$can('create', 'groups', this.contextId)) {
        this.registerAction('groups', { name: 'create-group', label: 'Create', icon: 'add', handler: this.createGroup })
      }
      if (this.$can('update', 'groups', this.contextId)) {
        this.registerAction('group', { name: 'manage-group-properties', label: 'Manage', icon: 'description', route: {
          name: 'groups-activity', params: { contextId: this.contextId, operation: 'edit', perspective: 'properties' } }
        })
      }
      if (this.$can(['create', 'remove'], 'authorisations', this.contextId)) {
        this.registerAction('group', { name: 'manage-group-members', label: 'Manage', icon: 'group', route: {
          name: 'groups-activity', params: { contextId: this.contextId, operation: 'edit', perspective: 'members' } }
        })
      }
      if (this.$can('create', 'authorisations', this.contextId)) {
        this.registerAction('members', { name: 'add-group-member', label: 'Add', icon: 'add', handler: this.addGroupMember })
      }
      if (this.$can('remove', 'authorisations', this.contextId)) {
        this.registerAction('member', { name: 'remove-group-member', label: 'Remove', icon: 'remove_circle', handler: this.removeGroupMember })
      }
      if (this.id) {
        if (this.$can('update', 'groups', this.contextId, { resource: this._id })) {
          this.registerAction('tab', { name: 'properties', label: 'Properties', icon: 'description', route: {
            name: 'groups-activity', params: { contextId: this.contextId, operation: 'edit', id: this.id, perspective: 'properties' } }
          })
          this.registerAction('tab', { name: 'members', label: 'Members', icon: 'group', route: {
            name: 'groups-activity', params: { contextId: this.contextId, operation: 'edit', id: this.id, perspective: 'members' } }
          })
          this.registerAction('tab', { name: 'danger-zone', label: 'Danger Zone', icon: 'warning', route: {
            name: 'groups-activity', params: { contextId: this.contextId, operation: 'edit', id: this.id, perspective: 'danger-zone' } }
          })
        }
      }
    },
    refreshMembers () {
      this.$refs.membersGrid.refreshCollection()
    },
    createGroup () {
      this.$refs.createGroupDialog.open()
    },
    addGroupMember () {
      this.$refs.addMemberDialog.open()
    },
    removeGroupMember (member) {
      this.selection = member
      this.$refs.removeMemberDialog.open()
    },
    removeMemberConfirmed () {
      this.$refs.removeMemberDialog.close()
      let authorisationService = this.$api.getService('authorisations')
      authorisationService.remove(this.id, {
        query: {
          scope: 'groups',
          subjects: this.selection._id,
          subjectsService: 'users',
          resourcesService: this.contextId + '/groups'
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
  }
}
</script>