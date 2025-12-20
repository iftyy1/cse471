
import pool from '../src/lib/db';

async function updateSchema() {
  const client = await pool.connect();
  try {
    console.log('Updating bookings table schema...');
    
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('Creating bookings table...');
      await client.query(`
        CREATE TABLE bookings (
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
    } else {
      console.log('Altering existing bookings table...');
      
      // Add missing columns
      await client.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES users(id) ON DELETE CASCADE`);
      await client.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meet_link TEXT`);
      
      // Update constraint if needed (not strictly necessary for this simple update)
      // Ensure tutor_id references tutors(id) - complex to check, assuming it might not or might
      // For now, just adding columns is safe.
    }

    console.log('Schema updated successfully.');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

updateSchema();
