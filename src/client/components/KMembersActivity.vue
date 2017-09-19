<template>
  <div>
    <div v-if="operation === 'manage'">
      <k-editor :context="context" service="users" :id="id" :perspective="perspective" />
    </div>
    <div v-else>
      <k-grid :context="context" service="users" :actions="memberItemActions()" />
      <k-fab :actions="memberActions()" />
    </div>
    <!-- 
      Add member dialog
     -->
    <k-authoriser ref="addMember" 
      title="Select the member to add"
      scope="organisations"
      :resource-id="id"
      resource-service="organisations"
    />
    <!-- 
      Remove member dialog
     -->
    <k-confirm ref="confirmRemove" 
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
  name: 'k-members-activity',
  mixins: [
    kCoreMixins.baseActivity
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
      default: ''
    }
  },
  computed: {
    selectionName () {
      return this.selection ? this.selection.name : ''
    }
  },
  data () {
    return {
      selection: null
    }
  },
  methods: {
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
      this.$refs.confirmRemove.open()
    },
    removeMemberConfirmed () {
      this.$refs.confirmRemove.close()
      let authorisationService = this.$api.getService('authorisations')
      authorisationService.remove(this.$store.get('organisation._id'), {
        query: {
          scope: 'organisations',
          subjects: this.selection._id,
          subjectsService: 'users',
          resourcesService: 'organisations'
        }
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
    this.registerAction('removeMember', { label: 'Remove', icon: 'delete' })
  }
}
</script>