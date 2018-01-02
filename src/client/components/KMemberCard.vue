<template>
  <k-card v-bind="$props">
    <div slot="card-content">
      <div class="row justify-between items-center xs-gutter" style="padding: 4px">
        <template v-for="group in memberGroups">
          <div :key="group._id">  
            <q-chip small :closable="groupClosable" color="secondary">{{group.name}}</q-chip>
          </div>
        </template>
      </div>
    </div>
  </k-card>
</template>

<script>
import _ from 'lodash'
import { mixins as kCoreMixins } from 'kCore/client'
import { QChip } from 'quasar'

export default {
  name: 'k-member-card',
  mixins: [kCoreMixins.baseItem],
  components: {
    QChip
  },
  props: {
    groups: {
      type: Array,
      default: () => { return [] }
    }
  },
  computed: {
    memberGroups () {
      let groupsOfMember = _.map(this.item.groups, '_id')
      return  _.filter(this.groups, (group) => {
        return _.includes(groupsOfMember, group._id)
      })
    },
    groupClosable () {
      // TODO: need to be defined by the permissions assign to the leaveGroup action
      return true
    }
  },
  data () {
    return {
      members: this.$store.get('members')
    }
  },
  created () {
    // Load the required components
    this.$options.components['k-card'] = this.$load('collection/KCard')
  }
}
</script>
