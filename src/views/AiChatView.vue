<template>
  <div class="chat-page-container">
    <!-- Page Header -->
    <div class="page-title-section">
      <h1>Mental Health Chat</h1>
      <p>Talk to our support assistant</p>
    </div>

    <!-- Chat Messages Area -->
    <div class="messages-display-area" ref="messagesDisplayArea">
      <!-- Welcome Message -->
      <div class="chat-message bot-message">
        <div class="message-content">
          <p>Hello! I'm here to help with mental health support. How are you feeling today?</p>
        </div>
      </div>

      <!-- Message List -->
      <div v-for="(message, index) in chatMessages" :key="index"
           :class="['chat-message', message.messageType]">
        <div class="message-content">
          <p>{{ message.messageText }}</p>
        </div>
      </div>

      <!-- Loading Message -->
      <div v-if="isLoading" class="chat-message bot-message">
        <div class="message-content loading-message">
          <p>Thinking...</p>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-display">
        <p>⚠️ {{ errorMessage }}</p>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-section">
      <form @submit.prevent="handleSendMessage" class="message-form">
        <input
          v-model="userMessageInput"
          type="text"
          placeholder="Type your message here..."
          class="message-input"
          :disabled="isLoading"
          @keydown.enter.prevent="handleSendMessage"
        />
        <button
          type="submit"
          class="send-message-button"
          :disabled="isLoading || !userMessageInput.trim()"
        >
          <span v-if="!isLoading">Send</span>
          <span v-else>...</span>
        </button>
      </form>

      <!-- Quick Message Buttons -->
      <div class="quick-message-buttons">
        <button
          v-for="quickMessage in quickMessageOptions"
          :key="quickMessage"
          @click="userMessageInput = quickMessage"
          class="quick-message-button"
          :disabled="isLoading"
        >
          {{ quickMessage }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

// Component name
defineOptions({
  name: 'ChatPage'
})

// API endpoint URL
const API_ENDPOINT_URL = 'https://us-central1-week7-weifeng.cloudfunctions.net/askGemini'

// Chat state variables
const chatMessages = ref([])
const userMessageInput = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const messagesDisplayArea = ref(null)

// Quick message options for users
const quickMessageOptions = ref([
  'I feel anxious today',
  'I need help with stress',
  'I feel sad',
  'How can I sleep better?',
  'I want to talk about my feelings'
])

// Scroll to bottom of messages
const scrollToBottomOfMessages = async () => {
  await nextTick()
  if (messagesDisplayArea.value) {
    messagesDisplayArea.value.scrollTop = messagesDisplayArea.value.scrollHeight
  }
}

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

// Send message function
async function handleSendMessage() {
  const messageText = sanitizeBasic(userMessageInput.value.trim())
  if (!messageText || isLoading.value) return

  // Clear any previous error
  errorMessage.value = ''

  // Add user message to chat
  chatMessages.value.push({
    messageType: 'user-message',
    messageText: messageText
  })

  // Clear input field
  userMessageInput.value = ''

  // Start loading
  isLoading.value = true

  // Scroll to bottom
  scrollToBottomOfMessages()

  try {
    // Create simple prompt for the assistant
    const simplePrompt = `
You are a helpful mental health support assistant.
Be warm, supportive and concise.

User says: "${messageText}"

Response:
    `.trim()

    // Call the API
    const apiResponse = await fetch(API_ENDPOINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: simplePrompt
      })
    })

    if (!apiResponse.ok) {
      throw new Error(`Request failed: ${apiResponse.status}`)
    }

    const responseData = await apiResponse.json()

    // Get the response text
    let assistantResponse = responseData.output || responseData.text || 'I understand. How can I support you?'

    // Add assistant response to chat
    chatMessages.value.push({
      messageType: 'bot-message',
      messageText: assistantResponse
    })

  } catch (error) {
    console.error('Error:', error)
    errorMessage.value = 'Sorry, I could not process that. Please try again.'
  } finally {
    isLoading.value = false
    scrollToBottomOfMessages()
  }
}
</script>

<style scoped>
/* Main container */
.chat-page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

/* Page header */
.page-title-section {
  text-align: center;
  padding: 30px 20px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  border-radius: 15px 15px 0 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.page-title-section h1 {
  margin: 0 0 10px 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.page-title-section p {
  margin: 0;
  opacity: 0.95;
  font-size: 1rem;
}

/* Messages display area */
.messages-display-area {
  background: white;
  min-height: 400px;
  max-height: 500px;
  overflow-y: auto;
  padding: 20px;
  border-left: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  scroll-behavior: smooth;
}

/* Chat message styles */
.chat-message {
  display: flex;
  margin-bottom: 16px;
}

.chat-message.user-message {
  justify-content: flex-end;
}

.chat-message.bot-message {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.user-message .message-content {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.bot-message .message-content {
  background: #f3f4f6;
  color: #1f2937;
  border-bottom-left-radius: 4px;
}

.message-content p {
  margin: 0;
  line-height: 1.5;
}

.loading-message {
  background: #f3f4f6;
  color: #6b7280;
  font-style: italic;
}

/* Error message */
.error-display {
  background: #fee2e2;
  color: #dc2626;
  padding: 10px 15px;
  border-radius: 8px;
  margin: 10px 0;
  font-size: 0.9rem;
}

/* Input section */
.input-section {
  background: white;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 15px 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.message-form {
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
}

.message-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.message-input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

.send-message-button {
  padding: 12px 28px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  min-width: 80px;
}

.send-message-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
}

.send-message-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Quick message buttons */
.quick-message-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
}

.quick-message-button {
  padding: 8px 12px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
}

.quick-message-button:hover:not(:disabled) {
  background: #e5e7eb;
}

.quick-message-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive design */
@media (max-width: 640px) {
  .chat-page-container {
    padding: 10px;
  }

  .page-title-section h1 {
    font-size: 1.5rem;
  }

  .message-content {
    max-width: 85%;
  }

  .messages-display-area {
    max-height: 400px;
  }

  .quick-message-buttons {
    justify-content: center;
  }

  .send-message-button {
    padding: 12px 20px;
  }
}

/* Scrollbar styles */
.messages-display-area::-webkit-scrollbar {
  width: 6px;
}

.messages-display-area::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.messages-display-area::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.messages-display-area::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
