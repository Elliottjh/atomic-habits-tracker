import express from 'express'
import { getDb, toCamelCase, toSnakeCase } from '../db/database.js'

const router = express.Router()

// Helper function to process habit data with tracking
const processHabitWithTracking = async (db, habit) => {
  const habitObj = toCamelCase(habit)
  
  // Convert boolean values
  habitObj.isPriority = !!habitObj.isPriority
  habitObj.isArchived = !!habitObj.isArchived
  
  // Get tracking data
  const trackingRows = await db.all(
    'SELECT date, completed, comment FROM habit_tracking WHERE habit_id = ?',
    [habitObj.id]
  )
  
  // Convert tracking data to an object keyed by date
  const tracking = {}
  trackingRows.forEach(row => {
    const trackingObj = toCamelCase(row)
    trackingObj.completed = !!trackingObj.completed
    tracking[trackingObj.date] = {
      completed: trackingObj.completed,
      comment: trackingObj.comment || ''
    }
  })
  
  habitObj.tracking = tracking
  
  return habitObj
}

// Get all habits for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id
    
    const db = await getDb()
    
    // Get all habits for the user
    const habits = await db.all(
      'SELECT * FROM habits WHERE user_id = ? ORDER BY category, is_priority DESC, name',
      [userId]
    )
    
    // Process each habit with tracking data
    const habitsWithTracking = await Promise.all(
      habits.map(habit => processHabitWithTracking(db, habit))
    )
    
    res.json({ habits: habitsWithTracking })
  } catch (error) {
    console.error('Error fetching habits:', error)
    res.status(500).json({ message: 'Server error while fetching habits' })
  }
})

// Get a single habit by ID
router.get('/:id', async (req, res) => {
  try {
    const habitId = req.params.id
    const userId = req.user.id
    
    const db = await getDb()
    
    // Get the habit
    const habit = await db.get(
      'SELECT * FROM habits WHERE id = ? AND user_id = ?',
      [habitId, userId]
    )
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' })
    }
    
    // Process habit with tracking data
    const habitWithTracking = await processHabitWithTracking(db, habit)
    
    res.json({ habit: habitWithTracking })
  } catch (error) {
    console.error('Error fetching habit:', error)
    res.status(500).json({ message: 'Server error while fetching habit' })
  }
})

