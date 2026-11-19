<template>
  <Teleport to="body">
    <div v-if="show" class="csv-modal-overlay" @click.self="$emit('close')">
      <div class="csv-modal-card" role="dialog" aria-modal="true" :aria-label="title">
        <div class="csv-modal-head">
          <div class="csv-head-text">
            <span class="csv-eyebrow">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="16" y2="17" />
              </svg>
              CSV &amp; Excel
            </span>
            <h2 class="csv-modal-title">{{ title }}</h2>
            <p v-if="subtitle" class="csv-modal-sub">{{ subtitle }}</p>
          </div>
          <button type="button" class="csv-close-btn" aria-label="Tutup modal export" @click="$emit('close')">
            ✕
          </button>
        </div>

        <fieldset v-if="!downloads.length" class="csv-modal-body" :disabled="preparing">
          <!-- Dataset Selector -->
          <div v-if="datasets && datasets.length > 1" class="csv-section">
            <label class="csv-label">Jenis Laporan / Dataset</label>
            <div class="csv-dataset-grid">
              <button
                v-for="ds in datasets"
                :key="ds.id"
                type="button"
                class="csv-dataset-card"
                :class="{ active: selectedDataset === ds.id }"
                @click="$emit('update:selectedDataset', ds.id)"
              >
                <div class="csv-ds-top">
                  <span class="csv-ds-name">{{ ds.label }}</span>
                  <span v-if="ds.badge" class="csv-ds-badge">{{ ds.badge }}</span>
                </div>
                <span v-if="ds.description" class="csv-ds-desc">{{ ds.description }}</span>
              </button>
            </div>
          </div>

          <!-- Timestamp Filter Section -->
          <div class="csv-section">
            <div class="csv-section-head">
              <label class="csv-label">Rentang Timestamp (WIB)</label>
              <div class="csv-presets">
                <button
                  type="button"
                  class="csv-preset-btn"
                  :class="{ active: !startDate && !endDate }"
                  @click="applyPreset('all')"
                >
                  Semua
                </button>
                <button
                  type="button"
                  class="csv-preset-btn"
                  @click="applyPreset('today')"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  class="csv-preset-btn"
                  @click="applyPreset('7d')"
                >
                  7 Hari
                </button>
                <button
                  type="button"
                  class="csv-preset-btn"
                  @click="applyPreset('30d')"
                >
                  30 Hari
                </button>
                <button
                  type="button"
                  class="csv-preset-btn"
                  @click="applyPreset('month')"
                >
                  Bulan Ini
                </button>
              </div>
            </div>

            <div class="csv-date-range-row">
              <div class="csv-date-field">
                <span class="csv-date-sub">Tanggal Minimal (Dari)</span>
                <input
                  type="date"
                  class="csv-date-input"
                  :value="startDate"
                  :max="endDate || undefined"
                  @input="$emit('update:startDate', ($event.target as HTMLInputElement).value)"
                />
              </div>

              <div class="csv-date-arrow" aria-hidden="true">→</div>

              <div class="csv-date-field">
                <span class="csv-date-sub">Tanggal Maksimal (Sampai)</span>
                <input
                  type="date"
                  class="csv-date-input"
                  :value="endDate"
                  :min="startDate || undefined"
                  @input="$emit('update:endDate', ($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>

            <p v-if="!dateRangeValid" class="csv-range-error">
              Tanggal minimal tidak boleh melebihi tanggal maksimal.
            </p>
          </div>

          <!-- Optional Active Filter Toggle -->
          <label v-if="activeFilterLabel" class="csv-checkbox-row">
            <input
              type="checkbox"
              :checked="useActiveFilters"
              @change="$emit('update:useActiveFilters', ($event.target as HTMLInputElement).checked)"
            />
            <span>{{ activeFilterLabel }}</span>
          </label>

          <!-- Live Preview & Timestamp Min -> Max Summary -->
          <div class="csv-preview-box">
            <div class="csv-preview-head">
              <span class="csv-preview-title">Pratinjau Data Export</span>
              <span v-if="loading" class="csv-preview-count muted">Memuat data...</span>
              <span v-else class="csv-preview-count">{{ previewCount }} baris ditemukan</span>
            </div>

            <div class="csv-timestamp-bar">
              <span class="csv-ts-label">Timestamp Minimal → Maksimal:</span>
              <div class="csv-ts-values">
                <span class="csv-ts-pill">{{ formattedMin }}</span>
                <span class="csv-ts-arrow">→</span>
                <span class="csv-ts-pill">{{ formattedMax }}</span>
              </div>
            </div>

            <div v-if="summaryMetrics && summaryMetrics.length > 0" class="csv-metrics-grid">
              <div
                v-for="(metric, idx) in summaryMetrics"
                :key="idx"
                class="csv-metric-item"
                :class="{ highlight: metric.highlight }"
              >
                <span class="csv-metric-label">{{ metric.label }}</span>
                <span class="csv-metric-val">{{ metric.value }}</span>
              </div>
            </div>

            <p class="csv-preview-note">
              CSV berisi tabel data. File Excel memiliki kolom yang disesuaikan, filter, dan lembar ringkasan.
            </p>
          </div>
          <p v-if="errorMessage" class="csv-range-error" role="alert">{{ errorMessage }}</p>
        </fieldset>
        <div v-else class="csv-modal-body">
          <p role="status">Kedua file siap diunduh.</p>
          <a v-for="file in downloads" :key="file.format" class="report-link"
             :href="file.url" :download="file.filename">
            <strong>Unduh {{ file.format }}</strong>
            <span>{{ file.filename }}</span>
          </a>
        </div>

        <div class="csv-modal-foot">
          <button v-if="downloads.length" type="button" class="csv-btn-cancel" @click="resetDownloads">Ubah pilihan</button>
          <button type="button" class="csv-btn-cancel" @click="$emit('close')">{{ downloads.length ? 'Tutup' : 'Batal' }}</button>
          <button
            v-if="!downloads.length"
            type="button"
            class="csv-btn-download"
            :disabled="preparing || loading || !dateRangeValid || previewCount === 0 || exportDisabled"
            @click="prepareDownloads"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>{{ preparing || loading ? 'Menyiapkan…' : 'Siapkan CSV dan XLSX' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { ReportFile } from '~/utils/csvExport'
import {
  formatReadableTimestamp,
  getTodayWibDateInput,
  getWibDateOffsetInput,
  getWibMonthStartInput,
  isValidDateRange
} from '~/utils/csvExport'

export interface CsvDatasetOption {
  id: string
  label: string
  description?: string
  badge?: string
}

export interface CsvPreviewMetric {
  label: string
  value: string
  highlight?: boolean
}

const props = withDefaults(
  defineProps<{
    show: boolean
    prepareFiles: () => Promise<ReportFile[]> | undefined
    title?: string
    subtitle?: string
    datasets?: CsvDatasetOption[]
    selectedDataset?: string
    startDate?: string
    endDate?: string
    useActiveFilters?: boolean
    activeFilterLabel?: string
    previewCount: number
    minTimestamp?: Date | null
    maxTimestamp?: Date | null
    summaryMetrics?: CsvPreviewMetric[]
    loading?: boolean
    exportDisabled?: boolean
  }>(),
  {
    title: 'Ekspor laporan',
    subtitle: 'Ekspor data keuangan & operasional dengan rentang timestamp WIB.',
    datasets: () => [],
    selectedDataset: '',
    startDate: '',
    endDate: '',
    useActiveFilters: false,
    activeFilterLabel: '',
    minTimestamp: null,
    maxTimestamp: null,
    summaryMetrics: () => [],
    loading: false,
    exportDisabled: false
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:selectedDataset', value: string): void
  (e: 'update:startDate', value: string): void
  (e: 'update:endDate', value: string): void
  (e: 'update:useActiveFilters', value: boolean): void
}>()

const downloads = ref<{ format: string; filename: string; url: string }[]>([])
const preparing = ref(false)
const errorMessage = ref('')
let generation = 0

function resetDownloads() {
  generation++
  for (const file of downloads.value) URL.revokeObjectURL(file.url)
  downloads.value = []
  preparing.value = false
  errorMessage.value = ''
}

async function prepareDownloads() {
  if (preparing.value) return
  const current = ++generation
  preparing.value = true
  errorMessage.value = ''
  try {
    const files = await props.prepareFiles()
    if (current !== generation) return
    if (!files?.length) {
      errorMessage.value = 'Tidak ada data untuk pilihan ini.'
      return
    }
    for (const { format, filename, blob } of files) {
      downloads.value.push({ format, filename, url: URL.createObjectURL(blob) })
    }
  } catch {
    if (current !== generation) return
    resetDownloads()
    errorMessage.value = 'File gagal disiapkan. Coba lagi.'
  } finally {
    if (current === generation) preparing.value = false
  }
}

watch(() => props.show, visible => { if (!visible) resetDownloads() })
onBeforeUnmount(resetDownloads)

const dateRangeValid = computed(() => isValidDateRange(props.startDate, props.endDate))

const formattedMin = computed(() =>
  props.minTimestamp ? formatReadableTimestamp(props.minTimestamp) : '-'
)
const formattedMax = computed(() =>
  props.maxTimestamp ? formatReadableTimestamp(props.maxTimestamp) : '-'
)

const applyPreset = (preset: 'all' | 'today' | '7d' | '30d' | 'month') => {
  const today = getTodayWibDateInput()
  if (preset === 'all') {
    emit('update:startDate', '')
    emit('update:endDate', '')
    return
  }
  if (preset === 'today') {
    emit('update:startDate', today)
    emit('update:endDate', today)
    return
  }
  if (preset === '7d') {
    emit('update:startDate', getWibDateOffsetInput(-6))
    emit('update:endDate', today)
    return
  }
  if (preset === '30d') {
    emit('update:startDate', getWibDateOffsetInput(-29))
    emit('update:endDate', today)
    return
  }
  if (preset === 'month') {
    emit('update:startDate', getWibMonthStartInput())
    emit('update:endDate', today)
  }
}
</script>

<style scoped>
fieldset.csv-modal-body {
  border: 0;
  margin: 0;
  min-width: 0;
}

.report-link {
  display: grid;
  gap: 4px;
  background: #FAF5EC;
  border: 1px solid #DFCCA8;
  border-radius: 8px;
  padding: 12px;
  color: #503C24;
  overflow-wrap: anywhere;
}

.csv-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 950;
  background: rgba(43, 33, 22, 0.56);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.csv-modal-card {
  width: 100%;
  max-width: 650px;
  max-height: 92dvh;
  overflow-y: auto;
  overflow-x: hidden;
  background: #ffffff;
  border: 1px solid #EFE1C6;
  border-radius: 14px;
  color: #2B2116;
  box-shadow: 0 24px 60px rgba(43, 33, 22, 0.22);
  display: flex;
  flex-direction: column;
}

.csv-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px 16px;
  background: #FAF5EC;
  border-bottom: 1px solid #EFE1C6;
}

.csv-head-text {
  min-width: 0;
  flex: 1;
}

.csv-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #8C6D3F;
  margin-bottom: 5px;
}

.csv-modal-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #2B2116;
  line-height: 1.3;
}

