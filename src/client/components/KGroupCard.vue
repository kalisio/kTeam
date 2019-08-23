<template>
  <k-card v-bind="$props" :itemActions="actions">
    <!--
      Card icon
     -->
    <q-icon slot="card-icon" :name="memberRoleIcon" size="1.4rem">
      <q-tooltip>{{ $t(memberRoleLabel) }}</q-tooltip>
    </q-icon>
    <!--
      Card content
     -->
    <div slot="card-content">
      <div class="row justify-around items-center">
        <template v-for="(role, index) in roleNames">
          <q-btn :key="roleKey(role)" flat small rounded color="primary"
            :icon="roleIcons[index]"
            :label="memberStats[role]"
            @click="onMembersClicked(role)"/>
        </template>
      </div>
    </div>
  </k-card>
</template>

<script>
import _ from 'lodash'
import { mixins as kCoreMixins } from '@kalisio/kdk-core/client'
import { permissions as kCorePermissions } from '@kalisio/kdk-core/common'
import { findMembersOfGroup, getRoleForGroup } from '../../common/permissions'
import { QChip, QBtn, QIcon, QTooltip, Dialog } from 'quasar'

export default {
  name: 'k-group-card',
  mixins: [kCoreMixins.baseItem],
  components: {
    QChip,
    QBtn,
    QIcon,
    QTooltip
  },
  computed: {
    memberRoleIcon () {
      const user = this.$store.get('user')
      let role = getRoleForGroup(user, this.contextId, this.item._id)
      if (!_.isUndefined(role)) return this.roleIcons[kCorePermissions.Roles[role]]
      else return ''
    },
    memberRoleLabel () {
      const user = this.$store.get('user')
      let role = getRoleForGroup(user, this.contextId, this.item._id)
      if (!_.isUndefined(role)) return this.roleLabels[kCorePermissions.Roles[role]]
      else return ''
    }
  },
  data () {
    return {
      memberStats: {},
      roleLabels: []
    }
  },
  methods: {
    refreshActions () {
      this.clearActions()
      if (this.$can('update', 'groups', this.contextId, this.item)) {
        this.registerPaneAction({
          name: 'edit-group',
          label: this.$t('KGroupCard.EDIT_LABEL'),
          icon: 'description',
          route: { name: 'edit-group', params: { contextId: this.contextId, objectId: this.item._id } }
        })
      }
      if (this.$can('remove', 'groups', this.contextId, this.item)) {
        this.registerMenuAction({
          name: 'remove-group',
          label: this.$t('KGroupCard.REMOVE_LABEL'),
          icon: 'remove_circle',
          handler: this.removeGroup
        })
      }
    },
    removeGroup (group) {
      Dialog.create({
        title: this.$t('KGroupCard.REMOVE_DIALOG_TITLE', { group: group.name }),
        message: this.$t('KGroupCard.REMOVE_DIALOG_MESSAGE', { group: group.name }),
        html: true,
        ok: {
          label: this.$t('OK')
        },
        cancel: {
          label: this.$t('CANCEL')
        }
      }).onOk(() => {
        let groupsService = this.$api.getService('groups')
        groupsService.remove(group._id)
      })
    },
    roleKey (role) {
      return this.item._id + '-' + role
    },
    refreshStats () {
      // Clear the counters. We use a temporaty object to ensure reactivity
      // see: https://v1.vuejs.org/guide/reactivity.html
      let stats = {}
      this.roleNames.forEach(role => {
        stats[role] = 0
      })
      const membersService = this.$api.getService('members', this.contextId)
      findMembersOfGroup(membersService, this.item._id)
      .then(members => {
        // filter the subjects according the role in order to count them
        _.forEach(members.data, (user) => {
          let group = _.find(user.groups, { '_id': this.item._id })
          stats[group.permissions]++
        })
        this.memberStats = Object.assign({}, stats)
      })
    },
    onMembersClicked (role) {
    /* FIXME
      this.$router.push({ name: 'edit-group', params: { contextId: this.contextId, objectId: this.item._id, perspective: role } })
      */
    }
  },
  created () {
    // Load the required components
    this.$options.components['k-card'] = this.$load('collection/KCard')
    // Compute the list of groups this member belongs
    this.roleNames = kCorePermissions.RoleNames
    this.roleIcons = this.$config('roles.icons')
    this.roleLabels = this.$config('roles.labels')
    this.refreshStats()
  }
}
</script>
