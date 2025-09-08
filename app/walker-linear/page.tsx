"use client"

import { useRef, useState, MouseEvent } from "react"

import {
  Walker,
  createWalker,
  drawWalker,
  updateWalkerMovement,
  move,
} from "@/lib/sims/walkers/walker-linear"

import { useCanvasAnimation } from "@/hooks/useAnimatedCanvas"
import { createVector } from "@/lib/utils-vector"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import {
  Rabbit,
  Turtle,
  Zap,
  Droplets,
  Flame,
  Flower2,
  Leaf,
  Cherry,
} from "lucide-react"

type SpeedOption = "slow" | "medium" | "fast"
type HueRange =
  | "blueGreen"
  | "redOrange"
  | "purplePink"
  | "yellowGreen"
  | "orangeRed"

const speedValues: Record<SpeedOption, number> = {
  slow: 25,
  medium: 50,
  fast: 100,
}

const generateWalkerHue = (hueRange: HueRange): number => {
  let baseHue: number

  switch (hueRange) {
    case "blueGreen":
      baseHue = 180 // Blue to green (180-240°)
      break
    case "redOrange":
      baseHue = 0 // Red to orange (0-60°)
      break
    case "purplePink":
      baseHue = 300 // Purple to pink (300-360°)
      break
    case "yellowGreen":
      baseHue = 60 // Yellow to green (60-120°)
      break
    case "orangeRed":
      baseHue = 330 // Orange-red to red (330-30°, wrapping around)
      break
    default:
      baseHue = 180
  }

  return Math.floor(Math.random() * 60) + baseHue // 60° analogous range
}

const WalkerLinearPage = () => {
  const walkers = useRef<Walker[]>([])
  const [selectedSpeed, setSelectedSpeed] = useState<SpeedOption>("medium")
  const [selectedHueRange, setSelectedHueRange] =
    useState<HueRange>("blueGreen")

  const handleUpdate = (deltaTime: number) => {
    const size = getSize()
    walkers.current.forEach((walker) => {
      updateWalkerMovement(walker, size.width, size.height)
      move(walker, deltaTime)
    })
  }

  const handleDraw = (ctx: CanvasRenderingContext2D) => {
    const size = getSize()
    ctx.clearRect(0, 0, size.width, size.height)
    walkers.current.forEach((walker) => drawWalker(ctx, walker))
  }

  const { canvasRef, getSize } = useCanvasAnimation(handleUpdate, handleDraw)

  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault()

    const x = event.nativeEvent.offsetX
    const y = event.nativeEvent.offsetY

    const position = createVector(x, y)
    const hue = generateWalkerHue(selectedHueRange)

    const newWalker = createWalker(
      position,
      speedValues[selectedSpeed],
      5, // radius
      40, // maxTailLength
      true,
      hue
    )

    walkers.current.push(newWalker)
  }

  return (
    <div className="h-dvh p-4 flex flex-col gap-2 select-none">
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-between">
        <h1 className="font-semibold text-2xl whitespace-nowrap">
          Walkers (linear)
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <Button
              variant={selectedSpeed === "slow" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSpeed("slow")}
              className="px-3"
            >
              <Turtle className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedSpeed === "medium" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSpeed("medium")}
              className="px-3"
            >
              <Rabbit className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedSpeed === "fast" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSpeed("fast")}
              className="px-3"
            >
              <Zap className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-1">
            <Button
              variant={selectedHueRange === "blueGreen" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedHueRange("blueGreen")}
              className="px-3"
              title="Blue-Green Ocean"
            >
              <Droplets className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedHueRange === "redOrange" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedHueRange("redOrange")}
              className="px-3"
              title="Red-Orange Fire"
            >
              <Flame className="h-4 w-4" />
            </Button>
            <Button
              variant={
                selectedHueRange === "purplePink" ? "default" : "outline"
              }
              size="sm"
              onClick={() => setSelectedHueRange("purplePink")}
              className="px-3"
              title="Purple-Pink Flowers"
            >
              <Flower2 className="h-4 w-4" />
            </Button>
            <Button
              variant={
                selectedHueRange === "yellowGreen" ? "default" : "outline"
              }
              size="sm"
              onClick={() => setSelectedHueRange("yellowGreen")}
              className="px-3"
              title="Yellow-Green Nature"
            >
              <Leaf className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedHueRange === "orangeRed" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedHueRange("orangeRed")}
              className="px-3"
              title="Orange-Red Sunset"
            >
              <Cherry className="h-4 w-4" />
            </Button>
          </div>

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

export default WalkerLinearPage
