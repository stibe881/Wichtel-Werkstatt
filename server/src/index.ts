import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Changed package
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

// Debug endpoint to list available models
app.get('/list-models', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("API key is not configured on the server.");
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const models = await genAI.listModels();
        res.json({ models: models.map(m => ({ name: m.name, displayName: m.displayName })) });
    } catch (error: any) {
        console.error('Error listing models:', error);
        res.status(500).send({
            error: 'Failed to list models.',
            details: error.message
        });
    }
});

// Proxy for Gemini API
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
        const genAI = new GoogleGenerativeAI(apiKey);

        // Try multiple model names
        let modelName = "gemini-1.5-flash";
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            res.send({ text });
        } catch (error: any) {
            // If flash fails, try pro
            if (error.message?.includes('404') || error.message?.includes('not found')) {
                console.log('Trying gemini-1.5-pro instead...');
                modelName = "gemini-1.5-pro";
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                res.send({ text });
            } else {
                throw error;
            }
        }

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
