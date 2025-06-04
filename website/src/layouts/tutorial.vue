<script>
import Wrap from '../components/Wrap.vue'
import DocMixin from '../mixins/doc'

export default {
  components: {
    Wrap,
  },

  mixins: [DocMixin],

  props: ['page'],

  head() {
    return {
      title: `${this.page.title} - Saber`,
    }
  },
}
</script>

<template>
  <Wrap :page="page" :show-sidebar="false">
    <div class="page-title">
      {{ page.title }}
    </div>
    <div class="page-content">
      <slot name="default" />
    </div>
  </Wrap>
</template>
