<template>
  <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
      <span class="text-purple-400 text-sm font-medium">Weight: {{ weight }}</span>
    </div>
    
    <div class="grid grid-cols-5 gap-2 mb-4">
      <button
        v-for="score in [1, 2, 3, 4, 5]"
        :key="score"
        @click="handleScoreSelect(score)"
        :class="[
          'py-3 px-4 rounded-lg border transition-all duration-200 font-medium',
          modelValue === score
            ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/30'
            : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 hover:border-purple-500'
        ]"
      >
        {{ score }}
      </button>
    </div>
    
    <div v-if="modelValue > 0" class="mb-4 p-3 bg-gray-900 rounded-lg min-h-[60px]">
      <p class="text-gray-300 text-sm leading-relaxed">
        {{ descriptions[modelValue] }}
      </p>
    </div>
    
    <div v-else class="mb-4 p-3 bg-gray-900 rounded-lg min-h-[60px] flex items-center">
      <p class="text-gray-500 text-sm">
        Select a score to see description
      </p>
    </div>
    
    <!-- Key Questions Accordion -->
    <div class="border-t border-gray-700 pt-4">
      <button 
        @click="toggleQuestions"
        class="w-full flex items-center justify-between text-gray-400 hover:text-gray-300 transition-colors text-sm font-medium mb-2"
      >
        <span>Key Questions:</span>
        <svg 
          :class="[
            'w-4 h-4 transition-transform duration-200',
            isQuestionsExpanded ? 'rotate-180' : ''
          ]" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div v-if="isQuestionsExpanded" class="space-y-1">
        <div
          v-for="question in questions"
          :key="question"
          class="text-gray-400 text-sm flex items-start gap-2"
        >
          <span class="text-purple-400 flex-shrink-0 mt-1">→</span>
          <span>{{ question }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: number
  title: string
  weight: string
  descriptions: Record<number, string>
  questions: string[]
}

interface Emits {
  'update:modelValue': [value: number]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Track questions accordion state
const isQuestionsExpanded = ref(false)

const toggleQuestions = () => {
  isQuestionsExpanded.value = !isQuestionsExpanded.value
}

const handleScoreSelect = (score: number) => {
  emit('update:modelValue', score)
}
</script> 