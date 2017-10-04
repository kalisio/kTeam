<template>
  <div class="col justify-center">
    <!--
      Toolbar area
    -->
    <div class="col-12 bg-light text-primary sm-gutter">
      <div class="row items-center">
        <div class="col-2">
          <div classs="row justify-start" style="padding:12px">
           <avatar :username="name" :size="32" />
          </div>
        </div>
        <div class="col-8">
          <div class="row justify-center">
            <q-btn big flat icon="group" @click="$router.push({name: 'members-activity', params: {contextId: contextId }})" />
            <q-btn big flat icon="folder" @click="$router.push({name: 'groups-activity', params: {contextId: contextId }})" />
          </div>
        </div>
        <div class="col-2">
          <div class="row justify-end">
            <q-btn big flat icon="settings" @click="$router.push({name: 'settings-activity', params: {contextId: contextId, perspective: 'properties' }})" />
          </div>
        </div>
      </div>
    </div>
    <!--
      Content area
    -->
    <div class="col-12">
      <router-view />
    </div>
  </div>
</template>

<script>
import { Events, QBtn } from 'quasar'
import { mixins as kCoreMixins } from 'kCore/client'
import Avatar from 'vue-avatar/dist/Avatar'

export default {
  name: 'k-organisation-activity',
  components: {
    QBtn,
    Avatar
  },
  mixins: [kCoreMixins.context],
  data () {
    return {
      name: ''
    }
  },
  methods: {
    refreshOrganisation () {
      if (this.$store.get('user') && this.contextId !== '') {
        this.$api.getService('organisations').get(this.contextId)
        .then(organisation => {
          this.name = organisation.name
        })
      }
    }
  },
  created () {
    this.refreshOrganisation()
  },
  mounted () {
    Events.$on('user-changed', user => {
      this.refreshOrganisation()
    })
    Events.$on('context-id-changed', id => {
      this.refreshOrganisation()
    })
  }
}
</script>
