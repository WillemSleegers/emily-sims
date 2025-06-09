import { Vector2D } from "@/lib/utils-vector"

export type Cell = {
  x: number
  y: number
  color: string
}

export type Raindrop = {
  position: Vector2D
  velocity: Vector2D
  z: number
  len: number
  color: string
}

export type Boid = {
  position: Vector2D
  velocity: Vector2D
  angle: number
  width: number
  length: number
  perception: number
  fillColor: string
  strokeColor?: string
}
export type Metaball = {
  position: Vector2D
  velocity: Vector2D
  radius: number
}

export type Circle = {
  position: Vector2D
  velocity: Vector2D
  radius: number
  colorStroke: string
  colorFill: string
}
