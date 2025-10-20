<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '@/services/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import Swal from 'sweetalert2'

const router = useRouter()

const loginData = ref({ email: '', password: '' })
const loginErrors = ref({ email: null, password: null })

// Basic XSS sanitization for user input
function sanitizeBasic(input) {
  if (typeof input !== 'string') return input
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

const validateEmail = (blur) => {
  const email = sanitizeBasic(loginData.value.email.trim())
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  loginErrors.value.email = !emailPattern.test(email) && blur
    ? 'Please enter a valid email address.'
    : null
}

const validatePassword = (blur) => {
  const password = loginData.value.password
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
  loginErrors.value.password = !passwordPattern.test(password) && blur
    ? 'Password must be at least 8 chars, incl. uppercase, lowercase, number, and special char.'
    : null
}

const submitLogin = async () => {
  validateEmail(true)
  validatePassword(true)
  if (loginErrors.value.email || loginErrors.value.password) return

  try {
    const cred = await signInWithEmailAndPassword(
      auth,
      sanitizeBasic(loginData.value.email),
      loginData.value.password
    )

    const userRef = doc(db, 'users', cred.user.uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data()

      if (userData.role === 'admin') {
        Swal.fire({
          icon: 'success',
          title: 'Welcome back, Admin!',
          text: 'Redirecting to admin dashboard...',
          timer: 2000,
          showConfirmButton: false,
        })
        setTimeout(() => router.push('/admin'), 1800)
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: `Welcome ${userData.username || 'User'}!`,
          timer: 2000,
          showConfirmButton: false,
        })
        setTimeout(() => router.push('/'), 1800)
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'User not found',
        text: 'User data not found in Firestore.',
      })
    }
  } catch (err) {
    console.error(err)
    let message = 'Login failed.'
    if (err.code === 'auth/user-not-found') message = 'No account found with this email.'
    else if (err.code === 'auth/wrong-password') message = 'Incorrect password.'

    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: message,
    })
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
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input
                type="email"
                id="email"
                class="form-control"
                v-model="loginData.email"
                @blur="validateEmail(true)"
                @input="validateEmail(false)"
                placeholder="you@example.com"
              />
              <div v-if="loginErrors.email" class="text-danger small mt-1">
                {{ loginErrors.email }}
              </div>
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input
                type="password"
                id="password"
                class="form-control"
                v-model="loginData.password"
                @blur="validatePassword(true)"
                @input="validatePassword(false)"
                placeholder="Enter your password"
              />
              <div v-if="loginErrors.password" class="text-danger small mt-1">
                {{ loginErrors.password }}
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

#email:focus,
#password:focus {
  border-color: #7f56d9;
  box-shadow: 0 0 0 0.15rem rgba(127, 86, 217, 0.15);
}
</style>
