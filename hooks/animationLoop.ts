"use client"

import { useRef, useEffect } from "react"

export type AnimationLoopOptions = {
  fps?: number
  enabled?: boolean
}

export const useAnimationLoop = (
  callback: (deltaTime: number) => void,
  options: AnimationLoopOptions = {}
) => {
  const { fps = 60, enabled = true } = options

  const animationId = useRef(0)
  const callbackRef = useRef(callback)
  const lastCallTime = useRef(0)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    const targetInterval = 1000 / fps // Target time between calls

    const animate = (timestamp: number) => {
      if (timestamp - lastCallTime.current >= targetInterval) {
        const deltaTime = timestamp - lastCallTime.current
        callbackRef.current(deltaTime)
        lastCallTime.current = timestamp
      }

      animationId.current = requestAnimationFrame(animate)
    }

    // Initialize
    lastCallTime.current = performance.now()
    animationId.current = requestAnimationFrame(animate)

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current)
        animationId.current = 0
      }
    }
  }, [fps, enabled])

  return {
    stop: () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current)
        animationId.current = 0
      }
    },
  }
}
