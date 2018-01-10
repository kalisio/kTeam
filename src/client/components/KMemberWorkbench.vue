<template>
  <k-modal ref="modal" 
    title="Member" 
    :toolbar="toolbar" 
    :route="true">
    <div slot="modal-content">  
      <q-tabs ref="tabs" inverted color="primary" align="justify" v-model="currentTab">
        <!-- 
          Tags pane
        -->
        <q-tab name="tags" slot="title" icon="local_offer" />
        <q-tab-pane name="tags">
          <div class="colum full-width justify-center">
            <k-grid service="tags" :renderer="renderer" :base-query="tagsQuery()" />
          </div>
        </q-tab-pane>
        <!-- 
          Groups pane
        -->
        <q-tab name="groups" slot="title" icon="group_work" />
        <q-tab-pane name="groups">
          <k-grid service="groups" :renderer="renderer" :base-query="groupsQuery()" />
        </q-tab-pane>
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
      default: 'tags'
    }
  },
  data () {
    return {
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
    tagsQuery () {
      return {}
    },
    groupsQuery () {
      return {}
    },
    /* FIXME: must implement a global 'done' button
    doDone (event, done) {
      done()
      this.doClose()
    },*/
    doClose () {
      this.$refs.modal.close(_ => this.$router.push({ name: 'members-activity' }))
    }
  },
  created () {
    this.$options.components['k-modal'] = this.$load('frame/KModal')
    this.$options.components['k-grid'] = this.$load('collection/KGrid')
  }
}
</script>
