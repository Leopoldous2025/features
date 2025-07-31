<template>
  <div class="min-h-screen bg-gray-900">
    <AppHeader :user="user" />
    
    <div v-if="user" class="container mx-auto px-4 py-8">
      <!-- Add Feature Button -->
      <div class="mb-8 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-white">Feature Evaluation Dashboard</h1>
        <UButton 
          @click="openFeatureDrawer"
          size="lg"
          class="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Feature
        </UButton>
      </div>

      <!-- Instruction when no feature selected -->
      <div v-if="!selectedFeature && features.length > 0" class="mb-8">
        <div class="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
          <h3 class="text-blue-300 font-semibold mb-2">👆 Ready to Analyze Features?</h3>
          <p class="text-blue-200 text-sm">
            Click on any feature in the matrix, plotted list, or features list below to see detailed score analysis and team consensus.
          </p>
        </div>
      </div>

      <!-- Results & Matrix Side by Side -->
      <div v-if="selectedFeature" class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <ScoreResults
          :feature="selectedFeature"
          :current-user="user"
          @edit-score="openScoreDrawer"
        />
        <PriorityMatrix 
          :features="features" 
          :current-user="user" 
          @feature-selected="handleFeatureSelected"
        />
      </div>
      
      <!-- Matrix only when no feature selected -->
      <div v-else class="mb-8">
        <PriorityMatrix 
          :features="features" 
          :current-user="user" 
          @feature-selected="handleFeatureSelected"
        />
      </div>

      <!-- Features List -->
      <FeaturesList
        :features="features"
        :current-user="user"
        @feature-selected="handleFeatureSelected"
        @score-updated="refreshFeatures"
        @feature-deleted="handleFeatureDeleted"
      />
    </div>

    <div v-else class="min-h-screen flex items-center justify-center">
      <div class="text-white text-lg">Loading...</div>
    </div>

    <!-- Feature Creation/Scoring Drawer -->
    <FeatureDrawer 
      :is-open="isDrawerOpen"
      :mode="drawerMode"
      :feature="drawerFeature"
      :current-user="user"
      @close="closeDrawer"
      @feature-created="handleFeatureCreated"
      @score-submitted="handleScoreSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
interface User {
  id: string
  email: string
}

interface Score {
  user: User
  strategic: number
  impact: number
  technical: number
  market: number
  revenue: number
  compliance: number
}

interface Feature {
  id: string
  name: string
  description?: string
  createdBy: User
  scores: Score[]
  createdAt: string
}

// Authentication check (client-side)
const { data: userData, error: userError } = await useFetch<{ user: User }>('/api/auth/me', {
  server: false,
  default: () => ({ user: null })
})

if (userError.value) {
  await navigateTo('/login')
}

const user = computed(() => userData.value?.user)

// Fetch features
const { data: featuresData, refresh: refreshFeatures } = await useFetch<{ features: Feature[] }>('/api/features', {
  server: false,
  default: () => ({ features: [] })
})

const features = computed(() => featuresData.value?.features || [])

// Selected feature state
const selectedFeature = ref<Feature | null>(null)

// Drawer state
const isDrawerOpen = ref(false)
const drawerMode = ref<'create' | 'score'>('create')
const drawerFeature = ref<Feature | null>(null)

const openFeatureDrawer = () => {
  drawerMode.value = 'create'
  drawerFeature.value = null
  isDrawerOpen.value = true
}

const openScoreDrawer = (feature: Feature) => {
  drawerMode.value = 'score'
  drawerFeature.value = feature
  isDrawerOpen.value = true
}

const closeDrawer = () => {
  isDrawerOpen.value = false
  drawerMode.value = 'create'
  drawerFeature.value = null
}

// Event handlers
const handleFeatureCreated = async (feature: Feature) => {
  console.log('Feature created:', feature)
  await refreshFeatures()
  
  console.log('Switching drawer to score mode...')
  // Switch to score mode for the newly created feature
  drawerMode.value = 'score'
  drawerFeature.value = feature
  selectedFeature.value = feature
  
  console.log('Drawer mode set to:', drawerMode.value)
  console.log('Drawer feature set to:', drawerFeature.value?.name)
}

const handleFeatureSelected = (feature: Feature) => {
  console.log('Feature selected:', feature.name)
  selectedFeature.value = feature
}

const handleScoreSubmitted = async () => {
  console.log('Score submitted, refreshing features...')
  await refreshFeatures()
}

const handleFeatureDeleted = async () => {
  console.log('Feature deleted, refreshing features...')
  await refreshFeatures()
}
</script> 