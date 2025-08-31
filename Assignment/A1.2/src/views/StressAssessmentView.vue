<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const options = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
const scoreMap = { Never: 0, Rarely: 1, Sometimes: 2, Often: 3, Always: 4 }

const questions = [
  { key: 'q1', text: 'Over the past two weeks, have you often felt tired or fatigued?' },
  { key: 'q2', text: 'Over the past two weeks, have you had trouble sleeping?' },
  { key: 'q3', text: 'Have you felt anxious or on edge?' },
  { key: 'q4', text: 'Have you had difficulty concentrating?' },
  { key: 'q5', text: 'Have you felt overwhelmed by daily tasks?' },
  { key: 'q6', text: 'Have you experienced headaches or muscle tension?' },
  { key: 'q7', text: 'Have you felt irritable or easily frustrated?' },
  { key: 'q8', text: 'Have you been avoiding social interactions?' },
]

const step = ref(1)
const answers = ref({})
const error = ref('')

function next() {
  const curr = questions[step.value - 1]
  if (!answers.value[curr.key]) {
    error.value = 'Please select an option.'
    return
  }
  error.value = ''
  if (step.value < questions.length) step.value++
}
function prev() {
  if (step.value > 1) step.value--
}

function submit() {
  for (const q of questions) {
    if (!answers.value[q.key]) {
      error.value = 'Please answer all questions.'
      return
    }
  }

  let totalScore = 0
  for (const q of questions) totalScore += scoreMap[answers.value[q.key]]

  let level = 'Low'
  if (totalScore >= 9 && totalScore <= 16) level = 'Moderate'
  if (totalScore >= 17 && totalScore <= 24) level = 'High'
  if (totalScore >= 25) level = 'Very High'

  const key = 'stressHistory'
  const history = JSON.parse(localStorage.getItem(key) || '[]')
  history.push({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    totalScore,
    level,
  })
  localStorage.setItem(key, JSON.stringify(history))

  router.push('/stress-assessment/result')
}
</script>

<template>
  <div class="p-4 border rounded-3">
    <h4 class="mb-3 text-center">Stress Self-Assessment</h4>

    <p class="text-muted small mb-1">Question {{ step }} of {{ questions.length }}</p>
    <h6 class="mb-3">{{ questions[step - 1].text }}</h6>

    <div class="d-flex flex-column gap-2 mb-3">
      <label v-for="opt in options" :key="opt" class="d-flex align-items-center gap-2">
        <input
          type="radio"
          :name="questions[step - 1].key"
          :value="opt"
          v-model="answers[questions[step - 1].key]"
        />
        {{ opt }}
      </label>
    </div>

    <div v-if="error" class="text-danger mb-3">{{ error }}</div>

    <div class="d-flex justify-content-between">
      <button class="btn btn-outline-secondary" @click="prev" :disabled="step === 1">
        Previous
      </button>
      <div>
        <button v-if="step < questions.length" class="btn btn-primary" @click="next">Next</button>
        <button v-else class="btn btn-success" @click="submit">Submit</button>
      </div>
    </div>
  </div>
</template>
