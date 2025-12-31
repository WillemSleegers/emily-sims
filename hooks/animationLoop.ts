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
  const previousTimestamp = useRef(0)

  // Update the ref whenever callback changes so we always call the latest version
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    const animate = (timestamp: number) => {
      // Skip callback on first frame (no previous timestamp to calculate delta from)
      if (previousTimestamp.current !== 0) {
        // Clamp deltaTime to max 100ms to prevent physics explosions when tab loses focus
        const deltaTime = Math.min(timestamp - previousTimestamp.current, 100)
        callbackRef.current(deltaTime)
      }

      // Store current timestamp for next frame's delta calculation
      previousTimestamp.current = timestamp

      // Queue next frame to keep the loop running
      animationId.current = requestAnimationFrame(animate)
    }

    // Reset timestamp
    previousTimestamp.current = 0

    // Start the animation loop
    animationId.current = requestAnimationFrame(animate)

    // Cleanup: cancel animation when effect re-runs or component unmounts
    return () => cancelAnimationFrame(animationId.current)
  }, [enabled])

  return {
    stop: () => cancelAnimationFrame(animationId.current),
  }
}