// Create a new habit
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id
    const { name, description, category, startDate, color, isPriority } = req.body
    
    // Validate required fields
    if (!name || !category || !startDate) {
      return res.status(400).json({ message: 'Name, category and start date are required' })
    }
    
    const db = await getDb()
    
    // Convert booleans to integers for SQLite
    const isPriorityInt = isPriority ? 1 : 0
    
    // Insert the habit
    const result = await db.run(
      `INSERT INTO habits 
        (user_id, name, description, category, start_date, color, is_priority)
       VALUES 
        (?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, description || '', category, startDate, color || '#38bdf8', isPriorityInt]
    )
    
    const habitId = result.lastID
    
    // Get the created habit
    const habit = await db.get('SELECT * FROM habits WHERE id = ?', [habitId])
    
    // Process habit with empty tracking data
    const habitWithTracking = await processHabitWithTracking(db, habit)
    
    res.status(201).json({
      message: 'Habit created successfully',
      habit: habitWithTracking
    })
  } catch (error) {
    console.error('Error creating habit:', error)
    res.status(500).json({ message: 'Server error while creating habit' })
  }
})

// Update a habit
router.put('/:id', async (req, res) => {
  try {
    const habitId = req.params.id
    const userId = req.user.id
    const { name, description, category, startDate, color, isPriority, isArchived } = req.body
    
    // Validate required fields
    if (!name || !category || !startDate) {
      return res.status(400).json({ message: 'Name, category and start date are required' })
    }
    
    const db = await getDb()
    
    // Check if habit exists and belongs to user
    const existingHabit = await db.get(
      'SELECT * FROM habits WHERE id = ? AND user_id = ?',
      [habitId, userId]
    )
    
    if (!existingHabit) {
      return res.status(404).json({ message: 'Habit not found' })
    }
    
    // Convert booleans to integers for SQLite
    const isPriorityInt = isPriority ? 1 : 0
    const isArchivedInt = isArchived ? 1 : 0
    
    // Update the habit
    await db.run(
      `UPDATE habits 
       SET name = ?, description = ?, category = ?, start_date = ?, 
           color = ?, is_priority = ?, is_archived = ?
       WHERE id = ? AND user_id = ?`,
      [name, description || '', category, startDate, color || '#38bdf8', 
       isPriorityInt, isArchivedInt, habitId, userId]
    )
    
    // Get the updated habit
    const updatedHabit = await db.get('SELECT * FROM habits WHERE id = ?', [habitId])
    
    // Process habit with tracking data
    const habitWithTracking = await processHabitWithTracking(db, updatedHabit)
    
    res.json({
      message: 'Habit updated successfully',
      habit: habitWithTracking
    })
  } catch (error) {
    console.error('Error updating habit:', error)
    res.status(500).json({ message: 'Server error while updating habit' })
  }
})

// Delete a habit
router.delete('/:id', async (req, res) => {
  try {
    const habitId = req.params.id
    const userId = req.user.id
    
    const db = await getDb()
    
    // Check if habit exists and belongs to user
    const existingHabit = await db.get(
      'SELECT * FROM habits WHERE id = ? AND user_id = ?',
      [habitId, userId]
    )
    
    if (!existingHabit) {
      return res.status(404).json({ message: 'Habit not found' })
    }
    
    // Delete the habit (and associated tracking data via foreign key cascade)
    await db.run(
      'DELETE FROM habits WHERE id = ? AND user_id = ?',
      [habitId, userId]
    )
    
    res.json({
      message: 'Habit deleted successfully',
      id: habitId
    })
  } catch (error) {
    console.error('Error deleting habit:', error)
    res.status(500).json({ message: 'Server error while deleting habit' })
  }
})

// Track a habit for a specific date
router.post('/:id/track', async (req, res) => {
  try {
    const habitId = req.params.id
    const userId = req.user.id
    const { date, completed, comment } = req.body
    
    // Validate required fields
    if (!date) {
      return res.status(400).json({ message: 'Date is required' })
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' })
    }
    
    const db = await getDb()
    
    // Check if habit exists and belongs to user
    const existingHabit = await db.get(
      'SELECT * FROM habits WHERE id = ? AND user_id = ?',
      [habitId, userId]
    )
    
    if (!existingHabit) {
      return res.status(404).json({ message: 'Habit not found' })
    }
    
    // Convert boolean to integer for SQLite
    const completedInt = completed ? 1 : 0
    
    // Check if tracking entry already exists
    const existingTracking = await db.get(
      'SELECT * FROM habit_tracking WHERE habit_id = ? AND date = ?',
      [habitId, date]
    )
    
    if (existingTracking) {
      // Update existing tracking
      await db.run(
        'UPDATE habit_tracking SET completed = ?, comment = ? WHERE habit_id = ? AND date = ?',
        [completedInt, comment || '', habitId, date]
      )
    } else {
      // Insert new tracking
      await db.run(
        'INSERT INTO habit_tracking (habit_id, date, completed, comment) VALUES (?, ?, ?, ?)',
        [habitId, date, completedInt, comment || '']
      )
    }
    
    // Get all tracking data for the habit
    const trackingRows = await db.all(
      'SELECT date, completed, comment FROM habit_tracking WHERE habit_id = ?',
      [habitId]
    )
    
    // Convert tracking data to an object keyed by date
    const tracking = {}
    trackingRows.forEach(row => {
      const trackingObj = toCamelCase(row)
      trackingObj.completed = !!trackingObj.completed
      tracking[trackingObj.date] = {
        completed: trackingObj.completed,
        comment: trackingObj.comment || ''
      }
    })
    
    res.json({
      message: 'Habit tracking updated',
      tracking
    })
  } catch (error) {
    console.error('Error tracking habit:', error)
    res.status(500).json({ message: 'Server error while tracking habit' })
  }
})

// Get analytics data for habits
router.get('/analytics/summary', async (req, res) => {
  try {
    const userId = req.user.id
    const { startDate, endDate } = req.query
    
    // Default to last 30 days if no date range provided
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(end)
    start.setDate(start.getDate() - 30)
    
    const formattedStartDate = start.toISOString().split('T')[0]
    const formattedEndDate = end.toISOString().split('T')[0]
    
    const db = await getDb()
    
    // Get habits
    const habits = await db.all(
      'SELECT * FROM habits WHERE user_id = ? AND is_archived = 0',
      [userId]
    )
    
    // Get tracking data in date range
    const trackingData = await db.all(
      `SELECT ht.habit_id, ht.date, ht.completed 
       FROM habit_tracking ht
       JOIN habits h ON ht.habit_id = h.id
       WHERE h.user_id = ? AND ht.date BETWEEN ? AND ?`,
      [userId, formattedStartDate, formattedEndDate]
    )
    
    // Calculate completion rates
    let totalTracked = 0
    let totalCompleted = 0
    
    const habitStats = {}
    habits.forEach(habit => {
      habitStats[habit.id] = {
        name: habit.name,
        category: habit.category,
        tracked: 0,
        completed: 0
      }
    })
    
    const categoryStats = {}
    
    trackingData.forEach(tracking => {
      const habitId = tracking.habit_id
      
      // Skip if habit no longer exists (could have been deleted)
      if (!habitStats[habitId]) return
      
      totalTracked++
      habitStats[habitId].tracked++
      
      const habit = habits.find(h => h.id === habitId)
      const category = habit.category
      
      if (!categoryStats[category]) {
        categoryStats[category] = { tracked: 0, completed: 0 }
      }
      
      categoryStats[category].tracked++
      
      if (tracking.completed) {
        totalCompleted++
        habitStats[habitId].completed++
        categoryStats[category].completed++
      }
    })
    
    // Calculate completion rate
    const overallCompletionRate = totalTracked > 0 
      ? (totalCompleted / totalTracked) * 100 
      : 0
    
    // Calculate habit completion rates
    const habitCompletionRates = Object.entries(habitStats).map(([id, stats]) => ({
      id: parseInt(id),
      name: stats.name,
      completionRate: stats.tracked > 0 ? (stats.completed / stats.tracked) * 100 : 0
    }))
    
    // Calculate category completion rates
    const categoryCompletionRates = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      completionRate: stats.tracked > 0 ? (stats.completed / stats.tracked) * 100 : 0
    }))
    
    res.json({
      overallCompletionRate,
      habitCompletionRates,
      categoryCompletionRates,
      dateRange: {
        start: formattedStartDate,
        end: formattedEndDate
      }
    })
  } catch (error) {
    console.error('Error getting analytics:', error)
    res.status(500).json({ message: 'Server error while fetching analytics' })
  }
})

export default router 