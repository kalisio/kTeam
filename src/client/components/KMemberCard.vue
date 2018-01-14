<template>
  <k-card v-bind="$props">
    <!--
      Card icon
     -->
    <q-icon slot="card-icon" :name="roleIcon(role)" />
    <!--
      Card content
     -->
    <div slot="card-content">
      <div class="column full-width justify-center xs-gutter">
        <div class="row justify-start items-center">
          <template v-for="(group, index) in memberGroups">
            <q-btn :key="groupKey(group)" flat small round color="faded">
              <avatar :username="group.name" :size="32" />
              <q-popover ref="popover">
                <q-toolbar inverted color="faded">
                  <span><q-icon :name="roleIcon(roleForGroup(group))" /></span>
                  <span style="margin:8px">{{group.name}}</span>
                  <q-btn v-if="canLeaveGroup(group)" flat round small @click="onLeaveGroup(group), $refs.popover[index].close()">
                    <q-icon name="remove_circle" />
                  </q-btn>
                </q-toolbar>
              </q-popover>
            </q-btn>
          </template>
          <q-btn v-if="canJoinGroup()" flat small round @click="onJoinGroup()">
            <q-icon name="add_circle" color="faded" />
          </q-btn>
        </div>
      </div>
    </div>
  </k-card>
</template>

<script>
import _ from 'lodash'
import { mixins as kCoreMixins } from 'kCore/client'
import { permissions as kCorePermissions } from 'kCore/common'
import { getRoleForOrganisation, getRoleForGroup } from '../../common/permissions'
import { QBtn, QIcon, QPopover, QToolbar, QCardSeparator, QChip, Dialog } from 'quasar'
import Avatar from 'vue-avatar/dist/Avatar'

export default {
  name: 'k-member-card',
  mixins: [kCoreMixins.baseItem],
  components: {
    QBtn,
    QIcon,
    QPopover,
    QToolbar,
    QCardSeparator,
    QChip,
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
    role () {
      const contextId = this.$store.get('context._id')
      let role = getRoleForOrganisation(this.item, contextId)
      if (! _.isUndefined(role)) return kCorePermissions.Roles[role]
      return ''
    }
  },
  methods: {
    tagKey (tag) {
      return this.item._id + '-' + tag.value
    },
    groupKey (group) {
      return this.item._id + group._id
    },
    roleIcon (role) {
      return this.roleIcons[role]
    },
    roleForGroup (group) {
      const contextId = this.$store.get('context._id')
      let role = getRoleForGroup(this.item, contextId, group._id)
      if (! _.isUndefined(role)) return kCorePermissions.Roles[role]
      return ''
    },
    canJoinGroup () {
      const contextId = this.$store.get('context._id')
      return this.$can('create', 'authorisations', contextId, { resource: contextId })
    },
    canLeaveGroup (group) {
      return this.$can('remove', 'authorisations', this.item._id, { resource: group._id })
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
