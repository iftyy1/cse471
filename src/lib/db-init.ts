import pool from './db';
import { hashPassword } from './auth';

// Initialize database tables
export async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new columns to users table if they don't exist
    try {
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`);
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`);
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE`);
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS sheerid_verification_id VARCHAR(255)`);
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS requested_role VARCHAR(50)`);
    } catch (e) {
      console.log('Columns bio, avatar_url, is_verified, sheerid_verification_id, or requested_role might already exist or error adding them', e);
    }

    // Create jobs table
    await client.query(`
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
      )
    `);

    // Create applications table
    await client.query(`
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
      )
    `);

    // Create posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        type VARCHAR(50) DEFAULT 'post'
      )
    `);

    // Add type column to posts table if it doesn't exist
    try {
      await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'post'`);
    } catch (e) {
      console.log('Column type might already exist in posts table', e);
    }

    // Create comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create post_likes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (post_id, user_id)
      )
    `);

    // Create tournaments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tournaments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        organizer VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        date_range VARCHAR(255) NOT NULL,
        registration_deadline DATE NOT NULL,
        prize_pool VARCHAR(255) NOT NULL,
        max_participants INTEGER NOT NULL,
        description TEXT NOT NULL,
        rules TEXT[],
        tags TEXT[],
        status VARCHAR(50) NOT NULL DEFAULT 'Upcoming',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tournament_participants table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tournament_participants (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        participant_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'registered',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tournament_id, user_id)
      )
    `);

    // Create tutors table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tutors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subjects TEXT[] NOT NULL,
        hourly_rate INTEGER NOT NULL,
        year VARCHAR(255) NOT NULL,
        headline TEXT NOT NULL,
        description TEXT NOT NULL,
        mode VARCHAR(50) NOT NULL,
        availability VARCHAR(255) NOT NULL,
        achievements TEXT[],
        contact_email VARCHAR(255) NOT NULL,
        sessions_hosted INTEGER DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0,
        max_students INTEGER NOT NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tutor_students table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tutor_students (
        id SERIAL PRIMARY KEY,
        tutor_id INTEGER REFERENCES tutors(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        student_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'registered',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tutor_id, user_id)
      )
    `);

    // Create marketplace_listings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS marketplace_listings (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        course VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        condition VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        delivery_options TEXT[],
        description TEXT NOT NULL,
        highlights TEXT[],
        contact_email VARCHAR(255) NOT NULL,
        preview_pages INTEGER DEFAULT 0,
        seller_name VARCHAR(255) NOT NULL,
        seller_year VARCHAR(255) NOT NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create lost_found_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS lost_found_items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'Lost' or 'Found'
        location VARCHAR(255) NOT NULL,
        date_lost_found DATE NOT NULL,
        image_url TEXT,
        contact_info VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Open', -- 'Open', 'Resolved'
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create projects table (Showcase)
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        tags TEXT[],
        link VARCHAR(255),
        github VARCHAR(255),
        image VARCHAR(255),
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create lost_found_comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS lost_found_comments (
        id SERIAL PRIMARY KEY,
        item_id INTEGER REFERENCES lost_found_items(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create bookings table (Tutor Sessions)
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        tutor_id INTEGER NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        student_name TEXT,
        start_time TIMESTAMPTZ,
        duration_minutes INTEGER,
        hourly_rate NUMERIC(10,2),
        total NUMERIC(10,2),
        status VARCHAR(50) DEFAULT 'pending',
        meet_link TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Create indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_lost_found_items_type ON lost_found_items(type)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_lost_found_comments_item_id ON lost_found_comments(item_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON tournament_participants(tournament_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tournament_participants_user_id ON tournament_participants(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tutor_students_tutor_id ON tutor_students(tutor_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tutor_students_user_id ON tutor_students(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_marketplace_listings_type ON marketplace_listings(type)');

    // Create default admin user if not exists
    const adminEmail = 'admin@studenthub.com';
    const adminCheck = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await hashPassword('admin123');
      await client.query(`
        INSERT INTO users (name, email, password, role, is_verified)
        VALUES ($1, $2, $3, $4, $5)
      `, ['System Admin', adminEmail, hashedPassword, 'admin', true]);
      console.log('Default admin user created: admin@studenthub.com / admin123');
    }

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}


