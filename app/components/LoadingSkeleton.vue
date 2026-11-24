<script setup lang="ts">
withDefaults(defineProps<{
  layout?: 'dashboard' | 'grid' | 'table'
  columns?: number
  rows?: number
  visible?: boolean
}>(), { layout: 'table', columns: 5, rows: 5, visible: true })
</script>

<template>
  <div class="placeholder" :class="{ waiting: !visible }" aria-busy="true" aria-label="Memuat...">
    <span role="status" class="visually-hidden">{{ visible ? 'Memuat...' : '' }}</span>
    <div v-if="layout !== 'table'" :class="layout" aria-hidden="true">
      <div v-for="i in layout === 'dashboard' ? 5 : 3" :key="i" class="card">
        <i /><i /><i />
      </div>
    </div>
    <div v-if="layout === 'dashboard'" class="panels" aria-hidden="true">
      <div v-for="i in 2" :key="i" class="card"><i /><i /><i /></div>
    </div>
    <div v-if="layout === 'table'" class="sheet" aria-hidden="true">
      <div v-for="r in rows + 1" :key="r" class="row" :style="{ gridTemplateColumns: 'repeat(' + columns + ', minmax(0, 1fr))' }">
        <i v-for="c in columns" :key="c" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.waiting { visibility: hidden; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.dashboard, .grid, .panels { display: grid; gap: 16px; }
.dashboard { grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr)); }
.grid { grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 22px; }
.panels { margin-top: 24px; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); }
.card, .sheet { background: #fffdf9; border: 1px solid #efe1c6; border-radius: 12px; }
.card { padding: 20px; display: grid; gap: 12px; align-content: center; min-height: 108px; }
.grid .card { min-height: 245px; }
.panels .card { min-height: 150px; }
i { display: block; background: #eadfcf; border-radius: 6px; height: 12px; animation: pulse 1.4s ease-in-out infinite alternate; }
.card i:nth-child(2) { width: 52%; height: 20px; }
.card i:last-child { width: 72%; }
.row { display: grid; gap: 4%; align-items: center; min-height: 64px; padding: 0 16px; }
.row:first-child { background: #faf5ec; min-height: 44px; }
.row + .row { border-top: 1px solid #f0e8da; }
@keyframes pulse { to { opacity: .45; } }
@media (max-width: 900px) { .panels { grid-template-columns: 1fr; } }
@media (max-width: 600px) { .dashboard { grid-template-columns: repeat(auto-fit, minmax(min(100%, 155px), 1fr)); } }
@media (prefers-reduced-motion: reduce) { i { animation: none; } }
</style>
