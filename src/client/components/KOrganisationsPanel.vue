<template>
  <div>
    <q-collapsible ref="collapsible" :icon="icon" :label="currentOrganisationName" :class="[bgColor, textColor]">
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
        <q-item-separator />
        <!--
          Create link
        -->
        <q-item @click="createOrganisation">
          <q-item-side icon="add_circle" />
          <q-item-main label="Create organisation" />
        </q-item>
      </q-list>
    </q-collapsible>

    <!-- 
      Popup to create the new organisation
    -->
    <k-popup-editor ref="editor" title="Create a new organisation ?" service="organisations" />
  </div>
</template>

<script>
import lodash from 'lodash'
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
  mixins: [ mixins.baseCollection ],
  data () {
    return {
      currentOrgId: ''
    }
  },
  computed: {
    currentOrganisationName () {
      let current = this.findOrganisation(this.currentOrgId)
      return current ? current.name : ''
    },
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
          this.setCurrentOrganisation(this.items[0])
        }
      } else if (this.items.length > 0) {
        // Select the first one otherwise
        this.setCurrentOrganisation(this.items[0])
      }
    },
    setCurrentOrganisation (org) {
      this.currentOrgId = org._id
      this.$router.push({ name: 'context', params: { contextId: org._id } })
    },
    createOrganisation () {
      this.$refs.editor.open(true)
    }
  },
  created () {
    // Load the required components
    this.$options.components['k-popup-editor'] = this.$load('editor/KPopupEditor')
    // Load the configuration
    this.icon = this.$config('organisationsPanel.icon', 'domain')
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