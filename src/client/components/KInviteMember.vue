<template>
  <k-modal title="Invite a guest to join your organisation" :actions="actions" @close="close">
    <div slot="modal-content" class="column xs-gutter">
      <k-form ref="form" :schema="schema" />
    </div>
  </k-modal>
</template>

<script>
import { mixins as kCoreMixins } from 'kCore/client'
import { Toast } from 'quasar'

export default {
  name: 'k-invite-member',
  mixins: [
    kCoreMixins.refsResolver(['form'])
  ],
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
      actions: [
        { 
          name: 'Invite', 
          color: 'primary',
          handler: (event, done) => this.doInvite(event, done)
        }
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
          organisationId: this.$store.get('context._id'),
          role: result.values.role
        }
        // Create the user
        let usersService = this.$api.getService('users')
        usersService.create(result.values)
        .then(_ => {
          done()
          this.close()
        })
        .catch(_ => done())
      } else {
        done()
      }
    },
    close () {
      this.$router.push({ name: 'members-activity' })
    }
  },
  created () {
    let loadComponent = this.$store.get('loadComponent')
    this.$options.components['k-modal'] = loadComponent('frame/KModal')
    this.$options.components['k-form'] = loadComponent('form/KForm')
  }
}
</script>
