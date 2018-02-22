<template>
  <div v-if="name !== ''" class="row items-center justify-center full-width">
    <div class="col-12">
      <k-block
        color="red" 
        title="Delete this organisation ?"
        :text="blockText()"
        action="Delete"
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
  computed: {
    disable () {
      return false
    }
  },
  data () {
    return {
      name: '',
    }
  },
  methods: {
    blockText () {
      return "Please note that deleting \'" + this.name + 
              "\' will delete any data attached to this organisation."
    },
    loadService () {
      return this.$api.getService('organisations')
    },
    onDeleteClicked () {
      Dialog.create({
        title: 'Are you sure you want to delete \'' + this.name + '\' ?',
        form: {
          confirm: {
            type: 'text',
            model: '',
            label: 'Enter the name of the organisation to confirm the deletion'
          }
        },
        buttons: [
          {
            label: 'Ok',
            preventClose: true,
            handler: (data, close) => {
              if (data.confirm === this.name) {
                close(() => { 
                  this.loadService().remove(this.id)
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
    .then(object => this.name = object.name)
  }
}
</script>