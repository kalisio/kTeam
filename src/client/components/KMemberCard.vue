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
        <template v-for="group in memberGroups">
          <q-btn :key="group._id" flat round color="tertiary" @click="onGroupClicked(group)">
            <avatar :key="group._id" :username="group.name" :size="32" />
          </q-btn>
        </template>
         <q-btn flat round color="tertiary" @click="onGroupsClicked()">
            <q-icon name="more_horiz" />
          </q-btn>
      </div>
    </div>
  </k-card>
</template>

<script>
import _ from 'lodash'
import { mixins as kCoreMixins } from 'kCore/client'
import { permissions as kCorePermissions } from 'kCore/common'
import { getRoleForOrganisation } from '../../common/permissions'
import { QBtn, QIcon, Dialog } from 'quasar'
import Avatar from 'vue-avatar/dist/Avatar'

export default {
  name: 'k-member-card',
  mixins: [kCoreMixins.baseItem],
  components: {
    QBtn,
    QIcon,
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
    canLeaveGroup (group) {
      if (this.$can('remove', 'authorisations', this.item._id, { resource: group._id })) return true
      return false
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
