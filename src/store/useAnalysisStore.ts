import { create } from 'zustand';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

interface Analysis {
  participants: {
    person1: string;
    person2: string;
  };
  moodMetrics: {
    happy: number;
    neutral: number;
    sad: number;
  };
  relationshipMetrics: {
    compatibility: number;
    tension: number;
    redFlags: number;
    greenFlags: number;
  };
  conversationFlow: {
    dryTexting: number;
    excitementLevel: number;
    mutualInterest: number;
  };
  responseTime: {
    average: string;
    fastest: string;
    slowest: string;
  };
  emojiStats: Array<{ emoji: string; count: number }>;
  petNames: Array<string>;
  debates: Array<{ topic: string; intensity: number }>;
  insideJokes: Array<string>;
  compliments: Array<{ from: string; to: string; text: string }>;
  memoryLane: Array<{ date: string; event: string }>;
  wordCloud: Array<{ word: string; frequency: number }>;
  apologies: Array<{ from: string; to: string; reason: string }>;
  media: {
    gifs: number;
    images: number;
    videos: number;
  };
}

interface AnalysisStore {
  analysis: Analysis | null;
  isLoading: boolean;
  error: string | null;
  analyzeChat: (text: string) => Promise<void>;
}

const ANALYSIS_PROMPT = `Analyze this WhatsApp chat conversation and provide insights in the following JSON format. Make the analysis fun and engaging:
{
  "participants": {"person1": "name1", "person2": "name2"},
  "moodMetrics": {"happy": 0-100, "neutral": 0-100, "sad": 0-100},
  "relationshipMetrics": {
    "compatibility": 0-100,
    "tension": 0-100,
    "redFlags": number,
    "greenFlags": number
  },
  "conversationFlow": {
    "dryTexting": 0-100,
    "excitementLevel": 0-100,
    "mutualInterest": 0-100
  },
  "responseTime": {
    "average": "time",
    "fastest": "time",
    "slowest": "time"
  },
  "emojiStats": [{"emoji": "emoji", "count": number}],
  "petNames": ["name1", "name2"],
  "debates": [{"topic": "topic", "intensity": 0-100}],
  "insideJokes": ["joke1", "joke2"],
  "compliments": [{"from": "name", "to": "name", "text": "compliment"}],
  "memoryLane": [{"date": "date", "event": "event"}],
  "wordCloud": [{"word": "word", "frequency": number}],
  "apologies": [{"from": "name", "to": "name", "reason": "reason"}],
  "media": {"gifs": number, "images": number, "videos": number}
}

Make sure to extract real names from the chat. Be creative with the analysis while maintaining accuracy.`;

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  analysis: null,
  isLoading: false,
  error: null,
  analyzeChat: async (text: string) => {
    try {
      set({ isLoading: true, error: null, analysis: null });
      
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent([ANALYSIS_PROMPT, text].join('\n\n'));
      const response = await result.response;
      const analysisText = response.text();
      
      // Clean the response text to ensure valid JSON
      const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      
      try {
        const analysis = JSON.parse(cleanedText) as Analysis;
        set({ analysis, isLoading: false });
      } catch (parseError) {
        console.error('Failed to parse JSON:', cleanedText);
        throw new Error('Failed to parse analysis results');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze chat';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
})); 