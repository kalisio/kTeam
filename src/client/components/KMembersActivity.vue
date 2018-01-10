<template>
  <div>
    <!-- 
      Members collection
     -->
    <k-grid ref="membersGrid" service="members" :renderer="renderer" :actions="actions.member" />
    <!-- 
      Router view to enable routing to modals
     -->
    <router-view service="members" :router="router()"></router-view>
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
  data () {
    return {
      renderer: { 
        component: 'KMemberCard', 
        props: { 
          groups: [],
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
        onApply: { name:'members-activity', params: { contextId: this.contextId } },
        onDismiss: { name:'members-activity', params: { contextId: this.contextId } }
      }
    },
    refreshActivity () {
      this.clearActivity()
      this.setTitle(this.$store.get('context.name'))
      // Tabbar actions
      this.registerTabAction({ 
        name: 'members', label: 'Members', icon: 'group', 
        route: { name: 'members-activity', params: { contextId: this.contextId } },
        default: true
      })
      this.registerTabAction({ 
        name: 'groups', label: 'Groups', icon: 'group_work', route: { 
        name: 'groups-activity', params: { contextId: this.contextId } } 
      })
      // Fab actions
      if (this.$can('create', 'authorisations', this.contextId, { resource: this.contextId })) {
        this.registerFabAction({ 
          name: 'add-member', label: 'Add a user', icon: 'person_add', 
          route: { name: 'add-member', params: {} } 
        })
        this.registerFabAction({ 
          name: 'invite-member', label: 'Invite a guest', icon: 'email', 
          route: { name: 'invite-member', params: {} } 
        })
      }
      // Collection actions
     /* FIXME: tags management
     if (this.$can('update', 'members', this.contextId)) {
        this.registerAction('member', { 
          name: 'edit-member', label: 'Edit', icon: 'local_offer',
          route: { name: 'edit-member', params: { perspective: 'tags' } }
        })
      }
      */
      if (this.$can('remove', 'authorisations', this.contextId, { resource: this.contextId })) {
        this.registerAction('member', { 
          name: 'remove-member', label: 'Remove', icon: 'remove_circle',
          handler: this.removeMember 
        })
      }
      // Refresh the group list
      this.refreshGroups()
    },
    refreshGroups () {
      let groupsService = this.$api.getService('groups')
      groupsService.find({
        rx: { listStrategy: 'always' }
      })
      .subscribe(response => {
        this.renderer.props.groups = response.data
      })
    },
    removeMember (member) {
      Dialog.create({
        title: 'Remove ' + member.name + '?',
        message: 'Are you sure you want to remove ' + member.name + ' from your organisation ?',
        buttons: [
          {
            label: 'Ok',
            handler: () => {
              let authorisationService = this.$api.getService('authorisations')
              authorisationService.remove(this.contextId, {
                query: {
                  scope: 'organisations',
                  subjects: member._id,
                  subjectsService: 'members',
                  resourcesService: 'organisations'
                }
              })
              .then(_ => this.$refs.membersGrid.refreshCollection())
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