<template>
  <button :class="classButton" class="prose-roboto" :to="to">
    <slot name="icon" v-if="icon === 'left'"></slot>
    <span :class="typoButton">
      <slot></slot>
    </span>
    <slot name="icon" v-if="icon === 'right'"></slot>
  </button>
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
      const classNames = ["prose-roboto px-4 align-middle"];

      // Handling sizes
      if (this.size == "medium") classNames.push("rounded-lg py-1");
      else classNames.push("rounded-md");

      // Handling variants
      if (this.isText) classNames.push("text-black bg-white");
      else if (this.isOutlined)
        classNames.push("text-black bg-white border border-grey-base");
      else if (this.isShaded) classNames.push("text-black bg-grey-light");
      else if (this.isContained)
        classNames.push("text-grey-light bg-grey-dark shadow-md");

      // Applying hover effects
      if (this.isText) classNames.push("hover:text-grey-light");
      else if (this.isOutlined)
        classNames.push("hover:border hover:border-grey-base hover:shadow-md");
      else if (this.isShaded) classNames.push("hover:bg-white hover:shadow-lg");
      else if (this.isContained)
        classNames.push("hover:text-white hover:shadow-lg");

      // Handling icons by centering every elements
      classNames.push("flex flex-row items-center");
      if (this.$slots.icon) classNames.push("space-x-1");

      return classNames.join(" ");
    },
    typoButton() {
      return this.size == "medium" ? "body-1" : "body-2";
    },
  },
};
</script>

<style></style>
