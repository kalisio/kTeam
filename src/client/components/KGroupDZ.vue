<template>
  <div>
    <!-- 
      Page section
    -->
    <div v-if="name !== ''" class="row items-center justify-center full-width">
      <k-block class="col-10"
        color="red" 
        title="Delete this group ?"
        :text="`Please note that deleting '${name}' will delete any data attached to this group.`"
        action="Delete"
        @action-triggered="deletionClicked" />
    </div>
    <!-- 
      Confim section
     -->
     <k-confirm ref="confirm" 
      :title="`Are you sure you want to delete '${name}' ?`"
      action="Yes"
      @confirmed="deletionConfirmed" />
  </div>
</template>

<script>
import { QInput, QBtn } from 'quasar'
import { mixins } from 'kCore/client'

export default {
  name: 'k-group-dz',
  components: {
    QInput,
    QBtn
  },
  mixins: [
    mixins.service,
    mixins.objectProxy
  ],
  props: {
    context: {
      type: String,
      required: true,
    }
  },
  data () {
    return {
      name: '',
      confirmName: ''
    }
  },
  methods: {
    loadService () {
      return this._service = this.$api.getService('groups')
    },
    deletionClicked () {
      this.$refs.confirm.open()
    },
    deletionConfirmed () {
      this.$refs.confirm.close()
      this.getService().remove(this.id)
      .then(_ => {
        this.$router.push({name: 'groups-activity', params: { context: this.$store.get('context._id') } })
      })
    }
  },
  created () {
    // Load the components
    let loadComponent = this.$store.get('loadComponent')
    this.$options.components['k-block'] = loadComponent('frame/KBlock')
    this.$options.components['k-confirm'] = loadComponent('frame/KConfirm')
    // Update underlying object
    this.loadObject()
    .then(object => this.name = object.name)
  }
}
</script>