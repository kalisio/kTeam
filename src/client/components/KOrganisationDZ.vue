<template>
  <div v-if="name !== ''" class="row items-center justify-center full-width">
    <div class="col-12">
      <k-block
        color="red" 
        :title="$t('KOrganisationDZ.BLOCK_TITLE')"
        :text="$t('KOrganisationDZ.BLOCK_TEXT', {organisation: name})"
        :action="$t('KOrganisationDZ.BLOCK_ACTION')"
        @action-triggered="onDeleteClicked" />
    </div>
  </div>
</template>

<script>
import { Dialog } from 'quasar'
import { mixins as kCoreMixins } from 'kCore/client'

export default {
  name: 'k-organisation-dz',
  mixins: [
    kCoreMixins.objectProxy
  ],
  data () {
    return {
      name: ''
    }
  },
  methods: {
    /* blockText () {
      return this.$i18n.i18next('KOrganisationDZ.BLOCK_TEXT', {organsation: this.name})
    }, */
    loadService () {
      return this.$api.getService('organisations')
    },
    onDeleteClicked () {
      Dialog.create({
        title: this.$t('KOrganisationDZ.DIALOG_TITLE', {organisation: this.name}),
        form: {
          confirm: {
            type: 'text',
            model: '',
            label: this.$t('KOrganisationDZ.DIALOG_HELPER')
          }
        },
        buttons: [
          {
            label: 'Ok',
            preventClose: true,
            handler: (data, close) => {
              if (data.confirm === this.name) {
                close(() => {
                  this.loadService().remove(this.objectId)
                  .then(() => {
                    this.$router.push({ name: 'home' })
                  })
                })
              }
            }
          },
          'Cancel'
        ]
      })
    }
  },
  created () {
    // Load the components
    this.$options.components['k-block'] = this.$load('frame/KBlock')
    // Update underlying object
    this.loadObject()
    .then(object => {
      this.name = object.name
    })
  }
}
</script>