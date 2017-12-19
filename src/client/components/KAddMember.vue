<template>
  <k-modal title="Add a member to your organisation" :actions="actions" @close="close">
    <div slot="modal-content" class="column xs-gutter">
      <!--k-autocomplete :services="subjectSearchServices()" @item-selected="onSubjectSelected" /-->
      <k-form ref="form" :schema="schema" />
    </div>
  </k-modal>
</template>

<script>
import { mixins as kCoreMixins } from 'kCore/client'
import { QBtn, QOptionGroup } from 'quasar'

export default {
  name: 'k-add-member',
  mixins: [
    kCoreMixins.refsResolver(['form'])
  ],
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
                //"organisations._id": "{ $nin: [" + this.$store.get('context._id') + "] }", 
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
      actions: [
        { 
          name: 'Add', 
          color: 'primary',
          handler: (event, done) => this.doAdd(event, done)
        }
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
          subjects: this.subject._id,
          subjectsService: 'users',
          resource: this.contextId,
          resourcesService: 'organisations'
        })
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
