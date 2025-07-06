import { Pool } from 'pg';

let pool: Pool | null = null;

export async function getDb() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  
  return {
    query: async (text: string, params?: unknown[]) => {
      const client = await pool!.connect();
      try {
        const result = await client.query(text, params);
        return result;
      } finally {
        client.release();
      }
    },
    end: async () => {
      if (pool) {
        await pool.end();
        pool = null;
      }
    }
  };
}
