<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '@/services/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore'

// Component name
defineOptions({ name: 'RegisterPage' })

const router = useRouter()

// Basic XSS sanitization
function sanitizeBasic(input) {
  if (typeof input !== 'string') return input
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

// Simple form data
const formState = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  identity: '',
  gender: '',
  isAustralian: false,
  suburb: 'Clayton',
})

// Simple error messages
const formErrors = ref({
  username: null,
  email: null,
  password: null,
  confirmPassword: null,
  identity: null,
  gender: null,
})

// Validate username and check uniqueness
const checkUsername = async (onBlur) => {
  const username = sanitizeBasic(formState.value.username.trim())
  const usernamePattern = /^[a-zA-Z0-9._-]{3,20}$/
  if (!usernamePattern.test(username)) {
    if (onBlur)
      formErrors.value.username = 'Username must be 3-20 characters (letters, numbers, . _ - only).'
  } else {
    const q = query(collection(db, 'users'), where('username', '==', username))
    const snap = await getDocs(q)
    if (!snap.empty) {
      if (onBlur) formErrors.value.username = 'Username already exists.'
    } else {
      formErrors.value.username = null
    }
  }
}

// Validate email format
const checkEmail = (onBlur) => {
  const email = sanitizeBasic(formState.value.email.trim())
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    if (onBlur) formErrors.value.email = 'Please enter a valid email address.'
  } else {
    formErrors.value.email = null
  }
}

// Validate password strength
const checkPassword = (onBlur) => {
  const password = formState.value.password
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
  if (!passwordPattern.test(password)) {
    if (onBlur)
      formErrors.value.password = 'Password must be at least 8 chars, incl. uppercase, lowercase, number, and special char.'
  } else {
    formErrors.value.password = null
  }
  checkConfirm(false)
}

// Validate confirm password
const checkConfirm = (onBlur) => {
  const pwd = formState.value.password
  const confirm = formState.value.confirmPassword
  if (!confirm) {
    if (onBlur) formErrors.value.confirmPassword = 'Please confirm your password.'
  } else if (confirm !== pwd) {
    if (onBlur) formErrors.value.confirmPassword = 'Passwords do not match.'
  } else {
    formErrors.value.confirmPassword = null
  }
}

// Validate identity selection
const checkIdentity = (onBlur) => {
  if (!formState.value.identity) {
    if (onBlur) formErrors.value.identity = 'Please select your identity.'
  } else {
    formErrors.value.identity = null
  }
}

// Submit registration
const submitRegister = async () => {
  checkUsername(true)
  checkEmail(true)
  checkPassword(true)
  checkConfirm(true)
  checkIdentity(true)

  if (
    formErrors.value.username ||
    formErrors.value.email ||
    formErrors.value.password ||
    formErrors.value.confirmPassword ||
    formErrors.value.identity
  ) {
    return
  }

  try {
    const cred = await createUserWithEmailAndPassword(
      auth,
      sanitizeBasic(formState.value.email),
      formState.value.password,
    )

    await setDoc(doc(db, 'users', cred.user.uid), {
      username: sanitizeBasic(formState.value.username.trim()),
      email: sanitizeBasic(formState.value.email.trim()),
      identity: formState.value.identity,
      gender: formState.value.gender,
      isAustralian: formState.value.isAustralian,
      suburb: sanitizeBasic(formState.value.suburb),
      createdAt: serverTimestamp(),
      role: 'user',
    })

    router.push('/login')
    clearForm()
  } catch (err) {
    alert(`Error: ${err.code || err.message}`)
  }
}

// Clear form
const clearForm = () => {
  formState.value = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    identity: '',
    gender: '',
    isAustralian: false,
    suburb: 'Clayton',
  }
  formErrors.value = {
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
          <form @submit.prevent="submitRegister">
            <div class="row mb-3">
              <!-- Left: Username + Email -->
              <div class="col-md-6 col-sm-12">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="formState.username"
                  @blur="() => checkUsername(true)"
                  @input="() => checkUsername(false)"
                  placeholder="Enter your username"
                />
                <div v-if="formErrors.username" class="text-danger small mt-1">
                  {{ formErrors.username }}
                </div>

                <label for="email" class="form-label mt-3">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="formState.email"
                  @blur="() => checkEmail(true)"
                  @input="() => checkEmail(false)"
                  placeholder="you@example.com"
                />
                <div v-if="formErrors.email" class="text-danger small mt-1">{{ formErrors.email }}</div>
              </div>

              <!-- Right: Password + Confirm Password -->
              <div class="col-md-6 col-sm-12">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="formState.password"
                  @blur="() => checkPassword(true)"
                  @input="() => checkPassword(false)"
                  placeholder="At least 8 chars incl. A/a/0-9/symbol"
                />
                <div v-if="formErrors.password" class="text-danger small mt-1">
                  {{ formErrors.password }}
                </div>

                <label for="confirmPassword" class="form-label mt-3">Confirm Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="confirmPassword"
                  v-model="formState.confirmPassword"
                  @blur="() => checkConfirm(true)"
                  @input="() => checkConfirm(false)"
                  placeholder="Re-enter your password"
                />
                <div v-if="formErrors.confirmPassword" class="text-danger small mt-1">
                  {{ formErrors.confirmPassword }}
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
                  v-model="formState.identity"
                  @blur="() => checkIdentity(true)"
                  @change="() => checkIdentity(false)"
                  required
                >
                  <option value="" disabled selected>Select your identity</option>
                  <option value="student">Student</option>
                  <option value="worker">Worker</option>
                  <option value="parent">Stay-at-home parent</option>
                  <option value="retired">Retiree</option>
                </select>
                <div v-if="formErrors.identity" class="text-danger small mt-1">
                  {{ formErrors.identity }}
                </div>
              </div>

              <div class="col-md-6 col-sm-12">
                <label for="gender" class="form-label">Gender</label>
                <select class="form-select" id="gender" v-model="formState.gender">
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
                    v-model="formState.isAustralian"
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
                  v-model="formState.suburb"
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
