"use client"

import { useEffect, useState } from "react"

export function CountdownTimer({ endDate }: { endDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const difference = endDate.getTime() - now.getTime()

      if (difference <= 0) {
        clearInterval(timer)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  return (
    <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-amber-800">
      <div className="flex flex-col items-center">
        <span className="font-semibold">{timeLeft.days}</span>
        <span className="text-[10px] text-amber-600">Dias</span>
      </div>
      <span>:</span>
      <div className="flex flex-col items-center">
        <span className="font-semibold">{timeLeft.hours.toString().padStart(2, "0")}</span>
        <span className="text-[10px] text-amber-600">Horas</span>
      </div>
      <span>:</span>
      <div className="flex flex-col items-center">
        <span className="font-semibold">{timeLeft.minutes.toString().padStart(2, "0")}</span>
        <span className="text-[10px] text-amber-600">Min</span>
      </div>
      <span>:</span>
      <div className="flex flex-col items-center">
        <span className="font-semibold">{timeLeft.seconds.toString().padStart(2, "0")}</span>
        <span className="text-[10px] text-amber-600">Seg</span>
      </div>
    </div>
  )
}