.csv-modal-sub {
  margin: 4px 0 0;
  font-size: 0.84rem;
  color: #7A6A55;
  line-height: 1.45;
}

.csv-close-btn {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 8px;
  border: 1px solid #EFE1C6;
  background: #ffffff;
  color: #7A6A55;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.csv-close-btn:hover {
  color: #2B2116;
  border-color: #8C6D3F;
  background: #FFFBF2;
}

.csv-modal-body {
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.csv-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.csv-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.csv-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #2B2116;
}

.csv-dataset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
  gap: 10px;
}

.csv-dataset-card {
  text-align: left;
  padding: 11px 12px;
  border-radius: 10px;
  background: #FFFBF2;
  border: 1px solid #EFE1C6;
  color: #5C4930;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.2s;
}

.csv-dataset-card:hover {
  border-color: #D8B978;
  background: #FAF5EC;
}

.csv-dataset-card.active {
  background: #FAF0DC;
  border-color: #8C6D3F;
  box-shadow: 0 0 0 1px rgba(140, 109, 63, 0.2);
}

.csv-ds-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.csv-ds-name {
  font-size: 0.84rem;
  font-weight: 700;
  color: #2B2116;
}

.csv-ds-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 5px;
  background: rgba(140, 109, 63, 0.14);
  color: #6F5530;
}

