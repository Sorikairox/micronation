<template>
  <AppInputFrame
    :select="true"
    :border="false"
    :options="[{ name: 'test', value: 5 }]"
  />
</template>

<script>
import AppInputFrame from "~/components/atoms/AppInputFrame.vue";
export default {
  components: { AppInputFrame },
};
</script>

<style scoped></style>
