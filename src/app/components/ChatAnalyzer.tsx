'use client'

import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
// import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// import { LineChart, Line } from '@mui/x-charts';
import { PieChart as MuiPieChart } from '@mui/x-charts';
import Squares from './Squares';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

const THEME = {
  colors: {
    primary: '#FFB5DA', // Pastel pink
    secondary: '#FFE8F6', // Light pink
    accent: '#6C63FF', // Fun purple
    text: '#2D2D2D', // Dark text
    textSecondary: '#4A5568', // Secondary text color
    background: '#FFF0F9',
    yellow: '#FFE66D',
    green: '#4ECDC4',
    red: '#FF6B6B'
  }
};

const ANALYSIS_PROMPT = `Analyze this conversation and return ONLY a JSON object (no markdown formatting, no backticks) with the following structure:

{
  "textingStyles": {
    "person1": {
      "enthusiasm": number between 0-100,
      "responseTime": number,
      "emojiUsage": number between 0-100,
      "emojiStats": [
        { "emoji": "😊", "count": number },
        { "emoji": "❤️", "count": number },
        { "emoji": "😂", "count": number },
        { "emoji": "🥰", "count": number },
        { "emoji": "😍", "count": number }
      ],
      "textLength": "short/medium/long",
      "ghostingScore": number between 0-100
    },
    "person2": {
      "enthusiasm": number between 0-100,
      "responseTime": number,
      "emojiUsage": number between 0-100,
      "emojiStats": [
        { "emoji": "😊", "count": number },
        { "emoji": "❤️", "count": number },
        { "emoji": "😂", "count": number },
        { "emoji": "🥰", "count": number },
        { "emoji": "😍", "count": number }
      ],
      "textLength": "short/medium/long",
      "ghostingScore": number between 0-100
    }
  },
  "moodMetrics": {
    "happy": number between 0-100,
    "neutral": number between 0-100,
    "sad": number between 0-100
  },
  "relationshipMetrics": {
    "compatibilityScore": number between 0-100,
    "breakupProbability": number between 0-100,
    "banterLevel": number between 0-100,
    "flirtScore": number between 0-100,
    "redFlags": number between 0-10,
    "greenFlags": number between 0-10
  },
  "conversationFlow": {
    "dryTexting": number between 0-100,
    "excitementLevel": number between 0-100,
    "mutualInterest": number between 0-100,
    "topicVariety": number between 0-100
  },
  "funStats": {
    "whoTextedFirst": "person1" or "person2",
    "whoSendsMoreEmojis": "person1" or "person2",
    "whoGhostsMore": "person1" or "person2",
    "whoIsMoreClingy": "person1" or "person2"
  }
}

Important: Return ONLY the JSON object, with no markdown formatting or backticks. Ensure all numbers are actual numbers, not strings.`;

