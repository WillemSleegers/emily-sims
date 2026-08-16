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

  // These live in refs, not state, because they change on every animation
  // frame (~60 times/second) — state would re-render the component that
  // often instead of just driving the callback.
  const animationId = useRef(0)
  const callbackRef = useRef(callback)
  const previousTimestamp = useRef(0)

  // Callers typically pass a new callback function each render (it closes
  // over the latest sim state). Stashing it in a ref lets the loop below
  // always call the current version without listing `callback` as a
  // dependency — which would otherwise cancel and restart the rAF loop
  // on every render.
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
