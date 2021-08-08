<template>
  <div>
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
  </div>
</template>

<script>
export default {
  name: "AppInputFrame",
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
  },
  computed: {
    classInputFrame() {
      const inputFrameClasses = [
        "rounded-lg px-2 py-1 focus:outline-none flex flex-rows justify-around",
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
