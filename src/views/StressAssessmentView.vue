<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// Component name
defineOptions({
  name: 'StressAssessmentPage'
})

const router = useRouter()

// Assessment questions
const assessmentQuestions = [
  'I can manage my emotions well.',
  'I am able to handle the level of stress I experience.',
  'I sleep well and wake up refreshed.',
  'I can concentrate on tasks without getting easily distracted.',
  'I feel supported by people around me.',
  'I rarely feel anxious or worried.',
  'My mood is stable across most days.',
  'I have enough energy to do the things I enjoy.',
  'I can calm myself when I feel upset.',
  'I feel optimistic about the future.',
]

// User answers array
const userAnswers = ref(Array(assessmentQuestions.length).fill(null))

// Answer scale (1 to 5)
const answerScale = [1, 2, 3, 4, 5]

// Current question being answered
const currentQuestionIndex = ref(0)

// Check if a question can be answered
function isQuestionAnswerable(questionIndex) {
  // First question is always answerable
  if (questionIndex === 0) return true
  // Other questions can only be answered if previous question is answered
  return userAnswers.value[questionIndex - 1] !== null
}

// Select an answer for a question
function selectAnswer(questionIndex, answerValue) {
  userAnswers.value[questionIndex] = answerValue
  // Move to next question if current question is answered
  if (questionIndex === currentQuestionIndex.value && questionIndex < assessmentQuestions.length - 1) {
    currentQuestionIndex.value++
  }
}

// Submit the assessment
function submitAssessment() {
  // Check if all questions are answered
  if (userAnswers.value.includes(null)) {
    alert('Please complete all questions before submitting.')
    return
  }

  // Calculate total score
  const totalAssessmentScore = userAnswers.value.reduce((sum, answer) => sum + (answer || 0), 0)

  // Save score to localStorage
  localStorage.setItem('mentalScore', totalAssessmentScore.toString())

  // Navigate to result page
  router.push({
    path: '/stress-assessment/result',
    query: { score: totalAssessmentScore.toString() }
  })
}

// Handle keyboard input
function handleKeyboardInput(event) {
  // If all questions are answered, only handle Enter for submit
  if (currentQuestionIndex.value >= assessmentQuestions.length) {
    if (event.key === 'Enter') {
      submitAssessment()
    }
    return
  }

  const currentAnswer = userAnswers.value[currentQuestionIndex.value] || 3

  // Left arrow: decrease answer value
  if (event.key === 'ArrowLeft') {
    const newValue = Math.max(1, currentAnswer - 1)
    userAnswers.value[currentQuestionIndex.value] = newValue
  }
  // Right arrow: increase answer value
  else if (event.key === 'ArrowRight') {
    const newValue = Math.min(5, currentAnswer + 1)
    userAnswers.value[currentQuestionIndex.value] = newValue
  }
  // Space or Enter: confirm answer and move to next question
  else if (event.key === ' ' || event.key === 'Enter') {
    if (userAnswers.value[currentQuestionIndex.value]) {
      currentQuestionIndex.value++
    }
  }
}

// Add keyboard event listeners
onMounted(() => {
  window.addEventListener('keydown', handleKeyboardInput)
})

// Remove keyboard event listeners
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboardInput)
})
</script>

<template>
  <div class="stress-assessment-page">
    <!-- Page Header -->
    <section class="page-header-section">
      <h1>How well do you cope?</h1>
      <p class="header-description">
        Most people experience mental health challenges at some point in life. This short check
        helps you reflect on how you're coping day to day and whether there might be areas for
        support or self-care.
      </p>
    </section>

    <!-- Questions Section -->
    <section class="questions-container">
      <h2 class="questions-title">Mental Health Self-Check</h2>

      <div
        v-for="(questionText, questionIndex) in assessmentQuestions"
        :key="questionIndex"
        class="single-question"
        :class="{ questionDisabled: !isQuestionAnswerable(questionIndex) }"
      >
        <p class="question-text">{{ questionIndex + 1 }}. {{ questionText }}</p>

        <div class="answer-scale-labels">
          <span>DISAGREE</span>
          <span>AGREE</span>
        </div>

        <div class="answer-options">
          <button
            v-for="optionValue in answerScale"
            :key="optionValue"
            type="button"
            :disabled="!isQuestionAnswerable(questionIndex)"
            class="answer-circle-button"
            :class="[`circle-size-${optionValue}`, { answerSelected: userAnswers[questionIndex] === optionValue }]"
            @click="selectAnswer(questionIndex, optionValue)"
          ></button>
        </div>
      </div>

      <div class="submit-button-container">
        <button @click="submitAssessment" class="submit-assessment-button">Submit Test</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Main container */
.stress-assessment-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Page header */
.page-header-section {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  text-align: center;
  padding: 40px 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.page-header-section h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 15px;
}

.header-description {
  max-width: 700px;
  margin: 0 auto 20px;
  line-height: 1.6;
  font-size: 1rem;
}

/* Questions container */
.questions-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.questions-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #059669;
  margin-bottom: 30px;
}

/* Single question */
.single-question {
  padding-bottom: 30px;
  margin-bottom: 30px;
  border-bottom: 1px solid #e5e7eb;
}

/* Disabled question */
.single-question.questionDisabled {
  opacity: 0.4;
  pointer-events: none;
}

/* Question text */
.question-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

/* Answer scale labels */
.answer-scale-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: bold;
  color: #6b7280;
  margin-bottom: 15px;
  padding: 0 5px;
}

/* Answer options container */
.answer-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

/* Answer circle buttons */
.answer-circle-button {
  border-radius: 50%;
  border: 3px solid #e5e7eb;
  cursor: pointer;
  flex-shrink: 0;
}

/* Circle sizes - large to small to large */
.circle-size-1 {
  width: 70px;
  height: 70px;
  background-color: #0f766e;
}

.circle-size-2 {
  width: 50px;
  height: 50px;
  background-color: #14b8a6;
}

.circle-size-3 {
  width: 30px;
  height: 30px;
  background-color: #10b981;
}

.circle-size-4 {
  width: 50px;
  height: 50px;
  background-color: #84cc16;
}

.circle-size-5 {
  width: 70px;
  height: 70px;
  background-color: #bef264;
}

/* Selected answer styling */
.answer-circle-button.answerSelected {
  border: 4px solid white;
  box-shadow: 0 0 0 6px rgba(0, 0, 0, 0.25);
  transform: scale(1.15);
}

/* Click animation - only when clicking */
.answer-circle-button:active {
  transform: scale(1.2);
}

/* Submit button container */
.submit-button-container {
  text-align: center;
  margin-top: 40px;
}

/* Submit button */
.submit-assessment-button {
  padding: 15px 50px;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background-color: #059669;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.submit-assessment-button:hover {
  background-color: #047857;
}

/* Click animation for submit button */
.submit-assessment-button:active {
  transform: scale(0.95);
}
</style>
