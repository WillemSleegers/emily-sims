"use client"

import { useRef, useEffect } from "react"

export type AnimationLoopOptions = {
  enabled?: boolean
}

export const useAnimationLoop = (
  callback: (deltaTime: number) => void,
  options: AnimationLoopOptions = {}
) => {
  const { enabled = true } = options

  const animationId = useRef(0)
  const callbackRef = useRef(callback)
  const lastCallTime = useRef(0)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    const animate = (timestamp: number) => {
      // Handle first frame
      if (lastCallTime.current === 0) {
        lastCallTime.current = timestamp
        animationId.current = requestAnimationFrame(animate)
        return
      }

      // Bounds check deltaTime (clamp between 0-100ms)
      const deltaTime = Math.max(
        0,
        Math.min(timestamp - lastCallTime.current, 100)
      )

      callbackRef.current(deltaTime)
      lastCallTime.current = timestamp
      animationId.current = requestAnimationFrame(animate)
    }

    // Initialize timing and start animation
    lastCallTime.current = 0
    animationId.current = requestAnimationFrame(animate)

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current)
        animationId.current = 0
      }
    }
  }, [enabled])

  return {
    stop: () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current)
        animationId.current = 0
      }
    },
  }
}
