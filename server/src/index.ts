import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initDB, getState, saveState } from './db';
import { authenticate, requireAdmin } from './middleware';
import pool from './db';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' })); // Increase limit for potentially large state

app.get('/health', (req, res) => {
  res.send({ status: 'ok' });
});

// Authentication endpoints
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email und Passwort sind erforderlich' });
    }

    // Check if user already exists
    const [existing]: any[] = await (await import('./db')).default.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Benutzer existiert bereits' });
    }

    // Generate user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate a simple token (in production, use JWT or similar)
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

    // Store user with hashed password (for now, storing plaintext - should use bcrypt in production)
    await (await import('./db')).default.query(
      'INSERT INTO users (id, email, password, token, state_json) VALUES (?, ?, ?, ?, ?)',
      [userId, email, password, token, '{}']
    );

    console.log(`User registered: ${email} with ID: ${userId}`);
    res.json({ token, userId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registrierung fehlgeschlagen' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email und Passwort sind erforderlich' });
    }

    // Find user by email
    const [rows]: any[] = await (await import('./db')).default.query(
      'SELECT id, password, token FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
    }

    const user = rows[0];

    // Check password (in production, use bcrypt.compare)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
    }

    console.log(`User logged in: ${email} with ID: ${user.id}`);
    res.json({ token: user.token, userId: user.id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Anmeldung fehlgeschlagen' });
  }
});

// Get state for a user
app.get('/state/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const state = await getState(userId);
        if (state) {
            res.json(state);
        } else {
            // If user does not exist, return an empty object to let the client initialize
            res.json({});
        }
    } catch (error) {
        console.error('Error getting state:', error);
        res.status(500).send({ error: 'Failed to get state.' });
    }
});

// Save state for a user
app.post('/state/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const state = req.body;
        await saveState(userId, state);
        res.send({ status: 'ok' });
    } catch (error) {
        console.error('Error saving state:', error);
        res.status(500).send({ error: 'Failed to save state.' });
    }
});

// Proxy for OpenAI API
app.post('/generate', async (req, res) => {
    const { prompt, schema } = req.body;

    if (!prompt) {
        return res.status(400).send({ error: 'Prompt is required.' });
    }

    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OpenAI API key is not configured on the server.");
        }

        const model = 'gpt-4o-mini';
        const url = 'https://api.openai.com/v1/chat/completions';

        console.log(`Calling OpenAI API with model: ${model}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        if (!text) {
            throw new Error('No text returned from OpenAI API');
        }

        console.log('Content generated successfully');
        res.send({ text });

    } catch (error: any) {
        console.error('Error generating content via proxy:', error);
        res.status(500).send({
            error: 'Failed to generate content.',
            details: error.message
        });
    }
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

// Get all users (admin only)
app.get('/api/admin/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const [users]: any[] = await pool.query(
      'SELECT id, email, is_admin, push_token, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(users.map((user: any) => ({
      id: user.id,
      email: user.email,
      isAdmin: user.is_admin === 1 || user.is_admin === true,
      pushToken: user.push_token,
      createdAt: user.created_at
    })));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Benutzer' });
  }
});

// Delete user (admin only)
app.delete('/api/admin/users/:userId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user?.id) {
      return res.status(400).json({ message: 'Du kannst dich nicht selbst löschen' });
    }

    const [result]: any = await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    res.json({ message: 'Benutzer erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Fehler beim Löschen des Benutzers' });
  }
});

// Toggle admin status (admin only)
app.patch('/api/admin/users/:userId/admin', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;

    // Prevent admin from removing their own admin status
    if (userId === req.user?.id && !isAdmin) {
      return res.status(400).json({ message: 'Du kannst dir nicht selbst die Admin-Rechte entziehen' });
    }

    const [result]: any = await pool.query(
      'UPDATE users SET is_admin = ? WHERE id = ?',
      [isAdmin ? 1 : 0, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    res.json({ message: 'Admin-Status erfolgreich aktualisiert' });
  } catch (error) {
    console.error('Error updating admin status:', error);
    res.status(500).json({ message: 'Fehler beim Aktualisieren des Admin-Status' });
  }
});

// Get all prompts (admin only)
app.get('/api/admin/prompts', authenticate, requireAdmin, async (req, res) => {
  try {
    const [prompts]: any[] = await pool.query(
      'SELECT id, name, category, template, created_at, updated_at FROM prompts ORDER BY category, name'
    );

    res.json(prompts.map((prompt: any) => ({
      id: prompt.id,
      name: prompt.name,
      category: prompt.category,
      template: prompt.template,
      createdAt: prompt.created_at,
      updatedAt: prompt.updated_at
    })));
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Prompts' });
  }
});

// Create new prompt (admin only)
app.post('/api/admin/prompts', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, category, template } = req.body;

    if (!name || !category || !template) {
      return res.status(400).json({ message: 'Name, Kategorie und Template sind erforderlich' });
    }

    const promptId = `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await pool.query(
      'INSERT INTO prompts (id, name, category, template) VALUES (?, ?, ?, ?)',
      [promptId, name, category, template]
    );

    res.json({
      id: promptId,
      message: 'Prompt erfolgreich erstellt'
    });
  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(500).json({ message: 'Fehler beim Erstellen des Prompts' });
  }
});

