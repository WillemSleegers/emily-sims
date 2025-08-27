"use client"

import { useRef, MouseEvent, useState } from "react"

import {
  Walker,
  createWalker,
  drawWalker,
  handleEdgeCollision,
  updateWalkerMovement,
  move,
  MovementMode,
} from "@/lib/sims/walker"

import { useCanvasAnimation } from "@/hooks/useAnimatedCanvas"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SettingsIcon, LineSquiggleIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Description } from "@/components/ui/description"
import { createVector } from "@/lib/utils-vector"
import { ModeToggle } from "@/components/mode-toggle"

const LinearIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line
      x1="2"
      y1="14"
      x2="14"
      y2="2"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
)

const SineIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 8 2 6.5 3 5.5 4 4.8 5 4.5 6 4.8 7 5.5 8 6.5 9 8 10 9.5 11 10.5 12 11.2 13 11.5 14 11.2 15 10.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
)

const RandomPage = () => {
  const walkers = useRef<Walker[]>([])

  const [mode, setMode] = useState<MovementMode>("linear")

  const handleUpdate = (deltaTime: number) => {
    const size = getSize()
    walkers.current.forEach((walker) => {
      handleEdgeCollision(walker, size.width, size.height, true)
      updateWalkerMovement(walker, deltaTime, size.width, size.height)
      move(walker, deltaTime)
    })
  }

  const handleDraw = (ctx: CanvasRenderingContext2D) => {
    walkers.current.forEach((walker) => drawWalker(ctx, walker))
  }

  const { canvasRef, getSize } = useCanvasAnimation(handleUpdate, handleDraw)

  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault()

    const x = event.nativeEvent.offsetX
    const y = event.nativeEvent.offsetY

    const position = createVector(x, y)

    const newWalker = createWalker(position, { mode: mode })
    walkers.current.push(newWalker)
  }

  return (
    <div className="h-dvh p-4 flex flex-col gap-2 select-none">
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-between">
        <h1 className="font-semibold text-2xl whitespace-nowrap">Walkers</h1>
        <div className="flex items-center gap-4">
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(value) => {
              if (value) setMode(value as MovementMode)
            }}
            className="gap-1"
          >
            <ToggleGroupItem value="linear" aria-label="Linear movement">
              <LinearIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="sine" aria-label="Sine wave movement">
              <SineIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="noise" aria-label="Noise-based movement">
              <LineSquiggleIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost">
                <SettingsIcon />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>
                  Here you can change how the walker behaves.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label>Current Mode: {mode}</Label>
                <Description>
                  Use the toggle buttons above to change movement mode.
                </Description>
              </div>
              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <ModeToggle />
        </div>
      </div>
      <div className="min-h-0 min-w-0 grow">
        <canvas
          ref={canvasRef}
          className="border border-primary rounded w-full h-full touch-none"
          onMouseDown={handleMouseDown}
        />
      </div>
    </div>
  )
}

export default RandomPage
