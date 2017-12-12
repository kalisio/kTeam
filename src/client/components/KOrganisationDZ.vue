<template>
  <div>
    <!-- 
      Page section
    -->
    <div class="row items-center justify-center full-width">
      <k-block class="col-10"
        color="red" 
        title="Delete this organisation ?"
        :text="blockText()"
        action="Delete"
        :disable="disable"
        @action-triggered="deletionClicked" />
    </div>
     <!-- 
      Confim section
     -->
     <k-confirm ref="confirm" 
      :title="`Are you sure you want to delete '${name}' ?`"
      action="Delete"
      :prevent="{ textToMatch: name, label: 'Please enter the name of this organisation to confim the deletion' }" 
      @confirmed="deletionConfirmed" />
  </div>
</template>

<script>
import { QInput, QBtn } from 'quasar'
import { mixins as kCoreMixins } from 'kCore/client'

export default {
  name: 'k-organisation-dz',
  components: {
    QInput,
    QBtn
  },
  mixins: [
    kCoreMixins.objectProxy
  ],
  computed: {
    disable () {
      return this.id === this.$store.get('user._id')
    }
  },
  data () {
    return {
      name: '',
    }
  },
  methods: {
    blockText () {
      if (!this.disable) {
        return "Please note that deleting \'" + this.name + 
               "\' will delete any data attached to this organisation."
      }
      return "You cannot delete this organisation because it is the default one attached to your account." +
             "<br>This organisation will be automatically deleted when deleting your account."
    },
    loadService () {
      return this.$api.getService('organisations')
    },
    deletionClicked () {
      this.$refs.confirm.open()
    },
    deletionConfirmed () {
      this.$refs.confirm.close()
      this.loadService().remove(this.id)
      .then(_ => {
        const organisations = this.$store.get('user').organisations
        const newCurrentOrg = organisations.length > 0 ? organisations[0] : null
        this.$router.push({ name: 'organisation-view', params: { contextId: newCurrentOrg ? newCurrentOrg._id : '' } })
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