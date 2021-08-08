<template>
  <div class="flex flex-col items-center p-4 m-4 space-y-4 border">
    <AppButton variant="contained" size="medium">Master</AppButton>
    <AppInputFrame
      :select="true"
      :border="false"
      :options="[{ name: 'test', value: 5 }]"
    />
    <AppLink link="https://www.youtube.com/user/dirtybiology"
      >This is a link</AppLink
    >
    <AppError>This is an error</AppError>
  </div>
</template>

<script>
import AppInputFrame from "~/components/atoms/AppInputFrame";
import AppLink from "~/components/atoms/AppLink";
import AppError from "~/components/atoms/AppError";
import AppButton from "~/components/atoms/AppButton.vue";

export default {
  components: { AppInputFrame, AppLink, AppError, AppButton },
};
</script>

AppButton
<style scoped></style>
