<template>
  <div class="border border-gray-400 rounded shadow-md p-2 flex flex-col">
    <div
      v-if="hasTitle"
      class="shadow-inner bg-gray-100 rounded flex mb-2"
      :class="{ collapsable }"
      @click="
        if (collapsable) {
          collapsed = !collapsed;
        }
      "
    >
      <h2 class="w-full text-center font-bold uppercase">
        <slot name="title" />
        <template v-if="collapsable">
          <span v-if="collapsed">⇓</span>
          <span v-else>⇑</span>
        </template>
      </h2>
    </div>
    <div v-show="!collapsable || !collapsed">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    collapsable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      collapsed: false,
    };
  },
  computed: {
    hasTitle() {
      return !!this.$slots.title;
    },
  },
};
</script>

<style scoped>
.collapsable {
  cursor: pointer;
}
</style>
