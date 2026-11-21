<template>
  <input
    ref="inputRef"
    :value="displayValue"
    type="text"
    inputmode="numeric"
    autocomplete="off"
    :required="required"
    class="idr-price-input"
    @keydown="handleKeydown"
    @input="handleInput"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import {
  formatIdrDigits,
  formatIdrValue,
  normalizeIdrInput,
  caretPosForDigitCount,
} from '../utils/idrFormat'

const props = withDefaults(
  defineProps<{
    modelValue: number | null | undefined
    min?: number | string
    required?: boolean
    nullable?: boolean
  }>(),
  {
    min: undefined,
    required: false,
    nullable: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const displayValue = ref<string>(formatIdrValue(props.modelValue))
const lastEmittedWasEmpty = ref(false)

const syncValidity = (rawDisplay: string = displayValue.value) => {
  const el = inputRef.value
  if (!el) return

  if (!rawDisplay) {
    el.setCustomValidity('')
    return
  }

  if (props.min !== undefined && props.min !== '') {
    const minNum = Number(props.min)
    const { numericValue } = normalizeIdrInput(rawDisplay)
    if (!Number.isNaN(minNum) && numericValue !== null && numericValue < minNum) {
      el.setCustomValidity(`Nilai minimal adalah Rp ${formatIdrDigits(String(Math.trunc(minNum)))}`)
      return
    }
  }

  el.setCustomValidity('')
}

const applyFormattedInput = (el: HTMLInputElement, rawValue: string, selectionStart: number | null) => {
  const safeSelection = selectionStart ?? rawValue.length
  const rawBeforeCaret = rawValue.slice(0, safeSelection)
  const rawDigitsBeforeCaret = rawBeforeCaret.replace(/\D/g, '').length

  const normalized = normalizeIdrInput(rawValue)
  displayValue.value = normalized.formatted
  el.value = normalized.formatted

  if (typeof document !== 'undefined' && document.activeElement === el) {
    const targetDigits = Math.max(
      0,
      Math.min(normalized.digits.length, rawDigitsBeforeCaret - normalized.strippedLeadingZeros)
    )
    const nextCaret = caretPosForDigitCount(normalized.formatted, targetDigits)
    el.setSelectionRange(nextCaret, nextCaret)
  }

  if (normalized.numericValue === null) {
    if (props.nullable) {
      lastEmittedWasEmpty.value = false
      emit('update:modelValue', null)
    } else {
      lastEmittedWasEmpty.value = true
      emit('update:modelValue', 0)
      nextTick(() => {
        lastEmittedWasEmpty.value = false
      })
    }
  } else {
    lastEmittedWasEmpty.value = false
    emit('update:modelValue', normalized.numericValue)
  }

  syncValidity(normalized.formatted)
}

const handleKeydown = (e: KeyboardEvent) => {
  const el = e.target as HTMLInputElement | null
  if (!el || el.readOnly || el.disabled) return

  const selStart = el.selectionStart
  const selEnd = el.selectionEnd
  if (selStart === null || selEnd === null || selStart !== selEnd) return

  const val = el.value
  // Remove the digit just before a separator dot on Backspace instead of stranding the cursor
  if (e.key === 'Backspace' && selStart >= 2 && val[selStart - 1] === '.') {
    e.preventDefault()
    const nextRaw = val.slice(0, selStart - 2) + val.slice(selStart)
    applyFormattedInput(el, nextRaw, selStart - 2)
    return
  }

  // Remove the digit right after a separator dot on Delete instead of noop-ing on the dot
  if (e.key === 'Delete' && selStart < val.length - 1 && val[selStart] === '.') {
    e.preventDefault()
    const nextRaw = val.slice(0, selStart) + val.slice(selStart + 2)
    applyFormattedInput(el, nextRaw, selStart)
  }
}

const handleInput = (e: Event) => {
  const el = e.target as HTMLInputElement | null
  if (!el || el.readOnly || el.disabled) return
  applyFormattedInput(el, el.value, el.selectionStart)
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal === 0 && lastEmittedWasEmpty.value && !props.nullable) {
      lastEmittedWasEmpty.value = false
      return
    }
    lastEmittedWasEmpty.value = false

    const nextDisplay = formatIdrValue(newVal)
    displayValue.value = nextDisplay
    if (inputRef.value && inputRef.value.value !== nextDisplay) {
      inputRef.value.value = nextDisplay
    }
    syncValidity(nextDisplay)
  }
)

watch(
  () => props.min,
  () => {
    syncValidity()
  }
)

onMounted(() => {
  syncValidity()
})
</script>

<style scoped>
.idr-price-input {
  font-variant-numeric: tabular-nums;
}
</style>
