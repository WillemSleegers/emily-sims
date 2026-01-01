"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const COLORS = [
  "#7f1d1d",
  "#991b1b",
  "#dc2626",
  "#ef4444",
  "#f87171",
  "#7c2d12",
  "#9a3412",
  "#ea580c",
  "#f97316",
  "#fb923c",
  "#713f12",
  "#854d0e",
  "#ca8a04",
  "#eab308",
  "#facc15",
  "#14532d",
  "#166534",
  "#16a34a",
  "#22c55e",
  "#4ade80",
  "#164e63",
  "#155e75",
  "#0891b2",
  "#06b6d4",
  "#22d3ee",
  "#1e3a8a",
  "#1d4ed8",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#581c87",
  "#6b21a8",
  "#9333ea",
  "#a855f7",
  "#c084fc",
  "#831843",
  "#9f1239",
  "#db2777",
  "#ec4899",
  "#f472b6",
]

interface ColorPickerProps {
  value: string
  onValueChange: (color: string) => void
}

export function ColorPicker({ value, onValueChange }: ColorPickerProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-12 h-8 p-0 border-0">
        <SelectValue className="bg-red-400" style={{ background: value }} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Colors</SelectLabel>
          <div className="flex gap-3 flex-wrap">
            {COLORS.map((color) => {
              return (
                <SelectItem
                  key={color}
                  value={color}
                  className="my-1 h-8 w-12"
                  style={{ backgroundColor: color }}
                ></SelectItem>
              )
            })}
          </div>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
