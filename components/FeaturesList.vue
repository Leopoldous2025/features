<template>
  <UCard>
    <template #header>
      <h2 class="text-xl font-semibold text-white flex items-center gap-2">
        📋 All Features
        <span v-if="features.length > 0" class="text-sm text-blue-400 font-normal">(Click to score)</span>
      </h2>
    </template>
    
    <div v-if="features.length === 0" class="text-center py-8">
      <p class="text-gray-400">No features created yet. Create your first feature above to start evaluating and building your roadmap.</p>
    </div>
    
    <div v-else class="space-y-4">
      <div
        v-for="feature in sortedFeatures"
        :key="feature.id"
        @click="handleFeatureClick(feature)"
        class="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500 hover:bg-gray-750 transition-all duration-200 cursor-pointer group relative select-none"
        style="user-select: none;"
      >
        <!-- Click indicator -->
        <div class="absolute top-2 right-2 text-gray-500 group-hover:text-purple-400 transition-colors pointer-events-none">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
        </div>
        
        <!-- Click feedback text -->
        <div class="absolute top-2 left-2 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Click to score
        </div>
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1">
            <h3 class="text-white font-medium group-hover:text-purple-300 transition-colors">
              {{ feature.name }}
            </h3>
            <p v-if="feature.description" class="text-gray-400 text-sm mt-1 line-clamp-2">
              {{ feature.description }}
            </p>
          </div>
          
          <div class="flex flex-col items-end gap-2">
            <!-- Average Score - only show if user has scored -->
            <div v-if="feature.scores.length > 0 && hasUserScored(feature)" class="text-right">
              <div class="text-xl font-bold text-purple-400">
                {{ getAverageScore(feature).toFixed(2) }}
              </div>
              <div class="text-xs text-gray-400">
                Avg Score
              </div>
            </div>
            
            <!-- Blind scoring indicator -->
            <div v-else-if="feature.scores.length > 0" class="text-right">
              <div class="text-xl font-bold text-blue-400">
                🔒
              </div>
              <div class="text-xs text-blue-400">
                Score First
              </div>
            </div>
            
            <!-- No scores yet -->
            <div v-else class="text-gray-500 text-sm">
              No scores yet
            </div>
            
            <!-- Quadrant Badge - only show if user has scored -->
            <div v-if="feature.scores.length > 0 && hasUserScored(feature)" :class="getQuadrantBadgeClass(feature)" class="px-2 py-1 rounded text-xs font-medium">
              {{ getQuadrant(feature) }}
            </div>
            
            <!-- Delete Button - only show for feature author -->
            <div v-if="canDeleteFeature(feature)" class="mt-2">
              <UButton 
                @click.stop="handleDeleteFeature(feature)"
                :loading="deleteLoading === feature.id"
                :disabled="deleteLoading === feature.id"
                size="xs"
                color="red"
                variant="ghost"
                class="hover:bg-red-900/30"
                title="Delete this feature"
              >
                <svg v-if="deleteLoading !== feature.id" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                <span v-if="deleteLoading === feature.id" class="text-xs">...</span>
                <span v-else class="text-xs ml-1">Delete</span>
              </UButton>
            </div>
          </div>
        </div>
        
        <!-- Feature Meta -->
        <div class="flex items-center justify-between text-sm text-gray-400">
          <div class="flex items-center gap-4">
            <span>Created by {{ feature.createdBy.email }}</span>
            <span>•</span>
            <span>{{ formatDate(feature.createdAt) }}</span>
          </div>
          
          <div class="flex items-center gap-2">
            <!-- Score count - be less specific if user hasn't scored -->
            <span v-if="hasUserScored(feature)">
              {{ feature.scores.length }} {{ feature.scores.length === 1 ? 'score' : 'scores' }}
            </span>
            <span v-else-if="feature.scores.length > 0" class="text-blue-400">
              Others scored
            </span>
            <span v-else>
              No scores
            </span>
            
            <!-- User's score status -->
            <div v-if="hasUserScored(feature)" class="flex items-center gap-1">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-green-400 text-xs">You scored</span>
            </div>
            <div v-else class="flex items-center gap-1">
              <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span class="text-yellow-400 text-xs">Not scored</span>
            </div>
          </div>
        </div>
        
        <!-- Score Distribution Preview -->
        <div v-if="feature.scores.length > 1" class="mt-3 pt-3 border-t border-gray-700">
          <!-- Show results only if current user has scored -->
          <div v-if="hasUserScored(feature)">
            <!-- Accordion Header -->
            <button 
              @click="toggleScoreDistribution(feature.id)"
              class="w-full flex items-center justify-between text-xs text-gray-400 hover:text-gray-300 transition-colors py-2 px-3 rounded hover:bg-gray-800/50"
            >
              <div class="flex items-center gap-3">
                <span>Score Distribution</span>
                <span 
                  :class="[
                    'px-2 py-1 rounded text-xs font-medium',
                    getConsensusLevel(feature) === 'High' ? 'bg-green-900 text-green-300' :
                    getConsensusLevel(feature) === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-red-900 text-red-300'
                  ]"
                >
                  {{ getConsensusLevel(feature) }} Consensus
                </span>
              </div>
              
              <!-- Chevron -->
              <svg 
                :class="[
                  'w-4 h-4 transition-transform duration-200',
                  isScoreDistributionExpanded(feature.id) ? 'rotate-180' : ''
                ]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <!-- Accordion Content -->
            <div 
              v-if="isScoreDistributionExpanded(feature.id)"
              class="mt-3 bg-gray-800/30 rounded-lg p-4 border border-gray-700/50"
            >
              <div class="grid grid-cols-6 gap-4 text-xs">
                <div
                  v-for="(criterion, key) in criteriaNames"
                  :key="key"
                  class="text-center"
                >
                  <div class="text-gray-400 mb-2 font-medium">{{ criterion.short }}</div>
                  
                  <!-- Average Score -->
                  <div class="text-purple-400 font-bold text-sm mb-1">
                    {{ getAverageForCriterion(feature, key).toFixed(1) }}
                  </div>
                  
                  <!-- Min-Max Range with consensus coloring -->
                  <div 
                    :class="[
                      'text-xs mb-2 px-2 py-1 rounded',
                      getCriterionConsensus(feature, key) === 'High' ? 'bg-green-900/30 text-green-300' :
                      getCriterionConsensus(feature, key) === 'Medium' ? 'bg-yellow-900/30 text-yellow-300' :
                      'bg-red-900/30 text-red-300'
                    ]"
                  >
                    <span v-if="getMinForCriterion(feature, key) === getMaxForCriterion(feature, key)" class="font-medium">
                      {{ getMinForCriterion(feature, key) }} ✓
                    </span>
                    <span v-else>
                      {{ getMinForCriterion(feature, key) }}-{{ getMaxForCriterion(feature, key) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Compact legend -->
              <div class="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-500 text-center">
                {{ feature.scores.length }} {{ feature.scores.length === 1 ? 'voter' : 'voters' }} • 
                Average scores with min-max ranges • 
                <span class="text-green-400">Green</span>: High consensus • 
                <span class="text-yellow-400">Yellow</span>: Medium • 
                <span class="text-red-400">Red</span>: Low consensus
              </div>
            </div>
          </div>
          
          <!-- Blind scoring message -->
          <div v-else class="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="text-blue-400">🔒</div>
              <h4 class="text-blue-300 font-medium text-sm">Score Privately First</h4>
            </div>
            <p class="text-blue-200 text-xs leading-relaxed">
              To avoid bias, team scores and consensus data will be revealed after you submit your own evaluation. 
              {{ feature.scores.length }} {{ feature.scores.length === 1 ? 'teammate has' : 'teammates have' }} already scored this feature.
            </p>
            <div class="mt-2 text-blue-300 text-xs font-medium">
              Click to score this feature →
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Error Alert -->
    <UAlert 
      v-if="deleteError" 
      :title="deleteError" 
      color="red" 
      variant="soft" 
      class="mt-4"
      :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
      @close="deleteError = ''"
    />
  </UCard>
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
  features: Feature[]
  currentUser: User
}

const props = defineProps<Props>()
const emit = defineEmits<{
  featureSelected: [feature: Feature]
  scoreUpdated: []
  featureDeleted: [featureId: string]
}>()

// Handle feature click
const handleFeatureClick = (feature: Feature) => {
  console.log('Feature clicked:', feature.name)
  emit('featureSelected', feature)
}

// Handle feature deletion
const deleteLoading = ref<string>('')
const deleteError = ref('')

const handleDeleteFeature = async (feature: Feature) => {
  // Confirm deletion
  if (!confirm(`Are you sure you want to delete "${feature.name}"? This action cannot be undone.`)) {
    return
  }

  deleteLoading.value = feature.id
  deleteError.value = ''

  try {
    await $fetch(`/api/features/${feature.id}`, {
      method: 'DELETE'
    })
    
    // Emit the delete event to refresh the features list
    emit('featureDeleted', feature.id)
    
  } catch (err: any) {
    console.error('Error deleting feature:', err)
    deleteError.value = err.data?.message || err.message || 'Failed to delete feature'
  } finally {
    deleteLoading.value = ''
  }
}

// Check if current user can delete a feature
const canDeleteFeature = (feature: Feature) => {
  return feature.createdBy?.id === props.currentUser?.id
}

// Track which score distributions are expanded
const expandedScoreDistributions = ref<Set<string>>(new Set())

const toggleScoreDistribution = (featureId: string) => {
  if (expandedScoreDistributions.value.has(featureId)) {
    expandedScoreDistributions.value.delete(featureId)
  } else {
    expandedScoreDistributions.value.add(featureId)
  }
}

const isScoreDistributionExpanded = (featureId: string) => {
  return expandedScoreDistributions.value.has(featureId)
}

// Criteria names and weights
const criteriaNames = {
  strategic: { name: 'Strategic Alignment', short: 'Strat', weight: 0.25 },
  impact: { name: 'User Impact', short: 'Impact', weight: 0.20 },
  technical: { name: 'Technical Feasibility', short: 'Tech', weight: 0.20 },
  market: { name: 'Market Differentiation', short: 'Market', weight: 0.15 },
  revenue: { name: 'Revenue Impact', short: 'Rev', weight: 0.10 },
  compliance: { name: 'Compliance', short: 'Comp', weight: 0.10 }
}

// Sort features by average score (highest first), then by creation date
const sortedFeatures = computed(() => {
  return [...props.features].sort((a, b) => {
    const scoreA = a.scores.length > 0 ? getAverageScore(a) : 0
    const scoreB = b.scores.length > 0 ? getAverageScore(b) : 0
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA // Higher scores first
    }
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() // Newer first
  })
})

