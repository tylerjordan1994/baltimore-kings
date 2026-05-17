"use client"

import type { TacticsLabel, FieldType } from "@/types/database"
import { useTacticsStore } from "@/lib/stores/tactics-store"

interface LabelLayerProps {
  labels: TacticsLabel[]
  fieldType: FieldType
  interactive?: boolean
}

export function LabelLayer({ labels, fieldType, interactive }: LabelLayerProps) {
  const vbWidth = 1000
  const vbHeight = fieldType === "futsal_rounded" ? 500 : 425
  const selectedId = useTacticsStore((s) => s.selectedId)
  const setSelectedId = useTacticsStore((s) => s.setSelectedId)
  const moveLabel = useTacticsStore((s) => s.moveLabel)

  return (
    <g>
      {labels.map((label) => {
        const lx = label.x * vbWidth
        const ly = label.y * vbHeight
        const isSelected = selectedId === label.id

        return (
          <g
            key={label.id}
            style={{ cursor: interactive ? "move" : "default" }}
            onClick={(e) => {
              if (!interactive) return
              e.stopPropagation()
              setSelectedId(label.id)
            }}
            onMouseDown={(e) => {
              if (!interactive) return
              e.stopPropagation()
              const svg = (e.currentTarget as SVGElement).ownerSVGElement!
              const handleDrag = (me: MouseEvent) => {
                const rect = svg.getBoundingClientRect()
                const scaleX = vbWidth / rect.width
                const scaleY = vbHeight / rect.height
                const nx = ((me.clientX - rect.left) * scaleX) / vbWidth
                const ny = ((me.clientY - rect.top) * scaleY) / vbHeight
                moveLabel(label.id, nx, ny)
              }
              const handleUp = () => {
                document.removeEventListener("mousemove", handleDrag)
                document.removeEventListener("mouseup", handleUp)
              }
              document.addEventListener("mousemove", handleDrag)
              document.addEventListener("mouseup", handleUp)
            }}
          >
            {/* Background pill */}
            <rect
              x={lx - 4}
              y={ly - 14}
              width={label.text.length * 7 + 8}
              height="20"
              rx="4"
              fill={isSelected ? "rgba(251, 191, 36, 0.3)" : "rgba(0,0,0,0.6)"}
              stroke={isSelected ? "#fbbf24" : "none"}
              strokeWidth="1.5"
            />
            <text
              x={lx}
              y={ly}
              fontSize="12"
              fontWeight="600"
              fill="white"
              style={{ userSelect: "none" }}
            >
              {label.text}
            </text>
          </g>
        )
      })}
    </g>
  )
}
