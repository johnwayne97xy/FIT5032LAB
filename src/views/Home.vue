<script setup>
import { ref, onMounted } from 'vue'
import { auth } from '@/services/firebase' // Use Firebase Auth
import { onAuthStateChanged } from 'firebase/auth' // Listen to auth state

// Component name
defineOptions({ name: 'HomePage' })

// Simple state for rating and showing current user email
const rating = ref(0)
const userEmail = ref(null) // Logged-in user email

// When component mounts, check if user is logged in
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userEmail.value = user.email
    } else {
      userEmail.value = null
    }
  })
})
</script>

<template>
  <div class="home-page">
    <!-- Top auth info -->
    <section class="top-info">
      <p v-if="userEmail" class="top-text">
        Logged in as: <strong>{{ userEmail }}</strong>
      </p>
      <p v-else class="top-text">You are not logged in.</p>
    </section>

    <div class="home-container">
      <!-- Hero card -->
      <section class="section-gap">
        <div class="hero-card">
          <h5 class="hero-title">The Reality of Women's Mental Health</h5>
          <div class="hero-number">45%</div>
          <p class="hero-text">
            Approximately 45% of Australian women have reported severe mental distress.
          </p>
          <p class="hero-subtext">You are not alone. Our community is here to support you.</p>
        </div>
      </section>

      <!-- Actions card -->
      <section class="section-gap">
        <div class="action-card">
          <h5 class="action-title">Supporting Women's Mental Health</h5>
          <p class="action-text">
            Manage stress and wellbeing with trusted tools, resources, and community support.
          </p>

          <router-link to="/stress-assessment" class="btn-primary">
            Start Stress Test
          </router-link>

          <router-link to="/community-stories" class="btn-outline">
            Explore Stories
          </router-link>
        </div>
      </section>

      <!-- Feature grid -->
      <section class="grid">
        <div class="grid-item">
          <h6 class="grid-title">Stress Assessment</h6>
          <p class="grid-text">Quick test to check your stress level.</p>
          <router-link to="/stress-assessment" class="btn-light">Start Test</router-link>
        </div>

        <div class="grid-item">
          <h6 class="grid-title">Community Stories</h6>
          <p class="grid-text">Read and share experiences with other women.</p>
          <router-link to="/community-stories" class="btn-light">Browse Stories</router-link>
        </div>

        <div class="grid-item">
          <h6 class="grid-title">Resources</h6>
          <p class="grid-text">Guides, articles, and professional support.</p>
          <router-link to="/resources" class="btn-light">View Resources</router-link>
        </div>
      </section>

      <!-- Simple rating -->
      <section class="rating-section">
        <h5 class="rating-title">Please rate your experience</h5>
        <div class="rating-stars">
          <span @click="rating = 1">★</span>
          <span @click="rating = 2">★</span>
          <span @click="rating = 3">★</span>
          <span @click="rating = 4">★</span>
          <span @click="rating = 5">★</span>
        </div>
        <p v-if="rating === 1" class="rating-result">You rated 1 star 😟</p>
        <p v-else-if="rating === 2" class="rating-result">You rated 2 stars 😐</p>
        <p v-else-if="rating === 3" class="rating-result">You rated 3 stars 🙂</p>
        <p v-else-if="rating === 4" class="rating-result">You rated 4 stars 😃</p>
        <p v-else-if="rating === 5" class="rating-result">You rated 5 stars 🤩</p>
        <p v-else class="rating-result">Please click a star to rate.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Page wrapper */
.home-page {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  min-height: 100vh;
}

/* Container */
.home-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px;
}

/* Top info */
.top-info {
  text-align: center;
  padding-top: 12px;
}
.top-text {
  color: #6b7280;
  font-size: 0.9rem;
}

/* Sections */
.section-gap {
  margin-bottom: 16px;
}

/* Hero */
.hero-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  text-align: center;
  padding: 24px;
}
.hero-title {
  margin-bottom: 8px;
}
.hero-number {
  font-size: 2rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 8px;
}
.hero-text {
  color: #4b5563;
  margin: 0;
}
.hero-subtext {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

/* Action card */
.action-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  text-align: center;
  padding: 28px;
}
.action-title {
  margin-bottom: 8px;
}
.action-text {
  color: #6b7280;
  margin-bottom: 16px;
}

/* Buttons */
.btn-primary {
  display: inline-block;
  background: #059669;
  color: white;
  text-decoration: none;
  padding: 10px 16px;
  border-radius: 8px;
  margin-right: 8px;
}
.btn-outline {
  display: inline-block;
  color: #059669;
  border: 2px solid #059669;
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 8px;
}
.btn-light {
  display: inline-block;
  background: #ecfdf5;
  color: #065f46;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 8px;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.grid-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
}
.grid-title {
  margin: 0 0 6px 0;
}
.grid-text {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 12px 0;
}

/* Rating */
.rating-section {
  margin-top: 24px;
  text-align: center;
}
.rating-title {
  margin-bottom: 12px;
}
.rating-stars span {
  font-size: 2rem;
  cursor: pointer;
  margin: 0 5px;
}
.rating-result {
  color: #374151;
  margin-top: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
