"use client"

import { ArrowLeft, Maximize, Minimize, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { ReactNode, useEffect, useState } from "react"
import { useFullScreenHandle } from "react-full-screen"
import { Button } from "./ui/button"
import { FPSCounter } from "./FPSCounter"

type PageNavProps = {
  title: string
  children?: ReactNode
  fullscreenHandle?: ReturnType<typeof useFullScreenHandle>
  showFPS?: boolean
}

export const PageNav = ({
  title,
  children,
  fullscreenHandle,
  showFPS = false,
}: PageNavProps) => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by waiting for client-side mount before showing theme toggle
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleFullscreen = () => {
    if (!fullscreenHandle) return

    if (fullscreenHandle.active) {
      fullscreenHandle.exit()
    } else {
      fullscreenHandle.enter()
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <nav className="flex items-center gap-4 justify-between flex-wrap">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="font-semibold text-2xl whitespace-nowrap">{title}</h1>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {children}

        {showFPS && <FPSCounter />}

        <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
          {fullscreenHandle?.active ? <Minimize /> : <Maximize />}
        </Button>

        {mounted && (
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
        )}
      </div>
    </nav>
  )
}
