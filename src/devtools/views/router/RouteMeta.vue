<template>
  <scroll-pane>
    <div v-if="activeRouteChange" slot="scroll" class="data-fields">
      <data-field v-for="(value, key) of activeRouteChange"
        :key="key"
        :field="{ key, value }"
        :depth="0">
      </data-field>
    </div>
    <div v-else slot="scroll" class="no-route-data">
      No route change selected
    </div>
  </scroll-pane>
</template>

<script>
import DataField from 'components/DataField.vue'
import ScrollPane from 'components/ScrollPane.vue'
import { mapState, mapGetters } from 'vuex'

export default {
	components: {
    	DataField,
    	ScrollPane
  	},
	computed: {
		...mapGetters('router', [
		  'activeRouteChange'
		])
	}
}
</script>

<style lang="stylus" scoped>
@import "../../common"

.no-route-data
  color: #ccc;
  text-align: center;
  margin-top: 50px;
  line-height: 30px;
</style>
