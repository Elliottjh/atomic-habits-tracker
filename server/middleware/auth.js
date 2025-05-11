import jwt from 'jsonwebtoken'

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || 'atomic-habits-secret-key-change-in-production'

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided.' })
  }
  
  const token = authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. Invalid token format.' })
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // Add user data to request
    req.user = decoded
    
    // Continue with the request
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' })
  }
}

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