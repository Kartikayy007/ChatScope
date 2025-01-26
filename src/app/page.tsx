'use client'

import React from 'react';
import { motion } from "framer-motion";
import ChatAnalyzer from './components/ChatAnalyzer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              AI Assistant
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Chat & Analyze with AI
            </p>
          </motion.div>
        </div>

        <div className="space-y-20">
          <ChatAnalyzer />
        </div>
      </main>
    </div>
  );
}