// Update prompt (admin only)
app.patch('/api/admin/prompts/:promptId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { promptId } = req.params;
    const { name, category, template } = req.body;

    if (!name || !category || !template) {
      return res.status(400).json({ message: 'Name, Kategorie und Template sind erforderlich' });
    }

    const [result]: any = await pool.query(
      'UPDATE prompts SET name = ?, category = ?, template = ? WHERE id = ?',
      [name, category, template, promptId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Prompt nicht gefunden' });
    }

    res.json({ message: 'Prompt erfolgreich aktualisiert' });
  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({ message: 'Fehler beim Aktualisieren des Prompts' });
  }
});

// Delete prompt (admin only)
app.delete('/api/admin/prompts/:promptId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { promptId } = req.params;

    const [result]: any = await pool.query('DELETE FROM prompts WHERE id = ?', [promptId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Prompt nicht gefunden' });
    }

    res.json({ message: 'Prompt erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({ message: 'Fehler beim Löschen des Prompts' });
  }
});

// Send broadcast notification (admin only)
app.post('/api/admin/notifications/broadcast', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Titel und Nachricht sind erforderlich' });
    }

    // Get all users with push tokens
    const [users]: any[] = await pool.query(
      'SELECT push_token FROM users WHERE push_token IS NOT NULL AND push_token != ""'
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Keine Benutzer mit Push-Token gefunden' });
    }

    // Prepare Expo push notifications
    const messages = users
      .map((user: any) => user.push_token)
      .filter((token: string) => token && token.startsWith('ExponentPushToken'))
      .map((token: string) => ({
        to: token,
        sound: 'default',
        title: title,
        body: body,
        data: { type: 'admin_broadcast' },
      }));

    if (messages.length === 0) {
      return res.status(400).json({ message: 'Keine gültigen Push-Token gefunden' });
    }

    // Send notifications to Expo Push API
    const chunks = chunkArray(messages, 100); // Expo allows max 100 notifications per request

    for (const chunk of chunks) {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });

      if (!response.ok) {
        console.error('Error sending push notifications:', await response.text());
      }
    }

    res.json({
      message: 'Benachrichtigungen erfolgreich gesendet',
      count: messages.length
    });
  } catch (error) {
    console.error('Error sending broadcast notification:', error);
    res.status(500).json({ message: 'Fehler beim Senden der Benachrichtigung' });
  }
});

// Update user's push token
app.post('/api/users/:userId/push-token', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { pushToken } = req.body;

    // Ensure user can only update their own push token
    if (userId !== req.user?.id) {
      return res.status(403).json({ message: 'Keine Berechtigung' });
    }

    await pool.query(
      'UPDATE users SET push_token = ? WHERE id = ?',
      [pushToken, userId]
    );

    res.json({ message: 'Push-Token erfolgreich aktualisiert' });
  } catch (error) {
    console.error('Error updating push token:', error);
    res.status(500).json({ message: 'Fehler beim Aktualisieren des Push-Tokens' });
  }
});

// Helper function to chunk array
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Setup endpoint to make a user admin (use this once to bootstrap)
app.post('/setup/make-admin', async (req, res) => {
  try {
    const { email, setupKey } = req.body;

    // Simple protection - require a setup key
    if (setupKey !== process.env.SETUP_KEY && setupKey !== 'wichtel-setup-2024') {
      return res.status(403).json({ message: 'Ungültiger Setup-Key' });
    }

    const [result]: any = await pool.query(
      'UPDATE users SET is_admin = 1 WHERE email = ?',
      [email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    res.json({ message: `${email} ist jetzt Administrator` });
  } catch (error) {
    console.error('Error making user admin:', error);
    res.status(500).json({ message: 'Fehler beim Admin-Setup' });
  }
});

initDB().then(() => {
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
});
