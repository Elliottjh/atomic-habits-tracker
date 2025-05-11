import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'
import authRoutes from './routes/auth.js'
import habitRoutes from './routes/habits.js'
import analyticsRoutes from './routes/analytics.js'
import settingsRoutes from './routes/settings.js'
import historyRoutes from './routes/history.js'
import { verifyToken } from './middleware/auth.js'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))
}

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/habits', verifyToken, habitRoutes)
app.use('/api/analytics', verifyToken, analyticsRoutes)
app.use('/api/settings', verifyToken, settingsRoutes)
app.use('/api/history', verifyToken, historyRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Handle React routing in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}

// Start the server
app.listen(PORT, () => {
  console.log()
})

// Start the server
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
