import React from 'react'
import SplineScene from '../components/SplineScene'
import TextArea from '@/components/ui/TextArea'

const page = () => {
  return (
    <div className="flex h-screen bg-[rgba(242,158,192)]">
      
      <div className="w-1/2 hidden lg:block">
        <SplineScene />
      </div>

      <TextArea />

    </div>
  )
}

export default page