# Student Social Media Platform

A modern social media platform built with Next.js, TypeScript, and Tailwind CSS, designed specifically for students to connect, share, and engage with each other.

## Features

- 📱 **Post Feed**: Create and view posts from other students
- ❤️ **Like System**: Like posts to show appreciation
- 💬 **Comments**: Comment on posts to start conversations
- 💼 **Jobs Portal**: Browse and apply for internships and job opportunities
- 📋 **Job Management**: Create, view, update, and delete job postings
- 📝 **Job Applications**: Apply to jobs with cover letters and resume links
- 👤 **User Profiles**: View and manage your profile
- 🔐 **Authentication**: Secure JWT-based authentication system
- 🗄️ **Neon DB (Serverless PostgreSQL)**: Robust cloud database with proper relationships
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode support

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Runtime**: Bun
- **Database**: Neon DB (Serverless PostgreSQL)
- **Authentication**: JWT (JSON Web Tokens)
- **API**: REST API with Next.js API Routes

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system
  - Install from: https://bun.sh/
  - Or via PowerShell: `powershell -c "irm bun.sh/install.ps1 | iex"`
- [Neon DB](https://neon.tech/) account (free tier available)
  - Sign up at: https://neon.tech/
  - Create a new project and database

### Installation

1. Install dependencies:
```bash
bun install
```

2. Set up the database:
   - Create a Neon DB account and project
   - Copy your Neon database connection string
   - Create a `.env.local` file in the root directory
   - Add `DATABASE_URL=your-neon-connection-string` to `.env.local`

3. Run the development server:
```bash
bun run dev
```

4. Open [http://localhost:1092](http://localhost:1092) in your browser.

The server is configured to run on port 1092 by default. Database tables will be automatically created on first run.

For detailed database setup instructions, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/              # REST API endpoints
│   │   │   ├── posts/        # Post-related endpoints
│   │   │   ├── jobs/         # Job-related endpoints
│   │   │   └── auth/         # Authentication endpoints
│   │   ├── jobs/             # Jobs portal pages
│   │   ├── profile/          # Profile page
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   ├── lib/                  # Utility libraries
│   │   ├── db.ts             # Database connection
│   │   ├── db-init.ts        # Database initialization
│   │   └── auth.ts           # Authentication utilities
│   ├── middleware/           # Middleware functions
│   │   └── auth.ts           # Authentication middleware
│   └── components/
│       ├── Navbar.tsx        # Navigation bar
│       ├── PostFeed.tsx      # Post feed component
│       ├── PostCard.tsx      # Individual post card
│       └── CreatePost.tsx    # Create post form
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## API Endpoints

For complete API documentation with request/response examples, see [API_ENDPOINTS.md](./API_ENDPOINTS.md)

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post
- `POST /api/posts/[id]/like` - Like/unlike a post
- `GET /api/posts/[id]/comments` - Get comments for a post
- `POST /api/posts/[id]/comments` - Add a comment to a post

### Jobs
- `GET /api/jobs` - Get all jobs (with filters and pagination)
- `GET /api/jobs/[id]` - Get job by ID
- `POST /api/jobs` - Create a new job (requires auth)
- `PUT /api/jobs/[id]` - Update a job (requires auth, owner/admin only)
- `DELETE /api/jobs/[id]` - Delete a job (requires auth, owner/admin only)
- `POST /api/jobs/[id]/apply` - Apply to a job (requires auth)
- `GET /api/jobs/[id]/apply` - Get applications for a job (requires auth, owner/admin only)

## Documentation

- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - Complete API documentation for Postman testing
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database setup and configuration guide

## License

MIT

