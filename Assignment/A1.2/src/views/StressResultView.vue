<script setup>
import { ref, onMounted } from 'vue'

const last = ref(null)
const history = ref([])

onMounted(() => {
  const list = JSON.parse(localStorage.getItem('stressHistory') || '[]')
  history.value = list.slice().reverse()
  last.value = history.value[0] || null
})

function clearHistory() {
  localStorage.removeItem('stressHistory')
  history.value = []
  last.value = null
}
</script>

<template>
  <div class="p-4 border rounded-3">
    <h4 class="mb-3 text-center">Your Result</h4>

    <div v-if="last" class="alert alert-info">
      <div class="fw-bold">Total Score: {{ last.totalScore }} / 32</div>
      <div>
        Level: <span class="fw-semibold">{{ last.level }}</span>
      </div>
      <div class="small text-muted">Time: {{ new Date(last.timestamp).toLocaleString() }}</div>
    </div>
    <div v-else class="alert alert-warning">No result yet. Please take the assessment first.</div>

    <h6 class="mt-4">History</h6>
    <div v-if="history.length">
      <ul class="list-group mb-3">
        <li class="list-group-item" v-for="(h, i) in history" :key="h.id">
          <span class="me-2">#{{ i + 1 }}</span>
          <b>{{ h.totalScore }}</b> pts — {{ h.level }}
          <span class="text-muted ms-2">{{ new Date(h.timestamp).toLocaleString() }}</span>
        </li>
      </ul>
      <button class="btn btn-outline-danger btn-sm" @click="clearHistory">Clear History</button>
    </div>
    <div v-else class="text-muted">No history.</div>
  </div>
</template>
