<template>
  <div class="relative flex flex-row items-center prose-roboto">
    <label class="checkbox-label">
      <input
        type="checkbox"
        :checked="checked"
        @change="$emit('change', $event.target.checked)"
      />
      <span class="checkbox-custom rectangular"></span>
    </label>
    <label class="text-grey-dark body-1">{{ label }}</label>
  </div>
</template>

<script>
export default {
  name: "AppCheckbox",
  props: {
    checked: {
      type: Boolean,
      default: false,
    },
    label: {
      required: true,
      type: String,
      default: undefined,
    },
  },
};
</script>

<style scoped lang="postcss">
/*Styling checkbox with a workaround as it's not a html element meant to be styled */
/* Thanks to : https://appitventures.com/blog/styling-checkbox-css-tips */

.checkbox-label {
  display: block;
  position: relative;
  margin: auto;
  cursor: pointer;
  font-size: 22px;
  line-height: 24px;
  height: 24px;
  width: 24px;
  clear: both;
}

.checkbox-label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-label .checkbox-custom {
  position: absolute;
  top: 0px;
  left: 0px;
  height: 19px;
  width: 19px;
  background-color: transparent;
  border-radius: 5px;
  @apply border-2 border-primary-base;
}

.checkbox-label input:checked ~ .checkbox-custom {
  border-radius: 5px;
  -webkit-transform: rotate(0deg) scale(1);
  -ms-transform: rotate(0deg) scale(1);
  transform: rotate(0deg) scale(1);
  opacity: 1;
  @apply border-2 border-primary-base bg-primary-base;
}

.checkbox-label .checkbox-custom::after {
  position: absolute;
  content: "";
  border-radius: 5px;
  -webkit-transform: rotate(0deg) scale(0);
  -ms-transform: rotate(0deg) scale(0);
  transform: rotate(0deg) scale(0);
  opacity: 1;
  @apply border-white;
}

.checkbox-label input:checked ~ .checkbox-custom::after {
  -webkit-transform: rotate(45deg) scale(1);
  -ms-transform: rotate(45deg) scale(1);
  transform: rotate(45deg) scale(1);
  opacity: 1;
  left: 5px;
  width: 6px;
  height: 12px;
  border-width: 0 2px 2px 0;
  background-color: transparent;
  border-radius: 0;
}
</style>
