"use client"

import React from 'react'
import CustomButton from './ui/CustomButton'
import { AlertCircle } from 'lucide-react'

interface InvalidChatProps {
  setIsInvalidFormat: (value: boolean) => void;
}

const InvalidChat = ({ setIsInvalidFormat }: InvalidChatProps) => {

  const handleTryAgain = () => {
    setIsInvalidFormat(false);
  }

  return (
    <div className="w-1/2 p-8 flex flex-col items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-4 p-8 bg-[#e8e8e8] border-2 border-black rounded-[0.75em] shadow-[4px_4px_0_0_#000]">
          <AlertCircle size={48} className="text-black" />
          <h2 className="text-2xl font-bold text-black">Invalid Chat Format</h2>
          <p className="text-center text-black">
            Please ensure you're using the WhatsApp chat export format.<br/>
            Example: [26/01/24, 10:30:45 PM] Person: Message
          </p>
          <CustomButton onClick={handleTryAgain}>
            Try Again
          </CustomButton>
        </div>
      </div>
  )
}

export default InvalidChat
