import dotenv from "dotenv";
import pg from "pg";

const { Pool } = pg;

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  database: process.env.PGDATABASE || 'data_solutions_project',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
});

export default pool;
