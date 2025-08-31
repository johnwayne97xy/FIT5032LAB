<!-- src/App.vue -->
<script setup>
import BHeader from './components/BHeader.vue'
</script>

<template>
  <div class="app-wrap">
    <header>
      <BHeader />
    </header>

    <main class="container py-4">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>
