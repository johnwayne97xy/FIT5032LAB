<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { auth, db } from '@/services/firebase'
import { addDoc, collection, serverTimestamp, query, where, orderBy, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import Swal from 'sweetalert2'

// Component name
defineOptions({
  name: 'StressResultPage'
})

const router = useRouter()
const route = useRoute()

// User score and data
const userTotalScore = ref(0)
const currentTestScore = ref(0)
const userEmailAddress = ref('')
const isSendingEmails = ref(false)
const isEmailFormVisible = ref(false)

// Authentication and history
const isUserLoggedIn = ref(false)
const isResultSaved = ref(false)
const isLoadingHistory = ref(false)
const userHistoryList = ref([])

// Email functionality
const newEmailAddress = ref('')
const emailAddressesList = ref([])

// Check authentication state and load data
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is logged in, save result and load history
    await saveCurrentResultToDatabase()
    await loadUserHistoryFromDatabase()
  }
})

// Initialize page data
onMounted(() => {
  // Calculate score: each question max 5 points, 10 questions total 50 points, convert to 100-point scale
  const rawScoreFromStorage = Number(localStorage.getItem('mentalScore')) || 0
  userTotalScore.value = Math.round((rawScoreFromStorage / 50) * 100)

  // Get current test score from URL or localStorage
  currentTestScore.value = Number(route.query.score ?? localStorage.getItem('mentalScore') ?? 0)

  // Auto-fill email if user is logged in
  if (auth.currentUser) {
    userEmailAddress.value = auth.currentUser.email
  }
})

// Determine wellbeing level based on score
const wellbeingLevel = computed(() => {
  if (userTotalScore.value < 20) return 'Struggling'
  if (userTotalScore.value < 40) return 'Needs Support'
  if (userTotalScore.value < 60) return 'Managing'
  if (userTotalScore.value < 80) return 'Coping Well'
  return 'Flourishing'
})

// Get color for wellbeing level
const wellbeingLevelColor = computed(() => {
  if (userTotalScore.value < 20) return '#dc2626'
  if (userTotalScore.value < 40) return '#f97316'
  if (userTotalScore.value < 60) return '#eab308'
  if (userTotalScore.value < 80) return '#10b981'
  return '#059669'
})

// Get message based on wellbeing level
const wellbeingLevelMessage = computed(() => {
  if (userTotalScore.value < 20) {
    return {
      title: "You're facing challenges, but help is available",
      text: "Your responses indicate significant stress. This is more common than you might think, and professional support can make a real difference."
    }
  }
  if (userTotalScore.value < 40) {
    return {
      title: "You're managing some difficulties",
      text: "While you're coping with daily life, there are areas where additional support could help you feel more balanced and resilient."
    }
  }
  if (userTotalScore.value < 60) {
    return {
      title: "You're managing reasonably well",
      text: "You have good coping strategies in place, but there's room to strengthen your emotional wellbeing and stress management."
    }
  }
  if (userTotalScore.value < 80) {
    return {
      title: "You're doing well!",
      text: "Your mental health appears strong. Keep up the good self-care practices and stay connected with your support network."
    }
  }
  return {
    title: "You're thriving!",
    text: "Your mental wellbeing is excellent. You have strong coping skills and emotional resilience. Consider sharing your strategies with others who might benefit."
  }
})

// Calculate percentage for display
const scorePercentage = computed(() => {
  return userTotalScore.value
})

