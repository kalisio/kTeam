<template>
  <div>
    <q-collapsible ref="collapsible" :icon="icon" :label="currentName" :class="[bgColor, textColor]">
      <q-list link no-border>
        <!-- 
          Organisations list
        -->
        <template v-for="org in items">
          <q-side-link item :key="org._id" :to="{ name: 'organisation-view', params: { contextId: org._id } }">
            <q-item-side><avatar :username="org.name" :size="24" /></q-item-side>
            <q-item-main :label="org.name" />
            <q-item-side v-if="org.name === currentName" right>
              <q-item-tile  icon="check" />
            </q-item-side>
          </q-side-link>
        </template>
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
  mixins: [
    mixins.service,
    mixins.baseCollection
  ],
  data () {
    return {
      currentId: '',
      currentName: '',
      list: []
    }
  },
  methods: {
    loadService () {
      return this._service = this.$api.getService('organisations')
    },
    updateOrganisations () {
      this.list = this.$store.get('user.organisations', [])
      this.filterQuery = { _id: { $in : this.list.map(org => { return org._id }) } }
      this.refreshCollection()
    },
    syncCurrentOrganisation () {
      let currentOrganisationIndex = lodash.findIndex(this.items, {'_id': this.currentId})
      if (currentOrganisationIndex !== -1) this.currentName = this.items[currentOrganisationIndex].name
      else this.currentName = 'Undefined'
    },
    createOrganisation () {
      this.$refs.editor.open(true)
    }
  },
  created () {
    // Load the required components
    let loadComponent = this.$store.get('loadComponent')
    this.$options.components['k-popup-editor'] = loadComponent('editor/KPopupEditor')
    // Load the configuration
    let confPath = 'config.organisationsPanel'
    this.icon = this.$store.get(confPath + '.icon', 'domain')
    this.bgColor = this.$store.get(confPath + '.bgColor', 'bg-light')
    this.textColor = this.$store.get(confPath + '.textColor', 'text-dark')
    // Setup the default organisation
    // this.currentId = this.$store.get('context._id')
    this.currentId = this.$store.get('context._id')
    // Update the list of organisations
    this.updateOrganisations()
    Events.$on('user-changed', this.updateOrganisations)
    Events.$on('context-id-changed', id => {
      this.currentId = id
      this.syncCurrentOrganisation()
    })
    this.$on('collection-refreshed', _ => {
      this.syncCurrentOrganisation()
    })
  },
  mounted () {
    // Route to the default organisation if needed
    if (this.$route.path === '/home') {
      let user = this.$store.get('user')
      let organisations = user ? user.organisations : null
      if (organisations && organisations.length > 0) {
        this.$router.push({ name: 'organisation-view', params: { contextId: organisations[0]._id } })
      }
    }
  },
  beforeDestroy() {
    Events.$off('user-changed', this.updateOrganisations)
  }
}
</script>