<template>
  <k-modal ref="modal" title="Authorize">
    <div slot="modal-content" class="column xs-gutter">
      <k-autocomplete :services="services()" @item-selected="onSubjectSelected" />
      <div class="row justify-around">
        <div>
          As 
        </div>
        <div>
          <q-option-group
            inline
            color="secondary"
            type="radio"
            v-model="permission"
            :options="permissions" />
        </div>
      </div>
      <div class="self-end">
        <q-btn color="primary" @click="onApplyClicked">Apply</q-btn>
      </div>
    </div>
  </k-modal>
</template>

<script>
import { QBtn, QOptionGroup } from 'quasar'

export default {
  name: 'k-authoriser',
  components: {
    QOptionGroup,
    QBtn
  },
  props: {
    permissions: {
      type: Array,
      default: function () {
        return [
          { label: 'Member', value: 'member' },
          { label: 'Manager', value: 'manager' },
          { label: 'Owner', value: 'owner' }
        ]
      }
    }
  },
  data () {
    return {
      permission: 'member'
    }
  },
  methods: {
    open () {
      this.$refs.modal.open()
    },
    close () {
      this.$refs.modal.close()
    },
    services () {
      let services = [{
        service: 'users',
        field: 'name',
        icon: 'user'
      }]
      return services
    },
    onSubjectSelected (subject) {
      console.log(subject)
    },
    onApplyClicked () {
      this.close()
    }
  },
  created () {
    // Load the required components
    let loadComponent = this.$store.get('loadComponent')
    this.$options.components['k-modal'] = loadComponent('frame/KModal')
    this.$options.components['k-autocomplete'] = loadComponent('collection/KAutocomplete')
  }
}
</script>