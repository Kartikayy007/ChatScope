import { create } from 'zustand';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface GeminiStore {
  isLoading: boolean;
  response: string | null;
  error: string | null;
  analyzeChat: (text: string) => Promise<void>;
}

const PROMPT = `Analyze this chat conversation and provide insights: `;

export const useGeminiStore = create<GeminiStore>((set) => ({
  isLoading: false,
  response: null,
  error: null,
  analyzeChat: async (text: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `${PROMPT} ${text}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      set({ response: response.text(), isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
