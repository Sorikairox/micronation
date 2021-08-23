<template>
  <fieldset class="inline border-2 rounded-md">
    <legend class="w-auto px-1 ml-2 prose-roboto" v-if="label || $slots.addon">
      <span class="body-2 text-grey-dark">{{ label }} </span>
      <!-- TODO: make support for a second legend -->
      <!-- <slot name="addon"></slot> -->
    </legend>
    <component
      :is="select ? 'select' : 'input'"
      :class="classInputFrame"
      :placeholder="!select && placeholder"
      @input="$emit('input', $event.target.value)"
    >
      <option
        :v-if="select"
        v-for="(opt, ind) in options"
        :key="ind"
        :value="opt.value"
      >
        {{ opt.name }}
      </option>
    </component>
  </fieldset>
</template>

<script>
import AppError from "../atoms/AppError.vue";

export default {
  name: "AppInputFrame",
  components: {
    AppError,
  },
  props: {
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
      /**
      @example
      const options = [
        {
          name: "myOptName",
          value: x,
        },
      ];
      */
    },
    // addon parts
    label: {
      type: String,
      required: true,
      default: undefined,
    },
    errorMessage: {
      type: String,
      default: undefined,
    },
  },
  computed: {
    classInputFrame() {
      const inputFrameClasses = [
        "rounded-lg border-0 px-3 pb-1 focus:outline-none flex flex-rows justify-around",
      ];

      if (!this.select) inputFrameClasses.push("placeholder-grey-base");

      if (this.border)
        inputFrameClasses.push(
          "border border-2 border-gray-dark text-gray-dark"
        );
      else inputFrameClasses.push("bg-primary-dark text-white");

      return inputFrameClasses.join(" ");
    },
  },
};
</script>

<style></style>
