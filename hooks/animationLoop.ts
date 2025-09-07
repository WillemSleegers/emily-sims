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

  // Track requestAnimationFrame ID so we can cancel it during cleanup
  const animationId = useRef(0)

  // Store callback in ref to prevent stale closures in animation loop
  const callbackRef = useRef(callback)
  const previousTimestamp = useRef(0)

  // Update callback ref whenever callback changes to avoid stale closures
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    const animate = (timestamp: number) => {
      // Handle first frame
      if (previousTimestamp.current === 0) {
        previousTimestamp.current = timestamp
        animationId.current = requestAnimationFrame(animate)
        return
      }

      // Use Math.max to ensure deltaTime is never negative (protects against timing quirks)
      const deltaTime = Math.max(0, timestamp - previousTimestamp.current)

      callbackRef.current(deltaTime)
      previousTimestamp.current = timestamp
      animationId.current = requestAnimationFrame(animate)
    }

    // Initialize timing and start animation
    previousTimestamp.current = 0
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
