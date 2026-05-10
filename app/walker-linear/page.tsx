"use client"

import { MouseEvent, useRef, useState } from "react"
import {
  Cherry,
  Droplets,
  Flame,
  Flower2,
  Leaf,
  Rabbit,
  Turtle,
  Zap,
} from "lucide-react"

import {
  Walker,
  createWalker,
  drawWalker,
  move,
  updateWalkerMovement,
} from "@/lib/sims/walkers/walker-linear"

import { CanvasSize } from "@/hooks/useResponsiveCanvas"
import { useAnimatedCanvas } from "@/hooks/useAnimatedCanvas"

import { SimLayout } from "@/components/sim-layout"
import { Canvas } from "@/components/canvas"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

import { createVector } from "@/lib/utils-vector"

// Speed presets in pixels per second.
const SPEEDS = {
  slow: { value: 25, icon: Turtle, label: "Slow" },
  medium: { value: 50, icon: Rabbit, label: "Medium" },
  fast: { value: 100, icon: Zap, label: "Fast" },
} as const
type SpeedOption = keyof typeof SPEEDS

// Each hue range picks a 60° analogous slice of the color wheel.
const HUE_RANGES = {
  blueGreen: { base: 180, icon: Droplets, label: "Blue-Green Ocean" },
  redOrange: { base: 0, icon: Flame, label: "Red-Orange Fire" },
  purplePink: { base: 300, icon: Flower2, label: "Purple-Pink Flowers" },
  yellowGreen: { base: 60, icon: Leaf, label: "Yellow-Green Nature" },
  orangeRed: { base: 330, icon: Cherry, label: "Orange-Red Sunset" },
} as const
type HueRange = keyof typeof HUE_RANGES

const randomHueIn = (range: HueRange) =>
  Math.floor(Math.random() * 60) + HUE_RANGES[range].base

const WalkerLinearPage = () => {
  const walkers = useRef<Walker[]>([])
  const [speed, setSpeed] = useState<SpeedOption>("medium")
  const [hueRange, setHueRange] = useState<HueRange>("blueGreen")

  const handleUpdate = (deltaTime: number, size: CanvasSize) => {
    walkers.current.forEach((walker) => {
      updateWalkerMovement(walker, size.width, size.height)
      move(walker, deltaTime)
    })
  }

  const handleDraw = (ctx: CanvasRenderingContext2D, size: CanvasSize) => {
    ctx.clearRect(0, 0, size.width, size.height)
    walkers.current.forEach((walker) => drawWalker(ctx, walker))
  }

  const { canvasRef } = useAnimatedCanvas(handleUpdate, handleDraw)

  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    const position = createVector(
      event.nativeEvent.offsetX,
      event.nativeEvent.offsetY,
    )
    walkers.current.push(
      createWalker(position, SPEEDS[speed].value, 5, 40, true, randomHueIn(hueRange)),
    )
  }

  const controls = (
    <>
      <ToggleGroup
        type="single"
        value={speed}
        onValueChange={(v) => v && setSpeed(v as SpeedOption)}
        variant="outline"
        size="sm"
      >
        {Object.entries(SPEEDS).map(([key, { icon: Icon, label }]) => (
          <ToggleGroupItem key={key} value={key} aria-label={label}>
            <Icon />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <ToggleGroup
        type="single"
        value={hueRange}
        onValueChange={(v) => v && setHueRange(v as HueRange)}
        variant="outline"
        size="sm"
      >
        {Object.entries(HUE_RANGES).map(([key, { icon: Icon, label }]) => (
          <ToggleGroupItem key={key} value={key} aria-label={label}>
            <Icon />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </>
  )

  return (
    <SimLayout title="Walker (linear)" fullscreen showFPS controls={controls}>
      <Canvas ref={canvasRef} onMouseDown={handleMouseDown} />
    </SimLayout>
  )
}

export default WalkerLinearPage
