import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import moment from 'moment'

const HabitForm = ({ isOpen, onClose, onSubmit, habit, isEditMode, habitGroups }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    startDate: moment().format('YYYY-MM-DD'),
    color: '#38bdf8', // Default to primary blue
    isPriority: false,
    isArchived: false
  })
  
  const [newCategory, setNewCategory] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [errors, setErrors] = useState({})
  
  // Load habit data if editing
  useEffect(() => {
    if (isEditMode && habit) {
      setFormData({
        name: habit.name || '',
        description: habit.description || '',
        category: habit.category || '',
        startDate: habit.startDate || moment().format('YYYY-MM-DD'),
        color: habit.color || '#38bdf8',
        isPriority: habit.isPriority || false,
        isArchived: habit.isArchived || false
      })
    }
  }, [isEditMode, habit])
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      })
    }
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Habit name is required'
    }
    
    if (!formData.category && !newCategory) {
      newErrors.category = 'Category is required'
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    // Use new category if entered
    const finalCategory = showNewCategory && newCategory 
      ? newCategory 
      : formData.category
    
    onSubmit({
      ...formData,
      category: finalCategory
    })
  }
  
  // Modal backdrop variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }
  
  // Modal content variants
  const modalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {isEditMode ? 'Edit Habit' : 'Add New Habit'}
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={onClose}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                {/* Habit Name */}
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Habit Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`input ${errors.name ? 'border-red-500' : ''}`}
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Morning Meditation"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
                
                {/* Description */}
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="2"
                    className="input"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of your habit (optional)"
                  ></textarea>
                </div>
                
                {/* Category */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category*
                  </label>
                  
                  {!showNewCategory ? (
                    <div>
                      <select
                        name="category"
                        className={`input ${errors.category ? 'border-red-500' : ''}`}
                        value={formData.category}
                        onChange={handleInputChange}
                        disabled={showNewCategory}
                      >
                        <option value="">Select a category</option>
                        {habitGroups.map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                      
                      <button
                        type="button"
                        className="mt-2 text-sm text-primary-600 hover:text-primary-800"
                        onClick={() => setShowNewCategory(true)}
                      >
                        + Add new category
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        className={`input ${errors.category ? 'border-red-500' : ''}`}
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Enter new category name"
                      />
                      
                      <button
                        type="button"
                        className="mt-2 text-sm text-gray-600 hover:text-gray-800"
                        onClick={() => {
                          setShowNewCategory(false)
                          setNewCategory('')
                        }}
                      >
                        Use existing category instead
                      </button>
                    </div>
                  )}
                  
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                  )}
                </div>
                
                {/* Start Date */}
                <div className="mb-4">
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date*
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    className={`input ${errors.startDate ? 'border-red-500' : ''}`}
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
                  )}
                </div>
                
                {/* Color */}
                <div className="mb-4">
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      id="color"
                      name="color"
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                      value={formData.color}
                      onChange={handleInputChange}
                    />
                    <span className="ml-2 text-sm text-gray-500">Select a color for your habit</span>
                  </div>
                </div>
                
                {/* Checkboxes */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPriority"
                      name="isPriority"
                      className="checkbox"
                      checked={formData.isPriority}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="isPriority" className="ml-2 text-sm text-gray-700">
                      Mark as priority habit
                    </label>
                  </div>
                  
                  {isEditMode && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isArchived"
                        name="isArchived"
                        className="checkbox"
                        checked={formData.isArchived}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="isArchived" className="ml-2 text-sm text-gray-700">
                        Archive this habit
                      </label>
                    </div>
                  )}
                </div>
                
                {/* Form Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  
                  <motion.button
                    type="submit"
                    className="btn-primary"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {isEditMode ? 'Update Habit' : 'Create Habit'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default HabitForm 