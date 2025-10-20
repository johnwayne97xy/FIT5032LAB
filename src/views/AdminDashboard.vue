<template>
  <div class="admin-container">
    <!-- Simple header -->
    <div class="admin-header">
      <h1>Admin Dashboard</h1>
      <p>Manage users and community stories</p>
    </div>

    <!-- Simple tabs -->
    <div class="tab-buttons">
      <button :class="['tab-btn', { active: currentTab === 'users' }]" @click="currentTab = 'users'">Registered Users</button>
      <button :class="['tab-btn', { active: currentTab === 'stories' }]" @click="currentTab = 'stories'">Community Stories</button>
    </div>

    <!-- Users table -->
    <div v-if="currentTab === 'users'" class="table-section">
      <h2>Registered Users</h2>

      <div class="table-controls">
        <InputText v-model="userTableFilters.global.value" placeholder="Global search users..." class="search-input" autocomplete="off" />
      </div>

      <DataTable
        :value="userList"
        class="p-datatable-sm"
        showGridlines
        :loading="isLoadingUsers"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10,20,50]"
        :sortMode="'multiple'"
        :filters="userTableFilters"
        :globalFilterFields="['username','email','gender','identity','suburb','isAustralianLabel']"
        responsiveLayout="scroll"
        dataKey="id"
        emptyMessage="No users found"
      >
        <Column field="username" header="Username" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Search username" />
          </template>
        </Column>

        <Column field="email" header="Email" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Search email" />
          </template>
        </Column>

        <Column field="gender" header="Gender" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Search gender" />
          </template>
        </Column>

        <Column field="identity" header="Identity" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Search identity" />
          </template>
        </Column>

        <Column field="suburb" header="Suburb" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Search suburb" />
          </template>
        </Column>

        <Column field="isAustralianLabel" header="Australian" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <Dropdown
              v-model="filterModel.value"
              :options="yesNoOptionsList"
              optionLabel="label"
              optionValue="value"
              placeholder="All"
              @change="filterCallback()"
              class="p-inputtext-sm"
            />
          </template>
          <template #body="{ data }">
            {{ data.isAustralian ? 'Yes' : 'No' }}
          </template>
        </Column>

        <Column field="createdAtMillis" header="Registered" sortable dataType="numeric">
          <template #body="{ data }">
            {{ formatDateSimple(data.createdAt) }}
          </template>
        </Column>
        <Column header="Actions" :sortable="false">
          <template #body="{ data }">
            <Button label="Delete" size="small" class="p-button-text p-button-danger" @click="deleteUserById(data.id)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Stories table -->
    <div v-if="currentTab === 'stories'" class="table-section">
      <h2>Community Stories</h2>

      <div class="table-controls">
        <InputText v-model="storyTableFilters.global.value" placeholder="Global search stories..." class="search-input" autocomplete="off" />
      </div>

      <DataTable
        :value="storyList"
        class="p-datatable-sm"
        showGridlines
        :loading="isLoadingStories"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10,20,50]"
        :sortMode="'multiple'"
        :filters="storyTableFilters"
        :globalFilterFields="['title','authorName','authorEmail','tagsJoined','anonymousLabel']"
        responsiveLayout="scroll"
        dataKey="id"
        emptyMessage="No stories found"
      >
        <Column field="title" header="Title" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Search title" />
          </template>
        </Column>

        <Column field="authorName" header="Author" sortable>
          <template #body="{ data }">
            {{ data.authorName || 'Anonymous' }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Search author" />
          </template>
        </Column>

        <Column field="authorEmail" header="Email" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Search email" />
          </template>
        </Column>

        <Column field="tagsJoined" header="Tags" sortable>
          <template #body="{ data }">
            <div class="tags-cell">
              <span v-for="tag in data.tags || []" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Search tags" />
          </template>
        </Column>

        <Column field="anonymousLabel" header="Anonymous" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <Dropdown
              v-model="filterModel.value"
              :options="yesNoOptionsList"
              optionLabel="label"
              optionValue="value"
              placeholder="All"
              @change="filterCallback()"
              class="p-inputtext-sm"
            />
          </template>
          <template #body="{ data }">
            {{ data.anonymous ? 'Yes' : 'No' }}
          </template>
        </Column>

        <Column field="createdAtMillis" header="Created" sortable dataType="numeric">
          <template #body="{ data }">
            {{ formatDateSimple(data.createdAt) }}
          </template>
        </Column>

        <Column header="Actions" :sortable="false">
          <template #body="{ data }">
            <Button label="View" size="small" class="p-button-text p-button-info" @click="openStoryModal(data)" />
            <Button label="Delete" size="small" class="p-button-text p-button-danger" @click="deleteStoryById(data.id)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Story modal -->
    <div v-if="selectedStoryItem" class="modal" @click="selectedStoryItem = null">
      <div class="modal-content" @click.stop>
        <h3>{{ selectedStoryItem.title }}</h3>
        <p class="story-author">By: {{ selectedStoryItem.authorName || 'Anonymous' }}</p>
        <p class="story-content">{{ selectedStoryItem.content }}</p>
        <button @click="selectedStoryItem = null" class="close-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// PrimeVue + Vue + Firestore
import { ref, onMounted } from 'vue'
import { db } from '@/services/firebase'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { FilterMatchMode } from 'primevue/api'

// Component name
defineOptions({ name: 'AdminDashboardPage' })

// Simple UI state
const currentTab = ref('users')

// Simple data lists
const userList = ref([])
const storyList = ref([])
const isLoadingUsers = ref(false)
const isLoadingStories = ref(false)
const selectedStoryItem = ref(null)

// Yes/No dropdown options
const yesNoOptionsList = [
  { label: 'All', value: null },
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' }
]

// User table filters
const userTableFilters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  username: { value: null, matchMode: FilterMatchMode.CONTAINS },
  email: { value: null, matchMode: FilterMatchMode.CONTAINS },
  gender: { value: null, matchMode: FilterMatchMode.CONTAINS },
  identity: { value: null, matchMode: FilterMatchMode.CONTAINS },
  suburb: { value: null, matchMode: FilterMatchMode.CONTAINS },
  isAustralianLabel: { value: null, matchMode: FilterMatchMode.EQUALS },
  createdAtMillis: { value: null, matchMode: FilterMatchMode.EQUALS }
})