.csv-ds-desc {
  font-size: 0.74rem;
  color: #7A6A55;
  line-height: 1.35;
}

.csv-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.csv-preset-btn {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #EFE1C6;
  background: #ffffff;
  color: #5C4930;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.csv-preset-btn:hover {
  border-color: #8C6D3F;
  background: #FFFBF2;
}

.csv-preset-btn.active {
  background: #8C6D3F;
  border-color: #8C6D3F;
  color: #ffffff;
}

.csv-date-range-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: end;
  gap: 10px;
}

.csv-date-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.csv-date-sub {
  font-size: 0.74rem;
  font-weight: 600;
  color: #7A6A55;
}

.csv-date-input {
  width: 100%;
  box-sizing: border-box;
  padding: 9px 11px;
  border-radius: 8px;
  border: 1px solid #DFCCA8;
  background: #FFFBF2;
  color: #2B2116;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
}

.csv-date-input:focus {
  outline: none;
  border-color: #8C6D3F;
  background: #ffffff;
}

.csv-date-arrow {
  padding-bottom: 10px;
  color: #8C6D3F;
  font-weight: 800;
  text-align: center;
}

.csv-range-error {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 600;
  color: #B91C1C;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 7px;
  padding: 8px 10px;
}

.csv-checkbox-row {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #FAF5EC;
  border: 1px solid #EFE1C6;
  font-size: 0.82rem;
  font-weight: 600;
  color: #2B2116;
  cursor: pointer;
}

