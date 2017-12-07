<template>
  <div>
    <k-nav-bar :tabs="actions.tab" :selected="perspective" />
    <div v-if="perspective === 'properties'">
     <k-editor service="organisations" :id="contextId" />
    </div>
    <div v-else-if="perspective === 'billing'">
      <k-editor service="organisations" :id="contextId" perspective="billing" />
    </div>
    <div v-else-if="perspective === 'danger-zone'">
     <k-organisation-dz :id="contextId" />
    </div>
    <div v-else>
      <!-- Error -->
    </div>
  </div>
</template>

<script>
import { mixins as kCoreMixins } from 'kCore/client'
import mixins from '../mixins'

export default {
  name: 'k-settings-activity',
  mixins: [kCoreMixins.baseActivity],
  props: {
    contextId: {
      type: String,
      default: ''
    },
    perspective: {
      type: String,
      default: '',
    }
  },
  methods: {
    refreshActions () {
      this.clearActions()
      this.registerAction('tab', { name: 'properties', label: 'Properties', icon: 'description', route: { 
        name: 'settings-activity', params: { contextId: this.contextId, perspective: 'properties' } } 
      })
      this.registerAction('tab', { name: 'billing', label: 'Billing', icon: 'credit_card', route: { 
        name: 'settings-activity', params: { contextId: this.contextId, perspective: 'billing' } } 
      })
      this.registerAction('tab', { name: 'danger-zone', label: 'Danger Zone', icon: 'warning', route: { 
        name: 'settings-activity', params: { contextId: this.contextId, perspective: 'danger-zone' } } 
      })
    }
  },
  created () {
    // Load the required components
    let loadComponent = this.$store.get('loadComponent')
    this.$options.components['k-editor'] = loadComponent('editor/KEditor')
    this.$options.components['k-nav-bar'] = loadComponent('layout/KNavBar')
    this.$options.components['k-organisation-dz'] = loadComponent('KOrganisationDZ')
    this.$options.components['k-authoriser'] = loadComponent('KAuthoriser')
    // Register the actions
    this.refreshActions()
  }
}
</script>