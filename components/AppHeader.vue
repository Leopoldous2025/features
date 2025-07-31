<template>
  <header class="bg-gray-800 border-b border-gray-700">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h1 class="text-xl font-bold text-white">
            AlphaLens Feature Matrix
          </h1>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="text-sm text-gray-300">
            Signed in as <span class="font-medium text-white">{{ user?.email }}</span>
          </div>
          
          <UButton
            @click="handleLogout"
            variant="ghost"
            color="gray"
            size="sm"
          >
            Sign Out
          </UButton>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface User {
  id: string
  email: string
}

interface Props {
  user?: User
}

defineProps<Props>()

const handleLogout = async () => {
  try {
    // Clear the auth cookie by calling logout endpoint
    await $fetch('/api/auth/logout', { method: 'POST' })
  } catch (error) {
    console.error('Logout error:', error)
  }
  
  // Navigate to login page
  await navigateTo('/login')
}
</script> 