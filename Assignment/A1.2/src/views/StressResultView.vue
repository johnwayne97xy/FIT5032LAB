<script setup>
import { ref } from 'vue'

const totalScore = ref(null)
const level = ref('')

const data = localStorage.getItem('lastResult')
if (data) {
  const result = JSON.parse(data)
  totalScore.value = result.totalScore
  level.value = result.level
}
</script>

<template>
  <div class="p-4 border rounded-3">
    <h4 class="mb-3 text-center">Your Result</h4>

    <div v-if="totalScore !== null" class="alert alert-info">
      <div class="fw-bold">Total Score: {{ totalScore }} / 32</div>
      <div>
        Level: <span class="fw-semibold">{{ level }}</span>
      </div>
    </div>
    <div v-else class="alert alert-warning">No result yet.</div>
  </div>
</template>