// Save current result to database
async function saveCurrentResultToDatabase() {
  const currentUser = auth.currentUser
  if (!currentUser) {
    isUserLoggedIn.value = false
    return
  }

  isUserLoggedIn.value = true

  // Check if there's a new score in localStorage
  const latestScoreFromStorage = Number(localStorage.getItem('mentalScore'))
  if (!latestScoreFromStorage || latestScoreFromStorage === 0) {
    console.log('No new score found in localStorage, skipping save.')
    return
  }

  // Check if already saved (e.g., page refresh)
  if (route.query.saved === '1') {
    console.log('Already marked as saved, skipping duplicate save.')
    return
  }

  // Save current score to database
  await addDoc(collection(db, 'stress_results'), {
    uid: currentUser.uid,
    score: userTotalScore.value,
    level: wellbeingLevel.value,
    createdAt: serverTimestamp()
  })

  isResultSaved.value = true

  // Clear localStorage after saving
  localStorage.removeItem('mentalScore')

  // Update URL to mark as saved
  router.replace({ query: { ...route.query, saved: '1' } })
}

// Load user history from database
async function loadUserHistoryFromDatabase() {
  isLoadingHistory.value = true
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      userHistoryList.value = []
      return
    }

    const historyQuery = query(
      collection(db, 'stress_results'),
      where('uid', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(historyQuery)

    // Get current score for filtering
    const currentScoreValue = userTotalScore.value

    userHistoryList.value = querySnapshot.docs
      .map(doc => {
        const data = doc.data()
        const timestamp = data.createdAt?.toDate?.() ? data.createdAt.toDate() : null
        return {
          id: doc.id,
          score: data.score ?? 0,
          level: data.level ?? '',
          when: timestamp ? timestamp.toLocaleString() : 'N/A'
        }
      })
      // Filter out current result
      .filter(result => result.score !== currentScoreValue)
  } finally {
    isLoadingHistory.value = false
  }
}

// Toggle email form visibility
function toggleEmailForm() {
  isEmailFormVisible.value = !isEmailFormVisible.value
}

// Add email address to list
function addEmailAddress() {
  if (!validateEmailAddress(newEmailAddress.value)) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Email',
      text: 'Please enter a valid email address.'
    })
    return
  }
  if (!emailAddressesList.value.includes(newEmailAddress.value)) {
    emailAddressesList.value.push(newEmailAddress.value)
  }
  newEmailAddress.value = ''
}

// Remove email address from list
function removeEmailAddress(index) {
  emailAddressesList.value.splice(index, 1)
}

// Send emails to all addresses
async function sendEmailToAllAddresses() {
  if (emailAddressesList.value.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'No recipients',
      text: 'Please add at least one email address.'
    })
    return
  }

  // Check if user is logged in
  if (!auth.currentUser) {
    Swal.fire({
      icon: 'error',
      title: 'Login Required',
      text: 'Please log in to send emails.'
    })
    return
  }

  isSendingEmails.value = true
  try {
    for (const emailAddress of emailAddressesList.value) {
      await addDoc(collection(db, 'email_queue'), {
        uid: auth.currentUser.uid,
        to: emailAddress,
        subject: 'Your Mental Health Assessment Results',
        score: userTotalScore.value,
        level: wellbeingLevel.value,
        message: wellbeingLevelMessage.value,
        timestamp: serverTimestamp(),
        status: 'pending'
      })
    }

    Swal.fire({
      icon: 'success',
      title: 'Emails Sent!',
      text: `Results have been sent to ${emailAddressesList.value.length} recipients.`,
      timer: 3000,
      showConfirmButton: false
    })

    emailAddressesList.value = []
    isEmailFormVisible.value = false
  } catch (error) {
    console.error('Error sending emails:', error)
    Swal.fire({
      icon: 'error',
      title: 'Failed to send',
      text: 'Something went wrong. Please try again.'
    })
  } finally {
    isSendingEmails.value = false
  }
}

