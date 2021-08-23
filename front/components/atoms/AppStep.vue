<template>
  <div class="flex flex-col items-center prose-roboto">
    <input
      type="radio"
      class="w-4 h-4 pointer-events-none"
      :checked="isDone || isCurrent"
      :disabled="isDone"
    />
    <span class="body-2">Etape {{ number }}</span>
  </div>
</template>

<script>
export default {
  name: "AppStep",
  props: {
    variant: {
      type: String,
      default: "Current",
      validator(value) {
        return ["Current", "Done", "Next"].includes(value);
      },
    },
    label: {
      type: String,
      default: undefined,
    },
    number: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    isCurrent() {
      return this.variant === "Current";
    },
    isDone() {
      return this.variant === "Done";
    },
    isNext() {
      return this.variant === "Next";
    },
  },
};
</script>

<style scoped lang="postcss">
input[type="radio"]:after {
  box-shadow: 0px 0px 0px 2px #fff inset;
  width: 16px;
  height: 16px;
  border-radius: 15px;
  content: "";
  position: relative;
  display: inline-block;
  bottom: 1.5px; /* the bottom of doing something by hard, sorry for your eyes lmao */
  @apply border border-grey-dark;
}
input[type="radio"]:checked:after {
  @apply bg-primary-dark;
}

input[type="radio"]:disabled:after {
  @apply bg-primary-light border-grey-base;
}
</style>
