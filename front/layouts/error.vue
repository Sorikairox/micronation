<template>
  <div
    class="flex flex-col w-screen h-screen place-items-center prose-montserrat"
  >
    <h1 class="customErrorFont">{{ error.statusCode }}</h1>
    <div v-if="error.statusCode === 404" class="flex flex-col w-auto space-y-8">
      <p class="body-1">
        Désolé, la page est introuvable. Tu as peut être plus de chance de
        trouver des mobulas en Corse !
      </p>
      <AppButton
        size="medium"
        variant="contained"
        class="mx-auto bg-primary-base"
        :to="{ name: 'index' }"
        >Revenir à l'acceuil</AppButton
      >
    </div>
    <div v-else>
      <pre>{{ error.message }}</pre>
    </div>
  </div>
</template>

<script>
import AppButton from "../components/atoms/AppButton.vue";

export default {
  props: ["error"],
  components: { AppButton },
};
</script>

<style scoped>
.customErrorFont {
  font-family: Montserrat;
  font-size: 350px;
  font-weight: bold;
}
</style>
