<template>
  <component
    :is="to ? 'NuxtLink' : 'button'"
    :class="classButton"
    :to="to"
    :href="href"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noreferrer noopener' : undefined"
    @click="to ? '' : $emit('click', $event)"
  >
    <span v-if="icon === 'left'" :class="typoIcon">
      <slot name="icon"></slot>
    </span>
    <span :class="typoButton">
      <slot></slot>
    </span>
    <span v-if="icon === 'right'" :class="typoIcon">
      <slot name="icon"></slot>
    </span>
  </component>
</template>

<script>
export default {
  name: "AppButton",
  props: {
    variant: {
      type: String,
      default: "text",
      validator(value) {
        return ["text", "outlined", "shaded", "contained"].includes(value);
      },
    },
    size: {
      type: String,
      default: "small",
      validator(value) {
        return ["small", "medium"].includes(value);
      },
    },
    to: {
      type: Object,
      default: undefined,
    },
    href: {
      type: String,
      default: undefined,
    },
    icon: {
      type: String,
      default: "left",
      validator(value) {
        return ["left", "right"].includes(value);
      },
    },
  },
  computed: {
    isText() {
      return this.variant === "text";
    },
    isOutlined() {
      return this.variant === "outlined";
    },
    isShaded() {
      return this.variant === "shaded";
    },
    isContained() {
      return this.variant === "contained";
    },
    classButton() {
      const classNames = [
        "prose-roboto px-5 align-middle text-center h-auto cursor-pointer flex flex-row justify-center fitButton",
      ];

      // Handling sizes
      if (this.size == "medium") classNames.push("rounded-lg py-2");
      else classNames.push("rounded-md py-1.5");

      // Handling variants
      if (this.isText) classNames.push("text-black bg-white");
      else if (this.isOutlined)
        classNames.push("text-black bg-white border border-grey-base");
      else if (this.isShaded) classNames.push("text-black bg-grey-light");
      else if (this.isContained)
        classNames.push("text-grey-light bg-grey-dark shadow-md");

      // Applying hover effects
      if (this.isText) classNames.push("hover:text-grey-light");
      else if (this.isOutlined) classNames.push(" hover:shadow-md");
      else if (this.isShaded) classNames.push("hover:bg-white hover:shadow-lg");
      else if (this.isContained)
        classNames.push("hover:text-white hover:shadow-lg");

      // Handling icons by centering every elements
      classNames.push("flex flex-row items-center");
      if (this.$slots.icon) classNames.push("space-x-1");

      return classNames.join(" ");
    },
    typoButton() {
      return this.size == "medium" ? " body-1" : " body-2";
    },
    typoIcon() {
      return this.isContained ? "text-grey-light" : "text-grey-dark";
    },
  },
};
</script>

<style scoped>
/* This is done by hand which isn't a good practice considering the use of Tailwind, but I didn't find a native solution */
.fitButton {
  /* width: fit-content; */
  /* height: fit-content; */
}
</style>
