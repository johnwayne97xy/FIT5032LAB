<script setup>
import { ref } from 'vue'
const rating = ref(0)
</script>

<template>
  <div class="container py-4">
    <section class="mb-4">
      <div class="p-4 border rounded-3 text-center bg-light">
        <h5 class="mb-3">The Reality of Women's Mental Health</h5>
        <div class="display-6 fw-semibold mb-2">45%</div>
        <p class="text-muted m-0">
          Approximately 45% of Australian women have reported severe mental distress.
        </p>
        <p class="text-muted small m-0">You are not alone. Our community is here to support you.</p>
      </div>
    </section>

    <section class="mb-4">
      <div class="p-5 border rounded-3 text-center">
        <h5 class="mb-2">Supporting Women's Mental Health</h5>
        <p class="text-muted mb-4">
          Manage stress and wellbeing with trusted tools, resources, and community support.
        </p>

        <router-link to="/stress-assessment" class="btn btn-primary me-2">
          Start Stress Test
        </router-link>

        <router-link to="/community-stories" class="btn btn-outline-secondary">
          Explore Stories
        </router-link>
      </div>
    </section>

    <section class="row g-3">
      <div class="col-12 col-md-4">
        <div class="border rounded-3 p-3 h-100">
          <h6>Stress Assessment</h6>
          <p class="text-muted small mb-3">Quick test to check your stress level.</p>
          <router-link to="/stress-assessment" class="btn btn-light w-100">Start Test</router-link>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="border rounded-3 p-3 h-100">
          <h6>Community Stories</h6>
          <p class="text-muted small mb-3">Read and share experiences with other women.</p>
          <router-link to="/community-stories" class="btn btn-light w-100"
            >Browse Stories</router-link
          >
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="border rounded-3 p-3 h-100">
          <h6>Resources</h6>
          <p class="text-muted small mb-3">Guides, articles, and professional support.</p>
          <router-link to="/resources" class="btn btn-light w-100">View Resources</router-link>
        </div>
      </div>
    </section>

    <section class="mt-5 text-center">
      <h5 class="mb-3">Please rate your experience</h5>

      <!--  -->
      <div class="text-center mt-5">
        <h5>Please rate this page</h5>

        <!-- 五个星星，点击时赋值 -->
        <div>
          <span @click="rating = 1">★</span>
          <span @click="rating = 2">★</span>
          <span @click="rating = 3">★</span>
          <span @click="rating = 4">★</span>
          <span @click="rating = 5">★</span>
        </div>

        <!-- 根据评分显示不同提示 -->
        <p v-if="rating === 1">You rated 1 star 😟</p>
        <p v-else-if="rating === 2">You rated 2 stars 😐</p>
        <p v-else-if="rating === 3">You rated 3 stars 🙂</p>
        <p v-else-if="rating === 4">You rated 4 stars 😃</p>
        <p v-else-if="rating === 5">You rated 5 stars 🤩</p>
        <p v-else>Please click a star to rate.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
span {
  font-size: 2rem;
  cursor: pointer;
  margin: 0 5px;
}
</style>