// Calculate average weighted score
const getAverageScore = (feature: Feature) => {
  if (feature.scores.length === 0) return 0
  
  const totalScore = feature.scores.reduce((sum, score) => {
    return sum + Object.entries(criteriaNames).reduce((total, [key, criterion]) => {
      return total + (score[key as keyof Score] as number) * criterion.weight
    }, 0)
  }, 0)
  
  return totalScore / feature.scores.length
}

// Get average for specific criterion
const getAverageForCriterion = (feature: Feature, criterion: string) => {
  if (feature.scores.length === 0) return 0
  
  const total = feature.scores.reduce((sum, score) => {
    return sum + (score[criterion as keyof Score] as number)
  }, 0)
  
  return total / feature.scores.length
}

// Get min for specific criterion
const getMinForCriterion = (feature: Feature, criterion: string) => {
  if (feature.scores.length === 0) return 0
  const scores = feature.scores.map(score => score[criterion as keyof Score] as number)
  return Math.min(...scores)
}

// Get max for specific criterion
const getMaxForCriterion = (feature: Feature, criterion: string) => {
  if (feature.scores.length === 0) return 0
  const scores = feature.scores.map(score => score[criterion as keyof Score] as number)
  return Math.max(...scores)
}

// Check if current user has scored this feature
const hasUserScored = (feature: Feature) => {
  return feature.scores.some(score => score.user.id === props.currentUser.id)
}

