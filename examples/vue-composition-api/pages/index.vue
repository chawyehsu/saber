<script>
// Using Vue 3.x composition API in Vue 2.x
import { computed, reactive, defineComponent } from 'vue'

// Wrapping component definition with `defineComponent`
// is only required for TypeScript users
export default defineComponent({
  setup() {
    const state = reactive({
      count: 0,
    })
    const doubleCount = computed(() => state.count * 2)
    return {
      state,
      doubleCount,
      increment() {
        state.count++
      },
    }
  },
})
</script>

<template>
  <button @click="increment">
    {{ state.count }} * 2 = {{ doubleCount }}
  </button>
</template>
