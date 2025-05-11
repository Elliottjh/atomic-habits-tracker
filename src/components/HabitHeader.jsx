import { motion } from 'framer-motion'

const HabitHeader = ({ date, onMonthChange, onAddHabit }) => {
  const monthName = date.format('MMMM YYYY')
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
      <motion.div 
        className="flex items-center mb-4 md:mb-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button 
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          onClick={() => onMonthChange(-1)}
          aria-label="Previous month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mx-4">{monthName}</h2>
        
        <button 
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          onClick={() => onMonthChange(1)}
          aria-label="Next month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </motion.div>
      
      <motion.button
        className="btn-primary flex items-center"
        onClick={onAddHabit}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Habit
      </motion.button>
    </div>
  )
}

export default HabitHeader 