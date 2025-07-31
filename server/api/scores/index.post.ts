import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Verify authentication
    const token = getCookie(event, 'auth-token')
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    
    const config = useRuntimeConfig()
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string }
    
    const { featureId, strategic, impact, technical, market, revenue, compliance } = await readBody(event)
    
    // Validate required fields
    if (!featureId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Feature ID is required'
      })
    }
    
    // Validate score values (1-5)
    const scores = { strategic, impact, technical, market, revenue, compliance }
    for (const [key, value] of Object.entries(scores)) {
      if (!Number.isInteger(value) || value < 1 || value > 5) {
        throw createError({
          statusCode: 400,
          statusMessage: `Invalid ${key} score. Must be an integer between 1 and 5.`
        })
      }
    }
    
    // Verify feature exists
    const feature = await prisma.feature.findUnique({
      where: { id: featureId }
    })
    
    if (!feature) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Feature not found'
      })
    }
    
    // Create or update score
    const score = await prisma.score.upsert({
      where: {
        featureId_userId: {
          featureId,
          userId: decoded.userId
        }
      },
      update: {
        strategic,
        impact,
        technical,
        market,
        revenue,
        compliance
      },
      create: {
        featureId,
        userId: decoded.userId,
        strategic,
        impact,
        technical,
        market,
        revenue,
        compliance
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        feature: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    return { score }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Submit score error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to submit score'
    })
  }
}) 