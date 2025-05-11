# API Routes Documentation

The Habit Tracker backend provides the following API endpoints:

## Authentication Routes
- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/login`: Authenticate a user
- `GET /api/auth/verify/:token`: Verify a user's email
- `POST /api/auth/resend-verification`: Resend verification email

## Habit Routes
- `GET /api/habits`: Get all habits for the authenticated user
- `GET /api/habits/:id`: Get a specific habit
- `POST /api/habits`: Create a new habit
- `PATCH /api/habits/:id`: Update a habit
- `POST /api/habits/:id/track`: Track a habit for a specific date
- `GET /api/habits/tracking/:year/:month`: Get habit tracking data for a month
- `GET /api/habits/calendar/:year/:month`: Get calendar days for a month

## Analytics Routes
- `GET /api/analytics/habit/:id`: Get analytics for a specific habit
- `GET /api/analytics/summary`: Get aggregated analytics for all habits

## Settings Routes
- `GET /api/settings`: Get user settings
- `PATCH /api/settings`: Update user settings

## History Routes
- `GET /api/history`: Get habit history (active, archived, deleted)
- `PATCH /api/history/archive/:id`: Archive a habit
- `PATCH /api/history/restore/:id`: Restore a habit
- `PATCH /api/history/delete/:id`: Soft delete a habit
- `DELETE /api/history/permanent/:id`: Permanently delete a habit

## Health Check
- `GET /api/health`: Server health check endpoint

All routes except authentication routes require a valid JWT token in the Authorization header.

For the full implementation details, refer to the conversation history or contact the repository owner. 