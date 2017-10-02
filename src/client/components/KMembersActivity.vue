<template>
  <div>
    <div v-if="operation === 'manage'">
      <k-editor :context="context" service="users" :id="id" :perspective="perspective" />
    </div>
    <div v-else>
      <k-grid ref="membersGrid" :context="context" service="users" :actions="memberItemActions()" />
      <k-fab :actions="memberActions()" />
    </div>
    <!-- 
      Add member dialog
     -->
    <k-authoriser ref="addMember" 
      title="Select the member to add"
      scope="organisations"
      :resource-id="context"
      resource-service="organisations"
      :query="usersQuery"
      @authorised="refreshMembers"
    />
    <!-- 
      Remove member dialog
     -->
    <k-confirm ref="removeMember" 
      :title="`Are you sure you want to remove \'${selectionName}\' ?`"
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
    context: {
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
      return { 'organisations._id': { $nin: [this.context] }, $select: ['profile'] }
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
    memberActions () {
      return this.filterActions(['addMember'])
    },
    memberItemActions () {
      return this.filterActions(['manageMember', 'removeMember'])
    },
    manageMember (member) {
      this.$router.push({ 
        name: 'members-activity', 
        params: { context: this.context, operation: 'manage', id: member._id, perspective: 'profile' } 
      })
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
      authorisationService.remove(this.context, {
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
    // Register the action
    this.registerAction('manageMember', { label: 'Manage', icon: 'description' })
    this.registerAction('addMember', { label: 'Add', icon: 'add' })
    this.registerAction('removeMember', { label: 'Remove', icon: 'remove_circle' })
  }
}
</script>