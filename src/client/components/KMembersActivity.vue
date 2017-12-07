<template>
  <div>
    <div v-if="operation === 'edit'">
      <k-editor service="members" :id="id" :perspective="perspective" />
    </div>
    <div v-else>
      <k-grid ref="membersGrid" service="members" :actions="actions.member" />
      <k-fab :actions="actions.members" />
    </div>
    <!-- 
      Add member dialog
     -->
    <k-authoriser ref="addMember" 
      title="Select the member to add"
      scope="organisations"
      :resource-id="contextId"
      resource-service="organisations"
      :query="usersQuery"
      @authorised="refreshMembers"
    />
    <!-- 
      Remove member dialog
     -->
    <k-confirm ref="removeMember" 
      :title="`Are you sure you want to remove '${selectionName}' ?`"
      action="Yes"
      @confirmed="removeMemberConfirmed" 
    />
  </div>
</template>

<script>
import { mixins as kCoreMixins } from 'kCore/client'

export default {
  name: 'k-members-activity',
  mixins: [
    kCoreMixins.baseActivity
  ],
  props: {
    contextId: {
      type: String,
      required: true
    },
    operation: {
      type: String,
      default: '',
    },
    id : {
      type: String,
      default: ''
    },
    perspective: {
      type: String,
      default: ''
    }
  },
  computed: {
    selectionName () {
      return this.selection ? this.selection.name : ''
    },
    usersQuery () {
      return { 'organisations._id': { $nin: [this.contextId] }, $select: ['profile'] }
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
      this.registerAction('members', { name: 'add-member', label: 'Add', icon: 'add', handler: this.addMember })
      this.registerAction('member', { name: 'remove-member', label: 'Remove', icon: 'remove_circle', handler: this.removeMember })
      this.registerAction('member', { name: 'manage-members', label: 'Manage', icon: 'description', route: {
        name: 'members-activity', params: { contextId: this.contextId, operation: 'edit', id: member._id, perspective: 'profile' } }
      })
    },
    refreshMembers () {
      this.$refs.membersGrid.refreshCollection()
    },
    addMember () {
      this.$refs.addMember.open()
    },
    removeMember (member) {
      this.selection = member
      this.$refs.removeMember.open()
    },
    removeMemberConfirmed () {
      this.$refs.removeMember.close()
      let authorisationService = this.$api.getService('authorisations')
      authorisationService.remove(this.contextId, {
        query: {
          scope: 'organisations',
          subjects: this.selection._id,
          subjectsService: 'users',
          resourcesService: 'organisations'
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
    this.$options.components['k-grid'] = loadComponent('collection/KGrid')
    this.$options.components['k-fab'] = loadComponent('collection/KFab')
    this.$options.components['k-authoriser'] = loadComponent('KAuthoriser')
    this.$options.components['k-confirm'] = loadComponent('frame/KConfirm')
    // Register the actions
    this.refreshActions()
  }
}
</script>