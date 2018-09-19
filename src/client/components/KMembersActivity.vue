<template>
  <div>
    <!-- 
      Members collection
     -->
    <k-grid ref="membersGrid" service="members" :renderer="renderer" :contextId="contextId" :base-query="baseQuery" :filter-query="searchQuery" />
    <!-- 
      Router view to enable routing to modals
     -->
    <router-view service="members" :router="router()"></router-view>
  </div>
</template>

<script>
import { mixins } from 'kCore/client'

export default {
  name: 'k-members-activity',
  mixins: [ mixins.baseActivity ],
  props: {
    contextId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      baseQuery: {
        $sort: {
          'profile.name': 1
        }
      },
      renderer: {
        component: 'KMemberCard',
        props: {
          groups: [],
          options: {
            tags: 'chip',
            avatar: { size: 96 }
          }
        }
      }
    }
  },
  methods: {
    router () {
      return {
        onApply: { name: 'members-activity', params: { contextId: this.contextId } },
        onDismiss: { name: 'members-activity', params: { contextId: this.contextId } }
      }
    },
    refreshActivity () {
      this.clearActivity()
      // Title
      this.setTitle(this.$store.get('context.name'))
      // Search bar
      this.setSearchBar('profile.name', [
        { service: 'groups', field: 'name', baseQuery: {}, icon: { name: 'group_work' } },
        { service: 'tags', field: 'value', baseQuery: {}, icon: 'label' }
      ])
      // Tabbar actions
      this.registerTabAction({
        name: 'members',
        label: this.$t('KMembersActivity.MEMBERS_LABEL'),
        icon: 'group',
        route: { name: 'members-activity', params: { contextId: this.contextId } },
        default: true
      })
      this.registerTabAction({
        name: 'groups',
        label: this.$t('KMembersActivity.GROUPS_LABEL'),
        icon: 'group_work',
        route: {
          name: 'groups-activity', params: { contextId: this.contextId } }
      })
      // Fab actions
      if (this.$can('create', 'authorisations', this.contextId, { resource: this.contextId })) {
        this.registerFabAction({
          name: 'add-member',
          label: this.$t('KMembersActivity.ADD_USER_LABEL'),
          icon: 'person_add',
          route: { name: 'add-member', params: {} }
        })
        this.registerFabAction({
          name: 'invite-member',
          label: this.$t('KMembersActivity.INVITE_GUEST_LABEL'),
          icon: 'email',
          route: { name: 'invite-member', params: {} }
        })
      }
      // Refresh the group list
      this.subscribeGroups()
    },
    subscribeGroups () {
      // Remove previous listener if any
      this.unsubscribeGroups()
      let groupsService = this.$api.getService('groups')
      this.groupsListener = groupsService.watch({ listStrategy: 'always' })
      .find()
      .subscribe(response => {
        this.renderer.props.groups = response.data
      })
    },
    unsubscribeGroups () {
      if (this.groupsListener) {
        this.groupsListener.unsubscribe()
        this.groupsListener = null
      }
    }
  },
  created () {
    // Load the required components
    this.$options.components['k-grid'] = this.$load('collection/KGrid')
  },
  beforeDestroy () {
    this.unsubscribeGroups()
  }
}
</script>