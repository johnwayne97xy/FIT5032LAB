<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAllUsers } from '../services/userStore'

const loginData = ref({
  username: '',
  password: '',
  role: '',
})

const loginErrors = ref({
  username: null,
  password: null,
  role: null,
})

const validateLoginName = (blur) => {
  const username = loginData.value.username.trim()
  const usernamePattern = /^[a-zA-Z0-9._-]{3,20}$/ // allow letters, numbers, . _ -, 3-20 chars

  if (!usernamePattern.test(username)) {
    if (blur)
      loginErrors.value.username =
        'Username must be 3-20 characters (letters, numbers, . _ - only).'
  } else {
    loginErrors.value.username = null
  }
}

const validateLoginPassword = (blur) => {
  const password = loginData.value.password
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/ //allow at least 8 chars, must include upper, lower, number, special char

  if (!passwordPattern.test(password)) {
    if (blur)
      loginErrors.value.password =
        'Password must be at least 8 chars, incl. uppercase, lowercase, number, and special char.'
  } else {
    loginErrors.value.password = null
  }
}

const validateLoginRole = (blur) => {
  if (!loginData.value.role) {
    if (blur) loginErrors.value.role = 'Please select a role.'
  } else {
    loginErrors.value.role = null
  }
}

const router = useRouter()

const submitLogin = () => {
  validateLoginName(true)
  validateLoginPassword(true)
  validateLoginRole(true)

  if (!loginErrors.value.username && !loginErrors.value.password && !loginErrors.value.role) {
    //  Admin login check
    if (
      loginData.value.role === 'admin' &&
      loginData.value.username === 'fw19990504' &&
      loginData.value.password === 'fw19990504'
    ) {
      router.push('/admin')
    }
    // user login check
    else if (loginData.value.role === 'user') {
      const users = getAllUsers()
      const found = users.find(
        (u) => u.username === loginData.value.username && u.password === loginData.value.password,
      )
      if (found) {
        router.push('/') // Redirect to home or user dashboard
      } else {
        alert('Invalid username or password for user.')
      }
    }
    // invalid login
    else {
      alert('Invalid login.')
    }
  }
}

const clearLoginForm = () => {
  loginData.value = {
    username: '',
    password: '',
    role: '',
  }
  loginErrors.value = {
    username: null,
    password: null,
    role: null,
  }
}
</script>

<template>
  <div class="container mt-5 page-wrap">
    <div class="row">
      <div class="col-md-10 offset-md-1 col-lg-8 offset-lg-2">
        <div class="header-band text-center text-white rounded-top-3 py-3">
          <h1 class="m-0">User Login</h1>
        </div>

        <div class="form-card p-4 rounded-bottom-3">
          <form @submit.prevent="submitLogin">
            <div class="row mb-3">
              <div class="col-md-6 col-sm-12">
                <label for="loginUsername" class="form-label">Username</label>
                <input
                  type="text"
                  class="form-control"
                  id="loginUsername"
                  v-model="loginData.username"
                  @blur="() => validateLoginName(true)"
                  @input="() => validateLoginName(false)"
                  placeholder="Enter your username"
                />
                <div v-if="loginErrors.username" class="text-danger small mt-1">
                  {{ loginErrors.username }}
                </div>
              </div>

              <div class="col-md-6 col-sm-12">
                <label for="loginPassword" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="loginPassword"
                  v-model="loginData.password"
                  @blur="() => validateLoginPassword(true)"
                  @input="() => validateLoginPassword(false)"
                  placeholder="Enter your password"
                />
                <div v-if="loginErrors.password" class="text-danger small mt-1">
                  {{ loginErrors.password }}
                </div>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-12 col-sm-12">
                <label for="role" class="form-label">Role</label>
                <select
                  id="role"
                  class="form-select"
                  v-model="loginData.role"
                  @blur="() => validateLoginRole(true)"
                  @change="() => validateLoginRole(false)"
                >
                  <option value="" disabled selected>Select role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <div v-if="loginErrors.role" class="text-danger small mt-1">
                  {{ loginErrors.role }}
                </div>
              </div>
            </div>

            <div class="text-center">
              <button type="submit" class="btn btn-primary me-2">Login</button>
              <button type="button" class="btn btn-outline-primary" @click="clearLoginForm">
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

#loginUsername:focus,
#loginPassword:focus,
#role:focus {
  border-color: #7f56d9;
  box-shadow: 0 0 0 0.15rem rgba(127, 86, 217, 0.15);
}
</style>
