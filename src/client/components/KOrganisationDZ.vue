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
      :title="`Are you sure you want to delete \'${name}\' ?`"
      action="Delete"
      :prevent="{ capture: name, label: 'Please enter the name of this account to confim the deletion' }" 
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
    getService () {
      return this.$api.getService('organisations')
    },
    deletionClicked () {
      this.$refs.confirm.open()
    },
    deletionConfirmed () {
      this.$refs.confirm.close()
      this.getService().remove(this.id)
      .then(_ => {
        this.$store.set('organisation', null)
        this.$router.push({name: 'organisations-activity', params: { context: this.context } })
      })
    }
  },
  created () {
    // Load the components
    let loadComponent = this.$store.get('loadComponent')
    this.$options.components['k-block'] = loadComponent('frame/KBlock')
    this.$options.components['k-confirm'] = loadComponent('frame/KConfirm')
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