<template>
  <k-card v-bind="$props">
    <div slot="card-content">
      <div class="row justify-around items-center xs-gutter">
        <template v-for="group in memberGroups">
          <div :key="group._id"> 
            <q-chip small :closable="canLeaveGroup(group)" color="tertiary" @click="onGroupClicked(group)" @close="onLeaveGroup(group)">
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
import { QChip, Dialog } from 'quasar'

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
  }
}
</script>
