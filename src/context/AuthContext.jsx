import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Check for existing auth token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          // Validate token with backend
          const response = await fetch('/api/auth/validate', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            setUser(data.user)
          } else {
            // Invalid token, clear localStorage
            localStorage.removeItem('token')
          }
        } catch (error) {
          console.error('Auth validation error:', error)
          localStorage.removeItem('token')
        }
      }
      
      setLoading(false)
    }
    
    checkAuth()
  }, [])
  
  // Login function
  const login = async (email, password) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        localStorage.setItem('token', data.token)
        setUser(data.user)
        return { success: true }
      } else {
        return { 
          success: false, 
          message: data.message || 'Login failed' 
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: 'An error occurred during login' 
      }
    } finally {
      setLoading(false)
    }
  }
  
  // Register function
  const register = async (email, password, name) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        localStorage.setItem('token', data.token)
        setUser(data.user)
        return { success: true }
      } else {
        return { 
          success: false, 
          message: data.message || 'Registration failed' 
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        message: 'An error occurred during registration' 
      }
    } finally {
      setLoading(false)
    }
  }
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }
  
  const value = {
    user,
    loading,
    login,
    register,
    logout
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 