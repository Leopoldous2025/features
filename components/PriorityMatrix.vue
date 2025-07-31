<template>
  <UCard>
    <template #header>
      <h2 class="text-xl font-semibold text-white flex items-center gap-2">
        🎯 Priority Matrix
      </h2>
    </template>
    
    <div class="space-y-6">
      <!-- Matrix Info -->
      <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 class="text-purple-400 font-medium mb-3">Matrix Guide</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <span class="font-medium text-blue-300">Impact (Y-axis):</span>
            <br>Strategic Alignment + User Impact
          </div>
          <div>
            <span class="font-medium text-blue-300">Effort (X-axis):</span>
            <br>Inverse of Technical Feasibility
          </div>
        </div>
      </div>
      
      <!-- Matrix Container -->
      <div class="relative bg-gray-900 rounded-xl border border-gray-700 overflow-hidden h-96 min-h-96">
        <!-- Axis Labels -->
        <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm font-medium">
          Effort →
        </div>
        <div class="absolute -left-16 top-1/2 transform -translate-y-1/2 -rotate-90 text-gray-400 text-sm font-medium origin-center">
          Impact →
        </div>
        
        <!-- Grid Lines -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
          <!-- Vertical center line -->
          <line x1="200" y1="0" x2="200" y2="400" stroke="#374151" stroke-width="1" stroke-dasharray="5,5" opacity="0.5"/>
          <!-- Horizontal center line -->
          <line x1="0" y1="200" x2="400" y2="200" stroke="#374151" stroke-width="1" stroke-dasharray="5,5" opacity="0.5"/>
        </svg>
        
        <!-- Quadrants -->
        <div class="absolute inset-0 grid grid-cols-2 grid-rows-2 h-full">
          <!-- Quick Wins (Top Left) -->
          <div class="relative bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-r border-b border-gray-600/30">
            <div class="absolute top-4 left-4">
              <div class="text-emerald-400 font-semibold text-sm">Quick Wins</div>
              <div class="text-emerald-300/70 text-xs mt-1">High Impact, Low Effort</div>
            </div>
          </div>
          
          <!-- Strategic Initiatives (Top Right) -->
          <div class="relative bg-gradient-to-bl from-purple-500/10 to-purple-600/5 border-b border-gray-600/30">
            <div class="absolute top-4 right-4 text-right">
              <div class="text-purple-400 font-semibold text-sm">Strategic</div>
              <div class="text-purple-300/70 text-xs mt-1">High Impact, High Effort</div>
            </div>
          </div>
          
          <!-- Nice-to-Haves (Bottom Left) -->
          <div class="relative bg-gradient-to-tr from-yellow-500/10 to-yellow-600/5 border-r border-gray-600/30">
            <div class="absolute bottom-4 left-4">
              <div class="text-yellow-400 font-semibold text-sm">Nice-to-Haves</div>
              <div class="text-yellow-300/70 text-xs mt-1">Low Impact, Low Effort</div>
            </div>
          </div>
          
          <!-- Avoid (Bottom Right) -->
          <div class="relative bg-gradient-to-tl from-red-500/10 to-red-600/5">
            <div class="absolute bottom-4 right-4 text-right">
              <div class="text-red-400 font-semibold text-sm">Avoid</div>
              <div class="text-red-300/70 text-xs mt-1">Low Impact, High Effort</div>
            </div>
          </div>
        </div>
        
        <!-- Feature Points -->
        <div
          v-for="(feature, index) in plottedFeatures"
          :key="feature.id"
          @click="handleFeatureClick(feature)"
          :style="{
            left: `${feature.x}%`,
            top: `${feature.y}%`
          }"
          class="absolute w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg hover:z-20 group"
          :class="feature.color"
          :title="`${feature.name} (Score: ${feature.averageScore.toFixed(1)}) - Click to analyze`"
        >
          {{ index + 1 }}
          
          <!-- Tooltip -->
          <div class="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-gray-600 shadow-lg">
            <div class="font-medium">{{ feature.name }}</div>
            <div class="text-gray-300">Score: {{ feature.averageScore.toFixed(1) }}</div>
            <div class="text-purple-400 text-xs mt-1">Click to analyze →</div>
            <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
        
        <!-- Axis Values -->
        <div class="absolute bottom-2 left-4 text-xs text-gray-500">Low Effort</div>
        <div class="absolute bottom-2 right-4 text-xs text-gray-500">High Effort</div>
        <div class="absolute top-2 left-4 text-xs text-gray-500">High Impact</div>
        <div class="absolute bottom-20 left-4 text-xs text-gray-500">Low Impact</div>
      </div>
      
      <!-- Legend -->
      <div v-if="plottedFeatures.length > 0" class="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 class="text-white font-medium mb-3 text-sm flex items-center gap-2">
          <span>📍</span>
          Features Plotted
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="(feature, index) in plottedFeatures"
            :key="feature.id"
            @click="handleFeatureClick(feature)"
            class="flex items-center gap-3 text-sm p-2 rounded-lg bg-gray-750 hover:bg-gray-700 transition-colors cursor-pointer group"
            :title="`Click to analyze ${feature.name}`"
          >
            <div 
              :class="['w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0', feature.color]"
            >
              {{ index + 1 }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-gray-200 font-medium truncate group-hover:text-white transition-colors">{{ feature.name }}</div>
              <div class="text-gray-400 text-xs group-hover:text-purple-400 transition-colors">{{ feature.averageScore.toFixed(1) }}/5.0 • Click to analyze</div>
            </div>
            <div class="text-gray-500 group-hover:text-purple-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <UButton
          @click="clearMatrix"
          variant="ghost"
          color="gray"
          size="sm"
          class="mt-4"
        >
          Clear All Features
        </UButton>
      </div>
      
      <div v-else class="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
        <div class="text-gray-400 mb-2">🔒</div>
        <h4 class="text-gray-300 font-medium mb-2">Score Features to See Matrix</h4>
        <p class="text-gray-400 text-sm">
          Features will appear here after you score them. This prevents bias by keeping others' evaluations private until you submit your own.
        </p>
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
  features: Feature[]
  currentUser: User
}

