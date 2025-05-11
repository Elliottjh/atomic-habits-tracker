import { useState } from 'react'
import { motion } from 'framer-motion'
import moment from 'moment'

const HabitCell = ({ 
  habit, 
  date, 
  onStatusToggle, 
  isPast, 
  isToday, 
  isFuture,
  isStartDateValid
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [comment, setComment] = useState('')
  
  // Format date for API
  const formattedDate = date.format('YYYY-MM-DD')
  
  // Check if habit tracking exists for this date
  const trackingData = habit.tracking && habit.tracking[formattedDate] 
    ? habit.tracking[formattedDate] 
    : null
  
  // Check completion status
  const isCompleted = trackingData?.completed || false
  
  // Get comment if any
  const existingComment = trackingData?.comment || ''
  
  // Handler for cell click
  const handleCellClick = () => {
    // Only allow tracking if the date is today or in the past and after start date
    if ((isToday || isPast) && isStartDateValid) {
      if (trackingData?.comment) {
        setComment(trackingData.comment)
        setIsPopoverOpen(true)
      } else {
        // Toggle completion status directly if no comment
        onStatusToggle(habit.id, formattedDate, !isCompleted)
      }
    }
  }
  
  // Handler for long press (to add comment)
  const handleLongPress = () => {
    if ((isToday || isPast) && isStartDateValid) {
      setComment(existingComment)
      setIsPopoverOpen(true)
    }
  }
  
  // Submit the comment and status
  const handleSubmitComment = () => {
    onStatusToggle(habit.id, formattedDate, true, comment)
    setIsPopoverOpen(false)
  }
  
  // Mark as missed with comment
  const handleMarkMissed = () => {
    onStatusToggle(habit.id, formattedDate, false, comment)
    setIsPopoverOpen(false)
  }
  
  // Get appropriate class for cell based on status
  const getCellClass = () => {
    if (!isStartDateValid) {
      return 'bg-gray-100'
    }
    
    if (trackingData) {
      if (trackingData.completed) {
        return 'habit-status-complete'
      } else {
        return 'habit-status-missed'
      }
    }
    
    return isToday ? 'bg-primary-50' : 'habit-status-pending'
  }
  
  // Cell animation variants
  const cellVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    tap: { scale: 0.95 }
  }

  return (
    <div className="relative w-12 min-w-[3rem] border-r last:border-r-0">
      <motion.button
        className={`w-full h-12 flex items-center justify-center relative ${getCellClass()}`}
        variants={cellVariants}
        initial="initial"
        animate="animate"
        whileTap="tap"
        transition={{ duration: 0.2 }}
        onClick={handleCellClick}
        onContextMenu={(e) => {
          e.preventDefault()
          handleLongPress()
        }}
        disabled={isFuture || !isStartDateValid}
      >
        {isCompleted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : trackingData && !trackingData.completed ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : null}
        
        {/* Comment indicator */}
        {trackingData?.comment && (
          <span className="absolute bottom-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
        )}
      </motion.button>
      
      {/* Comment popover */}
      {isPopoverOpen && (
        <div 
          className="absolute z-20 left-0 mt-1 bg-white rounded-md shadow-lg border w-64"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3">
            <div className="text-xs font-medium mb-1">
              {date.format('MMM D, YYYY')} - {habit.name}
            </div>
            
            <textarea
              className="w-full p-2 text-sm border rounded mb-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
              rows="3"
              placeholder="Add a comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
            
            <div className="flex justify-between">
              <button 
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setIsPopoverOpen(false)}
              >
                Cancel
              </button>
              
              <div>
                <button
                  className="text-xs bg-red-500 text-white px-2 py-1 rounded mr-1 hover:bg-red-600"
                  onClick={handleMarkMissed}
                >
                  Missed
                </button>
                
                <button
                  className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  onClick={handleSubmitComment}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HabitCell 