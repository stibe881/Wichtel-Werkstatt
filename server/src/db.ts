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
        is_admin BOOLEAN DEFAULT FALSE,
        push_token VARCHAR(512),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        state_json JSON NOT NULL
      );
    `);

    // Migration: Add columns if they don't exist
    try {
      // Check for is_admin column
      const [isAdminCol]: any[] = await connection.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_admin';
      `);

      if (isAdminCol.length === 0) {
        await connection.query(`ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;`);
        console.log('is_admin column added successfully');
      }

      // Check for push_token column
      const [pushTokenCol]: any[] = await connection.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'push_token';
      `);

      if (pushTokenCol.length === 0) {
        await connection.query(`ALTER TABLE users ADD COLUMN push_token VARCHAR(512);`);
        console.log('push_token column added successfully');
      }

      // Check for created_at column
      const [createdAtCol]: any[] = await connection.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'created_at';
      `);

      if (createdAtCol.length === 0) {
        await connection.query(`ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
        console.log('created_at column added successfully');
      }
    } catch (alterError: any) {
      console.error('Error adding columns:', alterError);
    }

    // Create prompts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS prompts (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        template TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Insert default prompts if table is empty
    const [promptCount]: any[] = await connection.query('SELECT COUNT(*) as count FROM prompts');
    if (promptCount[0].count === 0) {
      await connection.query(`
        INSERT INTO prompts (id, name, category, template) VALUES
        ('default_normal', 'Standard Wichtel-Idee', 'normal', 'Generiere eine kreative Idee für den Elf on the Shelf für Tag {day}. Die Idee sollte lustig, familienfreundlich und einfach umsetzbar sein.'),
        ('default_arrival', 'Wichtel-Ankunft', 'arrival', 'Generiere eine herzliche Begrüßungsidee für die Ankunft des Elf on the Shelf. Die Idee sollte magisch und besonders sein.'),
        ('default_departure', 'Wichtel-Abschied', 'departure', 'Generiere eine liebevolle Abschiedsidee für den Elf on the Shelf zum Ende der Weihnachtszeit. Die Idee sollte emotional und unvergesslich sein.');
      `);
      console.log('Default prompts inserted successfully');
    }

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
