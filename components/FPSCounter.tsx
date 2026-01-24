import { useState, useEffect, useRef } from "react"

type FPSCounterProps = {
  updateInterval?: number
  sampleSize?: number
  showDetails?: boolean
  visible?: boolean
}

/**
 * Displays real-time FPS counter.
 * Color-coded performance: green (55+), yellow (45+), orange (30+), red (<30).
 *
 * @param updateInterval - Update interval in milliseconds
 * @param sampleSize - Number of frames to average over
 * @param showDetails - Show min/max/avg statistics
 * @param visible - Component visibility
 * @returns JSX element or null if not visible
 */
export const FPSCounter = ({
  updateInterval = 500,
  sampleSize = 60,
  showDetails = false,
  visible = true,
}: FPSCounterProps) => {
  const [fps, setFps] = useState<number>(0)
  const [minFps, setMinFps] = useState<number>(0)
  const [maxFps, setMaxFps] = useState<number>(0)
  const [avgFps, setAvgFps] = useState<number>(0)

  const frameTimesRef = useRef<number[]>([])
  const lastFrameTimeRef = useRef<number>(0)
  const animationIdRef = useRef<number>(0)
  const lastUpdateRef = useRef<number>(0)

  useEffect(() => {
    const measureFPS = (currentTime: number): void => {
      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = currentTime
        animationIdRef.current = requestAnimationFrame(measureFPS)
        return
      }

      const deltaTime = currentTime - lastFrameTimeRef.current
      lastFrameTimeRef.current = currentTime

      if (deltaTime > 0) {
        const currentFPS = 1000 / deltaTime
        frameTimesRef.current.push(currentFPS)

        if (frameTimesRef.current.length > sampleSize) {
          frameTimesRef.current.shift()
        }
      }

      // Update display at specified interval
      if (currentTime - lastUpdateRef.current >= updateInterval) {
        const frameTimes = frameTimesRef.current

        if (frameTimes.length > 0) {
          const avgFPS =
            frameTimes.reduce((sum, fps) => sum + fps, 0) / frameTimes.length
          const minFPS = Math.min(...frameTimes)
          const maxFPS = Math.max(...frameTimes)

          setFps(Math.round(avgFPS))
          setAvgFps(Math.round(avgFPS))
          setMinFps(Math.round(minFPS))
          setMaxFps(Math.round(maxFPS))
        }

        lastUpdateRef.current = currentTime
      }

      animationIdRef.current = requestAnimationFrame(measureFPS)
    }

    animationIdRef.current = requestAnimationFrame(measureFPS)

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [updateInterval, sampleSize])

  const getFpsColor = (): string => {
    if (fps >= 55) return "#00ff00"
    if (fps >= 45) return "#ffff00"
    if (fps >= 30) return "#ff8800"
    return "#ff0000"
  }

  if (!visible) return null

  return (
    <div
      className="px-3 py-1 rounded font-mono text-sm font-bold"
      style={{ color: getFpsColor() }}
    >
      {fps} FPS
      {showDetails && (
        <div style={{ fontSize: "10px", opacity: 0.8 }}>
          Avg: {avgFps} | Min: {minFps} | Max: {maxFps}
        </div>
      )}
    </div>
  )
}
