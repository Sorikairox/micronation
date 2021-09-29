<template>
  <div class="flex flex-row">
    <div v-for="n in numStep - 1" :key="n" class="flex flex-row">
      <AppStep :number="n" :variant="calculateVariant(n)" />
      <div class="line-sample"></div>
    </div>

    <AppStep :number="numStep" :variant="calculateVariant(numStep)" />
  </div>
</template>

<script>
import AppStep from "../atoms/AppStep.vue";

export default {
  name: "AppStepLine",
  components: {
    AppStep,
  },
  props: {
    current: {
      type: Number,
      default: 1,
      validator(value) {
        return 0 < value;
      },
    },
    numStep: {
      type: Number,
      default: 3,
      required: true,
      validator(value) {
        return value >= 2;
      },
    },
  },
  computed: {
    calculateVariant() {
      return (n) => {
        // if (n === this.current) return "Current";
        // else if (n < this.current) {
        //   return "Done";
        // } else return "Next";

        return n === this.current
          ? "Current"
          : n < this.current
          ? "Done"
          : "Next";
      };
    },
  },
};
</script>

<style scoped lang="postcss">
.line-sample {
  height: 1.5px;
  min-width: 30px;
  @apply bg-primary-dark my-2;
}
</style>
