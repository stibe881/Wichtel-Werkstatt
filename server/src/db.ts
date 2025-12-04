import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wichtel_werkstatt',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const initDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to database');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        token VARCHAR(255),
        state_json JSON NOT NULL
      );
    `);

    // For simplicity, we'll use a single row with a static ID to store the state.
    // In a real multi-user app, this ID would be linked to a user.
    await connection.query(`
      INSERT IGNORE INTO users (id, state_json) VALUES ('default_user', '{}');
    `);

    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

export const getState = async (userId: string): Promise<any> => {
  const [rows]: any[] = await pool.query('SELECT state_json FROM users WHERE id = ?', [userId]);
  if (rows.length > 0) {
    const stateJson = rows[0].state_json;
    // Parse JSON string if it's a string, otherwise return as-is
    return typeof stateJson === 'string' ? JSON.parse(stateJson) : stateJson;
  }
  return null;
};

export const saveState = async (userId: string, state: any): Promise<void> => {
  const stateJson = JSON.stringify(state);
  // This will insert a new row if the userId doesn't exist, or update the existing one if it does.
  await pool.query(
    'INSERT INTO users (id, state_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE state_json = ?',
    [userId, stateJson, stateJson]
  );
};

export default pool;
