"use client"

import React, { useRef, useState } from 'react'
import CustomButton from './CustomButton'
import { ClipboardPaste } from 'lucide-react'
import InvalidChat from '../InvalidChat'
import { useGeminiStore } from '@/store/useGeminiStore'

const TextArea = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isInvalidFormat, setIsInvalidFormat] = useState(false);

  const validateWhatsAppFormat = (text: string) => {
    const regex = /^\[\d{1,2}\/\d{1,2}\/\d{2,4},\s\d{1,2}:\d{2}:\d{2}\s[AP]M\]/;
    return regex.test(text.split('\n')[0]);
  };

  const handleAnalyze = () => {
    const text = textareaRef.current?.value;
    if (!text) return;

    if (!validateWhatsAppFormat(text)) {
      setIsInvalidFormat(true);
      return;
    }
    setIsInvalidFormat(false);

    useGeminiStore.getState().analyzeChat(text);

  }

  async function paste(input: HTMLTextAreaElement | null) {
    if (!input) return;
    const text = await navigator.clipboard.readText();
    input.value = text;
    setIsInvalidFormat(false);
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }

  const handleDragLeave = () => {
    setIsDragging(false);
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/plain' && textareaRef.current) {
      const text = await file.text();
      textareaRef.current.value = text;
      setIsInvalidFormat(false);
    }
  }

  if (isInvalidFormat) {
    return <InvalidChat setIsInvalidFormat={setIsInvalidFormat} />;
  }

  return (
    <div className="w-1/2 p-8 flex flex-col justify-center gap-8">
      <h1 className="text-5xl font-black text-black">
        ChatScope
      </h1>
      
      <div className="relative">
        <textarea 
          ref={textareaRef}
          className={`w-full h-64 p-6 text-lg font-medium bg-[#e8e8e8] border-2 border-black rounded-[0.75em] resize-none shadow-[4px_4px_0_0_#000] transition-all duration-200 focus:outline-none focus:shadow-[2px_2px_0_0_#000] focus:-translate-x-[2px] focus:-translate-y-[2px] focus:bg-[#f5f5f5] text-black ${isDragging ? 'border-dashed border-4' : ''}`}
          placeholder="Paste your chat here or drop a .txt file..."
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
        <div className="absolute top-6 right-4 flex gap-2"> 
          <ClipboardPaste 
            className="cursor-pointer text-black opacity-50 hover:opacity-100 transition-all duration-200 hover:shadow-[2px_2px_0_0_#000] hover:-translate-x-[2px] hover:-translate-y-[2px]"
            onClick={() => paste(textareaRef.current)}
          />
        </div>
      </div>
      
      <CustomButton onClick={handleAnalyze}>
        Analyze Chat
      </CustomButton>
    </div>
  )
}

export default TextArea
