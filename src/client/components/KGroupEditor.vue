<template>
  <div v-if="group !== null">
    <k-modal ref="modal" 
      :title="group.name" 
      :toolbar="toolbar" 
      :buttons="buttons" 
      :options="{minWidth: '80vw', minHeight: '80vh'}"
      :route="true">
      <div slot="modal-content">  
        <q-tabs inverted color="primary" align="justify" v-model="currentTab">
          <!-- 
            Properties pane
          -->
          <q-tab name="properties" slot="title" icon="map" />
          <q-tab-pane name="properties">
            <k-editor service="groups" :id="id" />
          </q-tab-pane>
          <!-- 
            Members pane
          -->
          <template v-for="(role, index) in roleNames">
            <q-tab :key="index" :name="role" slot="title" :icon="roleIcons[index]" />
            <q-tab-pane :key="index" :name="role">
              <div class="row justify-start items-center xs-gutter">
                <template v-for="member in members[role]">
                  <div :key="member._id">
                    <q-chip small color="tertiary">
                      {{member.name}}
                    </q-chip>
                  </div>
                </template>
              </div>
            </q-tab-pane>
          </template>
        </q-tabs>
      </div>
    </k-modal>
  </div>
</template>

<script>
import _ from 'lodash'
import { mixins as kCoreMixins } from 'kCore/client'
import { QTabs, QTab, QTabPane, QChip } from 'quasar'
import { permissions as kCorePermissions } from 'kCore/common'
import { findMembersOfGroup } from '../../common/permissions'

export default {
  name: 'k-group-explorer',
  mixins: [kCoreMixins.objectProxy],
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
    }
  },
  data () {
    return {
      group: null,
      members: {},
      currentTab: this.perspective,
      toolbar: [
        { name: 'Close', icon: 'close', handler: () => this.doClose() }
      ]
    }
  },
  methods: {
    loadService () {
      this._service = this.$api.getService('groups')
      return this._service
    },
    doDone (event, done) {
      done()
      this.doClose()
    },
    doClose () {
      this.$refs.modal.close(_ => this.$router.push({ name: 'groups-activity' }))
    }
  },
  created () {
    this.$options.components['k-modal'] = this.$load('frame/KModal')
    this.$options.components['k-editor'] = this.$load('editor/KEditor')
    this.roleNames = kCorePermissions.RoleNames
    this.roleIcons = this.$config('roles.icons')
    // load the group
    this.loadObject()
    .then(object => {
      this.group = object
      // Load the members
      const membersService = this.$api.getService('members')
      findMembersOfGroup(membersService, this.id)
      .then(response => {
        let tempMembers = {}
        this.roleNames.forEach(role => tempMembers[role] = [])
        _.forEach(response.data, (member) => {
          let group = _.find(member.groups, { '_id':  this.id })
          tempMembers[group.permissions].push(member)
        })
        this.members = tempMembers
      })
    })
  }
}
</script>
