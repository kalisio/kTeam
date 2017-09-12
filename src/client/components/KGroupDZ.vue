<template>
  <div>
    <!-- 
      Page section
    -->
    <div v-if="name !== ''" class="row items-center justify-center full-width">
      <k-block class="col-10"
        color="red" 
        title="Delete this group ?"
        :text="`Please note that deleting \'${name}\' will delete any data attached to this group.`"
        action="Delete"
        @action-triggered="deletionClicked" />
    </div>
    <!-- 
      Modal section
     -->
     <k-modal ref="confirmModal" :title="`Are you sure you want to delete \'${name}\' ?`">
      <div slot="modal-content" class="column">
        <div>
          <q-input v-model="confirmName" float-label="Enter this organisation's name to confim" />
        </div>
        <div class="self-end" style="padding: 8px">
          <q-btn @click="deletionConfirmed" :disable="confirmName !== name" color="primary">Delete</q-btn>
        </div>
      </div>
     </k-modal>
  </div>
</template>

<script>
import { QInput, QBtn } from 'quasar'
import { mixins as kCoreMixins } from 'kCore/client'

export default {
  name: 'k-group-dz',
  components: {
    QInput,
    QBtn
  },
  mixins: [
    kCoreMixins.objectProxy
  ],
  props: {
    context: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true
    },
  },
  data () {
    return {
      name: '',
      confirmName: ''
    }
  },
  methods: {
    getService () {
      return this.$api.getService(this.service, this.context)
    },
    deletionClicked () {
      this.$refs.confirmModal.open()
    },
    deletionConfirmed () {
      this.$refs.confirmModal.close()
      this.$router.push({name: 'groups-activity', params: { context: this.context, service: 'groups' } })
    }
  },
  created () {
    // Load the components
    let loadComponent = this.$store.get('loadComponent')
    this.$options.components['k-block'] = loadComponent('frame/KBlock')
    this.$options.components['k-modal'] = loadComponent('frame/KModal')
    // Install an object-changed callback
    this.$on('object-changed', _ =>  {
      if (this.getObject()) {
        this.name = this.getObject().name
      } else {
        this.name = ''
      }
    })
  }
}
</script>