// Validate email address format
function validateEmailAddress(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Navigate to share story page
function navigateToShareStory() {
  // Save current score to localStorage for community page
  localStorage.setItem('fromAssessment', 'true')
  localStorage.setItem('assessmentScore', userTotalScore.value)
  router.push('/community-stories')
}
</script>

<template>
  <div class="stress-result-page">
    <!-- Score Display Card -->
    <div class="score-display-card">
      <div class="score-title-section">
        <h1>Your Mental Wellbeing Score</h1>
      </div>

      <!-- Score Circle Display -->
      <div class="score-circle-container">
        <svg class="score-circle-svg" width="220" height="220">
          <circle class="circle-background" cx="110" cy="110" r="95" />
          <circle
            class="circle-progress-bar"
            cx="110"
            cy="110"
            r="95"
            :stroke="wellbeingLevelColor"
            :style="{
              strokeDasharray: `${(scorePercentage / 100) * 597} 597`,
            }"
          />
        </svg>
        <div class="score-number-display">
          <div class="main-score-number">{{ userTotalScore }}</div>
          <div class="score-out-of-total">/ 100</div>
        </div>
      </div>

      <div class="wellbeing-level-badge" :style="{ backgroundColor: wellbeingLevelColor }">
        {{ wellbeingLevel }}
      </div>

      <!-- Test Result Information -->
      <div class="test-result-info">
        <h2>Stress Test Result</h2>

        <div class="result-details-box">
          <p><b>Your score:</b> {{ currentTestScore }}</p>
          <p><b>Level:</b> {{ wellbeingLevel }}</p>
          <p v-if="isResultSaved" class="saved-indicator">Saved to your history ✅</p>
          <p v-if="!isUserLoggedIn" class="not-logged-in-warning">
            (Not logged in — result won't be linked to an account)
          </p>
        </div>

        <h3 class="previous-results-title">My previous results</h3>
        <div v-if="isLoadingHistory" class="loading-message">Loading...</div>
        <div v-else-if="userHistoryList.length === 0" class="no-history-message">No previous records.</div>

        <table v-else class="history-table">
          <thead>
            <tr>
              <th class="table-header">Date</th>
              <th class="table-header">Score</th>
              <th class="table-header">Level</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="historyItem in userHistoryList" :key="historyItem.id">
              <td class="table-cell">{{ historyItem.when }}</td>
              <td class="table-cell">{{ historyItem.score }}</td>
              <td class="table-cell">{{ historyItem.level }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Email Results Section -->
      <div class="email-results-section">
        <button @click="toggleEmailForm" class="email-results-button">
           Email My Results
        </button>

        <div v-if="isEmailFormVisible" class="email-form-container">
          <div class="email-input-container">
            <input
              v-model="newEmailAddress"
              type="email"
              placeholder="Enter an email (friend/family)"
              class="email-address-input"
              @keyup.enter="addEmailAddress"
            />
            <button @click="addEmailAddress" class="add-email-button">Add</button>
          </div>

          <ul class="email-addresses-list">
            <li v-for="(emailAddress, index) in emailAddressesList" :key="index" class="email-address-item">
              {{ emailAddress }}
              <button @click="removeEmailAddress(index)" class="remove-email-button">×</button>
            </li>
          </ul>

          <button
            @click="sendEmailToAllAddresses"
            :disabled="isSendingEmails"
            class="send-all-emails-button"
          >
            {{ isSendingEmails ? 'Sending...' : 'Send to All' }}
          </button>
        </div>
      </div>

      <!-- Score Explanation Legend -->
      <div class="score-explanation-legend">
        <h3>Understanding Your Score:</h3>
        <div class="legend-items-container">
          <div class="legend-item">
            <span class="legend-color-dot" style="background-color: #dc2626"></span>
            <span><strong>0–19</strong> – Struggling</span>
          </div>
          <div class="legend-item">
            <span class="legend-color-dot" style="background-color: #f97316"></span>
            <span><strong>20–39</strong> – Needs Support</span>
          </div>
          <div class="legend-item">
            <span class="legend-color-dot" style="background-color: #eab308"></span>
            <span><strong>40–59</strong> – Managing</span>
          </div>
          <div class="legend-item">
            <span class="legend-color-dot" style="background-color: #10b981"></span>
            <span><strong>60–79</strong> – Coping Well</span>
          </div>
          <div class="legend-item">
            <span class="legend-color-dot" style="background-color: #059669"></span>
            <span><strong>80–100</strong> – Flourishing</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Information Sections -->
    <div class="information-sections">
      <!-- Main Result Message -->
      <section class="information-card main-message-card">
        <h2>{{ wellbeingLevelMessage.title }}</h2>
        <p>{{ wellbeingLevelMessage.text }}</p>
      </section>

      <!-- Community Support Section -->
      <section class="information-card community-support-card" v-if="userTotalScore < 60">

        <h3>You're Not Alone</h3>
        <p>
          Feeling stressed? Share your story with our supportive community or read how others
          have navigated similar challenges. Sometimes knowing you're not alone makes all the difference.
        </p>
        <button @click="navigateToShareStory" class="share-story-button">
          Share Your Story or Read Others
        </button>
      </section>

      <!-- Find Help Section -->
      <section class="information-card">

        <h3>Find Support Near You</h3>
        <p>
          Professional help is available in your area. Mental health clinics and counseling services
          can provide the support you need to feel better.
        </p>
        <router-link to="/resources" class="find-help-link">
          Find Mental Health Services Near Me →
        </router-link>
      </section>

      <!-- Important Information -->
      <section class="information-card">

        <h3>Important to Remember</h3>
        <p>
          <strong>1 in 5 people</strong> experience mental health challenges each year.
          Seeking help is a sign of strength, not weakness. Recovery is possible with
          the right support and strategies.
        </p>
      </section>

      <!-- Action Steps -->
      <section class="information-card">

        <h3>Steps You Can Take Today</h3>
        <ul class="action-steps-list">
          <li>
            <span class="checkmark-icon">✓</span>
            <span>Take a 10-minute walk outside for fresh air and movement</span>
          </li>
          <li>
            <span class="checkmark-icon">✓</span>
            <span>Practice deep breathing: inhale for 4, hold for 4, exhale for 6</span>
          </li>
          <li>
            <span class="checkmark-icon">✓</span>
            <span>Connect with someone you trust - a call or message can help</span>
          </li>
          <li>
            <span class="checkmark-icon">✓</span>
            <span>Write down three things you're grateful for today</span>
          </li>
        </ul>
      </section>

      <!-- Professional Support -->
      <section class="information-card professional-support-card">

        <h3>Professional Support Options</h3>
        <div class="support-options-list">
          <div class="support-option-item">
            <strong>Immediate Help:</strong>
            <a href="tel:131114" class="support-contact-link">Lifeline 13 11 14</a>
          </div>
          <div class="support-option-item">
            <strong>Online Support:</strong>
            <a href="https://www.beyondblue.org.au" target="_blank" class="support-contact-link">
              Beyond Blue
            </a>
          </div>
          <div class="support-option-item">
            <strong>Youth Support:</strong>
            <a href="https://headspace.org.au" target="_blank" class="support-contact-link">
              Headspace
            </a>
          </div>
        </div>
      </section>

      <!-- Disclaimer -->
      <div class="disclaimer-text">
        * This assessment is for educational purposes only and not a clinical diagnosis.
        If you're experiencing distress, please consult with a healthcare professional.
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main page container */
.stress-result-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}

/* Score display card */
.score-display-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-bottom: 30px;
}

