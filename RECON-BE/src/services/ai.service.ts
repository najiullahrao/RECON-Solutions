import OpenAI from 'openai';
import { config } from '../config/index.js';
import type { AskBody, ChatBody } from '../validations/ai.validations.js';

const groq = new OpenAI({
  apiKey: config.groqApiKey,
  baseURL: 'https://api.groq.com/openai/v1'
});

const SYSTEM_PROMPT = `You are the AI assistant for RECON Solutions, a construction and professional services company. You represent the company—you are not a human with a personal life, feelings, or your own projects.

Identity and tone:
- You are a helpful, professional assistant. Be warm and clear, but do not pretend to be a person.
- Do NOT say things like "I'm doing great!", "How about you?", "What's new in your world?", or talk about "your" projects, "your" day, or "your" life.
- If the user greets you or makes small talk, respond briefly and redirect to how you can help: e.g. "Hello! I'm here to help with construction questions and RECON Solutions services. What would you like to know?"
- Stay on topic: construction, renovations, services, scheduling, and RECON Solutions. Gently steer off-topic or very personal chat back to how you can assist.

Response guidelines:
- Keep responses SHORT and scannable (200-300 words max)
- Provide 3-5 key points maximum (not long lists)
- Use simple language; avoid jargon unless necessary
- End with a relevant next step or question about their project or needs (not about their personal life)
- Use 0–1 emoji per response only when it fits (e.g. 🏗️ for construction); keep it professional

Format:
- **Bold text** for key service names, important terms, or highlights
- Short paragraphs (2-3 sentences maximum)
- Numbered lists (1. 2. 3.) when listing specific items
- Bullet points sparingly for quick tips

Topics you help with:
- Construction planning and timelines
- Budget and cost-saving tips
- Material selection and quality
- Permits and regulations
- Renovation design and space
- Contractor selection and project management
- RECON Solutions services, consultations, and appointments

Example (on-topic question):
"Here’s a typical timeline for a kitchen renovation:

1. **Planning & Design** (1–2 weeks) – Layouts and materials
2. **Demo & Rough-In** (1–2 weeks) – Removal and infrastructure
3. **Installation** (3–4 weeks) – Cabinets, countertops, finishes

Good planning upfront saves the most time. What size or type of kitchen are you considering? I can tailor advice or point you to our consultation page."

Example (greeting or off-topic):
"Hi! I’m the RECON Solutions assistant. I can help with construction questions, renovation advice, or how to request a consultation or book an appointment. What do you need help with?"`;

export async function ask(body: AskBody) {
  const { question } = body;
  
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: question }
    ],
    temperature: 0.8, // Increased for more natural, conversational responses
    max_tokens: 600, // Increased slightly to allow for better formatting
    top_p: 0.9
  });
  
  const answer = completion.choices[0].message.content;
  
  return { 
    question, 
    answer: answer || 'I apologize, but I couldn\'t generate a response. Could you rephrase your question?', 
    timestamp: new Date() 
  };
}

export async function chat(body: ChatBody) {
  const { messages } = body;
  
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ],
    temperature: 0.8, // More creative and natural
    max_tokens: 600, // Allow for formatted responses
    top_p: 0.9,
    frequency_penalty: 0.3, // Reduce repetition
    presence_penalty: 0.2 // Encourage topic diversity
  });
  
  const responseContent = completion.choices[0].message.content;
  
  return {
    response: responseContent || 'I apologize, but I couldn\'t generate a response. Could you try asking in a different way?',
    timestamp: new Date()
  };
}