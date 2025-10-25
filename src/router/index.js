import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import FirebaseSigninView from '../views/FirebaseSigninView.vue'
import FirebaseRegisterView from '../views/FirebaseRegisterView.vue'
import AddBookView from '@/views/AddBookView.vue'
import GetBookCountView from '@/views/GetBookCountView.vue'
import WeatherView from '@/views/WeatherView.vue'
import CountBookAPI from '@/views/CountBookAPI.vue'

const routes = [
  {
    path:'/GetBookCountView',
    name:'GetBookCountView',
    component: GetBookCountView
  },
  {
    path:'/CountBookAPI',
    name:'CountBookAPI',
    component: CountBookAPI
  },
  {
    path:'/WeatherCheck',
    name:'WeatherCheck',
    component: WeatherView
  },
  {
    path:'/AddBook',
    name:'AddBook',
    component: AddBookView
  },
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/FireLogin',
    name: 'FireLogin',
    component: FirebaseSigninView
  },
  {
    path: '/FireRegister',
    name: 'FireRegister',
    component: FirebaseRegisterView
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView
  }
]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router