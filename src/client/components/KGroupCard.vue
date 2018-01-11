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
      <div class="row justify-around items-center">
        <template v-for="(role, index) in roleNames">
          <q-btn :key="key(role)" flat round color="tertiary" @click="onMembersClicked(role)">
            <q-icon :name="roleIcons[index]" />
              {{memberStats[role]}}
          </q-btn>
        </template>
      </div>
    </div>
  </k-card>
</template>

<script>
import _ from 'lodash'
import { mixins as kCoreMixins } from 'kCore/client'
import { permissions as kCorePermissions } from 'kCore/common'
import { findMembersOfGroup, getRoleForGroup } from '../../common/permissions'
import { QChip, QBtn, QIcon } from 'quasar'

export default {
  name: 'k-group-card',
  mixins: [kCoreMixins.baseItem],
  components: {
    QChip,
    QBtn,
    QIcon
  },
  computed: {
    memberRole () {
      const contextId = this.$store.get('context._id')
      const user = this.$store.get('user')
      let role = getRoleForGroup(user, contextId, this.item._id)
      if (! _.isUndefined(role)) return this.roleIcons[kCorePermissions.Roles[role]]
      else return ''
    }
  },
  data () {
    return {
      memberStats: {}
    }
  },
  methods: {
    key (role) {
      return this.item._id + '-' + role
    },
    refreshStats () {
      // Clear the counters. We use a temporaty object to ensure reactivity
      // see: https://v1.vuejs.org/guide/reactivity.html
      let stats = {}
      this.roleNames.forEach(role => stats[role] = 0)
      const contextId = this.$store.get('context._id')
      const membersService = this.$api.getService('members', contextId)
      findMembersOfGroup(membersService, this.item._id)
      .then(members => {
        // filter the subjects according the role in order to count them
        _.forEach(members.data, (user) => {
          let group = _.find(user.groups, { '_id':  this.item._id })
          stats[group.permissions]++
        })
        this.memberStats = Object.assign({}, stats)
      })
    },
    onMembersClicked (role) {
    /* FIXME
      const contextId = this.$store.get('context._id')
      this.$router.push({ name: 'edit-group', params: { contextId: contextId, id: this.item._id, perspective: role } })
      */
    }
  },
  created () {
    // Load the required components
    this.$options.components['k-card'] = this.$load('collection/KCard')
    // Compute the list of groups this member belongs
    this.roleNames = kCorePermissions.RoleNames
    this.roleIcons = this.$config('roles.icons')
    this.refreshStats()
  }
}
</script>
