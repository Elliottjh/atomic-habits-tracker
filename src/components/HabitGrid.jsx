import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import moment from 'moment'
import HabitCell from './HabitCell'

const HabitGrid = ({ 
  habits, 
  habitGroups, 
  currentDate, 
  onStatusToggle, 
  onEditHabit,
  onDeleteHabit
}) => {
  const [daysInMonth, setDaysInMonth] = useState([])
  const [groupedHabits, setGroupedHabits] = useState({})
  const [expandedHabitId, setExpandedHabitId] = useState(null)
  
  // Generate days for the current month
  useEffect(() => {
    const year = currentDate.year()
    const month = currentDate.month()
    const daysCount = currentDate.daysInMonth()
    
    const days = []
    for (let i = 1; i <= daysCount; i++) {
      const day = moment().year(year).month(month).date(i)
      days.push(day)
    }
    
    setDaysInMonth(days)
  }, [currentDate])
  
  // Group habits by category
  useEffect(() => {
    const grouped = {}
    
    habitGroups.forEach(group => {
      grouped[group] = habits.filter(habit => 
        habit.category === group && !habit.isArchived
      )
    })
    
    setGroupedHabits(grouped)
  }, [habits, habitGroups])
  
  // Toggle expanded habit details
  const toggleExpandHabit = (habitId) => {
    if (expandedHabitId === habitId) {
      setExpandedHabitId(null)
    } else {
      setExpandedHabitId(habitId)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      {/* Calendar Header */}
      <div className="sticky top-0 bg-white z-10 border-b">
        <div className="flex">
          {/* Empty cell for habit names */}
          <div className="w-48 min-w-[12rem] p-4 border-r">
            <h3 className="font-semibold text-gray-700">Habits</h3>
          </div>
          
          {/* Day headers */}
          <div className="flex">
            {daysInMonth.map((day, index) => (
              <div 
                key={index}
                className={`w-12 min-w-[3rem] p-2 text-center border-r last:border-r-0 ${
                  day.isSame(moment(), 'day') ? 'bg-primary-50 font-bold' : ''
                }`}
              >
                <div className="text-sm font-medium">{day.format('DD')}</div>
                <div className="text-xs text-gray-500">{day.format('ddd')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Habit Rows by Category */}
      <div>
        {Object.entries(groupedHabits).map(([category, categoryHabits], groupIndex) => (
          <div key={category} className={groupIndex > 0 ? 'border-t' : ''}>
            {/* Category Header */}
            <motion.div 
              className="bg-gray-50 p-2 pl-4 border-b font-medium text-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              {category}
            </motion.div>
            
            {/* Habits in this category */}
            {categoryHabits.map((habit, habitIndex) => (
              <motion.div 
                key={habit.id}
                className={`border-b last:border-b-0 ${
                  expandedHabitId === habit.id ? 'bg-gray-50' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (groupIndex * 0.1) + (habitIndex * 0.05) }}
              >
                <div className="flex">
                  {/* Habit Name */}
                  <div className="w-48 min-w-[12rem] p-4 border-r flex items-start">
                    <div className="w-full">
                      <div className="flex items-center justify-between">
                        <button 
                          className="text-left font-medium truncate max-w-[80%]"
                          onClick={() => toggleExpandHabit(habit.id)}
                          title={habit.name}
                        >
                          <span 
                            className="inline-block w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: habit.color || '#38bdf8' }}
                          ></span>
                          {habit.name}
                        </button>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                            onClick={() => onEditHabit(habit)}
                            title="Edit habit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          
                          <button
                            className="p-1 text-gray-400 hover:text-red-500 rounded-full"
                            onClick={() => onDeleteHabit(habit.id)}
                            title="Delete habit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Show description if expanded */}
                      {expandedHabitId === habit.id && habit.description && (
                        <motion.p 
                          className="text-xs text-gray-500 mt-1"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.2 }}
                        >
                          {habit.description}
                        </motion.p>
                      )}
                    </div>
                  </div>
                  
                  {/* Habit cells for each day */}
                  <div className="flex">
                    {daysInMonth.map((day, index) => (
                      <HabitCell
                        key={index}
                        habit={habit}
                        date={day}
                        onStatusToggle={onStatusToggle}
                        isPast={day.isBefore(moment(), 'day')}
                        isToday={day.isSame(moment(), 'day')}
                        isFuture={day.isAfter(moment(), 'day')}
                        isStartDateValid={moment(habit.startDate).isSameOrBefore(day, 'day')}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Empty state if no habits in category */}
            {categoryHabits.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500 italic">
                No active habits in this category
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default HabitGrid 