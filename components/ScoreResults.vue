<template>
  <UCard>
    <template #header>
      <h2 class="text-xl font-semibold text-white flex items-center gap-2">
        📈 Score Analysis: {{ feature.name }}
      </h2>
    </template>
    
    <div class="space-y-6">
      <!-- Show analysis only if current user has scored -->
      <div v-if="hasUserScored">
        <!-- Overall Consensus Score -->
        <div v-if="feature.scores.length > 0" class="text-center">
          <div class="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            {{ averageScore.toFixed(2) }}
          </div>
          <div class="text-gray-400 mb-4">
            Average Weighted Score ({{ feature.scores.length }} {{ feature.scores.length === 1 ? 'user' : 'users' }})
          </div>
          
          <!-- Recommendation -->
          <div class="bg-gray-800 rounded-lg p-4 border-l-4 border-purple-600">
            <h3 class="text-white font-semibold mb-2">Recommendation</h3>
            <p class="text-gray-300">{{ recommendation }}</p>
          </div>
        </div>
        
        <!-- Compact Criterion Analysis -->
        <div v-if="feature.scores.length > 0" class="bg-gray-800 rounded-lg p-4">
          <h3 class="text-white font-semibold mb-4 flex items-center justify-between">
            <span>Criterion Analysis</span>
            <span v-if="feature.scores.length > 1" class="text-xs text-gray-400 font-normal">{{ feature.scores.length }} evaluators</span>
          </h3>
          <div class="space-y-3">
            <div
              v-for="(criterion, key) in criteriaWeights"
              :key="key"
              class="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0"
            >
              <!-- Left: Criterion name and weight -->
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <span class="text-gray-300 text-sm truncate">
                  {{ criterion.name }}
                  <span class="text-gray-500">({{ Math.round(criterion.weight * 100) }}%)</span>
                </span>
              </div>
              
              <!-- Right: Score, consensus, and mini indicator -->
              <div class="flex items-center gap-3 flex-shrink-0">
                <!-- Average score -->
                <span class="text-purple-400 font-semibold text-sm min-w-[2.5rem] text-right">
                  {{ getAverageForCriterion(key).toFixed(2) }}
                </span>
                
                <!-- Consensus badge (if multiple scores) -->
                <span 
                  v-if="feature.scores.length > 1"
                  :class="[
                    'text-xs px-2 py-1 rounded font-medium min-w-[4rem] text-center',
                    getConsensusLevel(key) === 'High' ? 'bg-green-900 text-green-300' :
                    getConsensusLevel(key) === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-red-900 text-red-300'
                  ]"
                >
                  {{ getConsensusLevel(key) === 'High' ? 'High' : getConsensusLevel(key) === 'Medium' ? 'Med' : 'Low' }}
                </span>
                
                <!-- Mini consensus indicator -->
                <div 
                  v-if="feature.scores.length > 1" 
                  class="w-8 h-2 rounded-full overflow-hidden bg-gray-700 flex"
                  :title="`${getConsensusLevel(key)} consensus - Range: ${getMinForCriterion(key)}-${getMaxForCriterion(key)}`"
                >
                  <!-- Range visualization -->
                  <div 
                    :class="[
                      'h-full rounded-full',
                      getConsensusLevel(key) === 'High' ? 'bg-green-500' :
                      getConsensusLevel(key) === 'Medium' ? 'bg-yellow-500' :
                      'bg-red-500'
                    ]"
                    :style="{ 
                      width: `${Math.max(12, ((getMaxForCriterion(key) - getMinForCriterion(key)) / 4) * 100)}%`,
                      marginLeft: `${((getMinForCriterion(key) - 1) / 4) * 100}%`
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Compact legend -->
          <div v-if="feature.scores.length > 1" class="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-500 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1">
                <div class="w-2 h-1 bg-green-500 rounded"></div>
                <span>High consensus</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-1 bg-yellow-500 rounded"></div>
                <span>Medium</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-1 bg-red-500 rounded"></div>
                <span>Low consensus</span>
              </div>
            </div>
            <span>Mini bars show score range</span>
          </div>
        </div>
        
        <!-- Individual Scores -->
        <div v-if="feature.scores.length > 0" class="bg-gray-800 rounded-lg p-4">
          <h3 class="text-white font-semibold mb-4">Individual Scores</h3>
          <div class="space-y-3">
            <div
              v-for="score in feature.scores"
              :key="score.user.id"
              class="flex justify-between items-center p-3 bg-gray-900 rounded-lg"
            >
              <div>
                <span class="text-white font-medium">{{ score.user.email }}</span>
                <span v-if="score.user.id === currentUser.id" class="text-purple-400 text-sm ml-2">(You)</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-purple-400 font-semibold">
                  {{ calculateWeightedScore(score).toFixed(2) }}
                </span>
                <UButton
                  v-if="score.user.id === currentUser.id"
                  @click="emit('editScore', feature)"
                  size="xs"
                  variant="ghost"
                  color="purple"
                  class="hover:bg-purple-900/30"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Blind scoring message -->
      <div v-else-if="feature.scores.length > 0" class="text-center py-12">
        <div class="bg-blue-900/20 border border-blue-700 rounded-lg p-8 max-w-md mx-auto">
          <div class="text-blue-400 text-4xl mb-4">🔒</div>
          <h3 class="text-blue-300 font-semibold text-lg mb-3">Score This Feature First</h3>
          <p class="text-blue-200 text-sm leading-relaxed mb-4">
            To ensure unbiased evaluation, detailed score analysis is hidden until you submit your own assessment. 
            {{ feature.scores.length }} {{ feature.scores.length === 1 ? 'teammate has' : 'teammates have' }} already evaluated this feature.
          </p>
          <UButton
            @click="emit('editScore', feature)"
            size="lg"
            class="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Score This Feature
          </UButton>
        </div>
      </div>
      
      <!-- No scores yet -->
      <div v-else class="text-center py-8">
        <p class="text-gray-400 mb-4">No scores submitted yet. Be the first to evaluate this feature!</p>
        <UButton
          @click="emit('editScore', feature)"
          size="lg"
          class="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Be First to Score
        </UButton>
      </div>
    </div>
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
}

