<template>
  <div class="d-flex flex-column align-items-center justify-content-start min-vh-100 mt-5">
    <h1>Sign in</h1>
    <input type="text" class="form-control w-50 my-2" placeholder="Email" v-model="email" />
    <input type="password" class="form-control w-50 my-2" placeholder="Password" v-model="password" />
    <button class="btn btn-primary mt-3" @click="signin">Sign in via Firebase</button>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "vue-router"

const email = ref("")
const password = ref("")
const router = useRouter()
const auth = getAuth()

const signin = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then((data) => {
      console.log("Firebase Sign In Successful!")
      console.log(auth.currentUser) 
      
      router.push({ 
        path: "/", 
        query: { user: auth.currentUser.email }   
      })
    })
    .catch((error) => {
      console.log(error.code)
    })
}
</script>
