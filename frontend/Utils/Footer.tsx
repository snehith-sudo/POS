import React, { useState, useEffect } from 'react'

const Footer = () => {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    // Set initial time
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString())
    }

    updateTime()

    // Update time every second
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-0 left-0 right-0 flex items-center px-6 py-6 bg-slate-800 border-t h-14">
      <div className="ml-auto text-sm font-bold text-white">
        {time || '--:--:--'}
      </div>
    </div>
  )
}

export default Footer
