<script setup>
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { getAllUsers } from '../services/userStore'

const registeredUsers = ref([])

onMounted(() => {
  registeredUsers.value = getAllUsers()
})
</script>

<template>
  <div class="container mt-5">
    <h2 class="mb-4">Admin Dashboard</h2>
    <p>List of registered users:</p>

    <DataTable :value="registeredUsers" class="p-datatable-sm" showGridlines>
      <Column field="username" header="Username"></Column>
      <Column field="email" header="Email"></Column>
      <Column field="password" header="Password"></Column>
      <Column field="gender" header="Gender"></Column>
      <Column field="isAustralian" header="Australian Resident"></Column>
      <Column field="suburb" header="Suburb"></Column>
      <Column field="identity" header="Identity"></Column>
      <Column field="registeredAt" header="Registered At"></Column>
    </DataTable>
  </div>
</template>

<style scoped>
.container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 85vw;
  margin: 0 auto;
  padding: 20px;
}
</style>
