<template>
  <k-modal ref="modal" :title="$t('KInviteMember.TITLE')" :toolbar="getToolbar()" :buttons="getButtons()" :route="true">
    <q-tabs slot="modal-content" align="justify" v-model="mode" inverted>
      <q-tab name="unique" icon="person"  />
      <q-tab name="multiple" icon="people"  />
    </q-tabs>
    <q-tab-panels v-model="mode" animated>
      <q-tab-panel name="unique">
        <k-form ref="form" :schema="getSchema()" />
      </q-tab-panel>
      <q-tab-panel name="multiple">
        <q-field
          :helper="$t('KInviteMember.FILE_FIELD_HELPER')"
          :error-label="fileErrorLabel"
          :error="fileError">
            <k-input-file 
              :mime-types="['txt/csv', 'application/vnd.ms-excel']"
              :clearable="true"
              @cleared="onInputFileCleared"
              @rejected="onInputFileRejected" 
              @failed="onInputFileFailed" 
              @loaded="onInputFileLoaded" />
        </q-field>
      </q-tab-panel>
    </q-tab-panels>
  </k-modal>
</template>

<script>
import { Dialog } from 'quasar'
import { permissions as kCorePermissions, mixins as kCoreMixins, utils } from '@kalisio/kdk-core/client'
import Papa from 'papaparse'

export default {
  name: 'k-invite-member',
  mixins: [
    kCoreMixins.refsResolver(['form'])
  ],
  props: {
    contextId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      mode: 'unique',
      fileError: false,
      fileErrorLabel: '',
      fileContent: ''
    }
  },
  methods: {
    getSchema () {
      return {
        '$schema': 'http://json-schema.org/draft-06/schema#',
        '$id': 'http://kalisio.xyz/schemas/invite-member',
        'title': 'Invite Member Form',
        'type': 'object',
        'properties': {
          'name': {
            'type': 'string',
            'minLength': 3,
            'maxLength': 128,
            'field': {
              'component': 'form/KTextField',
              'helper': 'KInviteMember.NAME_FIELD_HELPER'
            }
          },
          'email': {
            'type': 'string',
            'format': 'email',
            'field': {
              'component': 'form/KEmailField',
              'helper': 'KInviteMember.EMAIL_FIELD_HELPER'
            }
          },
          'role': {
            'type': 'string',
            'default': 'member',
            'field': {
              'component': 'form/KSelectField',
              'helper': 'KInviteMember.ROLE_FIELD_HELPER',
              'type': 'radio',
              'options': [
                { 'label': this.$t('KInviteMember.MEMBER_LABEL'), 'value': 'member' },
                { 'label': this.$t('KInviteMember.MANAGER_LABEL'), 'value': 'manager' },
                { 'label': this.$t('KInviteMember.OWNER_LABEL'), 'value': 'owner' }
              ]
            }
          }
        },
        'required': ['name', 'email', 'role']
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
      if (this.mode === 'unique') {
        let result = this.$refs.form.validate()
        if (result.isValid) this.doInviteUnique(result.values, done)
        else done()
      } else {
        if (this.fileContent !== '') {
          let result = Papa.parse(this.fileContent, { skipEmptyLines: true })
          this.doInviteMultiple(result.data, done)
        } else {
          this.fileError = true
          done()
        }
      }
    },
    async doInviteUnique (data, done) {
      // Add the locale information
      data.locale = utils.getLocale()
      // Add the sponsor information
      data.sponsor = {
        id: this.$store.get('user._id'),
        organisationId: this.contextId,
        roleGranted: data.role
      }
      // Remove the role from the form data
      delete data.role
      // Create the user
      let usersService = this.$api.getService('users')
      await usersService.create(data)
      done()
      this.doClose()
    },
    async doInviteMultiple (data, done) {
      let errors = []
      let guests = []
      let emailExpr = /\S+@\S+\.\S+/
      for (let i = 0; i < data.length; i++) {
        let record = data[i]
        if (record.length === 3 && emailExpr.test(record[1]) && kCorePermissions.RoleNames.includes(record[2])) {
          let guest = {
            locale: utils.getLocale(),
            sponsor: {
              id: this.$store.get('user._id'),
              organisationId: this.contextId,
              roleGranted: record[2]
            },
            name: record[0],
            email: record[1]
          }
          guests.push(guest)
        } else {
          let error = {
            line: i + 1,
            record: record
          }
          errors.push(error)
        }
      }
      if (guests.length === 0) {
        Dialog.create({
          title: this.$t('KInviteMember.ALERT_FILE_IMPORT_DIALOG'),
          message: this.$t('KInviteMember.ALERT_FILE_IMPORT_MESSAGE'),
          buttons: [{
            label: this.$t('OK')
          }]
        })
        done()
      } else if (errors.length > 0) {
        Dialog.create({
          title: this.$t('KInviteMember.CONFIRM_FILE_IMPORT_DIALOG'),
          message: this.$t('KInviteMember.CONFIRM_FILE_IMPORT_MESSAGE', { errors: errors.length, records: data.length }),
          buttons: [{
            label: this.$t('OK'),
            handler: async () => {
              let usersService = this.$api.getService('users')
              for (let i = 0; i < guests.length; ++i) await usersService.create(guests[i])
              done()
              this.doClose()
            }
          }, {
            label: this.$t('KInviteMember.CANCEL_BUTTON'), handler: () => done()
          }]
        })
      } else {
        let usersService = this.$api.getService('users')
        for (let i = 0; i < guests.length; ++i) await usersService.create(guests[i])
        done()
        this.doClose()
      }
    },
    doClose () {
      this.$refs.modal.close(() => this.$router.push({ name: 'members-activity' }))
    },
    onInputFileCleared () {
      this.fileError = false
      this.fileContent = ''
    },
    onInputFileRejected () {
      this.fileError = true
      this.fileErrorLabel = this.$t('KInviteMember.INVALID_FILE_TYPE')
    },
    onInputFileFailed () {
      this.fileError = true
      this.fileErrorLabel = this.$t('KInviteMember.ERROR_WHILE_LOADING_THE_FILE')
    },
    onInputFileLoaded (content) {
      this.fileError = false
      this.fileContent = content
    }
  },
  created () {
    // Load the required components
    this.$options.components['k-modal'] = this.$load('frame/KModal')
    this.$options.components['k-form'] = this.$load('form/KForm')
    this.$options.components['k-input-file'] = this.$load('input/KInputFile')
  }
}
</script>
