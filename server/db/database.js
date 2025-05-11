import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import { fileURLToPath } from 'url'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to SQLite database file
const dbPath = path.join(__dirname, '../data/habit_tracker.db')

// Initialize database connection
let db = null

export const getDb = async () => {
  if (db) return db
  
  // Open the database
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  })
  
  return db
}

// Set up database schema
export const setupDb = async () => {
  const db = await getDb()
  
  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON')
  
  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // Create habits table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      start_date TEXT NOT NULL,
      color TEXT,
      is_priority INTEGER DEFAULT 0,
      is_archived INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `)
  
  // Create habit tracking table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS habit_tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
      UNIQUE (habit_id, date)
    )
  `)
  
  console.log('Database setup completed')
}

// Helper function to convert row to camelCase
export const toCamelCase = (row) => {
  if (!row) return null
  
  const newObj = {}
  Object.keys(row).forEach(key => {
    const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
    newObj[camelKey] = row[key]
  })
  
  return newObj
}

// Helper function to convert object keys to snake_case
export const toSnakeCase = (obj) => {
  if (!obj) return null
  
  const newObj = {}
  Object.keys(obj).forEach(key => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    newObj[snakeKey] = obj[key]
  })
  
  return newObj
} 