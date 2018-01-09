<template>
  <k-modal ref="modal" title="Add a member to your organisation" :toolbar="toolbar" :buttons="buttons" :route="true">
    <div slot="modal-content" class="column xs-gutter">
      <k-form ref="form" :schema="schema" />
    </div>
  </k-modal>
</template>

<script>
import { mixins as kCoreMixins } from 'kCore/client'

export default {
  name: 'k-add-member',
  mixins: [
    kCoreMixins.refsResolver(['form'])
  ],
  props: {
    contextId: {
      type: String,
      required: true,
    }
  },
  data () {
    return {
      schema: {
        "$schema": "http://json-schema.org/draft-06/schema#",
        "$id": "http://kalisio.xyz/schemas/add-member#",
        "title": "Add Member Form",
        "description": "Add member form",
        "type": "object",
        "properties": {
          "user": { 
            "type": "array",
            "services": [{
              "service": "users",
              "field": "profile.name",
              "baseQuery": {
                "organisations._id": { "$nin": [this.contextId] },
                "$select": ["profile"]
              }
            }],
            "field": {
              "component": "form/KItemField",
              "label": "User",
              "helper": "Select the user to add",
            }
          },
          "role": { 
            "type": "string",
            "default": "member",
            "field": {
              "component": "form/KSelectField",
              "label": "Role",
              "helper": "Select the role of the user",
              "type": "radio",
              "options": [
                { "label": "Owner", "value": "owner" },
                { "label": "Manager", "value": "manager" },
                { "label": "Member", "value": "member" }
              ]
            }
          }
        },
        "required": ["user", "role"]
      },
      toolbar: [
        { name: 'Close', icon: 'close', handler: () => this.doClose() }
      ],
      buttons: [
        { name: 'Add', color: 'primary', handler: (event, done) => this.doAdd(event, done) }
      ],
    }
  },
  methods: {
    doAdd (event, done) {
      let result = this.$refs.form.validate()
      if (result.isValid) {
        let authorisationService = this.$api.getService('authorisations')
        authorisationService.create({
          scope: 'organisations',
          permissions: result.values.role,
          subjects: result.values.user[0]._id,
          subjectsService: 'users',
          resource: this.contextId,
          resourcesService: 'organisations'
        })
        .then(_ => {
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
      this.$refs.modal.close(_ => this.$router.push({ name: 'members-activity' }))
    }
  },
  created () {
    this.$options.components['k-modal'] = this.$load('frame/KModal')
    this.$options.components['k-form'] = this.$load('form/KForm')
  }
}
</script>
