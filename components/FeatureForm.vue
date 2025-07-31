<template>
  <UCard>
    <template #header>
      <h2 class="text-xl font-semibold text-white flex items-center gap-2">
        📝 Create New Feature
      </h2>
    </template>
    
    <UForm :state="form" @submit="handleSubmit" class="space-y-6">
      <UFormGroup label="Feature Name" required>
        <UInput
          v-model="form.name"
          placeholder="e.g., AI-Powered Deal Sourcing Recommendations"
          :disabled="loading"
        />
      </UFormGroup>
      
      <UFormGroup label="Description">
        <UTextarea
          v-model="form.description"
          placeholder="Describe the feature and its intended functionality..."
          :rows="4"
          :disabled="loading"
        />
      </UFormGroup>
      
      <UButton
        type="submit"
        :loading="loading"
        :disabled="!form.name.trim()"
        size="lg"
        block
        class="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
      >
        {{ loading ? 'Creating...' : 'Create Feature' }}
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
      title="Feature created successfully!"
      color="green"
      variant="soft"
      class="mt-4"
    />
  </UCard>
</template>

<script setup lang="ts">
interface FeatureForm {
  name: string
  description: string
}

interface Feature {
  id: string
  name: string
  description?: string
  createdBy: {
    id: string
    email: string
  }
}

const emit = defineEmits<{
  featureCreated: [feature: Feature]
}>()

const form = reactive<FeatureForm>({
  name: '',
  description: ''
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleSubmit = async () => {
  if (!form.name.trim()) {
    error.value = 'Feature name is required'
    return
  }
  
  loading.value = true
  error.value = ''
  success.value = false
  
  try {
    const { feature } = await $fetch<{ feature: Feature }>('/api/features', {
      method: 'POST',
      body: {
        name: form.name.trim(),
        description: form.description.trim() || undefined
      }
    })
    
    success.value = true
    emit('featureCreated', feature)
    
    // Reset form
    form.name = ''
    form.description = ''
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = false
    }, 3000)
    
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to create feature'
  } finally {
    loading.value = false
  }
}
</script> 