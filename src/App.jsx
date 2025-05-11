import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { AnimatePresence } from 'framer-motion'

// Components
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AtomLoader from './components/AtomLoader'

function App() {
  const { user, loading } = useAuth()
  const [appLoading, setAppLoading] = useState(true)

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setAppLoading(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  if (appLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AtomLoader />
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <AtomLoader />
        </div>
      ) : user ? (
        <Dashboard />
      ) : (
        <Login />
      )}
    </AnimatePresence>
  )
}

export default App 