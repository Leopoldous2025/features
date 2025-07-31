import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Only allow DELETE method
    if (getMethod(event) !== 'DELETE') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed'
      })
    }

    // Verify authentication
    const token = getCookie(event, 'auth-token')
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const config = useRuntimeConfig()
    let decoded: { userId: string, email: string }
    
    try {
      decoded = jwt.verify(token, config.jwtSecret) as { userId: string, email: string }
    } catch (jwtError) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }

    // Get feature ID from route params
    const featureId = getRouterParam(event, 'id')
    if (!featureId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Feature ID is required'
      })
    }

    // Find the feature and verify ownership
    const feature = await prisma.feature.findUnique({
      where: { id: featureId },
      include: { createdBy: true }
    })

    if (!feature) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Feature not found'
      })
    }

    // Only allow the author to delete their feature
    if (feature.createdById !== decoded.userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only delete features you created'
      })
    }

    // Delete the feature (cascade will handle related scores)
    await prisma.feature.delete({
      where: { id: featureId }
    })

    return { 
      success: true, 
      message: 'Feature deleted successfully',
      featureId: featureId 
    }

  } catch (error: any) {
    console.error('Error deleting feature:', error)
    
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    // Otherwise, throw a generic error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete feature'
    })
  }
}) 