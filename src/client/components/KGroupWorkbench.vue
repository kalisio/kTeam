<template>
  <k-modal ref="modal" 
    title="Group" 
    :toolbar="toolbar" 
    :route="true">
    <div slot="modal-content">  
      <q-tabs ref="tabs" inverted color="primary" align="justify" v-model="currentTab">
        <!-- 
          Properties pane
        -->
        <q-tab name="properties" slot="title" icon="description" />
        <q-tab-pane name="properties">
          <div class="colum full-width justify-center">
            <k-editor service="groups" :id="id" />
          </div>
        </q-tab-pane>
        <!-- 
          Members pane
        -->
        <template v-for="(role, index) in roleNames">
          <q-tab :key="index" :name="role" slot="title" :icon="roleIcons[index]" />
          <q-tab-pane :key="index" :name="role">
            <div class="colum full-width justify-center">
              <k-grid service="members" :renderer="renderer" :base-query="roleQuery(role)" />
            </div>
          </q-tab-pane>
        </template>
      </q-tabs>
    </div>
  </k-modal>
</template>

<script>
import _ from 'lodash'
import { QTabs, QTab, QTabPane, QChip } from 'quasar'
import { permissions as kCorePermissions } from 'kCore/common'

export default {
  name: 'k-group-editor',
  components: {
    QTabs,
    QTab,
    QTabPane,
    QChip
  },
  props: {
    contextId: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    perspective: {
      type: String,
      default: 'properties'
    }
  },
  data () {
    return {
      group: null,
      members: {},
      currentTab: this.perspective,
      toolbar: [
        { name: 'Close', icon: 'close', handler: () => this.doClose() }
      ],
      renderer: {
        component: 'collection/KChipItem'
      }
    }
  },
  methods: {
    roleQuery (role) {
      return { 'groups._id': this.id, 'groups.permissions': role }
    },
    /* FIXME: must implement a global 'done' button
    doDone (event, done) {
      done()
      this.doClose()
    },*/
    doClose () {
      this.$refs.modal.close(_ => this.$router.push({ name: 'groups-activity' }))
    }
  },
  created () {
    this.$options.components['k-modal'] = this.$load('frame/KModal')
    this.$options.components['k-editor'] = this.$load('editor/KEditor')
    this.$options.components['k-grid'] = this.$load('collection/KGrid')
    this.roleNames = kCorePermissions.RoleNames
    this.roleIcons = this.$config('roles.icons')
  }
}
</script>
