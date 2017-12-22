<template>
  <div>
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
      // Tabbar actions
      if (this.$can('update', 'organisations', this.contextId, { _id: this.contextId })) {
        this.registerTabAction({ 
          name: 'properties', label: 'Properties', icon: 'description', 
          route: { name: 'settings-activity', params: { contextId: this.contextId, perspective: 'properties' },
          default: this.perspective === 'properties' } 
        })
        this.registerTabAction({ 
          name: 'billing', label: 'Billing', icon: 'credit_card', 
          route: { name: 'settings-activity', params: { contextId: this.contextId, perspective: 'billing' },
          default: this.perspective === 'billing' }
        }),
        this.registerTabAction({
          name: 'danger-zone', label: 'Danger Zone', icon: 'warning', 
          route: { name: 'settings-activity', params: { contextId: this.contextId, perspective: 'danger-zone' },
          default: this.perspective === 'danger-zone' }
        })
      }
    }
  },
  created () {
    // Load the required components
    this.$options.components['k-editor'] = this.$load('editor/KEditor')
    this.$options.components['k-organisation-dz'] = this.$load('KOrganisationDZ')
  }
}
</script>