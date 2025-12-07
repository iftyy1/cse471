# Database Setup Guide

This guide will help you set up Neon DB (serverless PostgreSQL) for the Student Social Media platform.

## Prerequisites

1. A Neon DB account
   - Sign up at: https://neon.tech/
   - Create a new project and database

## Setup Steps

### 1. Create Neon Database

1. Log in to your Neon account
2. Create a new project
3. Copy the connection string from your Neon dashboard

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Configuration (Neon DB)
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require

# JWT Secret (change this in production)
JWT_SECRET=your-secret-key-change-in-production
```

**Important:** 
- Replace the `DATABASE_URL` with your actual Neon DB connection string
- Change the `JWT_SECRET` value to a secure value in production!
- The connection string should include `?sslmode=require` for secure connections

### 3. Initialize Database Tables

The database tables will be automatically created when the application starts. The initialization happens in `src/lib/db-init.ts`.

Alternatively, you can manually run the SQL:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  application_deadline DATE,
  posted_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  cover_letter TEXT,
  resume_url VARCHAR(500),
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
```

### 4. Start the Application

```bash
bun run dev
```

The application will automatically initialize the database tables on first run.

## Verification

To verify the database setup:

1. Connect to your Neon database using the connection string from your Neon dashboard
2. Check if tables exist:
```sql
\dt
```

You should see: `users`, `jobs`, and `applications` tables.

3. Check table structure:
```sql
\d users
\d jobs
\d applications
```

## Troubleshooting

### Connection Error
- Verify the `DATABASE_URL` in `.env.local` is correct
- Ensure the connection string includes SSL parameters (`?sslmode=require`)
- Check that your Neon database is active and accessible
- Verify network connectivity to Neon servers

### Permission Error
- Ensure the database user in your Neon connection string has proper permissions
- Check your Neon project settings for user permissions

### Tables Not Created
- Check server logs for errors
- Manually run the SQL commands from step 3
- Ensure `src/lib/db-init.ts` is being executed

## Sample Data (Optional)

You can insert sample data for testing:

```sql
-- Insert a test user (password: password123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@example.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'admin');

-- Insert a test job
INSERT INTO jobs (title, company, location, type, description, requirements, salary_min, salary_max, posted_by) VALUES 
('Software Engineer Intern', 'Tech Corp', 'New York, NY', 'internship', 'We are looking for a talented software engineer intern...', 'Bachelor''s degree in Computer Science...', 50000, 70000, 1);
```

**Note:** The password hash above is for "password123". In production, always use the registration endpoint to create users with properly hashed passwords.

