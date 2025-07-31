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
    
    const { name, description } = await readBody(event)
    
    if (!name || typeof name !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Feature name is required'
      })
    }
    
    const feature = await prisma.feature.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        createdById: decoded.userId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })
    
    return { feature }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Create feature error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create feature'
    })
  }
}) 