<script setup>
import { ref } from 'vue'

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  identity: '',
  gender: '',
  isAustralian: false,
  suburb: 'Clayton',
})

const errors = ref({
  username: null,
  email: null,
  password: null,
  confirmPassword: null,
  identity: null,
  gender: null,
})

const validateName = (blur) => {
  if (formData.value.username.trim().length < 3) {
    if (blur) errors.value.username = 'Name must be at least 3 characters.'
  } else {
    errors.value.username = null
  }
}

const validateEmail = (blur) => {
  const email = formData.value.email.trim()
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailOk) {
    if (blur) errors.value.email = 'Please enter a valid email address.'
  } else {
    errors.value.email = null
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

const validateIdentity = (blur) => {
  if (!formData.value.identity) {
    if (blur) errors.value.identity = 'Please select your identity.'
  } else {
    errors.value.identity = null
  }
}

const submitForm = () => {
  validateName(true)
  validateEmail(true)
  validatePassword(true)
  validateConfirm(true)
  validateIdentity(true)

  if (
    !errors.value.username &&
    !errors.value.email &&
    !errors.value.password &&
    !errors.value.confirmPassword &&
    !errors.value.identity
  ) {
    alert('Registration submitted ✅')
    clearForm()
  }
}

const clearForm = () => {
  formData.value = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    identity: '',
    gender: '',
    isAustralian: false,
    suburb: 'Clayton',
  }
  errors.value = {
    username: null,
    email: null,
    password: null,
    confirmPassword: null,
    identity: null,
    gender: null,
  }
}
</script>

<template>
  <div class="container mt-5 page-wrap">
    <div class="row">
      <div class="col-md-10 offset-md-1 col-lg-8 offset-lg-2">
        <div class="header-band text-center text-white rounded-top-3 py-3">
          <h1 class="m-0">User Registration</h1>
        </div>

        <div class="form-card p-4 rounded-bottom-3">
          <form @submit.prevent="submitForm">
            <div class="row mb-3">
              <!-- Left: Username + Email -->
              <div class="col-md-6 col-sm-12">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="formData.username"
                  @blur="() => validateName(true)"
                  @input="() => validateName(false)"
                  placeholder="Enter your username"
                />
                <div v-if="errors.username" class="text-danger small mt-1">
                  {{ errors.username }}
                </div>

                <label for="email" class="form-label mt-3">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="formData.email"
                  @blur="() => validateEmail(true)"
                  @input="() => validateEmail(false)"
                  placeholder="you@example.com"
                />
                <div v-if="errors.email" class="text-danger small mt-1">{{ errors.email }}</div>
              </div>

              <!-- Right: Password + Confirm Password -->
              <div class="col-md-6 col-sm-12">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="formData.password"
                  @blur="() => validatePassword(true)"
                  @input="() => validatePassword(false)"
                  placeholder="At least 8 chars incl. A/a/0-9/symbol"
                />
                <div v-if="errors.password" class="text-danger small mt-1">
                  {{ errors.password }}
                </div>

                <label for="confirmPassword" class="form-label mt-3">Confirm Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="confirmPassword"
                  v-model="formData.confirmPassword"
                  @blur="() => validateConfirm(true)"
                  @input="() => validateConfirm(false)"
                  placeholder="Re-enter your password"
                />
                <div v-if="errors.confirmPassword" class="text-danger small mt-1">
                  {{ errors.confirmPassword }}
                </div>
              </div>
            </div>

            <!-- Identity + Gender -->
            <div class="row mb-3">
              <div class="col-md-6 col-sm-12">
                <label for="identity" class="form-label">Identity</label>
                <select
                  id="identity"
                  class="form-select"
                  v-model="formData.identity"
                  @blur="() => validateIdentity(true)"
                  @change="() => validateIdentity(false)"
                  required
                >
                  <option value="" disabled selected>Select your identity</option>
                  <option value="student">Student</option>
                  <option value="worker">Worker</option>
                  <option value="parent">Stay-at-home parent</option>
                  <option value="retired">Retiree</option>
                </select>
                <div v-if="errors.identity" class="text-danger small mt-1">
                  {{ errors.identity }}
                </div>
              </div>

              <div class="col-md-6 col-sm-12">
                <label for="gender" class="form-label">Gender</label>
                <select class="form-select" id="gender" v-model="formData.gender">
                  <option value="" disabled selected>Select gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <!-- Other options -->
            <div class="row mb-3">
              <div class="col-md-6 col-sm-12">
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

              <div class="col-md-6 col-sm-12">
                <label for="suburb" class="form-label">Suburb</label>
                <input
                  type="text"
                  class="form-control"
                  id="suburb"
                  v-model="formData.suburb"
                  placeholder="e.g., Clayton"
                />
              </div>
            </div>

            <div class="text-center">
              <button type="submit" class="btn btn-primary me-2">Submit</button>
              <button type="button" class="btn btn-outline-primary" @click="clearForm">
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-wrap {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 86vw;
}

.header-band {
  background: linear-gradient(90deg, #7f56d9, #5b8def);
}

.form-card {
  background-color: #ffffff;
  border: 1px solid #e9e9ef;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.form-label {
  font-weight: 600;
}

#username:focus,
#email:focus,
#password:focus,
#confirmPassword:focus,
#identity:focus,
#gender:focus,
#suburb:focus {
  border-color: #7f56d9;
  box-shadow: 0 0 0 0.15rem rgba(127, 86, 217, 0.15);
}
</style>
