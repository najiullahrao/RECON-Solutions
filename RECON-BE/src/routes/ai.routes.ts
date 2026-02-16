import express from 'express';
import OpenAI from 'openai';
import { config } from '../config/index.js';

const router = express.Router();

const groq = new OpenAI({
  apiKey: config.groqApiKey,
  baseURL: 'https://api.groq.com/openai/v1'
});

router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body as { question?: string };

    if (!question) {
      res.status(400).json({ error: 'Question is required' });
      return;
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
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
        { role: 'user', content: question }
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

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body as { messages?: unknown };

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
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
