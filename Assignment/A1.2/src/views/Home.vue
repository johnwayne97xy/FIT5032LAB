<script setup>
// 不需要额外逻辑，全部用 <router-link> 导航即可
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
  </div>
</template>

<style scoped></style>
