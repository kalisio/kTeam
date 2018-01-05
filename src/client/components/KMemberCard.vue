<template>
  <k-card v-bind="$props">
    <div slot="card-content">
      <div class="row justify-between items-center xs-gutter" style="padding: 4px">
        <template v-for="group in memberGroups">
          <div :key="group._id">  
            <q-chip small :closable="canLeaveGroup(group)" color="secondary" @close="onLeaveGroup(group)">
              {{group.name}}
            </q-chip>
          </div>
        </template>
      </div>
    </div>
  </k-card>
</template>

<script>
import _ from 'lodash'
import { mixins as kCoreMixins } from 'kCore/client'
import { QChip, Dialog, Events } from 'quasar'

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
  data () {
    return {
      memberGroups: []
    }
  },
  methods: {
    refreshMemberGroups () {
      let groupsOfMember = _.map(this.item.groups, '_id')
      this.memberGroups =  _.filter(this.groups, (group) => {
        return _.includes(groupsOfMember, group._id)
      })
    },
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
              const authorisationService = this.$api.getService('authorisations')
              authorisationService.remove(group._id, {
                query: {
                  scope: 'groups',
                  subjects: this.item._id,
                  subjectsService: this.$store.get('context._id') + '/members',
                  resourcesService: this.$store.get('context._id') + '/groups'
                }
              })
            }
          },
          'Cancel'
        ]
      })
    },
  },
  created () {
    // Load the required components
    this.$options.components['k-card'] = this.$load('collection/KCard')
    // Compute the list of groups this member belongs
    this.refreshMemberGroups()
  }
}
</script>
