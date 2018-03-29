<template>
  <k-modal ref="modal" :title="$t('KInviteMember.TITLE')" :toolbar="getToolbar()" :buttons="getButtons()" :route="true">
    <div slot="modal-content" class="column xs-gutter">
      <k-form ref="form" :schema="getSchema()" />
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
  methods: {
    getSchema () {
      return {
        "$schema": "http://json-schema.org/draft-06/schema#",
        "$id": "http://kalisio.xyz/schemas/invite-member",
        "title": "Invite Member Form",
        "type": "object",
        "properties": {
         "name": { 
            "type": "string", 
            "minLength": 3,
            "maxLength": 128,
            "field": {
              "component": "form/KTextField",
              "helper": "KInviteMember.NAME_FIELD_HELPER"
            }
          },
          "email": { 
            "type": "string", 
            "format": "email",
            "field": {
              "component": "form/KEmailField",
              "helper": "KInviteMember.EMAIL_FIELD_HELPER"
            }
          },
          "role": { 
            "type": "string",
            "default": "member",
            "field": {
              "component": "form/KSelectField",
              "helper": "KInviteMember.ROLE_FIELD_HELPER",
              "type": "radio",
              "options": [
                { "label": this.$t('KInviteMember.OWNER_LABEL'), "value": "owner" },
                { "label": this.$t('KInviteMember.MANAGER_LABEL'), "value": "manager" },
                { "label": this.$t('KInviteMember.MEMBER_LABEL'), "value": "member" }
              ]
            }
          }
        },
        "required": ["name", "email", "role"]
      }
    },
    getToolbar () {
      return [
        { name: 'close-action', label: this.$t('KInviteMember.CLOSE_ACTION'), icon: 'close', handler: () => this.doClose() }
      ]
    },
    getButtons () {
      return [
        { name: 'invite-button', label: this.$t('KInviteMember.INVITE_BUTTON'), color: 'primary', handler: (event, done) => this.doInvite(event, done) }
      ]
    },
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
  }
}
</script>
