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

// Proxy for Gemini API using direct REST API call
app.post('/generate', async (req, res) => {
    const { prompt, schema } = req.body;

    if (!prompt) {
        return res.status(400).send({ error: 'Prompt is required.' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("API key is not configured on the server.");
        }

        // Use direct REST API call to v1 endpoint (not v1beta)
        const model = 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

        console.log(`Calling Gemini API with model: ${model}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('No text returned from Gemini API');
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
