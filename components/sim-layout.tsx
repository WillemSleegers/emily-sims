"use client"

import { useAppFullscreen } from "@/hooks/useAppFullscreen"
import { cn } from "@/lib/utils"
import { ArrowLeft, Maximize, Minimize, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { ReactNode } from "react"
import { FPSCounter } from "./fps-counter"
import { Button } from "./ui/button"

type SimLayoutProps = {
  title: string
  children?: ReactNode
  controls?: ReactNode
  fullscreen?: boolean
  showFPS?: boolean
}

export const SimLayout = ({
  title,
  children,
  controls,
  fullscreen = false,
  showFPS = false,
}: SimLayoutProps) => {
  const { theme, setTheme } = useTheme()
  const { isFullscreen, toggleFullscreen } = useAppFullscreen()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div
      className={cn(
        "h-dvh flex flex-col transition-all duration-300 ease-in-out",
        isFullscreen ? "p-0 gap-0" : "p-4 gap-2",
      )}
    >
      <nav
        className={cn(
          "flex items-center gap-4 justify-between flex-wrap overflow-hidden transition-all duration-300 ease-in-out",
          isFullscreen ? "max-h-0 opacity-0" : "max-h-20 opacity-100",
        )}
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="font-semibold text-2xl whitespace-nowrap">{title}</h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {controls}

          {showFPS && <FPSCounter />}

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <Sun className="hidden dark:block" />
            <Moon className="block dark:hidden" />
          </Button>

          {fullscreen && (
            <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
              <Maximize />
            </Button>
          )}
        </div>
      </nav>

      <div
        className={cn(
          "min-h-0 grow transition-all duration-300 ease-in-out",
          isFullscreen
            ? "border-transparent rounded-none"
            : "border border-foreground rounded",
        )}
      >
        {children}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleFullscreen}
        className={cn(
          "fixed top-4 right-4 z-50 transition-opacity duration-300 ease-in-out",
          isFullscreen
            ? "opacity-50 hover:opacity-100"
            : "opacity-0 pointer-events-none",
        )}
      >
        <Minimize />
      </Button>
    </div>
  )
}
