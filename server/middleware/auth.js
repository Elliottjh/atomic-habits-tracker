import jwt from 'jsonwebtoken'
import prisma from '../db/prisma.js'

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || 'atomic-habits-secret-key-change-in-production'

// Generate a JWT token for a user
export const generateToken = (user) => {
  // Create a payload with user ID and name (avoid including sensitive data)
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email
  }
  
  // Sign and return the token
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}
