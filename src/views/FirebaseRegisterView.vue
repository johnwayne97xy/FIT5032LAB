<template>
  <div class="container d-flex flex-column align-items-center justify-content-start min-vh-100 text-center mt-5">
    <h1>Create an Account</h1>
    <form class="w-50">
      <div class="mb-3">
        <input 
          type="text" 
          placeholder="Email" 
          v-model="email" 
          class="form-control" />
      </div>
      <div class="mb-3">
        <input 
          type="password" 
          placeholder="Password" 
          v-model="password" 
          class="form-control" />
      </div>
      <button type="button" class="btn btn-success" @click="register">
        Save to Firebase
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "vue-router"

const email = ref("")
const password = ref("")
const router = useRouter()
const auth = getAuth()

const register = () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then((data) => {
      console.log("Firebase Register Successful!")
      router.push("/FireLogin")
    })
    .catch((error) => {
      console.log(error.code)
    })
}
</script>
