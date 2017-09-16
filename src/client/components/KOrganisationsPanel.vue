<template>
  <div>
    <q-collapsible ref="collapsible" :icon="icon" :label="current" :class="[bgColor, textColor]">
      <q-list link no-border>
        <!-- 
          Organisations list
        -->
        <template v-for="org in list">
          <q-item @click="onOrganisationClicked(org)">
            <q-item-side><avatar :username="org.name" :size="24" /></q-item-side>
            <q-item-main :label="org.name" />
            <q-item-side v-if="org.name === current" right>
              <q-item-tile  icon="settings" />
            </q-item-side>
          </q-item>
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
    <k-popup-editor ref="creator" title="Create a new organisation ?" service="organisations" />
  </div>
</template>

<script>
import { Events, QCollapsible, QList, QItem, QItemMain, QItemSide, QItemTile, QItemSeparator } from 'quasar'
import Avatar from 'vue-avatar/dist/Avatar'

export default {
  name: 'k-organisations-panel',
  components: {
    QCollapsible,
    QList,
    QItem,
    QItemMain,
    QItemSide,
    QItemTile,
    QItemSeparator,
    Avatar
  },
  data () {
    return {
      current: '',
      list: []
    }
  },
  methods: {
    onOrganisationClicked (org) {
      // Shall we switch to the clicked organisation ?
      // That is to say, check whether the clicked organisation is different from the current one
      if (this.current !== org.name) {
        this.$store.set('organisation', org)
      } else {
        // Then mznage the organisation
        let orgId = this.$store.get('organisation._id')
        this.$router.push({ name: 'organisations-activity', params: { operation: 'manage', id: orgId } })
      }
    },
    createOrganisation () {
      this.$refs.creator.open()
    },
    setCurrentOrganisation (organisation) {
      if (organisation) {
        this.current = organisation.name
        this.$router.push({ name: 'organisations-activity', params: { operation: 'welcome', id:organisation._id } })
      }
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
    // Listen to the user changed event
    this.list = this.$store.get('user.organisations', [])
    this.current = this.$store.get('organisation.name', '')
  },
  mounted () {
    Events.$on('user-changed', user => {
      this.list = user ? user.organisations : []
    })
    Events.$on('organisation-changed', organisation => {
      this.setCurrentOrganisation(organisation)
    })
  }
}
</script>