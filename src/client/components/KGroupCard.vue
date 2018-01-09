<template>
  <k-card v-bind="$props">
    <div slot="card-content">
      <div class="row justify-around items-center">
        <template v-for="(role, index) in roleNames">
          <div :key="index">
            <q-btn flat round small color="tertiary" @click="onMembersClicked(role)">
              <q-icon :name="roleIcons[index]" />
              {{memberStats[role]}}
            </q-btn>
          </div>
        </template>
      </div>
    </div>
  </k-card>
</template>

<script>
import _ from 'lodash'
import { mixins as kCoreMixins } from 'kCore/client'
import { permissions as kCorePermissions } from 'kCore/common'
import { findMembersOfGroup } from '../../common/permissions'
import { QChip, QBtn, QIcon } from 'quasar'

export default {
  name: 'k-group-card',
  mixins: [kCoreMixins.baseItem],
  components: {
    QChip,
    QBtn,
    QIcon
  },
  data () {
    return {
      memberStats: {}
    }
  },
  methods: {
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
      const contextId = this.$store.get('context._id')
      this.$router.push({ name: 'edit-group', params: { contextId: contextId, id: this.item._id, perspective: role } })
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
