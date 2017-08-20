<template>
  <!--k-collection 
  :service="'groups'"
  :context="context"
  :actions="actions" 
  @actionRequested="onActionRequested" /-->
  <div>Hello</div>
</template>

<script>
//import { mixins } from 'kCore/client'

export default {
  name: 'k-groups',
  dependencies: ['store'],
  data () {
    return {
      context: null
    }
  },
 /* mixins: [
    mixins.collection.baseItemAction,
    mixins.collection.createItem,
    mixins.collection.deleteItem,
    mixins.collection.editItem
  ],*/
  created () {
    let Store = this.store()
    // Load the required component
    //let loadComponent = Store.get('loadComponent')
    //this.$options.components['k-collection'] = loadComponent('collection/KCollection')
    // Retrieve the context for the groups service
    this.context = Store.get(Store.get('config.users.context'), null)
  }
}
</script>