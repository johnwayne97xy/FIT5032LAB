<template>
  <div class="community-page-container">
    <!-- Page Header -->
    <div class="page-title-section">
      <h1>Share Your Story</h1>
      <p>Your experience matters. Share your journey to inspire others.</p>
    </div>

    <!-- Story Submission Form -->
    <div class="story-form-container">
      <form @submit.prevent="handleSubmitStory">
        <!-- Story Title Input -->
        <div class="input-group">
          <label for="story-title">Story Title *</label>
          <input
            id="story-title"
            v-model="newStoryData.storyTitle"
            type="text"
            class="text-input"
            placeholder="Give your story a title..."
            required
          />
        </div>

        <!-- Story Content -->
        <div class="input-group">
          <label for="story-content">Your Story *</label>
          <textarea
            id="story-content"
            v-model="newStoryData.storyContent"
            class="text-area"
            rows="8"
            placeholder="Share your experience..."
            required
          ></textarea>
          <small class="character-counter">{{ newStoryData.storyContent.length }}/2000 characters</small>
        </div>

        <!-- Tag Selection -->
        <div class="input-group">
          <label>Choose Tags (Select all that apply)</label>
          <div class="tag-selection-grid">
            <label v-for="tag in storyTagOptions" :key="tag" class="tag-selection-item">
              <input type="checkbox" :value="tag" v-model="newStoryData.selectedTags" />
              <span class="tag-text">{{ tag }}</span>
            </label>
          </div>
        </div>

        <!-- Anonymous Option -->
        <div class="input-group">
          <label class="anonymous-option">
            <input type="checkbox" v-model="newStoryData.isAnonymous" />
            <span>Post anonymously</span>
          </label>
        </div>

        <!-- Submit Button -->
        <div class="submit-section">
          <button type="submit" class="submit-button" :disabled="isSubmittingStory">
            {{ isSubmittingStory ? 'Submitting...' : 'Share Story' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Published Stories List -->
    <div class="stories-display-section">
      <h2>Community Stories</h2>

      <!-- Search and Filter Controls -->
      <div class="search-controls">
        <input
          v-model="searchText"
          class="search-input"
          placeholder="Search by title or author..."
          @input="resetToFirstPage"
        />
        <select v-model="selectedTagFilter" class="filter-select" @change="resetToFirstPage">
          <option value="">All Tags</option>
          <option v-for="tag in storyTagOptions" :key="tag" :value="tag">{{ tag }}</option>
        </select>
        <select v-model="sortByField" class="filter-select">
          <option value="createdAt">Sort by Date</option>
          <option value="title">Sort by Title</option>
          <option value="authorName">Sort by Author</option>
        </select>
        <button class="sort-direction-button" @click="toggleSortDirection">
          {{ sortDirection === 'asc' ? 'Asc' : 'Desc' }}
        </button>
      </div>

      <div v-if="allStories.length === 0" class="empty-stories-message">
        No stories yet. Be the first to share!
      </div>

      <div v-else class="stories-grid">
        <div
          v-for="story in displayedStories"
          :key="story.id"
          class="story-item"
          @click="showStoryDetails(story)"
        >
          <h3>{{ story.title }}</h3>
          <div class="story-info">
            <span>By: {{ story.anonymous ? 'Anonymous' : story.authorName }}</span>
            <span>{{ formatStoryDate(story.createdAt) }}</span>
          </div>
          <p class="story-excerpt">{{ story.content.substring(0, 200) }}...</p>
          <div class="story-tags-list">
            <span v-for="tag in story.tags" :key="tag" class="story-tag">{{ tag }}</span>
          </div>
        </div>
      </div>

      <!-- Page Navigation -->
      <div v-if="totalPageCount > 1" class="page-navigation">
        <button class="page-button" :disabled="currentPageNumber === 1" @click="currentPageNumber--">
          Previous
        </button>
        <span>Page {{ currentPageNumber }} / {{ totalPageCount }}</span>
        <button
          class="page-button"
          :disabled="currentPageNumber === totalPageCount"
          @click="currentPageNumber++"
        >
          Next
        </button>
      </div>

      <!-- Story Details Modal -->
      <div v-if="selectedStoryForViewing" class="modal-background" @click.self="selectedStoryForViewing = null">
        <div class="modal-content">
          <h2>{{ selectedStoryForViewing.title }}</h2>
          <p class="story-meta-info">
            By: {{ selectedStoryForViewing.anonymous ? 'Anonymous' : selectedStoryForViewing.authorName }}
            | {{ formatStoryDate(selectedStoryForViewing.createdAt) }}
          </p>
          <p class="story-full-text">{{ selectedStoryForViewing.content }}</p>
          <div class="story-tags-list">
            <span v-for="tag in selectedStoryForViewing.tags" :key="tag" class="story-tag">
              {{ tag }}
            </span>
          </div>
          <button class="close-button" @click="selectedStoryForViewing = null">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { auth, db } from '@/services/firebase'
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore'
import Swal from 'sweetalert2'

// Component name
defineOptions({
  name: 'CommunityStoriesPage'
})

// Available story tags
const storyTagOptions = [
  'Anxiety', 'Depression', 'Stress', 'Work-Life Balance',
  'Relationships', 'Self-Care', 'Recovery', 'Family', 'Student Life'
]

// New story form data
const newStoryData = ref({
  storyTitle: '',
  storyContent: '',
  selectedTags: [],
  isAnonymous: false
})
const isSubmittingStory = ref(false)
const allStories = ref([])

// List control states
const searchText = ref('')
const selectedTagFilter = ref('')
const sortByField = ref('createdAt')
const sortDirection = ref('desc')
const storiesPerPage = 10
const currentPageNumber = ref(1)
const selectedStoryForViewing = ref(null)

// Simple XSS protection function
function sanitizeUserInput(input) {
  if (typeof input !== 'string') return input

  // Remove potentially dangerous HTML tags and scripts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

// Event handlers
const resetToFirstPage = () => { currentPageNumber.value = 1 }
const toggleSortDirection = () => {
  sortDirection.value = (sortDirection.value === 'asc' ? 'desc' : 'asc')
}
const showStoryDetails = (story) => (selectedStoryForViewing.value = story)

// Filter and sort stories
const filteredStories = computed(() => {
  const searchKeyword = searchText.value.trim().toLowerCase()
  return allStories.value.filter(story => {
    const matchesSearch = searchKeyword
      ? (story.title?.toLowerCase().includes(searchKeyword) ||
         (story.authorName || '').toLowerCase().includes(searchKeyword))
      : true
    const matchesTag = selectedTagFilter.value
      ? (story.tags || []).includes(selectedTagFilter.value)
      : true
    return matchesSearch && matchesTag
  })
})

const sortedStories = computed(() => {
  const storyList = [...filteredStories.value]
  const sortKey = sortByField.value
  const sortOrder = sortDirection.value === 'asc' ? 1 : -1

  return storyList.sort((storyA, storyB) => {
    let valueA, valueB
    if (sortKey === 'createdAt') {
      valueA = storyA.createdAt ?
        (storyA.createdAt.getTime ? storyA.createdAt.getTime() : new Date(storyA.createdAt).getTime()) : 0
      valueB = storyB.createdAt ?
        (storyB.createdAt.getTime ? storyB.createdAt.getTime() : new Date(storyB.createdAt).getTime()) : 0
    } else {
      valueA = (storyA[sortKey] || '').toString().toLowerCase()
      valueB = (storyB[sortKey] || '').toString().toLowerCase()
    }
    if (valueA < valueB) return -1 * sortOrder
    if (valueA > valueB) return 1 * sortOrder
    return 0
  })
})

const totalPageCount = computed(() => Math.max(1, Math.ceil(sortedStories.value.length / storiesPerPage)))
const displayedStories = computed(() => {
  const startIndex = (currentPageNumber.value - 1) * storiesPerPage
  return sortedStories.value.slice(startIndex, startIndex + storiesPerPage)
})

// Submit new story
const handleSubmitStory = async () => {
  // Validate form data
  if (!newStoryData.value.storyTitle.trim() || !newStoryData.value.storyContent.trim()) {
    Swal.fire('Error', 'Please fill in all required fields', 'error')
    return
  }
  if (newStoryData.value.storyContent.length > 2000) {
    Swal.fire('Error', 'Story is too long (max 2000 characters)', 'error')
    return
  }
  if (newStoryData.value.selectedTags.length === 0) {
    Swal.fire('Error', 'Please select at least one tag', 'error')
    return
  }

  isSubmittingStory.value = true
  try {
    const currentUser = auth.currentUser

    // Sanitize user input to prevent XSS
    const sanitizedTitle = sanitizeUserInput(newStoryData.value.storyTitle.trim())
    const sanitizedContent = sanitizeUserInput(newStoryData.value.storyContent.trim())

    const storyToSave = {
      title: sanitizedTitle,
      content: sanitizedContent,
      tags: newStoryData.value.selectedTags,
      anonymous: newStoryData.value.isAnonymous,
      authorId: currentUser ? currentUser.uid : 'guest',
      authorEmail: currentUser ? currentUser.email : 'guest@example.com',
      authorName: newStoryData.value.isAnonymous ? 'Anonymous' :
        (currentUser?.email?.split('@')[0] || 'Guest'),
      createdAt: serverTimestamp(),
    }

    await addDoc(collection(db, 'communityStories'), storyToSave)

    Swal.fire({
      icon: 'success',
      title: 'Story Shared!',
      text: 'Thank you for sharing your story with our community.',
      timer: 2000,
      showConfirmButton: false
    })

    // Reset form
    newStoryData.value = { storyTitle: '', storyContent: '', selectedTags: [], isAnonymous: false }
    await loadAllStories()
    resetToFirstPage()
  } catch (error) {
    console.error('Error submitting story:', error)
    Swal.fire('Error', 'Failed to submit story. Please try again.', 'error')
  } finally {
    isSubmittingStory.value = false
  }
}

// Load all stories from database
const loadAllStories = async () => {
  try {
    const storiesQuery = query(collection(db, 'communityStories'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(storiesQuery)
    allStories.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }))
  } catch (error) {
    console.error('Error loading stories:', error)
  }
}

// Format date for display
const formatStoryDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Load stories when component mounts
onMounted(loadAllStories)
</script>

<style scoped>
/* Main container */
.community-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Page header */
.page-title-section {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  border-radius: 15px;
  margin-bottom: 30px;
}

.page-title-section h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

/* Story form container */
.story-form-container {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.input-group {
  margin-bottom: 25px;
}

.input-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
}

.text-input,
.text-area {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
}

.text-input:focus,
.text-area:focus {
  outline: none;
  border-color: #10b981;
}

.text-area {
  resize: vertical;
  font-family: inherit;
}

.character-counter {
  display: block;
  text-align: right;
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 5px;
}

/* Tag selection grid */
.tag-selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.tag-selection-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 8px;
}

.tag-selection-item input {
  margin-right: 8px;
}

.tag-text {
  font-size: 0.95rem;
}

/* Anonymous option */
.anonymous-option {
  display: flex;
  align-items: center;
}

.anonymous-option input {
  margin-right: 10px;
}

/* Submit section */
.submit-section {
  text-align: center;
}

.submit-button {
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: #10b981;
  color: white;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Stories display section */
.stories-display-section {
  margin-top: 50px;
}

.stories-display-section h2 {
  font-size: 2rem;
  margin-bottom: 16px;
  color: #1f2937;
}

/* Search controls */
.search-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.search-input,
.filter-select {
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  color: #374151;
}

.sort-direction-button {
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  color: #374151;
  background: #ffffff;
}

/* Empty stories message */
.empty-stories-message {
  text-align: center;
  padding: 40px;
  background: #f9fafb;
  border-radius: 10px;
  color: #6b7280;
}

/* Stories grid */
.stories-grid {
  display: grid;
  gap: 20px;
}

.story-item {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.story-item:hover {
  background: #f9fafb;
}

.story-item h3 {
  color: #1f2937;
  margin-bottom: 10px;
}

.story-info {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  font-size: 0.9rem;
  color: #6b7280;
}

.story-excerpt {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 15px;
}

.story-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.story-tag {
  padding: 4px 12px;
  background: #f3f4f6;
  color: #10b981;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Page navigation */
.page-navigation {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

.page-button {
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: #10b981;
  color: white;
}

.page-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal styles */
.modal-background {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.story-meta-info {
  color: #6b7280;
  margin-bottom: 10px;
}

.story-full-text {
  line-height: 1.6;
  color: #374151;
  margin-bottom: 15px;
}

.close-button {
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: #10b981;
  color: white;
}

/* Responsive design */
@media (max-width: 768px) {
  .page-title-section h1 {
    font-size: 2rem;
  }

  .story-form-container {
    padding: 20px;
  }

  .tag-selection-grid {
    grid-template-columns: 1fr;
  }
}
</style>
