import { Dialog } from 'quasar'

let groupActionsMixin = {
  methods: {
    createGroup () {
      this.$router.push({
        name: 'groups-activity',
        params: { context: this.context, operation: 'create' }
      })
    },
    manageGroupProperties (group) {
      this.$router.push({
        name: 'groups-activity',
        params: { context: this.context, operation: 'manage', id: group._id, perspective: 'properties' }
      })
    },
    manageGroupMembers (group) {
      this.$router.push({
        name: 'groups-activity',
        params: { context: this.context, operation: 'manage', id: group._id, perspective: 'members' }
      })
    },
    addGroupMember () {
      this.$refs.authoriser.open()
    },
    removeGroupMember (group) {
      Dialog.create({
        title: 'Warning',
        message: 'Are you sure you want to remove ' + group.name + '?',
        buttons: [
          'Cancel',
          {
            label: 'Remove',
            handler: () => {
              // delete the required item
              console.log('TODO')
            }
          }
        ]
      })
    }
  },
  created () {
    this.registerAction('createGroup', { label: 'Create', icon: 'add' })
    this.registerAction('manageGroupProperties', { label: 'Properties', icon: 'description' })
    this.registerAction('manageGroupMembers', { label: 'Members', icon: 'group' })
    this.registerAction('addGroupMember', { label: 'Add', icon: 'add' })
    this.registerAction('removeGroupMember', { label: 'Delete', icon: 'delete' })
  }
}

export default groupActionsMixin