.csv-checkbox-row input[type="checkbox"] {
  accent-color: #8C6D3F;
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.csv-preview-box {
  padding: 14px 15px;
  border-radius: 10px;
  background: #FAF5EC;
  border: 1px solid #EFE1C6;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.csv-preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.csv-preview-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #2B2116;
}

.csv-preview-count {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: #DCFCE7;
  color: #15803D;
}

.csv-preview-count.muted {
  background: #F1E7D3;
  color: #7A6A55;
}

.csv-timestamp-bar {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.csv-ts-label {
  font-size: 0.74rem;
  font-weight: 600;
  color: #7A6A55;
}

.csv-ts-values {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.csv-ts-pill {
  font-size: 0.78rem;
  font-weight: 700;
  color: #6F5530;
  background: #ffffff;
  border: 1px solid #D8B978;
  border-radius: 6px;
  padding: 4px 9px;
}

.csv-ts-arrow {
  color: #8C6D3F;
  font-weight: 800;
}

.csv-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 8px;
}

.csv-metric-item {
  padding: 8px 10px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #EFE1C6;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.csv-metric-item.highlight {
  border-color: #D8B978;
  background: #FFFBF2;
}

.csv-metric-label {
  font-size: 0.72rem;
  color: #7A6A55;
}

.csv-metric-val {
  font-size: 0.88rem;
  font-weight: 800;
  color: #2B2116;
  word-break: break-word;
}

.csv-preview-note {
  margin: 0;
  font-size: 0.74rem;
  color: #7A6A55;
  line-height: 1.45;
}

.csv-preview-note code {
  color: #6F5530;
  background: #EFE1C6;
  padding: 1px 4px;
  border-radius: 4px;
  font-weight: 700;
}

.csv-modal-foot {
  padding: 14px 22px 18px;
  background: #FAF5EC;
  border-top: 1px solid #EFE1C6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.csv-btn-cancel {
  padding: 9px 16px;
  border-radius: 8px;
  border: 1px solid #DFCCA8;
  background: #ffffff;
  color: #5C4930;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.csv-btn-cancel:hover {
  background: #FFFBF2;
  border-color: #8C6D3F;
}

.csv-btn-download {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 8px;
  border: none;
  background: #8C6D3F;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.csv-btn-download:hover:not(:disabled) {
  background: #6F5530;
  transform: translateY(-1px);
}

.csv-btn-download:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 560px) {
  .csv-modal-overlay {
    padding: 10px;
  }

  .csv-modal-head,
  .csv-modal-body,
  .csv-modal-foot {
    padding-left: 15px;
    padding-right: 15px;
  }

  .csv-date-range-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }

  .csv-date-arrow {
    display: none;
  }

  .csv-modal-foot {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .csv-btn-cancel,
  .csv-btn-download {
    width: 100%;
    text-align: center;
  }
}
</style>
