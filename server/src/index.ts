import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initDB, getState, saveState } from './db';

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



initDB().then(() => {
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
});
