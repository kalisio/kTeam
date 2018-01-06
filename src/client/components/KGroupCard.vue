<template>
  <k-card v-bind="$props">
    <div slot="card-content">
      <div class="row justify-around items-center">
        <template v-for="(role, index) in roleNames">
          <div :key="index">
            <q-btn flat round color="tertiary">
              <q-icon :name="roleIcons[index]" />
              <!--q-chip small floating color="tertiary">
                {{counters[role]}}
              </q-chip-->
              {{counters[role]}}
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
      roles: [],
      counters: {}
    }
  },
  methods: {
    refreshCounters () {
      // Clear the counters. We use a temporaty object to ensure reactivity
      // see: https://v1.vuejs.org/guide/reactivity.html
      let tempCounters = {}
      this.roleNames.forEach(role => tempCounters[role] = 0)
      const context = this.$store.get('context._id')
      kCorePermissions.getSubjectsForResource(this.$api, context, 'members', 'groups', this.item._id)
      .then(response => {
        // filter the subjects according the role in order to count them
        _.forEach(response.data, (user) => {
          let group = _.find(user.groups, { '_id':  this.item._id })
          tempCounters[group.permissions]++
        })
        this.counters = Object.assign({}, tempCounters)
      })
    }
  },
  created () {
    // Load the required components
    this.$options.components['k-card'] = this.$load('collection/KCard')
    // Compute the list of groups this member belongs
    this.roleNames = kCorePermissions.RoleNames
    this.roleIcons = this.$config('roles.icons')
    this.roleColors = this.$config('roles.colors')
    this.refreshCounters()
  }
}
</script>
