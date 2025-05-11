# Habit Tracker

A modern, public habit tracker web application inspired by James Clear's Atomic Habits. Track your daily habits, visualize your progress, and improve your consistency with detailed analytics.

## Features

- 🔐 User Authentication: Email/password signup with email verification
- 📅 Calendar-based Habit Tracking: Track habits daily with a monthly grid view
- 📊 Detailed Analytics: Visualize completion rates, streaks, and top/bottom performing habits
- 🗂️ Habit Categories: Group habits into categories (Morning, Health, Productivity, etc.)
- 📝 Missed Habit Comments: Add comments for missed habits to reflect on obstacles
- 🔄 Habit History: Archive/restore habits, with safe deletion confirmation
- 🌓 Dark/Light Mode: Toggle between themes for comfortable usage
- ✨ Particle Animation: Beautiful background animation with toggle option

## Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion, Chart.js, Moment.js
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT, Bcrypt, Email verification
- **Deployment**: Vercel (frontend), Render (backend/database)

## Local Development Setup

### Prerequisites

- Node.js (v14+ recommended)
- PostgreSQL database

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/elliottjh/atomic-habits-tracker.git
cd atomic-habits-tracker
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory with the following variables:

```
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/habit_tracker?schema=public"

# JWT Secret
JWT_SECRET="your-secret-key-change-this-in-production"

# Email Configuration (for verification emails)
EMAIL_HOST="smtp.example.com"
EMAIL_PORT=587
EMAIL_USER="your-email@example.com"
EMAIL_PASS="your-email-password"
EMAIL_FROM="Habit Tracker <noreply@habittracker.com>"

# Frontend URL (for email verification links)
FRONTEND_URL="http://localhost:5173"

# Server Port
PORT=3001
```

4. **Initialize the database with Prisma**

```bash
# Generate Prisma client
npm run prisma:generate

# Create database tables
npm run prisma:migrate
```

5. **Start the development servers**

In one terminal, start the backend:
```bash
npm run server
```

In another terminal, start the frontend:
```bash
npm run dev
```

6. **Access the application**

Open your browser and navigate to `http://localhost:5173`

## Deployment Guide

### Frontend Deployment (Vercel)

1. **Push your code to GitHub**

```bash
git add .
git commit -m "Ready for deployment"
git push
```

2. **Deploy to Vercel**

- Sign up for [Vercel](https://vercel.com)
- Connect your GitHub repository
- Configure the project:
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Environment Variables: Add `VITE_API_URL` (e.g., https://your-backend.onrender.com)
- Click Deploy

### Backend Deployment (Render)

1. **Set up PostgreSQL on Render**

- Sign up for [Render](https://render.com)
- Create a new PostgreSQL database
- Note the connection string provided by Render

2. **Deploy the backend service**

- Create a new Web Service on Render
- Connect your GitHub repository
- Configure:
  - Build Command: `npm install`
  - Start Command: `node server/server.js`
  - Environment Variables:
    - `DATABASE_URL`: The PostgreSQL connection string from step 1
    - `JWT_SECRET`: A secure random string
    - `EMAIL_*`: Email service configuration
    - `FRONTEND_URL`: Your Vercel app URL
    - `NODE_ENV`: `production`

3. **Run database migrations**

```bash
npx prisma migrate deploy
```

## Testing Email Verification Locally

For local development, you can use a service like [Mailhog](https://github.com/mailhog/MailHog) or [Mailtrap](https://mailtrap.io/) to capture and test verification emails without actually sending them.

### Using Mailtrap:

1. Sign up for a free Mailtrap account
2. Get your SMTP credentials from the inbox settings
3. Update your `.env` file with these credentials:

```
EMAIL_HOST="smtp.mailtrap.io"
EMAIL_PORT=2525
EMAIL_USER="your-mailtrap-user"
EMAIL_PASS="your-mailtrap-password"
```

## Customizing Appearance

### Particle Animation

The particle animation can be customized by modifying the `ParticleBackground.jsx` component:

- Change particle count (default: 100)
- Adjust particle size, speed, and opacity
- Modify color (default: cyan)
- Adjust connection distance and opacity

### Color Theme

The main color scheme can be adjusted in `tailwind.config.js`. The default theme uses a cyan accent color.

## License

This project is MIT licensed.

## Acknowledgements

- Inspired by James Clear's [Atomic Habits](https://jamesclear.com/atomic-habits)
- Particle animation based on canvas techniques
- Icons from [Heroicons](https://heroicons.com)
- Calendar implementation using Moment.js
