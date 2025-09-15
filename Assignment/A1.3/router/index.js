import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import StressAssessment from '../views/StressAssessmentView.vue'
import CommunityStories from '../views/CommunityStories.vue'
import Resources from '../views/Resources.vue'
import GetInvolved from '../views/GetInvolved.vue'
import Register from '../views/RegisterView.vue'
import StressResult from '../views/StressResultView.vue'

import Login from '../views/LoginView.vue'
import AdminDashboard from '../views/AdminDashboard.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/stress-assessment', name: 'StressAssessment', component: StressAssessment },
  { path: '/community-stories', name: 'CommunityStories', component: CommunityStories },
  { path: '/resources', name: 'Resources', component: Resources },
  { path: '/get-involved', name: 'GetInvolved', component: GetInvolved },
  { path: '/register', name: 'Register', component: Register },
  { path: '/stress-assessment/result', name: 'StressResult', component: StressResult },

  { path: '/login', name: 'Login', component: Login },
  { path: '/admin', name: 'AdminDashboard', component: AdminDashboard },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
