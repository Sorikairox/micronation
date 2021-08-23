<template>
  <svg
    @click="$emit('click')"
    width="28"
    height="28"
    viewBox="0 0 28 28"
    class="cursor-pointer fill-current"
  >
    <path
      d="M22.1667 7.47831L20.5217 5.83331L14 12.355L7.47837 5.83331L5.83337 7.47831L12.355 14L5.83337 20.5216L7.47837 22.1666L14 15.645L20.5217 22.1666L22.1667 20.5216L15.645 14L22.1667 7.47831Z"
      fill="#323232"
    />
  </svg>
</template>

<script>
export default {
  name: "AppDismissIcon",
};
</script>

<style></style>
