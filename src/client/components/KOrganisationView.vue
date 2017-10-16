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
    updateView () {
      // update the app bar
      if (this.organisation !== null) {
        this.actions.forEach(action => {
          action.route.params['contextId'] = this.contextId
        })
        this.$store.set('appBar', { title: this.organisation.name, subtitle: '', actions: this.actions })
      }
      else this.$store.set('appBar', null)
    }
  },
  created () {
    this.actions = this.$store.get('config.organisationView.actions', [])
    this.organisation = this.$store.get('context.subject')
    this.updateView()
  },
  mounted () {
    Events.$on('context-changed', context => {
      this.organisation = context
      this.updateView()
    })
    
  },
  beforeDestroy () {
    this.$store.set('appBar', null)
  }
}
</script>
