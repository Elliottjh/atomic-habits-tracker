import express from 'express'
import bcrypt from 'bcrypt'
import { getDb, toCamelCase } from '../db/database.js'
import { generateToken, verifyToken } from '../middleware/auth.js'

const router = express.Router()

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    
    // Check for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }
    
    // Check for password strength (at least 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }
    
    const db = await getDb()
    
    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email])
    
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' })
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    // Create new user
    const result = await db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    )
    
    const userId = result.lastID
    
    // Get the created user
    const user = await db.get('SELECT id, name, email, created_at FROM users WHERE id = ?', [userId])
    const userObj = toCamelCase(user)
    
    // Generate JWT token
    const token = generateToken(userObj)
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userObj
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error during registration' })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    
    const db = await getDb()
    
    // Find user by email
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email])
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    
    // Create user object without password
    const userObj = toCamelCase({
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at
    })
    
    // Generate JWT token
    const token = generateToken(userObj)
    
    res.json({
      message: 'Login successful',
      token,
      user: userObj
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error during login' })
  }
})

// Validate token and get user info
router.get('/validate', verifyToken, async (req, res) => {
  try {
    const { id } = req.user
    
    const db = await getDb()
    
    // Get user by ID
    const user = await db.get(
      'SELECT id, name, email, created_at FROM users WHERE id = ?', 
      [id]
    )
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    res.json({
      user: toCamelCase(user)
    })
  } catch (error) {
    console.error('Token validation error:', error)
    res.status(500).json({ message: 'Server error during token validation' })
  }
})

export default router 