<template>
  <div>
    <div
      v-if="label || $slots.addon"
      class="relative flex flex-row justify-between px-3 inset-y-3"
    >
      <label
        v-if="label"
        for="input"
        class="px-1 bg-white text-grey-dark prose-roboto"
        ><span class="body-2">{{ label }}</span></label
      >
      <span class="px-1 bg-white"><slot name="add-on"></slot></span>
    </div>

    <AppInputFrame
      :select="select"
      :border="border"
      :placeholder="placeholder"
      :options="options"
      @input="$emit('input', $event)"
    ></AppInputFrame>
    <AppError v-if="errorMessage">{{ errorMessage }}</AppError>
  </div>
</template>

<script>
import AppError from "../atoms/AppError.vue";
import AppInputFrame from "../atoms/AppInputFrame.vue";
export default {
  name: "LabeledInputFrame",
  components: { AppInputFrame, AppError },
  props: {
    label: {
      type: String,
      required: true,
      default: undefined,
    },
    errorMessage: {
      type: String,
      default: undefined,
    },
    /* AppInputFrame props */
    select: {
      type: Boolean,
      default: false,
    },
    border: {
      type: Boolean,
      default: true,
    },
    placeholder: {
      type: String,
      default: "",
    },
    options: {
      type: Array,
      default: undefined,
    },
  },
};
</script>

<style></style>
