<template>
  <AppButton variant="contained" size="medium"
    >Button <template v-slot:icon><AppHomeIcon /></template
  ></AppButton>
</template>

<script>
import AppButton from "~/components/atoms/AppButton.vue";
import AppHomeIcon from "~/components/atoms/icons/AppHomeIcon.vue";
export default {
  components: { AppButton, AppHomeIcon },
};
</script>

<style scoped></style>
