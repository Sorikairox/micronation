<template>
  <div
    class="flex flex-col p-4 space-y-4 bg-white border rounded-md  prose-roboto border-primary-base"
  >
    <div class="flex flex-row items-center justify-between pb-2">
      <h5>Inscription</h5>
      <AppDismissIcon />
    </div>
    <div class="flex flex-col space-y-2">
      <p class="body-1">Rentrez votre adresse mail.</p>
      <AppInputFrame
        label="Mail"
        :select="false"
        :border="true"
        placeholder="xyz@gmail.com"
      />
      <div class="flex flex-col space-y-1">
        <span class="body-1">Captcha :</span>
      </div>
      <AppStepLine />
      <div class="flex flex-row justify-between">
        <AppButton variant="outlined">Annuler</AppButton>
        <AppButton variant="contained" class="bg-primary-dark"
          >Suivant</AppButton
        >
      </div>
    </div>
  </div>
</template>

<script>
import AppDismissIcon from "../atoms/icons/AppDismissIcon.vue";
import AppInputFrame from "../atoms/AppInputFrame.vue";
import AppStepLine from "../molecules/AppStepLine.vue";
import AppButton from "../atoms/AppButton.vue";

export default {
  name: "SubscribeForm",
  components: { AppDismissIcon, AppInputFrame, AppStepLine, AppButton },
};
</script>

<style></style>
