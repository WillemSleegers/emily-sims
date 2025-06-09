import { useState, useEffect, useRef } from "react"

type FPSCounterProps = {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  updateInterval?: number
  sampleSize?: number
  className?: string
  showDetails?: boolean
  backgroundColor?: string
  visible?: boolean
}

/**
 * Displays real-time FPS counter in any screen corner.
 * Color-coded performance: green (55+), yellow (45+), orange (30+), red (<30).
 *
 * @param position - Corner position for display
 * @param updateInterval - Update interval in milliseconds
 * @param sampleSize - Number of frames to average over
 * @param className - Additional CSS classes
 * @param showDetails - Show min/max/avg statistics
 * @param backgroundColor - Custom background color
 * @param visible - Component visibility
 * @returns JSX element or null if not visible
 */
export const FPSCounter = ({
  position = "top-left",
  updateInterval = 500,
  sampleSize = 60,
  className = "",
  showDetails = false,
  backgroundColor = "rgba(0, 0, 0, 0.8)",
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

  const getPositionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: "fixed",
      zIndex: 9999,
      padding: "8px 12px",
      fontSize: "12px",
      fontFamily: "monospace",
      fontWeight: "bold",
      backgroundColor,
      borderRadius: "4px",
      backdropFilter: "blur(4px)",
      userSelect: "none",
      pointerEvents: "none",
    }

    const offset = "16px"
    switch (position) {
      case "top-left":
        return { ...baseStyles, top: offset, left: offset }
      case "top-right":
        return { ...baseStyles, top: offset, right: offset }
      case "bottom-left":
        return { ...baseStyles, bottom: offset, left: offset }
      case "bottom-right":
        return { ...baseStyles, bottom: offset, right: offset }
      default:
        return { ...baseStyles, top: offset, left: offset }
    }
  }

  const getFpsColor = (): string => {
    if (fps >= 55) return "#00ff00" // Green
    if (fps >= 45) return "#ffff00" // Yellow
    if (fps >= 30) return "#ff8800" // Orange
    return "#ff0000" // Red
  }

  if (!visible) return null

  return (
    <div
      style={{ ...getPositionStyles(), color: getFpsColor() }}
      className={className}
    >
      <div style={{ lineHeight: "1.2" }}>
        <div style={{ fontSize: "14px", fontWeight: "bold" }}>{fps} FPS</div>
        {showDetails && (
          <>
            <div style={{ fontSize: "10px", opacity: 0.8, marginTop: "2px" }}>
              Avg: {avgFps} | Min: {minFps} | Max: {maxFps}
            </div>
            <div style={{ fontSize: "10px", opacity: 0.6 }}>
              Samples: {frameTimesRef.current.length}/{sampleSize}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
