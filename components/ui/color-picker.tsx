"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const COLORS = [
  // Sand and earth tones
  "#e6c068", "#d4a373", "#b08968", "#7f5539", "#3d2817",
  // Reds and oranges
  "#f4a261", "#e76f51", "#e63946", "#c1121f", "#6a040f",
  // Greens
  "#b5e48c", "#76c893", "#52796f", "#2d6a4f", "#1b4332",
  // Blues and cools
  "#a8dadc", "#2a9d8f", "#457b9d", "#1d3557", "#03045e",
  // Purples, pinks, neutrals
  "#cdb4db", "#b5179e", "#ffafcc", "#f5f5f5", "#1a1a1a",
]

interface ColorPickerProps {
  value: string
  onValueChange: (color: string) => void
}

export function ColorPicker({ value, onValueChange }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Pick a color"
        className="size-9 rounded-md border border-input shadow-xs outline-none transition-shadow hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring/50"
        style={{ backgroundColor: value }}
      />
      <PopoverContent align="end" className="w-auto p-2">
        <div className="grid grid-cols-5 gap-1.5">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={color}
              onClick={() => onValueChange(color)}
              className={cn(
                "size-7 rounded outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring",
                value === color &&
                  "ring-2 ring-foreground ring-offset-2 ring-offset-popover",
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
