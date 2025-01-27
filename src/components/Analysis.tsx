"use client"

import React from 'react'
import { useAnalysisStore } from '@/store/useAnalysisStore'
import { Loader2, AlertCircle } from 'lucide-react'
import CustomButton from './ui/CustomButton'

const Analysis = () => {
  const { analysis, isLoading, error } = useAnalysisStore()

  if (error) {
    return (
      <div className="w-full p-8 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-xl font-bold text-red-500">Analysis Failed</div>
        <div className="text-center text-red-500">{error}</div>
        <CustomButton onClick={() => window.location.reload()}>
          Try Again
        </CustomButton>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
        <div className="text-xl font-bold text-black">Analyzing your chat...</div>
        <div className="text-sm text-black opacity-75">This might take a moment</div>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div className="w-full p-8 grid grid-cols-2 gap-8">
      <div className="col-span-2 bg-[#e8e8e8] p-6 border-2 border-black rounded-[0.75em] shadow-[4px_4px_0_0_#000]">
        <h2 className="text-2xl font-bold mb-4">Mood Analysis</h2>
        <div className="space-y-4">
          {Object.entries(analysis.moodMetrics).map(([mood, value]) => (
            <div key={mood} className="space-y-2">
              <div className="flex justify-between">
                <span className="capitalize">{mood}</span>
                <span>{value}%</span>
              </div>
              <div className="w-full h-4 bg-white rounded-full border-2 border-black">
                <div 
                  className="h-full bg-black rounded-full transition-all duration-500"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#e8e8e8] p-6 border-2 border-black rounded-[0.75em] shadow-[4px_4px_0_0_#000]">
        <h2 className="text-2xl font-bold mb-4">Relationship Health</h2>
        <div className="space-y-4">
          <div className="text-4xl font-black">
            {analysis.relationshipMetrics.compatibility}%
          </div>
          <div className="flex justify-between text-sm">
            <span>🚩 {analysis.relationshipMetrics.redFlags}</span>
            <span>🌟 {analysis.relationshipMetrics.greenFlags}</span>
          </div>
        </div>
      </div>

      <div className="bg-[#e8e8e8] p-6 border-2 border-black rounded-[0.75em] shadow-[4px_4px_0_0_#000]">
        <h2 className="text-2xl font-bold mb-4">Response Time</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Average</span>
            <span>{analysis.responseTime.average}</span>
          </div>
          <div className="flex justify-between">
            <span>Fastest</span>
            <span>{analysis.responseTime.fastest}</span>
          </div>
          <div className="flex justify-between">
            <span>Slowest</span>
            <span>{analysis.responseTime.slowest}</span>
          </div>
        </div>
      </div>

      <div className="col-span-2 bg-[#e8e8e8] p-6 border-2 border-black rounded-[0.75em] shadow-[4px_4px_0_0_#000]">
        <h2 className="text-2xl font-bold mb-4">Inside Jokes</h2>
        <div className="grid grid-cols-2 gap-4">
          {analysis.insideJokes.map((joke, index) => (
            <div key={index} className="p-4 bg-white border-2 border-black rounded-lg">
              "{joke}"
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-2 bg-[#e8e8e8] p-6 border-2 border-black rounded-[0.75em] shadow-[4px_4px_0_0_#000]">
        <h2 className="text-2xl font-bold mb-4">Pet Names</h2>
        <div className="flex flex-wrap gap-4">
          {analysis.petNames.map((name, index) => (
            <div key={index} className="px-4 py-2 bg-white border-2 border-black rounded-full">
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Analysis
