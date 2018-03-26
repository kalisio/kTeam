<template>
  <k-card v-bind="$props" :itemActions="actions">
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
  mixins: [ kCoreMixins.baseItem ],
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
      let role = getRoleForOrganisation(this.item, this.contextId)
      if (! _.isUndefined(role)) return kCorePermissions.Roles[role]
      return ''
    }
  },
  methods: {
    refreshActions () {
      this.clearActions()
      if (this.$can('update', 'members', this.contextId)) {
        this.registerPaneAction({ 
          name: 'tag-member', label: this.$t('KMemberCard.TAG_LABEL'), icon: 'local_offer',
          route: { name: 'tag-member', params: { contextId: this.contextId, id: this.item._id } }
        })
      }
      if (this.$can('remove', 'authorisations', this.contextId, { resource: this.contextId })) {
        this.registerMenuAction({ 
          name: 'remove-member', label: this.$t('KMemberCard.REMOVE_LABEL'), icon: 'remove_circle',
          handler: this.removeMember 
        })
      }
    },
    removeMember (member) {
      Dialog.create({
        title: this.$t('KMemberCard.REMOVE_DIALOG_TITLE', { member: member.name }),
        message: this.$t('KMemberCard.REMOVE_DIALOG_MESSAGE', { member: member.name }),
        buttons: [
          {
            label: 'Ok',
            handler: () => {
              let authorisationService = this.$api.getService('authorisations')
              authorisationService.remove(this.contextId, {
                query: {
                  scope: 'organisations',
                  subjects: member._id,
                  subjectsService: this.contextId + '/members',
                  resourcesService: 'organisations'
                }
              })
            }
          },
          'Cancel'
        ]
      })
    },
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
      let role = getRoleForGroup(this.item, this.contextId, group._id)
      if (! _.isUndefined(role)) return kCorePermissions.Roles[role]
      return ''
    },
    canJoinGroup () {
      return this.$can('create', 'authorisations', this.contextId, { resource: this.contextId })
    },
    canLeaveGroup (group) {
      return this.$can('remove', 'authorisations', this.item._id, { resource: group._id })
    },
    onJoinGroup () {
      this.$router.push({ name: 'join-group', params: { contextId: this.contextId, id: this.item._id } })
    },
    onLeaveGroup (group) {
      Dialog.create({
        title: this.$t('KMemberCard.LEAVE_GROUP_DIALOG_TITLE', { group: group.name }),
        message: this.$t('KMemberCard.LEAVE_GROUP_DIALOG_MESSAGE', { group: group.name, member: this.item.name }),
        buttons: [
          {
            label: 'Ok',
            handler: () => {
              const authorisationService = this.$api.getService('authorisations')
              authorisationService.remove(group._id, {
                query: {
                  scope: 'groups',
                  subjects: this.item._id,
                  subjectsService: this.contextId + '/members',
                  resourcesService: this.contextId + '/groups'
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
