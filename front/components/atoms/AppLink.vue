<template>
  <span class="prose-roboto">
    <a
      :href="link"
      target="_blank"
      rel="noreferrer noopener"
      class="cursor-pointer text-primary-base body-1"
      ><slot></slot
    ></a>
  </span>
</template>

<script>
export default {
  name: "AppLink",
  props: {
    link: {
      type: String,
      default: undefined,
    },
  },
  computed: {},
};
</script>

<style></style>
