<template>
  <div>
    <!-- Overlay -->
    <div 
      v-if="isOpen"
      @click="close"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
      :class="isOpen ? 'opacity-100' : 'opacity-0'"
    ></div>
    
    <!-- Drawer - wider for scoring mode -->
    <div 
      :class="[
        'fixed top-0 right-0 h-full bg-gray-800 border-l border-gray-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out',
        mode === 'score' ? 'w-[600px]' : 'w-96',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      ]"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-700">
        <h2 class="text-xl font-semibold text-white flex items-center gap-2">
          <span v-if="mode === 'create'">📝 Create New Feature</span>
          <span v-else>📊 Score Feature: {{ feature?.name }}</span>
        </h2>
        <button 
          @click="close"
          class="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Content -->
      <div class="overflow-y-auto h-full pb-24">
        <!-- Create Mode -->
        <div v-if="mode === 'create'" class="p-6">
          <UForm :state="createForm" @submit="handleCreateSubmit" class="space-y-6">
            <UFormGroup label="Feature Name" required>
              <UInput 
                v-model="createForm.name" 
                placeholder="e.g., AI-Powered Deal Sourcing Recommendations"
                :disabled="loading"
                class="w-full"
              />
            </UFormGroup>
            
            <UFormGroup label="Description">
              <UTextarea 
                v-model="createForm.description" 
                placeholder="Describe the feature and its intended functionality..."
                :rows="4"
                :disabled="loading"
                class="w-full"
              />
            </UFormGroup>
            
            <UButton 
              type="submit" 
              :loading="loading" 
              :disabled="!createForm.name.trim()"
              size="lg" 
              block
              class="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              {{ loading ? 'Creating...' : 'Create & Score Feature' }}
            </UButton>
          </UForm>
        </div>

        <!-- Score Mode -->
        <div v-else-if="mode === 'score'" class="p-6">
          <!-- Feature Info -->
          <div class="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
            <h3 class="text-white font-medium mb-2">{{ feature?.name }}</h3>
            <p v-if="feature?.description" class="text-gray-400 text-sm">{{ feature.description }}</p>
            <div class="mt-2 text-xs text-gray-500">
              Created by {{ feature?.createdBy?.email }} • {{ formatDate(feature?.createdAt) }}
            </div>
          </div>

          <!-- Team Scores (if others have scored) -->
          <div v-if="otherUserScores.length > 0 && userScore" class="mb-6">
            <h3 class="text-lg font-medium text-white mb-3">Team Scores</h3>
            <div class="space-y-2">
              <div
                v-for="score in otherUserScores"
                :key="score.user.id"
                class="flex justify-between items-center p-3 bg-gray-900 rounded-lg"
              >
                <span class="text-gray-300">{{ score.user.email }}</span>
                <span class="text-purple-400 font-semibold">{{ calculateWeightedScore(score).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Blind scoring notice -->
          <div v-if="otherUserScores.length > 0 && !userScore" class="mb-6">
            <div class="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="text-blue-400">🔒</div>
                <h3 class="text-blue-300 font-medium">Independent Scoring</h3>
              </div>
              <p class="text-blue-200 text-sm">
                {{ otherUserScores.length }} {{ otherUserScores.length === 1 ? 'person has' : 'people have' }} already scored this feature.
                Their scores will be revealed after you submit your evaluation to ensure unbiased scoring.
              </p>
            </div>
          </div>

          <!-- Scoring Form -->
          <UForm @submit="handleScoreSubmit" class="space-y-6">
            <ScoringCriteria 
              v-model="scores.strategic" 
              title="Strategic Alignment & Value Creation" 
              weight="25%" 
              :descriptions="scoreDescriptions.strategic"
              :questions="[
                'Does this feature leverage our unique vector search capability?',
                'Will it accelerate our head pin user path to value?',
                'Does it create a compelling reason to upgrade tiers?'
              ]"
            />

            <ScoringCriteria 
              v-model="scores.impact" 
              title="User Impact & Time-to-Value" 
              weight="20%" 
              :descriptions="scoreDescriptions.impact"
              :questions="[
                'How quickly can users realize value (seconds vs. minutes)?',
                'Does it solve a top-3 pain point from user feedback?',
                'Will it increase daily active usage?'
              ]"
            />

            <ScoringCriteria 
              v-model="scores.technical" 
              title="Data & Technical Feasibility" 
              weight="20%" 
              :descriptions="scoreDescriptions.technical"
              :questions="[
                'Can we maintain less than 2 second response times?',
                'Do we have reliable data sources?',
                'What is the ongoing maintenance burden?'
              ]"
            />

            <ScoringCriteria 
              v-model="scores.market" 
              title="Market Differentiation" 
              weight="15%" 
              :descriptions="scoreDescriptions.market"
              :questions="[
                'Is this functionality readily available elsewhere?',
                'Does it create a competitive moat?',
                'Will it drive word-of-mouth referrals?'
              ]"
            />

            <ScoringCriteria 
              v-model="scores.revenue" 
              title="Revenue & Growth Impact" 
              weight="10%" 
              :descriptions="scoreDescriptions.revenue"
              :questions="[
                'Will it reduce churn by improving stickiness?',
                'Does it create upsell opportunities?',
                'Can we charge more for this capability?'
              ]"
            />

            <ScoringCriteria 
              v-model="scores.compliance" 
              title="Compliance & Risk" 
              weight="10%" 
              :descriptions="scoreDescriptions.compliance"
              :questions="[
                'Are there regulatory concerns?',
                'Does it enhance data security?',
                'Will it reduce operational risk?'
              ]"
            />

            <UButton 
              type="submit" 
              :loading="loading" 
              :disabled="!allScoresProvided"
              size="lg" 
              block
              class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {{ loading ? 'Submitting Score...' : userScore ? 'Update Score' : 'Submit Score' }}
            </UButton>
          </UForm>
        </div>
        
        <!-- Alerts -->
        <div class="px-6">
          <UAlert 
            v-if="error" 
            :title="error" 
            color="red" 
            variant="soft" 
            class="mb-4" 
          />
          <UAlert 
            v-if="success" 
            :title="successMessage" 
            color="green" 
            variant="soft" 
            class="mb-4" 
          />
        </div>
      </div>
    </div>
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

