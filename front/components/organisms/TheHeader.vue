<template>
  <div class="grid w-full grid-cols-2 py-2 bg-white shadow-md px-7">
    <div class="flex flex-row items-center justify-start space-x-8">
      <AppIconHome classs="w-10 h-10" />
      <AppButton to="edit" size="medium" variant="contained" class="bg-primary-dark"
        >Editer le drapeau</AppButton
      >
      <AppButton to="/">Accueil</AppButton>
      <AppButton to="about" >A propos</AppButton>
    </div>
    <div v-if="loggedIn" class="flex justify-end">
      <AppButton icon="left" variant="contained" class="bg-primary-dark"
        ><template #icon><AppPersonIcon /></template>Pseudo</AppButton
      >
    </div>
    <div v-else class="flex justify-end space-x-8">
      <AppButton variant="outlined" size="medium">S'inscrire</AppButton>
      <AppButton variant="contained" class="bg-primary-dark" size="medium"
        >Se connecter</AppButton
      >
    </div>
  </div>
</template>

<script>
import AppButton from "~/components/atoms/AppButton.vue";
import AppIconHome from "~/components/atoms/icons/AppHomeIcon.vue";
import AppPersonIcon from "~/components/atoms/icons/AppPersonIcon.vue";

export default {
  components: { AppIconHome, AppButton, AppPersonIcon },
  name: "TheHeader",
  props: {
    loggedIn: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style></style>
