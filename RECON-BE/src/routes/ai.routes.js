import express from 'express';
import OpenAI from 'openai';
import { config } from '../config/index.js';

const router = express.Router();

// Use Groq (free & fast)
const groq = new OpenAI({
  apiKey: config.groqApiKey,
  baseURL: 'https://api.groq.com/openai/v1'
});

// Public endpoint - anyone can ask construction questions
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Free Llama 3.3 model
      messages: [
        {
          role: 'system',
          content: `You are a professional construction and consulting expert. 
          Provide helpful, accurate advice about:
          - Construction planning and timelines
          - Material costs and budgeting
          - Building permits and regulations
          - Home renovation tips
          - Contractor selection
          - Project management
          Keep answers concise, practical, and professional.`
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const answer = completion.choices[0].message.content;

    res.json({
      question,
      answer,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

// Get conversation with context (multi-turn chat)
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const systemMessage = {
      role: 'system',
      content: `You are a professional construction and consulting expert. 
      Provide helpful, accurate advice about construction, renovation, and consulting.`
    };

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500
    });

    res.json({
      response: completion.choices[0].message.content,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

export default router;