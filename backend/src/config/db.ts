import { Pool } from 'pg'

import dotenv from 'dotenv'

dotenv.config()

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

pool.connect((err) => {
  if (err) {
    console.error('Database connection error:', err.message)
  } else {
    console.log('Connected to PostgreSQL')
  }
})
