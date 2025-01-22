'use client'

import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

const ANALYSIS_PROMPT = `Analyze this conversation and return ONLY a JSON object (no additional text or markdown) with the following structure:

{
  "sentiment": {
    "positive": number between 0-100,
    "negative": number between 0-100,
    "neutral": number between 0-100
  },
  "emojiAnalysis": [
    { "emoji": "emoji character", "count": number }
  ],
  "wordStats": {
    "totalWords": number,
    "uniqueWords": number,
    "averageMessageLength": number
  },
  "topWords": [
    { "word": "string", "count": number }
  ],
  "compatibility": {
    "score": number between 0-100,
    "reasons": ["string"]
  },
  "interactionPatterns": {
    "responseTime": "string",
    "conversationStyle": "string",
    "engagementLevel": "string"
  },
  "summary": {
    "mainTopics": ["string"],
    "keyInsights": ["string"],
    "recommendations": ["string"]
  }
}

Important: Return ONLY the JSON object, with no additional text or explanation. Ensure all numbers are actual numbers, not strings.`;

export default function ChatAnalyzer() {
  const [chatText, setChatText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: Loading, 3: Results

  const analyzeChat = async () => {
    if (!chatText.trim()) return;

    try {
      setStep(2); // Show loading
      setLoading(true);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(ANALYSIS_PROMPT + "\n\nChat transcript:\n" + chatText);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.trim().replace(/```json\n?|\n?```/g, '');
      
      try {
        const parsedData = JSON.parse(cleanedText);
        const defaultAnalysis = {
          sentiment: { positive: 0, negative: 0, neutral: 0 },
          emojiAnalysis: [],
          wordStats: { totalWords: 0, uniqueWords: 0, averageMessageLength: 0 },
          topWords: [],
          compatibility: { score: 0, reasons: [] },
          interactionPatterns: {
            responseTime: '',
            conversationStyle: '',
            engagementLevel: ''
          },
          summary: { mainTopics: [], keyInsights: [], recommendations: [] }
        };

        setAnalysis({ ...defaultAnalysis, ...parsedData });
        setStep(3); // Show results
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Received text:', cleanedText);
        setAnalysis(null);
        setStep(1); // Back to input on error
      }
    } catch (error) {
      console.error('API Error:', error);
      setAnalysis(null);
      setStep(1); // Back to input on error
    } finally {
      setLoading(false);
    }
  };

  const renderInputStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-xl"
    >
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Chat Analysis</h2>
      <p className="text-gray-300 mb-8 text-center">
        Paste your conversation below to get detailed insights and analytics
      </p>
      <motion.textarea
        whileFocus={{ scale: 1.01 }}
        value={chatText}
        onChange={(e) => setChatText(e.target.value)}
        className="w-full h-64 bg-gray-700/50 text-white rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Paste your chat conversation here..."
      />
      <div className="flex justify-center mt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={analyzeChat}
          disabled={loading || !chatText.trim()}
          className="bg-purple-600 text-white px-12 py-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-lg font-semibold"
        >
          Analyze Chat
        </motion.button>
      </div>
    </motion.div>
  );

  const renderLoadingStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-xl mx-auto text-center py-20"
    >
      <div className="relative w-32 h-32 mx-auto mb-8">
        <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-purple-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <h3 className="text-2xl font-semibold mb-4">Analyzing Your Conversation</h3>
      <p className="text-gray-400">
        Our AI is processing your chat to extract meaningful insights...
      </p>
    </motion.div>
  );

  const renderAnalysisStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Analysis Results</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setStep(1);
            setChatText('');
            setAnalysis(null);
          }}
          className="bg-gray-700/50 text-white px-6 py-2 rounded-lg hover:bg-gray-600/50 transition-colors"
        >
          New Analysis
        </motion.button>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Sentiment Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl"
        >
          <h3 className="text-xl font-semibold mb-4">Sentiment Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Positive', value: analysis.sentiment.positive },
                    { name: 'Negative', value: analysis.sentiment.negative },
                    { name: 'Neutral', value: analysis.sentiment.neutral },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analysis.sentiment && Object.values(analysis.sentiment).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Word Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl"
        >
          <h3 className="text-xl font-semibold mb-4">Word Statistics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analysis.topWords?.slice(0, 5)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="word" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Compatibility Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl"
        >
          <h3 className="text-xl font-semibold mb-4">Compatibility Score</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{analysis.compatibility?.score}%</span>
              </div>
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  className="text-gray-700"
                  strokeWidth="12"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                />
                <circle
                  className="text-purple-500"
                  strokeWidth="12"
                  strokeDasharray={351.86}
                  strokeDashoffset={351.86 - (351.86 * analysis.compatibility?.score) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                />
              </svg>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            {analysis.compatibility?.reasons.map((reason: string, index: number) => (
              <li key={index} className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                {reason}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Emoji Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl"
        >
          <h3 className="text-xl font-semibold mb-4">Emoji Usage</h3>
          <div className="grid grid-cols-2 gap-4">
            {analysis.emojiAnalysis?.map((emoji: any, index: number) => (
              <div key={index} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                <span className="text-2xl">{emoji.emoji}</span>
                <span className="font-semibold">{emoji.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Key Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl col-span-2"
        >
          <h3 className="text-xl font-semibold mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Main Topics</h4>
              <ul className="space-y-2">
                {analysis.summary?.mainTopics.map((topic: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {analysis.summary?.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <AnimatePresence mode="wait">
        {step === 1 && renderInputStep()}
        {step === 2 && renderLoadingStep()}
        {step === 3 && renderAnalysisStep()}
      </AnimatePresence>
    </div>
  );
} 