// Story table filters
const storyTableFilters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  title: { value: null, matchMode: FilterMatchMode.CONTAINS },
  authorName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  authorEmail: { value: null, matchMode: FilterMatchMode.CONTAINS },
  tagsJoined: { value: null, matchMode: FilterMatchMode.CONTAINS },
  anonymousLabel: { value: null, matchMode: FilterMatchMode.EQUALS },
  createdAtMillis: { value: null, matchMode: FilterMatchMode.EQUALS }
})

// Load users
const loadAllUsers = async () => {
  isLoadingUsers.value = true
  try {
    const snap = await getDocs(collection(db, 'users'))
    userList.value = snap.docs.map(d => {
      const data = d.data()
      const createdAtDate = data.createdAt?.toDate?.() || data.createdAt || null
      return {
        id: d.id,
        ...data,
        createdAt: createdAtDate,
        createdAtMillis: createdAtDate ? new Date(createdAtDate).getTime() : 0,
        isAustralianLabel: data.isAustralian ? 'Yes' : 'No'
      }
    })
  } finally {
    isLoadingUsers.value = false
  }
}

// Load stories
const loadAllStories = async () => {
  isLoadingStories.value = true
  try {
    const snap = await getDocs(collection(db, 'communityStories'))
    storyList.value = snap.docs.map(d => {
      const data = d.data()
      const createdAtDate = data.createdAt?.toDate?.() || data.createdAt || null
      return {
        id: d.id,
        ...data,
        createdAt: createdAtDate,
        createdAtMillis: createdAtDate ? new Date(createdAtDate).getTime() : 0,
        anonymousLabel: data.anonymous ? 'Yes' : 'No',
        tagsJoined: Array.isArray(data.tags) ? data.tags.join(', ') : ''
      }
    })
  } finally {
    isLoadingStories.value = false
  }
}

// Actions
const openStoryModal = (story) => (selectedStoryItem.value = story)
const deleteStoryById = async (storyId) => {
  if (!confirm('Delete this story?')) return
  await deleteDoc(doc(db, 'communityStories', storyId))
  await loadAllStories()
}
const deleteUserById = async (userId) => {
  if (!confirm('Delete this user?')) return
  await deleteDoc(doc(db, 'users', userId))
  await loadAllUsers()
}

// Helpers
const formatDateSimple = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'

// Init
onMounted(async () => {
  await Promise.all([loadAllUsers(), loadAllStories()])
})
</script>

<style scoped>
.admin-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.admin-header { background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:#fff; padding: 24px; border-radius: 12px; margin-bottom: 20px; }
.tab-buttons { display:flex; gap:10px; margin-bottom:20px; }
.tab-btn { padding:8px 16px; border:1px solid #e5e7eb; background:#fff; border-radius:8px; cursor:pointer; }
.tab-btn.active { background:#667eea; color:#fff; border-color:#667eea; }
.table-section { background:#fff; padding:16px; border-radius:12px; box-shadow:0 1px 6px rgba(0,0,0,.06); }
.table-controls { margin-bottom:12px; }
.search-input { width: 260px; }
.tags-cell { display:flex; flex-wrap:wrap; gap:6px; }
.tag { background:#eef2ff; color:#4338ca; padding:2px 8px; border-radius:12px; font-size:12px; }
.modal { position:fixed; inset:0; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; }
.modal-content { background:#fff; padding:20px; border-radius:8px; max-width:600px; width:90%; }
.close-btn { background:#667eea; color:#fff; border:none; padding:8px 14px; border-radius:6px; cursor:pointer; }
</style>