.score-title-section h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #059669;
  margin-bottom: 30px;
}

/* Score circle display */
.score-circle-container {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.score-circle-svg {
  transform: rotate(-90deg);
}

.circle-background {
  fill: none;
  stroke: #e5e7eb;
  stroke-width: 14;
}

.circle-progress-bar {
  fill: none;
  stroke-width: 14;
  stroke-linecap: round;
}

.score-number-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.main-score-number {
  font-size: 3.5rem;
  font-weight: bold;
  color: #1f2937;
  line-height: 1;
}

.score-out-of-total {
  font-size: 1.3rem;
  color: #6b7280;
  margin-top: -5px;
}

/* Wellbeing level badge */
.wellbeing-level-badge {
  display: inline-block;
  padding: 12px 35px;
  border-radius: 50px;
  color: white;
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Test result information */
.test-result-info {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px;
}

.result-details-box {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin: 12px 0;
}

.saved-indicator {
  color: #059669;
  margin-top: 8px;
}

.not-logged-in-warning {
  color: #b91c1c;
  margin-top: 8px;
}

.previous-results-title {
  margin-top: 24px;
}

.loading-message {
  color: #6b7280;
}

.no-history-message {
  color: #6b7280;
}

/* History table */
.history-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  padding: 8px;
}

.table-cell {
  padding: 8px;
}

/* Email results section */
.email-results-section {
  margin: 25px 0;
}

.email-results-button {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.email-form-container {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
  padding: 0 20px;
}

.email-input-container {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 10px;
}

.email-address-input {
  flex: 1;
  max-width: 300px;
  padding: 10px 15px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
}

.email-address-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.add-email-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
}

.send-all-emails-button {
  background: #059669;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.send-all-emails-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Email addresses list */
.email-addresses-list {
  list-style: none;
  padding: 0;
  margin: 0 0 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.email-address-item {
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.remove-email-button {
  background: transparent;
  border: none;
  color: #ef4444;
  font-weight: bold;
  cursor: pointer;
}

/* Score explanation legend */
.score-explanation-legend {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  text-align: left;
  margin-top: 20px;
}

.score-explanation-legend h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 15px;
}

.legend-items-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
  color: #4b5563;
}

.legend-color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Information sections */
.information-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.information-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

/* Main message card - plain white box */
.main-message-card {
  background: #ffffff;
  color: #1f2937;
}

.main-message-card h2 {
  color: #059669;
  margin-bottom: 15px;
  font-size: 1.6rem;
}

.main-message-card p {
  color: #4b5563;
  font-size: 1.05rem;
  line-height: 1.7;
}

/* Community support card */
.community-support-card {
  border: 2px solid #f59e0b;
  background: #ffffff;
}

/* Card icon */
.card-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.information-card h3 {
  font-size: 1.4rem;
  font-weight: 600;
  color: #059669;
  margin-bottom: 15px;
}

.information-card p {
  line-height: 1.7;
  color: #4b5563;
  font-size: 1rem;
  margin-bottom: 15px;
}

/* Share story button */
.share-story-button {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
}

/* Find help link */
.find-help-link {
  display: inline-block;
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
  padding: 10px 20px;
  border: 2px solid #2563eb;
  border-radius: 8px;
  margin-top: 10px;
}

.find-help-link:hover {
  background: #2563eb;
  color: white;
}

/* Action steps list */
.action-steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.action-steps-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #4b5563;
  line-height: 1.6;
}

.checkmark-icon {
  background: #10b981;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
  font-size: 0.9rem;
}

/* Professional support card */
.professional-support-card {
  border: 2px solid #10b981;
}

.support-options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 15px;
}

.support-option-item {
  padding: 10px;
  background: #ffffff;
  border-radius: 8px;
}

.support-option-item strong {
  color: #059669;
  margin-right: 10px;
}

.support-contact-link {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
  border-bottom: 2px solid transparent;
}

.support-contact-link:hover {
  border-bottom-color: #2563eb;
}

/* Disclaimer text */
.disclaimer-text {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  font-style: italic;
  margin-top: 20px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

/* Responsive design */
@media (max-width: 768px) {
  .stress-result-page {
    padding: 20px 15px;
  }

  .score-display-card {
    padding: 30px 20px;
  }

  .score-title-section h1 {
    font-size: 1.5rem;
  }

  .main-score-number {
    font-size: 3rem;
  }

  .information-card {
    padding: 20px;
  }

  .card-icon {
    font-size: 2rem;
  }

  .email-form-container {
    flex-direction: column;
    align-items: center;
  }

  .email-address-input {
    width: 100%;
    max-width: none;
  }
}
</style>
