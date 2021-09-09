<template>
  <div>
    <the-header class="absolute z-20" />
    <Nuxt />
  </div>
</template>

<script>
import fouloscopie from "fouloscopie";
export default {
  mounted() {
    (async () => {
      const instance = await fouloscopie();
      instance.onUserLogin = (user) => {
        console.log(user);
      };
      instance.onUserLogout = () => {
        this.$router.push({ name: "index" });
      };
    })();
  },
};
</script>
