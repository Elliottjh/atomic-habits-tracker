import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import moment from 'moment'

// Components
import HabitHeader from '../components/HabitHeader'
import HabitGrid from '../components/HabitGrid'
import HabitForm from '../components/HabitForm'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import Navbar from '../components/Navbar'

// Variants for animations
const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.5 } }
}

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [habits, setHabits] = useState([])
  const [habitGroups, setHabitGroups] = useState([])
  const [currentDate, setCurrentDate] = useState(moment())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [activeHabit, setActiveHabit] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState('tracker') // 'tracker' or 'analytics'
  
  // Fetch habits on component mount
  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/habits', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setHabits(data.habits)
          
          // Group habits by category
          const groups = data.habits.reduce((acc, habit) => {
            if (!acc.includes(habit.category)) {
              acc.push(habit.category)
            }
            return acc
          }, [])
          
          setHabitGroups(groups)
        }
      } catch (error) {
        console.error('Error fetching habits:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchHabits()
  }, [])
  
  // Handle month change
  const changeMonth = (increment) => {
    setCurrentDate(moment(currentDate).add(increment, 'month'))
  }
  
  // Toggle habit form modal
  const toggleHabitForm = (habit = null) => {
    if (habit) {
      setActiveHabit(habit)
      setIsEditMode(true)
    } else {
      setActiveHabit(null)
      setIsEditMode(false)
    }
    
    setIsFormOpen(!isFormOpen)
  }
  
  // Handle form submission
  const handleHabitSubmit = async (habitData) => {
    try {
      const token = localStorage.getItem('token')
      const url = isEditMode 
        ? `/api/habits/${activeHabit.id}` 
        : '/api/habits'
        
      const method = isEditMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(habitData)
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (isEditMode) {
          // Update existing habit
          setHabits(habits.map(h => h.id === data.habit.id ? data.habit : h))
        } else {
          // Add new habit
          setHabits([...habits, data.habit])
          
          // Add category to groups if it's new
          if (!habitGroups.includes(data.habit.category)) {
            setHabitGroups([...habitGroups, data.habit.category])
          }
        }
        
        setIsFormOpen(false)
      }
    } catch (error) {
      console.error('Error saving habit:', error)
    }
  }
  
  // Handle habit status toggle
  const handleHabitStatusToggle = async (habitId, date, completed, comment = '') => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/habits/${habitId}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date,
          completed,
          comment
        })
      })
      
      if (response.ok) {
        // Update habits with new tracking data
        const data = await response.json()
        
        setHabits(habits.map(habit => 
          habit.id === habitId 
            ? { ...habit, tracking: data.tracking }
            : habit
        ))
      }
    } catch (error) {
      console.error('Error updating habit status:', error)
    }
  }
  
  // Handle habit deletion
  const handleDeleteHabit = async (habitId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        // Remove habit from state
        setHabits(habits.filter(h => h.id !== habitId))
        
        // Update habit groups if needed
        const deletedHabit = habits.find(h => h.id === habitId)
        const hasOtherHabitsInCategory = habits.some(
          h => h.id !== habitId && h.category === deletedHabit.category
        )
        
        if (!hasOtherHabitsInCategory) {
          setHabitGroups(habitGroups.filter(g => g !== deletedHabit.category))
        }
      }
    } catch (error) {
      console.error('Error deleting habit:', error)
    }
  }
  
  return (
    <motion.div 
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-background flex flex-col"
    >
      {/* Navigation */}
      <Navbar 
        user={user} 
        onLogout={logout} 
        activeView={view}
        onViewChange={setView}
      />
      
      {/* Main content */}
      <div className="flex-grow p-4 md:p-6">
        {view === 'tracker' ? (
          <>
            {/* Month selection and habit controls */}
            <HabitHeader 
              date={currentDate}
              onMonthChange={changeMonth}
              onAddHabit={() => toggleHabitForm()}
            />
            
            {isLoading ? (
              <div className="flex justify-center mt-12">
                <div className="animate-pulse text-primary-500">Loading habits...</div>
              </div>
            ) : habits.length === 0 ? (
              <div className="mt-8 text-center">
                <h3 className="text-xl text-gray-700 mb-4">No habits yet</h3>
                <p className="text-gray-600 mb-6">Start building better habits by adding your first habit to track</p>
                <button 
                  className="btn-primary"
                  onClick={() => toggleHabitForm()}
                >
                  Add Your First Habit
                </button>
              </div>
            ) : (
              <HabitGrid 
                habits={habits}
                habitGroups={habitGroups}
                currentDate={currentDate}
                onStatusToggle={handleHabitStatusToggle}
                onEditHabit={toggleHabitForm}
                onDeleteHabit={handleDeleteHabit}
              />
            )}
          </>
        ) : (
          <AnalyticsDashboard habits={habits} />
        )}
      </div>
      
      {/* Habit Form Modal */}
      {isFormOpen && (
        <HabitForm 
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleHabitSubmit}
          habit={activeHabit}
          isEditMode={isEditMode}
          habitGroups={habitGroups}
        />
      )}
    </motion.div>
  )
}

export default Dashboard 