// Get quadrant for feature
const getQuadrant = (feature: Feature) => {
  if (feature.scores.length === 0) return 'Unscored'
  
  // Calculate effort and impact like in the matrix
  const averages = feature.scores.reduce((acc, score) => {
    acc.strategic += score.strategic
    acc.impact += score.impact
    acc.technical += score.technical
    return acc
  }, { strategic: 0, impact: 0, technical: 0 })
  
  const scoreCount = feature.scores.length
  averages.strategic /= scoreCount
  averages.impact /= scoreCount
  averages.technical /= scoreCount
  
  const effort = 6 - averages.technical
  const impact = (averages.strategic * 0.25 + averages.impact * 0.20) / (0.25 + 0.20)
  
  if (impact >= 3 && effort <= 3) return 'Quick Win'
  if (impact >= 3 && effort > 3) return 'Strategic Initiative'
  if (impact < 3 && effort <= 3) return 'Nice-to-Have'
  return 'Avoid'
}

// Get quadrant badge styling
const getQuadrantBadgeClass = (feature: Feature) => {
  const quadrant = getQuadrant(feature)
  
  switch (quadrant) {
    case 'Quick Win':
      return 'bg-green-900 text-green-300'
    case 'Strategic Initiative':
      return 'bg-purple-900 text-purple-300'
    case 'Nice-to-Have':
      return 'bg-yellow-900 text-yellow-300'
    case 'Avoid':
      return 'bg-red-900 text-red-300'
    default:
      return 'bg-gray-700 text-gray-300'
  }
}

// Get overall consensus level
const getConsensusLevel = (feature: Feature) => {
  if (feature.scores.length < 2) return 'N/A'
  
  const allStdDevs = Object.keys(criteriaNames).map(criterion => {
    const scores = feature.scores.map(score => score[criterion as keyof Score] as number)
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    return Math.sqrt(variance)
  })
  
  const avgStdDev = allStdDevs.reduce((a, b) => a + b, 0) / allStdDevs.length
  
  if (avgStdDev <= 0.5) return 'High'
  if (avgStdDev <= 1.0) return 'Medium'
  return 'Low'
}

// Get consensus for specific criterion
const getCriterionConsensus = (feature: Feature, criterion: string) => {
  if (feature.scores.length < 2) return 'N/A'
  
  const scores = feature.scores.map(score => score[criterion as keyof Score] as number)
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
  const stdDev = Math.sqrt(variance)
  
  if (stdDev <= 0.5) return 'High'
  if (stdDev <= 1.0) return 'Medium'
  return 'Low'
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script> 