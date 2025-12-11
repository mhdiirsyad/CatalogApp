<script setup lang="ts">
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "vue-chartjs";

const props = defineProps<{
  labels: string[];
  data: number[];
  backgroundColor?: string[];
}>();

ChartJS.register(ArcElement, Tooltip, Legend);

const defaultColors = [
  "rgba(102, 126, 234, 0.8)",
  "rgba(118, 75, 162, 0.8)",
  "rgba(237, 100, 166, 0.8)",
  "rgba(255, 154, 158, 0.8)",
  "rgba(250, 208, 196, 0.8)",
];

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      backgroundColor: props.backgroundColor || defaultColors,
      borderWidth: 2,
      borderColor: "#fff",
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "bottom" as const,
      labels: {
        padding: 15,
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 12,
      titleFont: {
        size: 14,
      },
      bodyFont: {
        size: 13,
      },
    },
  },
};
</script>

<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>
