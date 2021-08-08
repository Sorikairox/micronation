<template>
  <div
    class="flex flex-col items-center p-4 m-4 space-y-4 border prose-montserrat"
  >
    <h3>Atoms examples</h3>

    <AppButton variant="contained" size="medium" icon="left"
      ><template #icon><AppHomeIcon /></template>Master</AppButton
    >
    <LabeledInputFrame
      label="Oui."
      :select="false"
      :border="true"
      :options="[{ name: 'Placeholder', value: 5 }]"
      errorMessage="P'tite erreur des familles"
      ><template #add-on><AppHomeIcon /></template
    ></LabeledInputFrame>
    <AppLink link="https://www.youtube.com/user/dirtybiology"
      >This is a link</AppLink
    >
    <AppError>This is an error</AppError>
    <theHeader />
  </div>
</template>

<script>
import AppLink from "~/components/atoms/AppLink";
import AppError from "~/components/atoms/AppError";
import AppButton from "~/components/atoms/AppButton.vue";
import LabeledInputFrame from "~/components/molecules/LabeledInputFrame.vue";
import AppHomeIcon from "~/components/atoms/icons/AppHomeIcon.vue";
import TheHeader from "~/components/organisms/TheHeader.vue";

export default {
  components: {
    LabeledInputFrame,
    AppLink,
    AppError,
    AppButton,
    AppHomeIcon,
    TheHeader,
  },
};
</script>
<style scoped></style>
