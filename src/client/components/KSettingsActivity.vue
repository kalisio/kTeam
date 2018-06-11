<template>
  <div class="row justify-center full-width">
    <div v-if="perspective === 'properties'" class="col-11">
      <k-editor service="organisations" :objectId="contextId" />
    </div>
    <div v-else-if="perspective === 'billing'" class="col-11">
      <k-organisation-billing :objectId="contextId" />
    </div>
    <div v-else-if="perspective === 'danger-zone'" class="col-11">
      <k-organisation-dz :objectId="contextId" />
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
      default: ''
    }
  },
  methods: {
    refreshActivity () {
      this.clearActivity()
      this.setTitle(this.$store.get('context.name'))
      // Tabbar actions
      if (this.$can('update', 'organisations', this.contextId, { _id: this.contextId })) {
        this.registerTabAction({
          name: 'properties',
          label: this.$t('KSettingsActivity.PROPERTIES_LABEL'),
          icon: 'description',
          route: { name: 'settings-activity',
            params: { contextId: this.contextId, perspective: 'properties' },
            default: this.perspective === 'properties' }
        })
        this.registerTabAction({
          name: 'billing',
          label: this.$t('KSettingsActivity.BILLING_LABEL'),
          icon: 'credit_card',
          route: { name: 'settings-activity',
            params: { contextId: this.contextId, perspective: 'billing' },
            default: this.perspective === 'billing' }
        })
        this.registerTabAction({
          name: 'danger-zone',
          label: this.$t('KSettingsActivity.DANGER_ZONE_LABEL'),
          icon: 'warning',
          route: { name: 'settings-activity',
            params: { contextId: this.contextId, perspective: 'danger-zone' },
            default: this.perspective === 'danger-zone' }
        })
      }
    }
  },
  created () {
    // Load the required components
    this.$options.components['k-editor'] = this.$load('editor/KEditor')
    this.$options.components['k-organisation-billing'] = this.$load('KOrganisationBilling')
    this.$options.components['k-organisation-dz'] = this.$load('KOrganisationDZ')
  }
}
</script>