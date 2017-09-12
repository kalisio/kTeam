<template>
  <q-collapsible ref="collapsible" :icon="icon" :label="label" :class="[bgColor, textColor]">
    <q-list link no-border>
      <!-- 
        Organisations list
       -->
      <template v-for="org in organisations">
        <q-item @click="onOrganisationClicked(org)">
          <q-item-side><avatar :username="org.name" :size="24" /></q-item-side>
          <q-item-main :label="org.name" />
          <q-item-side v-if="org.name === label" right>
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
        <q-item-main label="Create" />
      </q-item>
    </q-list>
  </q-collapsible>
</template>

<script>
import { QCollapsible, QList, QItem, QItemMain, QItemSide, QItemTile, QItemSeparator } from 'quasar'
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
      label: '',
      organisations: []
    }
  },
  methods: {
    onOrganisationClicked (org) {
      // Shall we switch to the clicked organisation ?
      // That is to say, check whether the clicked organisation is different from the current one
      if (this.label !== org.name) {
        this.label = org.name
        this.$store.set('organisation', org)
        // FIXME: should redirect to 'home' dedicated to the organisation: maybe a default activity ?
        this.$router.push({ name: 'home' })
      } else {
        // Then mnage the organisation
        let orgId = this.$store.get('organisation._id')
        this.$router.push({ name: 'organisations-activity', params: { operation: 'manage', id: orgId } })
      }
    },
    createOrganisation () {
      this.$router.push({ name: 'organisations-activity', params: { operation: 'create' } })
    }
  },
  created () {
    this.organisations = this.$store.get('user.organisations')
    this.label = this.$store.get('organisation.name')
    // Load the configuration
    let confPath = 'config.organisationsPanel'
    this.icon = this.$store.get(confPath + '.icon', 'domain')
    this.bgColor = this.$store.get(confPath + '.bgColor', 'bg-light')
    this.textColor = this.$store.get(confPath + '.textColor', 'text-dark')
  }
}
</script>