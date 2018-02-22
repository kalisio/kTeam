<template>
  <div v-if="member !== null">
    <k-modal ref="modal" :title="title" :toolbar="toolbar" :buttons="buttons" :route="true">
      <div slot="modal-content" class="column xs-gutter">
        <k-form ref="form" :schema="schema" />
      </div>
    </k-modal>
  </div>
</template>

<script>
import _ from 'lodash'
import { mixins as kCoreMixins } from 'kCore/client'

export default {
  name: 'k-join-group',
  mixins: [
    kCoreMixins.objectProxy,
    kCoreMixins.refsResolver(['form'])
  ],
  props: {
    contextId: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    }
  },
  computed: {
    title () {
      if (this.member === null) return ''
      return 'Add ' + this.member.name + ' to an existing group ?'
    },
    schema () {
      if (this.member === null) return {}
      return {
        "$schema": "http://json-schema.org/draft-06/schema#",
        "$id": "http://kalisio.xyz/schemas/join-group#",
        "title": "Join Group Form",
        "description": "Join group form",
        "type": "object",
        "properties": {
          "group": { 
            "type": "array",
            "services": [{
              "service": this.contextId + "/groups",
              "field": "name",
              "baseQuery": {
                "_id": { "$nin": _.map(this.member.groups, '_id') }
              }
            }],
            "field": {
              "component": "form/KItemField",
              "label": "Group",
              "helper": "Enter the name of the group",
            }
          },
          "role": { 
            "type": "string",
            "default": "member",
            "field": {
              "component": "form/KSelectField",
              "label": "Role",
              "helper": "Select the role you want to grant",
              "type": "radio",
              "options": [
                { "label": "Owner", "value": "owner" },
                { "label": "Manager", "value": "manager" },
                { "label": "Member", "value": "member" }
              ]
            }
          }
        },
        "required": ["group", "role"]
      }
    }
  },
  data () {
    return {
      toolbar: [
        { name: 'Close', icon: 'close', handler: () => this.doClose() }
      ],
      buttons: [
        { name: 'Add', color: 'primary', handler: (event, done) => this.doJoin(event, done) }
      ],
      member: null
    }
  },
  methods: {
    loadService () {
      return this.$api.getService('members')
    },
    doJoin (event, done) {
      let result = this.$refs.form.validate()
      if (result.isValid) {
        let authorisationService = this.$api.getService('authorisations')
        authorisationService.create({
          scope: 'groups',
          permissions: result.values.role,
          subjects: this.id,
          subjectsService: this.contextId + '/members',
          resource: result.values.group[0]._id,
          resourcesService: this.contextId + '/groups'
        })
        .then(() => {
          done()
          this.doClose()
        })
        .catch(error => {
          done()
          throw error 
        })
      } else {
        done()
      }
    },
    doClose () {
      this.$refs.modal.close(() => this.$router.push({ name: 'members-activity' }))
    }
  },
  created () {
    this.$options.components['k-modal'] = this.$load('frame/KModal')
    this.$options.components['k-form'] = this.$load('form/KForm')
    // Load the member
    this.loadObject()
    .then(object => {
      this.member = object
    })
  }
}
</script>
