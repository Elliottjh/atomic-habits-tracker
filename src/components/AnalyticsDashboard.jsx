import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import moment from 'moment'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const AnalyticsDashboard = ({ habits }) => {
  const [timeRange, setTimeRange] = useState('30') // days
  const [selectedHabit, setSelectedHabit] = useState('all')
  const [completionRate, setCompletionRate] = useState(0)
  const [streakData, setStreakData] = useState({
    current: 0,
    longest: 0
  })
  const [trendData, setTrendData] = useState({
    labels: [],
    datasets: []
  })
  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: []
  })
  const [habitComparisonData, setHabitComparisonData] = useState({
    labels: [],
    datasets: []
  })
  
  // Process analytics data when habits or time range changes
  useEffect(() => {
    if (!habits.length) return
    
    // Calculate date range
    const endDate = moment()
    const startDate = moment().subtract(parseInt(timeRange), 'days')
    
    // Filter habits by selection
    const filteredHabits = selectedHabit === 'all' 
      ? habits 
      : habits.filter(h => h.id === selectedHabit)
    
    // Process tracking data for the date range
    const trackingData = processTrackingData(filteredHabits, startDate, endDate)
    
    // Update UI state with processed data
    setCompletionRate(trackingData.completionRate)
    setStreakData(trackingData.streakData)
    setTrendData(trackingData.trendData)
    setCategoryData(trackingData.categoryData)
    setHabitComparisonData(trackingData.habitComparisonData)
    
  }, [habits, timeRange, selectedHabit])
  
  // Process habit tracking data
  const processTrackingData = (filteredHabits, startDate, endDate) => {
    // Generate array of days in the date range
    const days = []
    const currentDate = moment(startDate)
    
    while (currentDate.isSameOrBefore(endDate, 'day')) {
      days.push(moment(currentDate))
      currentDate.add(1, 'day')
    }
    
    const dayLabels = days.map(day => day.format('MMM D'))
    
    // Calculate completion rate
    let totalDays = 0
    let completedDays = 0
    
    // Track streak data
    let currentStreak = 0
    let longestStreak = 0
    let activeStreak = true
    
    // Daily completion rates for trend
    const dailyCompletionRates = days.map(day => {
      const formattedDate = day.format('YYYY-MM-DD')
      let dayCompletedCount = 0
      let dayTotalCount = 0
      
      filteredHabits.forEach(habit => {
        // Only count if the day is on or after the habit's start date
        if (moment(habit.startDate).isSameOrBefore(day, 'day')) {
          dayTotalCount++
          
          if (habit.tracking && 
              habit.tracking[formattedDate] && 
              habit.tracking[formattedDate].completed) {
            dayCompletedCount++
          }
        }
      })
      
      // Update streak data
      if (dayTotalCount > 0) {
        totalDays += dayTotalCount
        completedDays += dayCompletedCount
        
        const dayCompletionRate = dayTotalCount > 0 
          ? (dayCompletedCount / dayTotalCount) * 100 
          : 0
          
        // Check if all habits were completed for the day (consider a day complete if rate > 80%)
        if (dayCompletionRate >= 80) {
          if (activeStreak) {
            currentStreak++
            longestStreak = Math.max(longestStreak, currentStreak)
          } else {
            activeStreak = true
            currentStreak = 1
          }
        } else {
          activeStreak = false
          currentStreak = 0
        }
      }
      
      return dayTotalCount > 0 ? (dayCompletedCount / dayTotalCount) * 100 : 0
    })
    
    // Calculate overall completion rate
    const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
    
    // Prepare trend chart data
    const trendData = {
      labels: dayLabels,
      datasets: [
        {
          label: 'Completion Rate (%)',
          data: dailyCompletionRates,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    }
    
    // Group data by categories
    const categoryGroups = {}
    
    habits.forEach(habit => {
      if (!categoryGroups[habit.category]) {
        categoryGroups[habit.category] = {
          total: 0,
          completed: 0
        }
      }
      
      days.forEach(day => {
        const formattedDate = day.format('YYYY-MM-DD')
        
        // Only count if the day is on or after the habit's start date
        if (moment(habit.startDate).isSameOrBefore(day, 'day')) {
          categoryGroups[habit.category].total++
          
          if (habit.tracking && 
              habit.tracking[formattedDate] && 
              habit.tracking[formattedDate].completed) {
            categoryGroups[habit.category].completed++
          }
        }
      })
    })
    
    // Prepare category chart data
    const categoryLabels = Object.keys(categoryGroups)
    const categoryCompletionRates = categoryLabels.map(category => {
      const group = categoryGroups[category]
      return group.total > 0 ? (group.completed / group.total) * 100 : 0
    })
    
    const categoryData = {
      labels: categoryLabels,
      datasets: [
        {
          label: 'Category Completion Rate (%)',
          data: categoryCompletionRates,
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 205, 86, 0.7)',
          ],
          borderWidth: 1
        }
      ]
    }
    
    // Habit comparison data
    const habitCompletionRates = filteredHabits.map(habit => {
      let habitTotal = 0
      let habitCompleted = 0
      
      days.forEach(day => {
        const formattedDate = day.format('YYYY-MM-DD')
        
        // Only count if the day is on or after the habit's start date
        if (moment(habit.startDate).isSameOrBefore(day, 'day')) {
          habitTotal++
          
          if (habit.tracking && 
              habit.tracking[formattedDate] && 
              habit.tracking[formattedDate].completed) {
            habitCompleted++
          }
        }
      })
      
      return habitTotal > 0 ? (habitCompleted / habitTotal) * 100 : 0
    })
    
    const habitComparisonData = {
      labels: filteredHabits.map(h => h.name),
      datasets: [
        {
          label: 'Habit Completion Rate (%)',
          data: habitCompletionRates,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }
      ]
    }
    
    return {
      completionRate,
      streakData: {
        current: currentStreak,
        longest: longestStreak
      },
      trendData,
      categoryData,
      habitComparisonData
    }
  }
  
  // Chart options
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Habit Completion Trend',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: value => `${value}%`
        }
      }
    }
  }
  
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Category Performance',
      },
    }
  }
  
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Habit Comparison',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: value => `${value}%`
        }
      }
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <motion.h2 
          className="text-2xl font-bold text-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Habit Analytics
        </motion.h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Time range selector */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-1">
              Time Range
            </label>
            <select
              id="timeRange"
              className="input"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="180">Last 6 months</option>
            </select>
          </motion.div>
          
          {/* Habit selector */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <label htmlFor="habitSelector" className="block text-sm font-medium text-gray-700 mb-1">
              Habit
            </label>
            <select
              id="habitSelector"
              className="input"
              value={selectedHabit}
              onChange={(e) => setSelectedHabit(e.target.value)}
            >
              <option value="all">All Habits</option>
              {habits.map(habit => (
                <option key={habit.id} value={habit.id}>
                  {habit.name}
                </option>
              ))}
            </select>
          </motion.div>
        </div>
      </div>
      
      {/* Summary metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Overall completion rate */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-1">Completion Rate</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-primary-600">{completionRate}%</span>
            <span className="text-sm text-gray-500 ml-2 mb-1">of habits completed</span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
        
        {/* Current streak */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-1">Current Streak</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-secondary-600">{streakData.current}</span>
            <span className="text-sm text-gray-500 ml-2 mb-1">days</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Keep going to reach your longest streak!
          </div>
        </div>
        
        {/* Longest streak */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-1">Longest Streak</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-success">{streakData.longest}</span>
            <span className="text-sm text-gray-500 ml-2 mb-1">days</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Your personal best streak
          </div>
        </div>
      </motion.div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line chart */}
        <motion.div 
          className="card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Line data={trendData} options={lineOptions} />
        </motion.div>
        
        {/* Doughnut chart */}
        <motion.div 
          className="card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Doughnut data={categoryData} options={doughnutOptions} />
        </motion.div>
        
        {/* Bar chart */}
        <motion.div 
          className="card p-6 lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Bar data={habitComparisonData} options={barOptions} />
        </motion.div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard 