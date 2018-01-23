<template>
  <div>
    <q-list link no-border>
      <!-- 
        Organisations list
      -->
      <q-item v-for="org in items" :key="org._id" @click="setCurrentOrganisation(org)">
        <q-item-side><avatar :username="org.name" :size="24" /></q-item-side>
        <q-item-main :label="org.name"/>
        <q-item-side v-if="org._id === currentOrgId" right>
          <q-item-tile  icon="check" />
        </q-item-side>
      </q-item>
      <!--
        Create link
      -->
      <q-item @click="createOrganisation">
        <q-item-side icon="add_circle" />
        <q-item-main label="New organisation" />
      </q-item>
    </q-list>
    <!--
      Create editor
     -->
    <k-modal-editor 
      ref="editor" 
      service="organisations"
      :route="false"
      @applied="onOrganisationCreated" />
  </div>
</template>

<script>
import _ from 'lodash'
import { Events, QCollapsible, QList, QItem, QSideLink, QItemMain, QItemSide, QItemTile, QItemSeparator } from 'quasar'
import Avatar from 'vue-avatar/dist/Avatar'
import { mixins } from 'kCore/client'

export default {
  name: 'k-organisations-panel',
  components: {
    QCollapsible,
    QList,
    QItem,
    QSideLink,
    QItemMain,
    QItemSide,
    QItemTile,
    QItemSeparator,
    Avatar
  },
  mixins: [mixins.baseCollection],
  inject: ['sideNav'],
  computed: {
    route () {
      return {}
    }
  },
  watch: {
    '$route' (to, from) {
      // React to route changes. Checks whether the context is null or not
      if (! this.$route.params.contextId) this.clearCurrentOrganisation()
    }
  },
  data () {
    return {
      currentOrgId: ''
    }
  },
  methods: {
    loadService () {
      this._service = this.$api.getService('organisations')
      return this._service
    },
    findOrganisation (id) {
      return this.items.find(org => org._id === id)
    },
    updateOrganisations () {
      let list = this.$store.get('user.organisations', [])
      this.filterQuery = { _id: { $in : list.map(org => { return org._id }) } }
      this.refreshCollection()
    },
    updateCurrentOrganisation () {
      // Check if current still exist
      if (this.currentOrgId) {
        if (!this.findOrganisation(this.currentOrgId)) {
          this.clearCurrentOrganisation()
          this.sideNav.navigate({ name: 'home' })
        }
      }
    },
    setCurrentOrganisation (org) {
      this.currentOrgId = org._id
      this.sideNav.navigate({ name: 'context', params: { contextId: org._id } })
    },
    clearCurrentOrganisation () {
      this.currentOrgId = ''
    },
    createOrganisation () {
      this.$refs.editor.open()
    },
    onOrganisationCreated (org) {
      this.currentOrgId = org._id
      this.$refs.editor.close(_ => this.sideNav.navigate({ name: 'context', params: { contextId: org._id } }))
    }
  },
  created () {
    this.$options.components['k-modal-editor'] = this.$load('editor/KModalEditor')
    // Load the configuration
    this.bgColor = this.$config('organisationsPanel.bgColor', 'bg-light')
    this.textColor = this.$config('organisationsPanel.textColor', 'text-dark')
    if (this.$route.params.contextId) this.currentOrgId = this.$route.params.contextId
    // Update the list of organisations
    this.updateOrganisations()
    // Required when user permissions change
    Events.$on('user-changed', this.updateOrganisations)
    // Required to get the org objects first
    this.$on('collection-refreshed', this.updateCurrentOrganisation)
  },
  beforeDestroy() {
    Events.$off('user-changed', this.updateOrganisations)
    this.$off('collection-refreshed', this.updateOrganisations)
  }
}
</script>