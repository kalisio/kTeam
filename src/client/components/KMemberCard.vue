<template>
  <k-card v-bind="$props">
    <!--
      Card icon
     -->
    <q-icon slot="card-icon" :name="memberRole" />
    <!--
      Card content
     -->
    <div slot="card-content">
      <div class="row justify-start items-center">
        <template v-for="(group, index) in memberGroups">
          <q-btn :key="group._id" flat small round color="tertiary">
            <avatar :key="group._id" :username="group.name" :size="32" />
            <q-popover ref="popover">
              <q-list inset-separator>
                <q-item>
                  <q-item-side :icon="roleForGroup(group)" />
                  <q-item-main :label="group.name" />
                </q-item>
                <q-item v-if="canLeaveGroup(group)" link @click="onLeaveGroup(group), $refs.popover[index].close()">
                  <q-item-side />
                  <q-item-main label="Leave" />
                </q-item>
              </q-list>
            </q-popover>
          </q-btn>
        </template>
        <q-btn v-if="canJoinGroup()" flat small round @click="onJoinGroup()">
          <q-icon name="add_circle" color="faded" />
        </q-btn>
      </div>
    </div>
  </k-card>
</template>

<script>
import _ from 'lodash'
import { mixins as kCoreMixins } from 'kCore/client'
import { permissions as kCorePermissions } from 'kCore/common'
import { getRoleForOrganisation, getRoleForGroup } from '../../common/permissions'
import { QBtn, QIcon, QTooltip, QPopover, QList, QItem, QItemMain, QItemSide, Dialog } from 'quasar'
import Avatar from 'vue-avatar/dist/Avatar'

export default {
  name: 'k-member-card',
  mixins: [kCoreMixins.baseItem],
  components: {
    QBtn,
    QIcon,
    QTooltip,
    QPopover,
    QList,
    QItem,
    QItemMain,
    QItemSide,
    Avatar
  },
  props: {
    groups: {
      type: Array,
      default: () => { return [] }
    }
  },
  computed: {
    memberGroups () {
      // Get the groups for this member
      let groupsOfMember = _.map(this.item.groups, '_id')
      // Filter the groups against the orfanisation groups
      return  _.filter(this.groups, (group) => {
        return _.includes(groupsOfMember, group._id)
      })
    },
    memberRole () {
      const contextId = this.$store.get('context._id')
      let role = getRoleForOrganisation(this.item, contextId)
      if (! _.isUndefined(role)) return this.roleIcons[kCorePermissions.Roles[role]]
      return ''
    }
  },
  methods: {
    roleForGroup (group) {
      const contextId = this.$store.get('context._id')
      let role = getRoleForGroup(this.item, contextId, group._id)
      if (! _.isUndefined(role)) return this.roleIcons[kCorePermissions.Roles[role]]
      return ''
    },
    canJoinGroup () {
      const contextId = this.$store.get('context._id')
      if (this.$can('create', 'authorisations', contextId, { resource: contextId })) return true
      return false
    },
    canLeaveGroup (group) {
      if (this.$can('remove', 'authorisations', this.item._id, { resource: group._id })) return true
      return false
    },
    onJoinGroup () {
      const contextId = this.$store.get('context._id')
      this.$router.push({ name: 'join-group', params: { contextId: contextId, id: this.item._id } })
    },
    onLeaveGroup (group) {
      Dialog.create({
        title: 'Leave the group ' + group.name + '?',
        message: 'Are you sure you want ' + this.item.name + ' to leave the group ' + group.name + ' ?',
        buttons: [
          {
            label: 'Ok',
            handler: () => {
              const contextId = this.$store.get('context._id')
              const authorisationService = this.$api.getService('authorisations')
              authorisationService.remove(group._id, {
                query: {
                  scope: 'groups',
                  subjects: this.item._id,
                  subjectsService: contextId + '/members',
                  resourcesService: contextId + '/groups'
                }
              })
            }
          },
          'Cancel'
        ]
      })
    },
    onGroupClicked (group) {
      const contextId = this.$store.get('context._id')
      this.$router.push({ name: 'edit-group', params: { contextId: contextId, id: group._id } })
    }
  },
  created () {
    // Load the required components
    this.$options.components['k-card'] = this.$load('collection/KCard')
    // Load the role configuration
    this.roleIcons = this.$config('roles.icons')
  }
}
</script>