interface Emits {
  featureSelected: [feature: Feature]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Handle feature dot click
const handleFeatureClick = (feature: Feature) => {
  // Find the original feature object from props
  const originalFeature = props.features.find(f => f.id === feature.id)
  if (originalFeature) {
    emit('featureSelected', originalFeature)
  }
}

// Modern color palette for features
const colorClasses = [
  'bg-purple-500 shadow-purple-500/30',
  'bg-emerald-500 shadow-emerald-500/30',
  'bg-blue-500 shadow-blue-500/30',
  'bg-pink-500 shadow-pink-500/30',
  'bg-indigo-500 shadow-indigo-500/30',
  'bg-teal-500 shadow-teal-500/30',
  'bg-orange-500 shadow-orange-500/30',
  'bg-cyan-500 shadow-cyan-500/30',
  'bg-violet-500 shadow-violet-500/30',
  'bg-amber-500 shadow-amber-500/30'
]

// Check if current user has scored a feature
const hasUserScored = (feature: Feature) => {
  return feature.scores.some(score => score.user.id === props.currentUser?.id)
}

// Calculate position and plotting data for features (only show if user has scored)
const plottedFeatures = computed(() => {
  return props.features
    .filter(feature => feature.scores.length > 0 && hasUserScored(feature))
    .map((feature, index) => {
      // Calculate average scores
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
      
      // Calculate effort (inverse of technical feasibility)
      const effort = 6 - averages.technical // Convert to effort scale (1=easy, 5=hard)
      
      // Calculate impact (weighted combination of strategic and user impact)
      const impact = (averages.strategic * 0.25 + averages.impact * 0.20) / (0.25 + 0.20)
      
      // Calculate overall weighted score
      const weights = { strategic: 0.25, impact: 0.20, technical: 0.20, market: 0.15, revenue: 0.10, compliance: 0.10 }
      const averageScore = feature.scores.reduce((sum, score) => {
        return sum + Object.entries(weights).reduce((total, [key, weight]) => {
          return total + (score[key as keyof Score] as number) * weight
        }, 0)
      }, 0) / scoreCount
      
      // Convert to percentage positions with better padding
      const xPercent = 8 + ((effort - 1) / 4) * 84 // 8% to 92%
      const yPercent = 92 - ((impact - 1) / 4) * 84 // 92% to 8% (inverted Y)
      
      return {
        id: feature.id,
        name: feature.name,
        x: xPercent,
        y: yPercent,
        effort,
        impact,
        averageScore,
        color: colorClasses[index % colorClasses.length]
      }
    })
})

const clearMatrix = () => {
  // In the actual implementation, this would clear features or refresh data
  console.log('Clear matrix functionality - features are automatically plotted based on scores')
}
</script> 