interface Props {
  isOpen: boolean
  mode: 'create' | 'score'
  feature?: Feature
  currentUser?: User
}

interface Emits {
  close: []
  featureCreated: [feature: Feature]
  scoreSubmitted: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Form states
const createForm = reactive({
  name: '',
  description: ''
})

const scores = reactive({
  strategic: 0,
  impact: 0,
  technical: 0,
  market: 0,
  revenue: 0,
  compliance: 0
})

const loading = ref(false)
const error = ref('')
const success = ref(false)
const successMessage = ref('')

// Score descriptions
const scoreDescriptions = {
  strategic: {
    1: 'Directly simplifies our core similar companies/products differentiation',
    2: 'Enhances existing workflows without diluting focus',
    3: 'Neutral - neither enhances nor detracts from strategy',
    4: 'Partially aligned but may require additional positioning',
    5: 'Perfectly aligned with our PLG motion and value prop'
  },
  impact: {
    1: 'Minimal workflow improvement (less than 10% time savings)',
    2: 'Moderate improvement (10-30% time savings)',
    3: 'Significant workflow improvement (30-50% time savings)',
    4: 'Major improvement with some user behavior change required',
    5: 'Transformative - fundamentally changes how users work'
  },
  technical: {
    1: 'Requires significant engineering effort (6+ sprints)',
    2: 'Requires substantial effort (3-5 sprints)',
    3: 'Requires moderate engineering effort (1-2 sprints)',
    4: 'Requires minimal effort with reliable execution',
    5: 'Leverages existing infrastructure seamlessly'
  },
  market: {
    1: 'Significantly better execution than alternatives',
    2: 'Better execution than most alternatives',
    3: 'Comparable to existing market solutions',
    4: 'Some alternatives exist but we can differentiate',
    5: 'Unique capability - no direct alternatives'
  },
  revenue: {
    1: 'Strong retention impact (greater than 15% reduction in churn)',
    2: 'Moderate retention improvement (5-15% churn reduction)',
    3: 'Some business impact but hard to quantify',
    4: 'Minimal direct revenue impact',
    5: 'No clear revenue connection'
  },
  compliance: {
    1: 'No regulatory concerns, enhances data security',
    2: 'Low risk with standard compliance requirements',
    3: 'Moderate compliance considerations, manageable',
    4: 'Some regulatory complexity but addressable',
    5: 'High compliance risk or regulatory uncertainty'
  }
}

// Computed properties
const allScoresProvided = computed(() => {
  return scores.strategic > 0 && scores.impact > 0 && scores.technical > 0 && 
         scores.market > 0 && scores.revenue > 0 && scores.compliance > 0
})

const userScore = computed(() => {
  if (!props.feature || !props.currentUser) return null
  return props.feature.scores.find(score => score.user.id === props.currentUser.id)
})

const otherUserScores = computed(() => {
  if (!props.feature || !props.currentUser) return []
  return props.feature.scores.filter(score => score.user.id !== props.currentUser.id)
})

// Methods
const close = () => {
  emit('close')
  resetForms()
}

const resetForms = () => {
  createForm.name = ''
  createForm.description = ''
  Object.assign(scores, {
    strategic: 0,
    impact: 0,
    technical: 0,
    market: 0,
    revenue: 0,
    compliance: 0
  })
  error.value = ''
  success.value = false
}

const calculateWeightedScore = (score: Score) => {
  const weights = { strategic: 0.25, impact: 0.20, technical: 0.20, market: 0.15, revenue: 0.10, compliance: 0.10 }
  return Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (score[key as keyof Score] as number) * weight
  }, 0)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const handleCreateSubmit = async () => {
  if (!createForm.name.trim()) {
    error.value = 'Feature name is required'
    return
  }

  loading.value = true
  error.value = ''
  success.value = false

  try {
    const response = await $fetch<{ feature: Feature }>('/api/features', {
      method: 'POST',
      body: {
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined
      }
    })

    // Emit feature created event (parent will handle mode switch)
    emit('featureCreated', response.feature)
    
    // Reset create form 
    createForm.name = ''
    createForm.description = ''
    
  } catch (err: any) {
    console.error('Error creating feature:', err)
    error.value = err.data?.message || err.message || 'Failed to create feature. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleScoreSubmit = async () => {
  if (!allScoresProvided.value || !props.feature) {
    error.value = 'Please provide scores for all criteria'
    return
  }

  loading.value = true
  error.value = ''
  success.value = false

  try {
    await $fetch('/api/scores', {
      method: 'POST',
      body: {
        featureId: props.feature.id,
        strategic: scores.strategic,
        impact: scores.impact,
        technical: scores.technical,
        market: scores.market,
        revenue: scores.revenue,
        compliance: scores.compliance
      }
    })

    success.value = true
    successMessage.value = userScore.value ? 'Score updated successfully!' : 'Score submitted successfully!'
    emit('scoreSubmitted')
    
    // Close drawer after short delay
    setTimeout(() => {
      close()
    }, 1500)
    
  } catch (err: any) {
    console.error('Error submitting score:', err)
    error.value = err.data?.message || err.message || 'Failed to submit score. Please try again.'
  } finally {
    loading.value = false
  }
}

// Initialize scores when feature changes
watch(() => props.feature, (newFeature) => {
  if (newFeature && props.currentUser) {
    const existingScore = newFeature.scores.find(score => score.user.id === props.currentUser!.id)
    if (existingScore) {
      Object.assign(scores, {
        strategic: existingScore.strategic,
        impact: existingScore.impact,
        technical: existingScore.technical,
        market: existingScore.market,
        revenue: existingScore.revenue,
        compliance: existingScore.compliance
      })
    } else {
      // Reset scores for new feature
      Object.assign(scores, {
        strategic: 0,
        impact: 0,
        technical: 0,
        market: 0,
        revenue: 0,
        compliance: 0
      })
    }
  }
}, { immediate: true })

// Watch for mode changes to reset state
watch(() => props.mode, (newMode, oldMode) => {
  console.log('FeatureDrawer mode changed from', oldMode, 'to', newMode)
  
  // Clear any lingering success/error states when mode changes
  success.value = false
  error.value = ''
  
  if (newMode === 'create') {
    // Reset create form when switching to create mode
    createForm.name = ''
    createForm.description = ''
  }
  
  if (newMode === 'score') {
    console.log('Switching to score mode for feature:', props.feature?.name)
  }
})

// Close on escape key
onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      close()
    }
  }
  document.addEventListener('keydown', handleKeydown)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
})
</script> 