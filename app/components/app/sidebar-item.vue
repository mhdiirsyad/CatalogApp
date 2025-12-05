<script setup lang="ts">
const props = defineProps<{
  to: string;
  icon: string;
  label: string;
  labelShow?: boolean;
}>();

const route = useRoute();
</script>

<template>
  <div class="tooltip-right" :data-tip="props.labelShow ? undefined : props.label" :class="{ tooltip: !props.labelShow }">
    <NuxtLink class="flex flex-nowrap gap-2 p-2 px-4 hover:bg-base-300 hover:cursor-pointer rounded-lg" :class="{ 'bg-base-300': route.path === props.to, 'justify-center': !props.labelShow, 'justify-start': props.labelShow }" :to="props.to">
      <Icon :name="props.icon" size="24" class="shrink-0" />
      <span v-if="props.labelShow">{{ props.label }}</span>
    </NuxtLink>
  </div>
</template>