interface Props {
  feature: Feature
  currentUser: User
}

interface Emits {
  editScore: [feature: Feature]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Check if current user has scored this feature
const hasUserScored = computed(() => {
  return props.feature.scores.some(score => score.user.id === props.currentUser.id)
})

// Criteria weights and names
const criteriaWeights = {
  strategic: { name: 'Strategic Alignment', weight: 0.25 },
  impact: { name: 'User Impact', weight: 0.20 },
  technical: { name: 'Technical Feasibility', weight: 0.20 },
  market: { name: 'Market Differentiation', weight: 0.15 },
  revenue: { name: 'Revenue Impact', weight: 0.10 },
  compliance: { name: 'Compliance & Risk', weight: 0.10 }
}

// Calculate weighted score for a single score object
const calculateWeightedScore = (score: Score) => {
  return Object.entries(criteriaWeights).reduce((total, [key, criterion]) => {
    return total + (score[key as keyof Score] as number) * criterion.weight
  }, 0)
}

// Calculate average weighted score across all scores
const averageScore = computed(() => {
  if (props.feature.scores.length === 0) return 0
  
  const totalScore = props.feature.scores.reduce((sum, score) => {
    return sum + calculateWeightedScore(score)
  }, 0)
  
  return totalScore / props.feature.scores.length
})

// Generate recommendation based on average score
const recommendation = computed(() => {
  const avg = averageScore.value
  
  if (avg >= 4.0) {
    return "Strongly Recommended: This feature aligns excellently with our PLG strategy and should be prioritized for immediate implementation."
  } else if (avg >= 3.5) {
    return "Recommended: This feature shows strong potential and should be included in the next quarter's roadmap."
  } else if (avg >= 2.5) {
    return "Consider with Modifications: This feature has merit but may need refinement to better align with our strategic goals."
  } else if (avg >= 2.0) {
    return "Low Priority: Consider deferring this feature unless strategic circumstances change."
  } else {
    return "Not Recommended: This feature does not align well with our current strategy and resources would be better allocated elsewhere."
  }
})

// Get average score for a specific criterion
const getAverageForCriterion = (criterion: string) => {
  if (props.feature.scores.length === 0) return 0
  
  const total = props.feature.scores.reduce((sum, score) => {
    return sum + (score[criterion as keyof Score] as number)
  }, 0)
  
  return total / props.feature.scores.length
}

// Get count of specific score for a criterion
const getScoreCount = (criterion: string, scoreValue: number) => {
  return props.feature.scores.filter(score => 
    (score[criterion as keyof Score] as number) === scoreValue
  ).length
}

// Calculate consensus level for a criterion
const getConsensusLevel = (criterion: string) => {
  if (props.feature.scores.length < 2) return 'N/A'
  
  const scores = props.feature.scores.map(score => score[criterion as keyof Score] as number)
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
  const stdDev = Math.sqrt(variance)
  
  if (stdDev <= 0.5) return 'High'
  if (stdDev <= 1.0) return 'Medium'
  return 'Low'
}

// Get minimum score for a criterion
const getMinForCriterion = (criterion: string) => {
  if (props.feature.scores.length === 0) return 0
  const scores = props.feature.scores.map(score => score[criterion as keyof Score] as number)
  return Math.min(...scores)
}

// Get maximum score for a criterion
const getMaxForCriterion = (criterion: string) => {
  if (props.feature.scores.length === 0) return 0
  const scores = props.feature.scores.map(score => score[criterion as keyof Score] as number)
  return Math.max(...scores)
}
</script> 