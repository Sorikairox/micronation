<template>
  <div
    v-show="open"
    class="fixed inset-0 flex items-center justify-center w-full h-full bg-opacity-75 pointer-events-none bg-grey-light"
  >
    <div
      class="fixed z-10 h-auto max-w-xs p-4 space-y-4 bg-white rounded-lg pointer-events-auto prose-roboto sm:max-w-md md:max-w-xl"
    >
      <div class="flex justify-between flew-row">
        <h6>{{ title }}</h6>
        <AppDismissIcon class="cursor-pointer" @click="closeModal" />
      </div>
      <div class="body-1"><slot></slot></div>
      <div :class="actionBarClass">
        <AppButton
          @click="closeModal"
          variant="outlined"
          :class="this.isConfirm ? 'border-negative-dark' : 'border-black'"
          v-if="isChoice || isConfirm"
          >Annuler</AppButton
        >
        <AppButton
          @click="action.effect"
          :class="
            variant === 'confirm' ? 'bg-positive-dark' : 'bg-primary-dark'
          "
          variant="contained"
          >{{ action.name }}</AppButton
        >
      </div>
    </div>
  </div>
</template>

<script>
import AppButton from "../atoms/AppButton.vue";
import AppDismissIcon from "../atoms/icons/AppDismissIcon.vue";

export default {
  name: "AppCard",
  components: { AppButton, AppDismissIcon },
  props: {
    open: {
      type: Boolean,
      default: false,
      required: true,
    },
    variant: {
      type: String,
      default: "info",
      validator(value) {
        return ["info", "confirm", "choice"].includes(value);
      },
    },
    title: {
      type: String,
      default: undefined,
      required: true,
    },
    action: {
      type: Object,
      default: () => {
        return {
          name: "Continuer",
          effect: () => {},
        };
      },
    },
  },
  methods: {
    closeModal() {
      this.open = false;
      this.$emit("close");
    },
  },
  computed: {
    isInfo() {
      return this.variant === "info";
    },
    isChoice() {
      return this.variant === "choice";
    },
    isConfirm() {
      return this.variant === "confirm";
    },
    actionBarClass() {
      const actionBarClasses = ["w-full flex flex-row"];
      if (this.isInfo) actionBarClasses.push("justify-end");
      else actionBarClasses.push("justify-between");

      return actionBarClasses.join(" ");
    },
  },
};
</script>

<style></style>
