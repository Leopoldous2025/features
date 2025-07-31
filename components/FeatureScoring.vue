<template>
  <UCard>
    <template #header>
      <h2 class="text-xl font-semibold text-white flex items-center gap-2">
        📊 Score Feature: {{ feature.name }}
      </h2>
    </template>
    
    <div class="space-y-6">
      <!-- Show existing scores from other users only if current user has already scored -->
      <div v-if="otherUserScores.length > 0 && userScore" class="mb-6">
        <h3 class="text-lg font-medium text-white mb-3">Team Scores</h3>
        <div class="space-y-2">
          <div
            v-for="score in otherUserScores"
            :key="score.user.id"
            class="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
          >
            <span class="text-gray-300">{{ score.user.email }}</span>
            <span class="text-purple-400 font-medium">
              {{ calculateWeightedScore(score).toFixed(2) }}
            </span>
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
      <UForm @submit="handleSubmit" class="space-y-6">
        <!-- Strategic Alignment -->
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
        
        <!-- User Impact -->
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
        
        <!-- Technical Feasibility -->
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
        
        <!-- Market Differentiation -->
        <ScoringCriteria
          v-model="scores.market"
          title="Market Differentiation"
          weight="15%"
          :descriptions="scoreDescriptions.market"
          :questions="[
            'Does this create a defensible moat?',
            'Can competitors easily copy this?',
            'Does it strengthen our positioning?'
          ]"
        />
        
        <!-- Revenue Impact -->
        <ScoringCriteria
          v-model="scores.revenue"
          title="Revenue & Growth Impact"
          weight="10%"
          :descriptions="scoreDescriptions.revenue"
          :questions="[
            'Will users pay more for this?',
            'Does it drive credit consumption?',
            'Can it attract new user segments?'
          ]"
        />
        
        <!-- Compliance -->
        <ScoringCriteria
          v-model="scores.compliance"
          title="Compliance & Risk"
          weight="10%"
          :descriptions="scoreDescriptions.compliance"
          :questions="[
            'Are there SEC/FINRA implications?',
            'Does it require new data agreements?',
            'What is the liability exposure?'
          ]"
        />
        
        <UButton
          type="submit"
          :loading="loading"
          :disabled="!isFormValid"
          size="lg"
          block
          class="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        >
          {{ loading ? 'Submitting...' : 'Submit Score' }}
        </UButton>
      </UForm>
      
      <UAlert
        v-if="error"
        :title="error"
        color="red"
        variant="soft"
        class="mt-4"
      />
      
      <UAlert
        v-if="success"
        title="Score submitted successfully!"
        color="green"
        variant="soft"
        class="mt-4"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface User {
  id: string
  email: string
}

interface Feature {
  id: string
  name: string
  description?: string
  createdBy: User
  scores: Array<{
    user: User
    strategic: number
    impact: number
    technical: number
    market: number
    revenue: number
    compliance: number
  }>
}

interface Props {
  feature: Feature
  user: User
}

const props = defineProps<Props>()
const emit = defineEmits<{
  scoreSubmitted: []
}>()

// Score state
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

// Score descriptions (same as original)
const scoreDescriptions = {
  strategic: {
    1: "Distracts from or contradicts strategic direction",
    2: "Tangentially related to core value proposition",
    3: "Enhances existing workflows without diluting focus",
    4: "Strongly supports PLG growth flywheel",
    5: "Directly amplifies our core 'similar companies/products' differentiator"
  },
  impact: {
    1: "Negligible impact on user outcomes",
    2: "Minor convenience feature",
    3: "Moderate efficiency gain (20-50% improvement)",
    4: "Significant workflow improvement (>50% time savings)",
    5: "Delivers instant 'aha!' moment for target persona"
  },
  technical: {
    1: "Fundamentally incompatible with current stack",
    2: "Major architectural changes required",
    3: "Significant development needed (3-4 sprints)",
    4: "Requires moderate engineering effort (1-2 sprints)",
    5: "Leverages existing infrastructure with minimal additions"
  },
  market: {
    1: "Already commoditized in market",
    2: "Table stakes feature we're missing",
    3: "Matches competitor features with unique twist",
    4: "Significantly better execution than alternatives",
    5: "Industry-first capability no competitor can replicate"
  },
  revenue: {
    1: "No clear path to monetization",
    2: "Indirect revenue impact",
    3: "Moderate monetization potential",
    4: "Strong retention impact (>15% reduction in churn)",
    5: "Direct revenue driver (>20% increase in conversions)"
  },
  compliance: {
    1: "High regulatory risk or data sensitivity issues",
    2: "Significant compliance burden",
    3: "Some regulatory complexity but manageable",
    4: "Standard compliance requirements, well-understood",
    5: "No regulatory concerns, enhances data security"
  }
}

// Computed properties
const otherUserScores = computed(() => {
  return props.feature.scores.filter(score => score.user.id !== props.user.id)
})

const isFormValid = computed(() => {
  return Object.values(scores).every(score => score >= 1 && score <= 5)
})

// Calculate weighted score for display
const calculateWeightedScore = (scoreData: any) => {
  const weights = {
    strategic: 0.25,
    impact: 0.20,
    technical: 0.20,
    market: 0.15,
    revenue: 0.10,
    compliance: 0.10
  }
  
  return Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (scoreData[key] * weight)
  }, 0)
}

// Load existing user score if available
const userScore = computed(() => {
  return props.feature.scores.find(score => score.user.id === props.user.id)
})

// Initialize form with existing scores
watchEffect(() => {
  if (userScore.value) {
    Object.assign(scores, {
      strategic: userScore.value.strategic,
      impact: userScore.value.impact,
      technical: userScore.value.technical,
      market: userScore.value.market,
      revenue: userScore.value.revenue,
      compliance: userScore.value.compliance
    })
  }
})

const handleSubmit = async () => {
  if (!isFormValid.value) {
    error.value = 'Please score all criteria (1-5)'
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
        ...scores
      }
    })
    
    success.value = true
    emit('scoreSubmitted')
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = false
    }, 3000)
    
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to submit score'
  } finally {
    loading.value = false
  }
}
</script> 