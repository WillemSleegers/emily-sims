import { useCallback, useEffect, useState } from "react"

// Manages an app-level "fullscreen" mode that hides the nav bar,
// letting the canvas fill the viewport. Exit via Escape key or
// the floating exit button rendered by the page.
export const useAppFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const enterFullscreen = useCallback(() => setIsFullscreen(true), [])
  const exitFullscreen = useCallback(() => setIsFullscreen(false), [])
  const toggleFullscreen = useCallback(
    () => setIsFullscreen((prev) => !prev),
    []
  )

  // Listen for Escape key to exit fullscreen
  useEffect(() => {
    if (!isFullscreen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen])

  return { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen }
}
