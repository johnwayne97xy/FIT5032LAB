<template>
  <div class="container">
    <header class="d-flex justify-content-between align-items-center py-3">
      <!-- 左侧 Logo（可选） -->
      <div class="fw-bold text-primary fs-5">WomenCare</div>

      <!-- 中间导航菜单（居中） -->
      <ul class="nav nav-pills justify-content-center flex-grow-1">
        <li class="nav-item">
          <router-link to="/" class="nav-link" active-class="active">Home</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/stress-assessment" class="nav-link" active-class="active">
            Stress Assessment
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/community-stories" class="nav-link" active-class="active">
            Community Stories
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/resources" class="nav-link" active-class="active">
            Resources
          </router-link>
        </li>
          <li class="nav-item">
    <router-link to="/ai-chat" class="nav-link" active-class="active">
      AI Chat
    </router-link>
  </li>
      </ul>

      <!-- 右侧 Register / Login -->
      <div class="d-flex align-items-center gap-3">
        <router-link to="/register" class="btn btn-outline-primary px-3 fw-semibold" style="color:#7b61ff; border-color:#7b61ff;">Register</router-link>
        <router-link to="/login" class="text-primary fw-semibold text-decoration-none">
          Login
        </router-link>
      </div>
    </header>
  </div>
</template>

<style scoped>
.nav-link {
  color: #333;
  font-weight: 500;
}
.nav-link.active {
  color: #0d6efd;
  font-weight: 600;
}
</style>
