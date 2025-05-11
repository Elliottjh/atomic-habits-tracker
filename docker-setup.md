# Docker Configuration

The Habit Tracker application includes Docker configuration for easy development and deployment.

## Dockerfile

The `Dockerfile` sets up a Node.js environment for the application:

```dockerfile
FROM node:18-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build frontend
RUN npm run build

# Expose the server port
EXPOSE 3001

# Start the server in production mode
CMD ["node", "server/server.js"]
```

## Docker Compose

The `docker-compose.yml` file configures a complete development environment with:

1. Application container with Node.js
2. PostgreSQL database
3. MailHog for email testing

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/habit_tracker?schema=public
      - JWT_SECRET=local-development-jwt-secret
      - EMAIL_HOST=mailhog
      - EMAIL_PORT=1025
      - EMAIL_USER=
      - EMAIL_PASS=
      - EMAIL_FROM=Habit Tracker <noreply@habittracker.com>
      - FRONTEND_URL=http://localhost:3001
      - NODE_ENV=production
      - PORT=3001
    volumes:
      - ./:/app
      - /app/node_modules

  postgres:
    image: postgres:14
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_USER=postgres
      - POSTGRES_DB=habit_tracker
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  mailhog:
    image: mailhog/mailhog
    ports:
      - "8025:8025" # Web UI
      - "1025:1025" # SMTP server

volumes:
  postgres_data:
```

## Usage

1. Start the development environment:
   ```
   docker-compose up
   ```

2. Access the application at http://localhost:3001

3. Access MailHog (for testing email verification) at http://localhost:8025

For the full implementation details, refer to the conversation history or contact the repository owner. 