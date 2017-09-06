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
            handler: () => { this.serviceRemove(group._id) }
          }
        ]
      })
    },
    editGroup (group) {
      this.$router.push({ 
        name: 'groups-activity', 
        params: { context: this.context, operation: 'edit', id: group._id } 
      })
    },
    browseGroup (group) {
      this.$router.push({ 
        name: 'groups-activity', 
        params: { context: this.context, operation: 'browse', id: group._id } 
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
    this.registerAction('editGroup', { label: 'Edit', icon: 'create' })
    this.registerAction('browseGroup', { label: 'Browse', icon: 'group' })
    this.registerAction('addGroupMember', { label: 'Add', icon: 'add' })
    this.registerAction('removeGroupMember', { label: 'Remove', icon: 'delete' })
  }
}

export default groupActionsMixin
