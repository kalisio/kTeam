import { Dialog } from 'quasar'

let groupActionsMixin = {
  methods: {
    createGroup () {
      this.$router.push({ 
        name: 'groups-activity', 
        params: { context: this.context, operation: 'create' } 
      })
    },
    deleteGroup (group) {
      Dialog.create({
        title: 'Warning',
        message: 'Are you sure you want to delete the group ' + group.name + ' ?',
        buttons: [
          'Cancel',
          {
            label: 'Delete',
            handler: () => { 
              let service = this.$api.getService('groups', this.context)
              if (service) service.remove(group._id)
            }
          }
        ]
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
      Dialog.create({
        title: 'Add Members',
        message: 'Select the users you want to add:',
        buttons: [
          'Cancel',
          {
            label: 'Add',
            handler: () => {
              // delete the required item
              console.log('TODO')
            }
          }
        ]
      })
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
    this.registerAction('deleteGroup', { label: 'Delete', icon: 'delete' })
    this.registerAction('manageGroupProperties', { label: 'Properties', icon: 'create' })
    this.registerAction('manageGroupMembers', { label: 'Members', icon: 'group' })
    this.registerAction('addGroupMember', { label: 'Add', icon: 'add' })
    this.registerAction('removeGroupMember', { label: 'Delete', icon: 'delete' })
  }
}

export default groupActionsMixin
