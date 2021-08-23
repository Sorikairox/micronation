<template>
  <div
    v-show="open"
    class="fixed inset-0 flex items-center justify-center w-full h-full bg-opacity-75 pointer-events-none bg-grey-light"
  >
    <div :class="AppAlertClass">
      <div :class="AlertHeaderClass">
        <span class="flex flex-row items-center space-x-1"
          ><AppInfoIcon />
          <h6>{{ isInfo ? "Info" : "Erreur" }}</h6>
        </span>
        <AppDismissIcon class="cursor-pointer" @click="closeModal" />
      </div>
      <div :class="AlertContentClass">
        <div class="body-1"><slot></slot></div>
        <div class="flex flex-row justify-end">
          <AppButton
            @click="closeModal"
            variant="contained"
            :class="isInfo ? 'bg-primary-dark' : 'bg-grey-dark'"
            >Ok</AppButton
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppButton from "../atoms/AppButton.vue";
import AppInfoIcon from "../atoms/icons/AppInfoIcon.vue";
import AppDismissIcon from "../atoms/icons/AppDismissIcon.vue";

export default {
  components: { AppButton, AppInfoIcon, AppDismissIcon },
  name: "AppAlert",
  props: {
    variant: {
      type: String,
      default: "info",
      validator(value) {
        return ["info", "error"].includes(value);
      },
    },
    open: {
      type: Boolean,
      default: false,
      required: true,
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
    isError() {
      return this.variant === "error";
    },
    AppAlertClass() {
      const AppAlertClasses = [
        "fixed z-10 h-auto bg-white rounded-lg pointer-events-auto max-w-xs sm:max-w-md sm:max-w-sm prose-roboto divide-y divide-white border-2 md:max-w-xl",
      ];
      if (this.isInfo) AppAlertClasses.push(" border-primary-base");
      else AppAlertClasses.push(" border-negative-dark");

      return AppAlertClasses.join(" ");
    },
    AlertHeaderClass() {
      const AlertHeaderClasses = [
        "flex justify-between flew-row p-2 bg-opacity-50",
      ];

      if (this.isInfo) AlertHeaderClasses.push("bg-primary-base");
      else AlertHeaderClasses.push("bg-negative-base");

      return AlertHeaderClasses.join(" ");
    },
    AlertContentClass() {
      const AlertContentClasses = ["p-2 flex flex-col space-y-4 bg-opacity-25"];
      if (this.isInfo) AlertContentClasses.push("bg-primary-base");
      else AlertContentClasses.push("bg-negative-base");

      return AlertContentClasses.join(" ");
    },
  },
};
</script>

<style></style>
