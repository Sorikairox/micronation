<template>
  <div
    class="flex items-center justify-between w-full py-2 bg-white shadow-md sm:grid sm:grid-cols-2 px-7"
  >
    <div class="flex flex-row items-center justify-start space-x-8">
      <AppIconHome />
      <AppButton class="lg:hidden" :to="{ name: 'index' }"
      >  <svg width="24" height="24" class="fill-current">
        <path
          d="M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69ZM12 3L2 12H5V20H11V14H13V20H19V12H22L12 3Z"
        />
      </svg></AppButton>
      <AppButton
        :to="{ name: 'edit' }"
        size="medium"
        variant="contained"
        class="bg-primary-dark lg:hidden"
      >
        <AppFlagIcon />
      </AppButton>
      <AppButton class="hidden lg:block" :to="{ name: 'index' }"
        >Accueil</AppButton
      >
      <AppButton
        :to="{ name: 'edit' }"
        size="medium"
        variant="contained"
        class="hidden bg-primary-dark lg:block"
      >
        Editer le drapeau
      </AppButton>

      <AppButton class="hidden lg:block" :to="{ name: 'about' }"
        >A propos</AppButton
      >
      <AppButton class="lg:hidden" :to="{ name: 'about' }"
        ><AppPersonIcon
      /></AppButton>
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
import AppIconHome from "../atoms/icons/AppHomeIcon.vue";
import AppPersonIcon from "../atoms/icons/AppPersonIcon.vue";
import AppLogInIcon from "../atoms/icons/AppLogInIcon.vue";
import AppRegisterIcon from "../atoms/icons/AppRegisterIcon.vue";
import AppFlagIcon from "../atoms/icons/AppFlagIcon.vue";

export default {
  components: {
    AppIconHome,
    AppButton,
    AppPersonIcon,
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

<style></style>
