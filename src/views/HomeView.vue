<script setup>
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { getAuth } from "firebase/auth"

const auth = getAuth()
const userEmail = auth.currentUser?.email || ""

const formData = ref({
  username: '',
  password: '',
  confirmPassword: '',
  isAustralian: false,
  reason: '',
  gender: '',
  suburb: 'Clayton'
})

const submittedCards = ref([])

const submitForm = () => {
  validateName(true)
  validatePassword(true)
  validateConfirm(true)
  if (!errors.value.username && !errors.value.password) {
    submittedCards.value.push({ ...formData.value })
    clearForm()
  }
}

const clearForm = () => {
  formData.value = {
    username: '',
    password: '',
    confirmPassword: '',
    isAustralian: false,
    reason: '',
    gender: ''
  }
}

const errors = ref({
  username: null,
  password: null,
  confirmPassword: null,
  resident: null,
  gender: null,
  reason: null
})

const validateName = (blur) => {
  if (formData.value.username.length < 3) {
    if (blur) errors.value.username = 'Name must be at least 3 characters'
  } else {
    errors.value.username = null
  }
}

const validatePassword = (blur) => {
  const password = formData.value.password
  const minLength = 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (password.length < minLength) {
    if (blur) errors.value.password = `Password must be at least ${minLength} characters long.`
  } else if (!hasUppercase) {
    if (blur) errors.value.password = 'Password must contain at least one uppercase letter.'
  } else if (!hasLowercase) {
    if (blur) errors.value.password = 'Password must contain at least one lowercase letter.'
  } else if (!hasNumber) {
    if (blur) errors.value.password = 'Password must contain at least one number.'
  } else if (!hasSpecialChar) {
    if (blur) errors.value.password = 'Password must contain at least one special character.'
  } else {
    errors.value.password = null
  }
  validateConfirm(false)
}

const validateConfirm = (blur) => {
  const pwd = formData.value.password
  const confirm = formData.value.confirmPassword
  if (!confirm) {
    if (blur) errors.value.confirmPassword = 'Please confirm your password.'
  } else if (confirm !== pwd) {
    if (blur) errors.value.confirmPassword = 'Passwords do not match.'
  } else {
    errors.value.confirmPassword = null
  }
}
</script>

<template>
    <div class="container mt-5">
    <h2 v-if="userEmail"> Currently logged in: {{ userEmail }}</h2>
    <h2 v-else>Please sign in first</h2>
  <!-- 🗄️ W3. Library Registration Form -->
    <div class="container mt-5">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center">🗄️ W5. Library Registration Form</h1>
        <p class="text-center">
          This form now includes validation. Registered users are displayed in a data table below
          (PrimeVue).
        </p>
        <form @submit.prevent="submitForm">
<div class="row mb-3">
  <!-- Username + Password -->
  <div class="col-md-6 col-sm-6">
    <!-- Username -->
    <label for="username" class="form-label">Username</label>
    <input
      type="text"
      class="form-control"
      id="username"
      v-model="formData.username"
      @blur="() => validateName(true)"
      @input="() => validateName(false)"
    />
    <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>

    <!-- Password -->
    <label for="password" class="form-label mt-3">Password</label>
    <input
      type="password"
      class="form-control"
      id="password"
      v-model="formData.password"
      @blur="() => validatePassword(true)"
      @input="() => validatePassword(false)"
    />
    <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
  </div>

  <!-- Gender + Confirm password -->
  <div class="col-md-6 col-sm-6">
    <!-- Gender -->
    <label for="gender" class="form-label">Gender</label>
    <select class="form-select" id="gender" v-model="formData.gender" required>
      <option value="" disabled selected>Select gender</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
    </select>

    <!-- Confirm password -->
    <label for="confirmPassword" class="form-label mt-3">Confirm password</label>
    <input
      type="password"
      class="form-control"
      id="confirmPassword"
      v-model="formData.confirmPassword"
      @blur="() => validateConfirm(true)"
      @input="() => validateConfirm(false)"
    />
    <div v-if="errors.confirmPassword" class="text-danger">
      {{ errors.confirmPassword }}
    </div>
  </div>


 
  <div class="col-md-6 col-sm-6"></div>
</div>
          <div class="row mb-3">
            <div class="col-md-6 col-sm-6">
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="isAustralian"
                  v-model="formData.isAustralian"
                />
                <label class="form-check-label" for="isAustralian">Australian Resident?</label>
              </div>
            </div>  

          </div>
          <div class="mb-3">
            <label for="reason" class="form-label">Reason for joining</label>
            <textarea
              class="form-control"
              id="reason"
              rows="3"
              v-model="formData.reason"
            ></textarea>
              <div v-if="formData.reason.toLowerCase().includes('friend')" class="text-success mt-1">
    Great to have a friend
  </div>
<div class="mb-3">
            <label for="reason" class="form-label">Suburb</label>
            <input type="text" class="form-control" id="suburb" v-model="formData.suburb" />
          </div>
</div>
          
          <div class="text-center">
            <button type="submit" class="btn btn-primary me-2">Submit</button>
            <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
          </div>
        </form>
      </div>
    </div>
  </div>
    </div>

  <div class="row mt-5">
    <h4>This is a Primevue Datatable.</h4>
    <DataTable :value="submittedCards" tableStyle="min-width: 50rem">
      <Column field="username" header="Username"></Column>
      <Column field="password" header="Password"></Column>
      <Column field="isAustralian" header="Australian Resident"></Column>
      <Column field="gender" header="Gender"></Column>
      <Column field="reason" header="Reason"></Column>
    </DataTable>
  </div>

  <div class="row mt-5" v-if="submittedCards.length">
    <div class="d-flex flex-wrap justify-content-start">
      <div
        v-for="(card, index) in submittedCards"
        :key="index"
        class="card m-2"
        style="width: 18rem"
      >
        <div class="card-header">User Information</div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">Username: {{ card.username }}</li>
          <li class="list-group-item">Password: {{ card.password }}</li>
          <li class="list-group-item">
            Australian Resident: {{ card.isAustralian ? 'Yes' : 'No' }}
          </li>
          <li class="list-group-item">Gender: {{ card.gender }}</li>
          <li class="list-group-item">Reason: {{ card.reason }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>



<style scoped>
.container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 80vw;
  margin: 0 auto;
  padding: 20px;
  /* background-color: #e0bfbf; */
  border-radius: 10px;
}

/* Class selectors */
.form {
  text-align: center;
  margin-top: 50px;
}

/* ID selectors */
#username:focus,
#password:focus,
#isAustralian:focus,
.card {
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.card-header {
  background-color: #275fda;
  color: white;
  padding: 10px;
  border-radius: 10px 10px 0 0;
}
.list-group-item {
  padding: 10px;
}
</style>
