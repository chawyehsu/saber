<script>
import Wrap from '../components/Wrap.vue'

export default {
  components: {
    Wrap,
  },

  props: ['page'],

  head() {
    return {
      title: this.$siteConfig.title,
    }
  },
}
</script>

<template>
  <Wrap :page="page" :show-sidebar="false" :show-edit-info="false" main-width="960px">
    <slot />
  </Wrap>
</template>
