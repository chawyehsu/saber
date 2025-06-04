<script>
import format from 'date-fns/format'

export default {
  props: ['page'],

  methods: {
    format,
  },
}
</script>

<template>
  <div class="page-meta">
    <span class="page-date">
      {{ format(new Date(page.createdAt), 'MMM DD, YYYY') }}
    </span>
  </div>
</template>

<style scoped>
.page-meta {
  color: var(--text-light-color);
}
</style>
