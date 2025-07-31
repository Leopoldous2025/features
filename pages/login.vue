<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900">
    <div class="max-w-md w-full mx-4">
      <UCard class="p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            AlphaLens Feature Matrix
          </h1>
          <p class="text-gray-400">
            Collaborative feature evaluation and prioritization
          </p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-6">
          <UFormGroup label="Email Address" required>
            <UInput
              v-model="form.email"
              type="email"
              placeholder="your.name@deckmatch.com"
              :disabled="loading"
              autocomplete="email"
            />
          </UFormGroup>
          
          <p class="text-sm text-gray-400">
            Only @deckmatch.com email addresses are allowed
          </p>
          
          <!-- Debug info -->
          <div v-if="form.email" class="text-xs text-gray-500">
            Email: "{{ form.email }}" | Valid: {{ isValidEmail }} | Loading: {{ loading }}
          </div>
          
          <UButton
            type="submit"
            :loading="loading"
            :disabled="loading || !form.email.trim()"
            block
            size="lg"
            class="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            @click="handleLogin"
          >
            {{ loading ? 'Signing In...' : 'Sign In' }}
          </UButton>
        </form>
        
        <UAlert
          v-if="error"
          :title="error"
          color="red"
          variant="soft"
          class="mt-4"
        />
        
        <UAlert
          v-if="success"
          title="Login successful! Redirecting..."
          color="green"
          variant="soft"
          class="mt-4"
        />
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
interface LoginForm {
  email: string
}

const form = reactive<LoginForm>({
  email: ''
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@deckmatch\.com$/
  return emailRegex.test(form.email.toLowerCase())
})

const handleLogin = async () => {
  console.log('Login attempted with email:', form.email)
  
  if (!form.email.trim()) {
    error.value = 'Please enter an email address'
    return
  }
  
  if (!isValidEmail.value) {
    error.value = 'Please enter a valid @deckmatch.com email address'
    return
  }
  
  loading.value = true
  error.value = ''
  success.value = false
  
  try {
    console.log('Sending login request...')
    const response = await $fetch<{ success: boolean, user: { id: string, email: string } }>('/api/auth/login', {
      method: 'POST',
      body: {
        email: form.email.trim()
      }
    })
    
    console.log('Login response:', response)
    
    if (response?.success) {
      success.value = true
      console.log('Login successful, navigating to home...')
      // Use window.location for immediate redirect
      window.location.href = '/'
    } else {
      error.value = 'Login failed - invalid response from server'
    }
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.data?.message || err.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}

// Redirect to home if already authenticated
// const { data: user } = await useFetch('/api/auth/me', {
//   server: false
// })

// if (user.value) {
//   await navigateTo('/')
// }

// Set page meta
useSeoMeta({
  title: 'Login - AlphaLens Feature Matrix',
  description: 'Sign in to collaborate on feature evaluation and prioritization'
})
</script> 