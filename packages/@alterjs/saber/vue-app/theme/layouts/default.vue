<script>
export default {
  props: ['page'],
}
</script>

<template>
  <div>
    <h2 v-if="page.title">
      {{ page.title }}
    </h2>
    <slot name="default" />
  </div>
</template>
