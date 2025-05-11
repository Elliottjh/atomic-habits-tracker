# Atomic Habit Tracker

A private, modern, and slick habit tracker web application inspired by James Clear's "Atomic Habits". This app allows you to track your daily habits with a clean, visually appealing interface, and provides analytics to help you build better habits, one day at a time.

## Features

- **Calendar-based Habit Tracking**: Track your habits daily with a visual grid
- **Habit Groups**: Organize habits into categories (Morning, Health, Evening, etc.)
- **Comments for Missed Habits**: Add notes for why you missed a habit
- **Analytics Dashboard**: View your progress with charts and stats
- **Beautiful UI**: Sleek design with fancy animations, including atom-inspired loading
- **Private & Secure**: Self-hosted, private solution for your personal use

## Tech Stack

### Frontend
- React
- Tailwind CSS
- Framer Motion (animations)
- Chart.js (analytics)
- Moment.js (date handling)

### Backend
- Node.js & Express
- SQLite (lightweight database)
- JWT for authentication

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Steps

1. Clone the repository:
   ```
   git clone <repository-url>
   cd habit-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. In a separate terminal, start the backend server:
   ```
   npm run server
   ```

5. Access the application at `http://localhost:5173`

## Building for Production

To build the application for production:

```
npm run build
```

This will create a `dist` folder with the compiled frontend. You can then run the full-stack application:

```
NODE_ENV=production npm run server
```

The application will be available at `http://localhost:3001`.

## Security Considerations

This application is designed for personal use:

- By default, it uses a local SQLite database (no external database needed)
- Authentication is handled via JWT tokens
- For enhanced security in production, consider:
  - Setting a custom JWT secret via environment variable `JWT_SECRET`
  - Running behind a reverse proxy like Nginx with HTTPS
  - Implementing rate limiting

## Privacy

All data is stored locally in a SQLite database file. No data is sent to external services. The application can be run completely offline after initial setup.

## License

This project is for personal use only.

## Acknowledgments

- Inspired by James Clear's "Atomic Habits"
- Built with React, Tailwind CSS, and Express 