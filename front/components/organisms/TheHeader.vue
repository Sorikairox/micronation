<template>
  <div
    class="flex items-center justify-between w-full py-2 bg-white shadow-md sm:grid sm:grid-cols-2 px-7"
  >
    <div class="flex flex-row items-center justify-start space-x-8">
      <img id="db-icon" src="~/assets/icon-dirtybiology.jpeg" alt="Dirtybiology logo">

      <AppButton :to="{ name: 'index' }">
        <template v-slot:icon><AppFlagIcon /></template>
        <span class="hidden md:block whitespace-nowrap">Drapeau</span>
      </AppButton>

      <AppButton
        :to="{ name: 'edit' }"
        size="medium"
        variant="contained"
        class="bg-primary-dark"
      >
        <template v-slot:icon><AppCreateIcon /></template>
        <span class="hidden md:block whitespace-nowrap">Éditer le drapeau</span>
      </AppButton>

      <AppButton :to="{ name: 'about' }">
        <template v-slot:icon><AppInfoIcon /></template>
        <span class="hidden md:block whitespace-nowrap">À propos</span>
      </AppButton>

      <AppButton :to="{ name: 'history' }">
        <template v-slot:icon><AppInfoIcon /></template>
        <span class="hidden md:block whitespace-nowrap">Historique</span>
      </AppButton>
    </div>
    <!-- <div v-if="loggedIn" class="flex justify-end">
      <AppButton icon="left" variant="contained" class="bg-primary-dark"
        ><template #icon><AppPersonIcon /></template
        ><span class="hidden lg:block">Pseudo</span></AppButton
      >
    </div>
    <div v-else class="flex justify-end space-x-8">
      <AppButton variant="outlined" size="medium" class="hidden lg:block"
        >S'inscrire</AppButton
      >
      <AppButton variant="outlined" size="medium" class="lg:hidden"
        ><template #icon><AppRegisterIcon /></template
      ></AppButton>
      <AppButton
        variant="contained"
        class="hidden bg-primary-dark lg:block"
        size="medium"
        >Se connecter</AppButton
      >
      <AppButton
        variant="contained"
        size="medium"
        class="bg-primary-dark lg:hidden"
        ><template #icon><AppLogInIcon /></template
      ></AppButton>
    </div>-->
  </div>
</template>

<script>
import AppButton from "../atoms/AppButton.vue";
import AppInfoIcon from "../atoms/icons/AppInfoIcon.vue";
import AppLogInIcon from "../atoms/icons/AppLogInIcon.vue";
import AppRegisterIcon from "../atoms/icons/AppRegisterIcon.vue";
import AppFlagIcon from "../atoms/icons/AppFlagIcon.vue";
import AppCreateIcon from "../atoms/icons/AppCreateIcon";

export default {
  components: {
    AppCreateIcon,
    AppButton,
    AppInfoIcon,
    AppLogInIcon,
    AppRegisterIcon,
    AppFlagIcon,
  },
  name: "TheHeader",
  props: {
    loggedIn: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      openMobileNav: false,
    };
  },
  methods: {
    toggleMobileMenu() {
      this.openMobileNav = true;
    },
  },
};
</script>

<style>
#db-icon {
  max-width: 40px;
}
</style>
