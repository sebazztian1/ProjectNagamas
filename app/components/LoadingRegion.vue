<script setup lang="ts">
const props = defineProps<{
  loading: boolean
  hasContent?: boolean
  layout?: 'dashboard' | 'grid' | 'table'
  columns?: number
}>()
const visible = useDelayedLoading(() => props.loading)
</script>

<template>
  <LoadingSkeleton v-if="visible || (loading && !hasContent)" :visible="visible"
    :layout="layout" :columns="columns" />
  <slot v-else />
</template>
