<template>
  <k-modal ref="modal" title="Invite a guest to join your organisation" :toolbar="toolbar" :buttons="buttons" :route="true">
    <div slot="modal-content" class="column xs-gutter">
      <k-form ref="form" :schema="schema" />
    </div>
  </k-modal>
</template>

<script>
import { mixins as kCoreMixins } from 'kCore/client'

export default {
  name: 'k-invite-member',
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
        "$id": "http://kalisio.xyz/schemas/invite-member",
        "title": "Invite Member Form",
        "description": "Invite member form",
        "type": "object",
        "properties": {
         "name": { 
            "type": "string", 
            "minLength": 3,
            "maxLength": 128,
            "field": {
              "component": "form/KTextField",
              "label": "Name",
              "helper": "Enter your guest's name",
            }
          },
          "email": { 
            "type": "string", 
            "format": "email",
            "field": {
              "component": "form/KEmailField",
              "label": "Email",
              "helper": "Enter your guest's email address",
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
        "required": ["name", "email", "role"]
      },
      toolbar: [
        { name: 'Close', icon: 'close', handler: () => this.doClose() }
      ],
      buttons: [
        { name: 'Invite', color: 'primary', handler: (event, done) => this.doInvite(event, done) }
      ],
    }
  },
  methods: {
    doInvite (event, done) {
      let result = this.$refs.form.validate()
      if (result.isValid) {
        // Add the sponsor information
        result.values.sponsor = {
          id: this.$store.get('user._id'),
          organisationId: this.contextId,
          roleGranted: result.values.role
        }
        // Create the user
        let usersService = this.$api.getService('users')
        usersService.create(result.values)
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
    // Load the required components
    this.$options.components['k-modal'] = this.$load('frame/KModal')
    this.$options.components['k-form'] = this.$load('form/KForm')
     // Initialize the form
    this.loadRefs()
    .then(() => {
      this.$refs.form.clear()
    })
  }
}
</script>
