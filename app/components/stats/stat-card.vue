<script setup lang="ts">
export type StatItem = {
  label: string;
  value: number;
  icon?: string;
  color?: string;
};

defineProps<{
  items: StatItem[];
  variant?: "horizontal" | "vertical";
  cols?: string; // Custom grid columns class
}>();
</script>

<template>
  <!-- Stats Grid - Can be used inline without wrapper card -->
  <div
    class="grid gap-3"
    :class="cols || (variant === 'horizontal' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5')"
  >
    <div
      v-for="(item, index) in items"
      :key="index"
      class="stats shadow-sm"
      :class="item.color || 'bg-base-100'"
    >
      <div class="stat p-4">
        <div class="stat-title text-xs flex items-center gap-2">
          <Icon v-if="item.icon" :name="item.icon" size="16" />
          {{ item.label }}
        </div>
        <div class="stat-value text-2xl">
          {{ item.value }}
        </div>
      </div>
    </div>
  </div>
</template>
