<template>
  <div v-if="hasOrganisation">
    <router-view />
  </div>
</template>

<script>
import { Events } from 'quasar'
import { mixins as kCoreMixins } from 'kCore/client'

export default {
  name: 'k-organisation-view',
  mixins: [kCoreMixins.context],
  computed: {
    hasOrganisation () {
      return this.organisation !== null
    }
  },
  data () {
    return {
      organisation: null
    }
  },
  methods: {
    refreshContext (context) {
      this.organisation = context
      // Update the app bar actions with new context
      if (this.organisation !== null) {
        this.actions.forEach(action => action.route.params['contextId'] = this.contextId)
        this.$store.set('appBar', { title: this.organisation.name, subtitle: '', actions: this.actions })
      } else {
        this.$store.set('appBar', null)
      }
    }
  },
  created () {
    this.actions = this.$store.get('config.organisationView.actions', [])
    this.refreshContext(this.$store.get('context.object'))
    Events.$on('context-changed', this.refreshContext)
  },
  beforeDestroy () {
    Events.$off('context-changed', this.refreshContext)
    this.$store.set('appBar', null)
  }
}
</script>
