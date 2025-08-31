<template>
  <!-- Bootstrap Header with nav-pills -->
  <div class="container">
    <header class="d-flex justify-content-center py-3">
      <ul class="nav nav-pills">
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
          <router-link to="/get-involved" class="nav-link" active-class="active">
            Get Involved
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/register" class="nav-link" active-class="active">
            Register
          </router-link>
        </li>
        <li class="nav-item"></li>
      </ul>
    </header>
  </div>
</template>

<style scoped></style>
