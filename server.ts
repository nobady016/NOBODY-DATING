import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI instance safely
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ----------------------------------------------------
// AI API Routes (Server-side Gemini 3.6 Flash)
// ----------------------------------------------------

// 1. AI Bio Generator
app.post('/api/ai/bio', async (req, res) => {
  try {
    const { keywords, relationshipGoal, interests, tone } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        bios: [
          `Lover of deep talks and late-night adventures. Looking for ${relationshipGoal || 'something real'}. Let's get coffee and see where the vibe takes us! ☕✨`,
          `Passionate about ${interests?.slice(0, 2).join(' & ') || 'good conversations'}. Sarcastic, ambitious, and looking for my partner in crime. 🚀`,
          `Seeking genuine connection, genuine laughs, and someone to share spontaneous road trips with. ${keywords || ''}`
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Generate 3 distinct, engaging, creative dating app bios for a profile with:
Keywords: ${keywords || 'adventurous, coffee lover, tech enthusiast'}
Relationship Goal: ${relationshipGoal || 'Looking for something serious'}
Interests: ${interests?.join(', ') || 'Travel, Music, Fitness'}
Tone: ${tone || 'Witty, authentic, attractive'}

Return a JSON array of 3 bio strings.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    const bios = JSON.parse(response.text || '[]');
    res.json({ bios });
  } catch (err: any) {
    console.error('Error generating AI Bio:', err);
    res.status(500).json({ error: 'Failed to generate bio' });
  }
});

// 2. AI Icebreakers
app.post('/api/ai/icebreaker', async (req, res) => {
  try {
    const { matchName, matchBio, matchInterests, matchJob, tone } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        icebreakers: [
          `Hey ${matchName || 'there'}! I noticed you like ${matchInterests?.[0] || 'music'} — what's your current #1 repeated track? 🎵`,
          `Hi ${matchName || 'there'}! Your bio caught my eye. On a scale of 1 to 10, how adventurous are you this weekend? ✨`,
          `Two options for our first chat: Coffee debates or spontaneous travel stories? You choose! ☕✈️`
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Generate 3 clever, non-cringe dating icebreaker openers for opening a message with ${matchName || 'a match'}.
Profile Bio: ${matchBio || 'No bio'}
Interests: ${matchInterests?.join(', ') || 'Coffee, Travel'}
Job/Hobby: ${matchJob || 'Creative'}
Tone Requested: ${tone || 'Flirty, humorous, engaging'}

Return a JSON array of 3 string pickup lines/openers.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    const icebreakers = JSON.parse(response.text || '[]');
    res.json({ icebreakers });
  } catch (err: any) {
    console.error('Error generating Icebreaker:', err);
    res.status(500).json({ error: 'Failed to generate icebreakers' });
  }
});

// 3. AI Compatibility Score & Analysis
app.post('/api/ai/compatibility', async (req, res) => {
  try {
    const { userProfile, matchProfile } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        score: 92,
        reasons: [
          'Shared passion for spontaneous travel & outdoor activities',
          'Aligned long-term relationship expectations',
          'Matching communication rhythm & creative hobbies'
        ],
        vibeSummary: 'High energy alignment! You both value authenticity, active lifestyle, and deep conversations.'
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Analyze compatibility between two dating profiles for NOBADY app:

User Profile: ${JSON.stringify(userProfile)}
Match Profile: ${JSON.stringify(matchProfile)}

Provide:
1. score (number between 75 and 99)
2. reasons (array of 3 short key bullet strings highlighting shared traits or complementary chemistry)
3. vibeSummary (1 concise, exciting sentence describing their romantic vibe)

Return strictly valid JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            reasons: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            vibeSummary: { type: Type.STRING }
          },
          required: ['score', 'reasons', 'vibeSummary']
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (err: any) {
    console.error('Error generating compatibility:', err);
    res.status(500).json({ error: 'Failed to calculate compatibility' });
  }
});

// 4. Toxic Message Moderation
app.post('/api/ai/moderate', async (req, res) => {
  try {
    const { message } = req.body;
    const ai = getAIClient();

    if (!ai || !message) {
      return res.json({ safe: true, toxicityScore: 0.05, warningReason: null });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Analyze this dating app chat message for toxicity, harassment, sexually explicit non-consensual language, or aggressive spam:

Message: "${message}"

Return JSON object:
{
  "safe": boolean,
  "toxicityScore": number (0.0 to 1.0),
  "warningReason": string or null
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safe: { type: Type.BOOLEAN },
            toxicityScore: { type: Type.NUMBER },
            warningReason: { type: Type.STRING }
          },
          required: ['safe', 'toxicityScore']
        },
      },
    });

    const result = JSON.parse(response.text || '{"safe": true, "toxicityScore": 0}');
    res.json(result);
  } catch (err: any) {
    console.error('Error in message moderation:', err);
    res.json({ safe: true, toxicityScore: 0.0, warningReason: null });
  }
});

// ----------------------------------------------------
// Vite Dev Server / Static Hosting Integration
// ----------------------------------------------------

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NOBADY Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