export default function ChatAnalyzer() {
  const [chatText, setChatText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: Loading, 3: Results
  const [formatError, setFormatError] = useState(false);

  console.log(analysis);

  const validateWhatsAppFormat = (text: string) => {
    // Check for WhatsApp timestamp format: [DD/MM/YY, HH:mm:ss]
    const lines = text.split('\n');
    const timestampRegex = /^\[\d{2}\/\d{2}\/\d{2},\s\d{1,2}:\d{2}:\d{2}\s[AP]M\]/;
    
    // Check first few lines to determine format
    const firstFewLines = lines.slice(0, Math.min(5, lines.length));
    const hasValidFormat = firstFewLines.some(line => timestampRegex.test(line));
    
    return hasValidFormat;
  };

  const analyzeChat = async () => {
    if (!chatText.trim()) return;

    // Check format first
    if (!validateWhatsAppFormat(chatText)) {
      setFormatError(true);
      return;
    }

    setFormatError(false);
    try {
      setStep(2);
      setLoading(true);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(ANALYSIS_PROMPT + "\n\nChat transcript:\n" + chatText);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response text
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      
      try {
        const parsedData = JSON.parse(cleanedText);
        setStep(3);
        setAnalysis(parsedData);
      } catch (jsonError) {
        console.error('Failed to parse JSON:', cleanedText);
        setAnalysis({ error: 'Invalid response format' });
        setStep(1);
      }
    } catch (error) {
      console.error('API Error:', error);
      setAnalysis(null);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const renderInputStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div 
        className="relative p-8 rounded-3xl backdrop-blur-lg"
        style={{ background: 'rgba(255, 240, 249, 0.8)' }}
      >
        {/* Fun decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 -translate-y-12 translate-x-8">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" fill={THEME.colors.yellow} opacity="0.2" />
            <path d="M30,50 Q50,20 70,50" stroke={THEME.colors.accent} fill="none" strokeWidth="3" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-24 h-24 translate-y-8 -translate-x-4">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect x="20" y="20" width="60" height="60" fill={THEME.colors.primary} opacity="0.3" rx="15" />
            <circle cx="50" cy="50" r="20" fill={THEME.colors.accent} opacity="0.2" />
          </svg>
        </div>

        <div className="relative z-10">
          <h2 
            className="text-5xl font-bold text-center mb-6"
            style={{ 
              color: THEME.colors.text,
              fontFamily: '"Space Grotesk", sans-serif'
            }}
          >
            Chat Vibes
            <span className="block text-2xl mt-2 text-[#6C63FF]">Relationship Analyzer</span>
          </h2>

          <div className="max-w-xl mx-auto">
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg relative overflow-hidden"
              whileHover={{ scale: 1.01 }}
            >
              {/* Decorative scribbles */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path d="M20,50 Q40,20 60,50 T100,50" stroke={THEME.colors.accent} fill="none" strokeWidth="3" />
                  <path d="M20,70 Q40,40 60,70 T100,70" stroke={THEME.colors.primary} fill="none" strokeWidth="3" />
                </svg>
              </div>

              <textarea
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                className="w-full h-64 bg-[#F8F9FC]/90 backdrop-blur-sm rounded-xl p-6 text-lg focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all"
                style={{ 
                  fontFamily: '"Space Grotesk", sans-serif',
                  resize: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                }}
                placeholder="Paste your WhatsApp chat here..."
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={analyzeChat}
                disabled={loading || !chatText.trim()}
                className="mt-6 w-full bg-[#6C63FF] text-white py-4 rounded-xl text-lg font-semibold shadow-lg disabled:opacity-50 relative overflow-hidden group"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              >
                <span className="relative z-10">Analyze Relationship</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#6C63FF] to-[#8B7FFF] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            </motion.div>

            {/* Fun illustrations */}
            <div className="mt-12 flex justify-center gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FFE8F6]/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">💝</span>
                </div>
                <p className="text-sm text-[#6C63FF]">Relationship Score</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FFE8F6]/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">🎯</span>
                </div>
                <p className="text-sm text-[#6C63FF]">Compatibility</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FFE8F6]/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">✨</span>
                </div>
                <p className="text-sm text-[#6C63FF]">Magic Moments</p>
              </div>
            </div>
          </div>
        </div>
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
      <div className="relative w-40 h-40 mx-auto mb-8">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/80 to-purple-500/80 backdrop-blur-sm"
        />
        <div className="absolute inset-2 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
          <span className="text-4xl">💝</span>
        </div>
      </div>
      <h3 className="text-3xl font-bold mb-4 text-gray-800">
        Analyzing Your Chat
      </h3>
      <p className="text-lg text-purple-600">
        Discovering your unique connection patterns ✨
      </p>
    </motion.div>
  );

  const renderAnalysisWidget = (title: string, icon: string, children: React.ReactNode) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, rotate: Math.random() * 2 - 1 }}
      className="relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#FF6B6B]/50 backdrop-blur-sm rounded-3xl transform rotate-1"></div>
      <div className="absolute inset-0 bg-[#FFE66D]/50 backdrop-blur-sm rounded-3xl transform -rotate-1"></div>
      <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl z-10">
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full transform translate-x-16 -translate-y-16"
          style={{
            background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.2) 0%, rgba(255, 230, 109, 0.2) 100%)',
            backdropFilter: 'blur(8px)'
          }}
        ></div>
        <div className="flex items-center gap-3 mb-6">
          <motion.span 
            className="text-3xl"
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {icon}
          </motion.span>
          <h3 
            className="text-xl font-bold text-[#2D334A]" 
            style={{ fontFamily: '"Comic Sans MS", cursive' }}
          >
            {title}
          </h3>
        </div>
        <div className="relative z-10 text-[#2D334A]">
          {children}
        </div>
      </div>
    </motion.div>
  );

  const ProgressBar = ({ value, color }: { value: number, color: string }) => (
    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        className={`h-full ${color}`}
        style={{
          background: `linear-gradient(90deg, ${color} 0%, ${color}88 100%)`,
          boxShadow: `0 0 10px ${color}66`
        }}
      />
    </div>
  );

  const renderAnalysisStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full py-8 px-4"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 230, 109, 0.05) 0%, rgba(78, 205, 196, 0.05) 100%)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mood Matcher Widget */}
        {renderAnalysisWidget("Mood Matcher", "🎭", (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[#2D334A] font-medium">Happy</span>
              <div className="w-32">
                <ProgressBar value={analysis?.moodMetrics?.happy ?? 0} color="#4ECDC4" />
              </div>
              <span className="ml-2 text-sm font-bold text-[#2D334A]">
                {analysis?.moodMetrics?.happy ?? 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#2D334A] font-medium">Neutral</span>
              <div className="w-32">
                <ProgressBar value={analysis?.moodMetrics?.neutral ?? 0} color="#4ECDC4" />
              </div>
              <span className="ml-2 text-sm font-bold text-[#2D334A]">
                {analysis?.moodMetrics?.neutral ?? 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#2D334A] font-medium">Sad</span>
              <div className="w-32">
                <ProgressBar value={analysis?.moodMetrics?.sad ?? 0} color="#4ECDC4" />
              </div>
              <span className="ml-2 text-sm font-bold text-[#2D334A]">
                {analysis?.moodMetrics?.sad ?? 0}%
              </span>
            </div>
          </div>
        ))}

        {/* Response Time Widget */}
        {renderAnalysisWidget("Response Time", "⚡️", (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
              <div className="text-2xl font-bold text-[#2D334A]">
                {analysis?.textingStyles?.person1?.responseTime ?? 0}m
              </div>
            </div>
            <p className="text-sm text-[#4A5568]">Average Response Time</p>
          </div>
        ))}

        {/* Emoji Battle Widget */}
        {renderAnalysisWidget("Emoji Battle", "🎯", (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-xl">😊</div>
              <div className="flex-1 mx-3">
                <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
                  />
                </div>
              </div>
              <span className="text-sm">
                {analysis?.textingStyles?.person1?.emojiUsage ?? 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-xl">❤️</div>
              <div className="flex-1 mx-3">
                <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '45%' }}
                    className="h-full bg-gradient-to-r from-red-400 to-red-600"
                  />
                </div>
              </div>
              <span className="text-sm">
                {analysis?.textingStyles?.person1?.emojiUsage ?? 0}%
              </span>
            </div>
          </div>
        ))}

        {/* Silent Treatment Detector */}
        {renderAnalysisWidget("Ghost Mode", "👻", (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {analysis?.textingStyles?.person1?.ghostingScore ?? 0}h
              </div>
              <p className="text-sm text-[#4A5568]">Longest Gap</p>
            </div>
            <div className="flex justify-center gap-2 text-sm">
              <span className="px-3 py-1 rounded-full bg-white/10">
                Person 1: {analysis?.textingStyles?.person1?.ghostingScore ?? 0}h
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10">
                Person 2: {analysis?.textingStyles?.person2?.ghostingScore ?? 0}h
              </span>
            </div>
          </div>
        ))}

        {/* Conversation Energy */}
        {renderAnalysisWidget("Energy Levels", "⚡️", (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span>High Energy</span>
              </div>
              <span>{analysis?.conversationFlow?.excitementLevel ?? 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span>Medium</span>
              </div>
              <span>30%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span>Low Energy</span>
              </div>
              <span>20%</span>
            </div>
          </div>
        ))}

        {/* Conversation Balance */}
        {renderAnalysisWidget("Chat Balance", "⚖️", (
          <div className="space-y-4">
            <div className="h-4 bg-gray-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                className="h-full bg-gradient-to-r from-blue-400 to-purple-600"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>Person 1: 60%</span>
              <span>Person 2: 40%</span>
            </div>
          </div>
        ))}

        {/* Pet Names Widget */}
        {renderAnalysisWidget("Pet Names", "🐻", (
          <div className="space-y-4">
            <div className="text-center bg-white/5 rounded-xl p-4">
              <div className="text-3xl font-bold mb-2">
                {analysis?.petNames?.total ?? 0}
              </div>
              <p className="text-sm text-[#4A5568]">Total Pet Names Used</p>
            </div>
            <div className="flex justify-around text-sm">
              <div className="text-center">
                <div className="font-bold">{analysis?.petNames?.person1Count ?? 0}</div>
                <div className="text-[#4A5568]">Person 1</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{analysis?.petNames?.person2Count ?? 0}</div>
                <div className="text-[#4A5568]">Person 2</div>
              </div>
            </div>
          </div>
        ))}

        {/* Debate Tracker */}
        {renderAnalysisWidget("Debate Tracker", "⚔️", (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-green-500/20 rounded-lg p-3">
                <div className="text-2xl font-bold">{analysis?.debates?.resolved ?? 0}</div>
                <div className="text-sm text-[#4A5568]">Resolved</div>
              </div>
              <div className="text-center bg-red-500/20 rounded-lg p-3">
                <div className="text-2xl font-bold">{analysis?.debates?.unresolved ?? 0}</div>
                <div className="text-sm text-[#4A5568]">Pending</div>
              </div>
            </div>
          </div>
        ))}

        {/* Inside Jokes */}
        {renderAnalysisWidget("Inside Jokes", "", (
          <div className="space-y-3">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold">{analysis?.insideJokes?.count ?? 0}</div>
              <p className="text-sm text-[#4A5568]">Shared Jokes</p>
            </div>
            <div className="space-y-2">
              {analysis?.insideJokes?.examples?.map((joke: string, index: number) => (
                <div key={index} className="bg-white/5 rounded-lg p-2 text-sm text-[#4A5568]">
                  "{joke}"
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Compliment Meter */}
        {renderAnalysisWidget("Compliment Meter", "🥰", (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Person 1</span>
              <div className="w-32 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis?.compliments?.person1 ?? 0}%` }}
                  className="h-full bg-gradient-to-r from-pink-400 to-pink-600"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Person 2</span>
              <div className="w-32 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis?.compliments?.person2 ?? 0}%` }}
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Memory Lane */}
        {renderAnalysisWidget("Memory Lane", "📸", (
          <div className="space-y-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-sm text-[#4A5568]">First Message</div>
              <div className="font-medium">{analysis?.memoryLane?.firstMessage ?? 'N/A'}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-sm text-[#4A5568]">Special Moments</div>
              <div className="space-y-2 mt-2">
                {analysis?.memoryLane?.specialMoments?.map((moment: string, index: number) => (
                  <div key={index} className="text-sm text-[#4A5568]">• {moment}</div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Word Cloud */}
        {renderAnalysisWidget("Common Words", "🌥️", (
          <div className="flex flex-wrap gap-2">
            {analysis?.wordCloud?.map((word: { text: string, size: number }, index: number) => (
              <div
                key={index}
                className="bg-white/10 rounded-full px-3 py-1"
                style={{ fontSize: `${Math.max(0.8, word.size / 20)}rem` }}
              >
                {word.text}
              </div>
            ))}
          </div>
        ))}

        {/* Apology Tracker */}
        {renderAnalysisWidget("Apology Tracker", "", (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{analysis?.apologies?.person1 ?? 0}</div>
                <div className="text-sm text-[#4A5568]">Person 1</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{analysis?.apologies?.person2 ?? 0}</div>
                <div className="text-sm text-[#4A5568]">Person 2</div>
              </div>
            </div>
            <div className="text-sm text-[#4A5568] text-center">
              Who says sorry more: {analysis?.apologies?.mostApologetic ?? 'Equal'}
            </div>
          </div>
        ))}

        {/* GIF Champion */}
        {renderAnalysisWidget("Media Share", "🖼️", (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-white/5 rounded-lg p-3">
                <div className="text-xl mb-1">🖼️</div>
                <div className="text-2xl font-bold">{analysis?.media?.images ?? 0}</div>
                <div className="text-sm text-[#4A5568]">Images</div>
              </div>
              <div className="text-center bg-white/5 rounded-lg p-3">
                <div className="text-xl mb-1">📱</div>
                <div className="text-2xl font-bold">{analysis?.media?.gifs ?? 0}</div>
                <div className="text-sm text-[#4A5568]">GIFs</div>
              </div>
            </div>
          </div>
        ))}

        {/* Emoji Usage */}
        {renderAnalysisWidget("Emoji Usage", "😊", (
          <div className="h-[200px] w-full">
            <MuiPieChart
              series={[
                {
                  data: [
                    ...(analysis?.textingStyles?.person1?.emojiStats?.map((stat: any, index: number) => ({
                      id: index,
                      value: stat.count,
                      label: stat.emoji,
                    })) ?? []),
                    ...(analysis?.textingStyles?.person2?.emojiStats?.map((stat: any, index: number) => ({
                      id: index + 5,
                      value: stat.count,
                      label: stat.emoji,
                    })) ?? [])
                  ].filter(item => item.value > 0),
                  highlightScope: { faded: 'global', highlighted: 'item' },
                  faded: { innerRadius: 30, additionalRadius: -30 },
                  arcLabel: (params) => `${params.label} (${params.value})`,
                },
              ]}
              slotProps={{
                legend: {
                  direction: 'row',
                  position: { vertical: 'bottom', horizontal: 'middle' },
                  padding: 0,
                },
              }}
              height={200}
              margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
            />
            <div className="text-center text-sm mt-2 text-[#4A5568]">
              Most Used Emojis
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderFormatError = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="relative bg-[#FF6B6B] rounded-3xl p-8 shadow-xl transform -rotate-1">
        <div className="absolute inset-0 bg-[#FFE66D] rounded-3xl transform rotate-2 -z-10"></div>
        <div className="text-center mb-8">
          <motion.div 
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="text-6xl mb-4 inline-block"
          >
            😅
          </motion.div>
          <h2 
            className="text-3xl font-bold text-[#2D334A] mb-2" 
            style={{ fontFamily: '"Comic Sans MS", cursive' }}
          >
            Oopsie! Wrong Format
          </h2>
          <p 
            className="text-[#4A5568] text-lg"
            style={{ fontFamily: '"Comic Sans MS", cursive' }}
          >
            Let's get your chat in the right shape! ✨
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 space-y-3">
            <p 
              className="text-[#4A5568] text-lg mb-3" 
              style={{ fontFamily: '"Comic Sans MS", cursive' }}
            >
              ✨ Your messages should look like this:
            </p>
            <div className="bg-black/20 rounded-xl p-4 space-y-2">
              <code className="block text-[#4ECDC4] text-sm font-mono">
                [17/01/25, 10:12:01 PM] Person1: Hello!
              </code>
              <code className="block text-[#4ECDC4] text-sm font-mono">
                [17/01/25, 10:13:45 PM] Person2: Hi there!
              </code>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
            <p 
              className="text-[#4A5568] text-lg mb-4" 
              style={{ fontFamily: '"Comic Sans MS", cursive' }}
            >
              🎯 Quick Steps:
            </p>
            <ol 
              className="space-y-3 text-[#4A5568]"
              style={{ fontFamily: '"Comic Sans MS", cursive' }}
            >
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 bg-[#4ECDC4] rounded-full flex items-center justify-center text-[#4A5568] font-bold">1</span>
                Open WhatsApp chat
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 bg-[#4ECDC4] rounded-full flex items-center justify-center text-[#4A5568] font-bold">2</span>
                Tap the ⋮ menu
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 bg-[#4ECDC4] rounded-full flex items-center justify-center text-[#4A5568] font-bold">3</span>
                Select "Export chat"
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 bg-[#4ECDC4] rounded-full flex items-center justify-center text-[#4A5568] font-bold">4</span>
                Choose "Without media"
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 bg-[#4ECDC4] rounded-full flex items-center justify-center text-[#4A5568] font-bold">5</span>
                Copy everything!
              </li>
            </ol>
          </div>
        </div>

        <div className="flex justify-center mt-8 gap-4">
          <motion.button
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFormatError(false)}
            className="bg-[#4ECDC4] text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg transform hover:shadow-xl transition-all"
            style={{ fontFamily: '"Comic Sans MS", cursive' }}
          >
            Try Again!
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="relative w-full min-h-screen">
      {/* Background Squares */}
      <div className="fixed inset-0 z-0">
        <Squares 
          speed={0.5} 
          squareSize={40}
          direction='diagonal'
          borderColor='rgba(255, 255, 255, 0.1)'
          hoverFillColor='rgba(108, 99, 255, 0.2)'
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {formatError && renderFormatError()}
          {!formatError && step === 1 && renderInputStep()}
          {!formatError && step === 2 && renderLoadingStep()}
          {!formatError && step === 3 && renderAnalysisStep()}
        </AnimatePresence>
      </div>
    </div>
  );
} 