import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

async function main() {
  // Create a direct PostgreSQL client
  const sql = postgres(process.env.POSTGRES_URL, { 
    ssl: { rejectUnauthorized: false },
    max: 1 
  });
  
  try {
    console.log('Creating database tables if they don\'t exist...');
    
    // Create the users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'member',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP
      )
    `;
    console.log('Created users table');
    
    // Create the teams table
    await sql`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        stripe_customer_id TEXT UNIQUE,
        stripe_subscription_id TEXT UNIQUE,
        stripe_product_id TEXT,
        plan_name VARCHAR(50),
        subscription_status VARCHAR(20)
      )
    `;
    console.log('Created teams table');
    
    // Create the team_members table
    await sql`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        team_id INTEGER NOT NULL REFERENCES teams(id),
        role VARCHAR(50) NOT NULL,
        joined_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('Created team_members table');
    
    // Create the activity_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        team_id INTEGER NOT NULL REFERENCES teams(id),
        user_id INTEGER REFERENCES users(id),
        action TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        ip_address VARCHAR(45)
      )
    `;
    console.log('Created activity_logs table');
    
    // Create the invitations table
    await sql`
      CREATE TABLE IF NOT EXISTS invitations (
        id SERIAL PRIMARY KEY,
        team_id INTEGER NOT NULL REFERENCES teams(id),
        email VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        invited_by INTEGER NOT NULL REFERENCES users(id),
        invited_at TIMESTAMP NOT NULL DEFAULT NOW(),
        status VARCHAR(20) NOT NULL DEFAULT 'pending'
      )
    `;
    console.log('Created invitations table');
    
    console.log('Database tables created successfully!');
  } catch (error) {
    console.error('Error creating database tables:', error);
  } finally {
    await sql.end();
  }
}

main().catch(console.error); 