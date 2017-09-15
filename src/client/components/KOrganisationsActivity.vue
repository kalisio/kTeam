<template>
  <div>
    <!--
      Create routing
    -->
    <div v-if="operation === 'create'">
      <k-popup-editor service="organisations" />
    </div>
    <!--
      Manage routing
    -->
    <div v-else-if="operation === 'manage'">
      <k-nav-bar :tabs="navBarTabs()" :selected="perspective" />
      <div v-if="perspective === 'billing'">
        <k-editor service="organisations" :id="id" perspective="billing" />
      </div>
      <div v-else-if="perspective === 'danger-zone'">
        <k-organisation-dz :id="id" />
      </div>
      <div v-else>
        <k-editor service="organisations" :id="id" />
      </div>
    </div>
    <!-- 
      Default routing
     -->
    <div v-else>
      Homepage of the organisation
    </div>
  </div>
</template>

<script>
import { mixins as kCoreMixins } from 'kCore/client'
import mixins from '../mixins'

export default {
  name: 'k-organisations-activity',
  mixins: [
    kCoreMixins.baseActivity,
  ],
  props: {
    operation: {
      type: String,
      default: '',
    },
    id : {
      type: String,
      default: function () {
        let id = this.$store.get('organisation._id')
        if (!id) {
          this.$store.set('organisation', this.$store.get('user.organisations')[0])
          id = this.$store.get('organisation._id')
        }
        return id
      }
    },
    perspective: {
      type: String,
      default: 'properties',
    }
  },
  methods: {
    navBarTabs () {
      return [ 
        { name: 'properties', label: 'Properties', icon: 'description', route: { 
          name: 'organisations-activity', params: { operation: 'manage', id: this.id } } 
        },
        { name: 'billing', label: 'Billing', icon: 'credit_card', route: 
          { name: 'organisations-activity', params: { operation: 'manage', id: this.id, perspective: 'billing' } } 
        },
        { name: 'danger-zone', label: 'Danger Zone', icon: 'warning', route: 
          { name: 'organisations-activity', params: { operation: 'manage', id: this.id, perspective: 'danger-zone' } } 
        }       
      ]
    }
  },
  created () {
    // Load the required components
    let loadComponent = this.$store.get('loadComponent')
    this.$options.components['k-editor'] = loadComponent('editor/KEditor')
    this.$options.components['k-nav-bar'] = loadComponent('layout/KNavBar')
    this.$options.components['k-organisation-dz'] = loadComponent('KOrganisationDZ')
  }
}
</script>