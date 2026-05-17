"use client"

import type { TacticsLabel, FieldType } from "@/types/database"
import { useTacticsStore } from "@/lib/stores/tactics-store"

interface LabelLayerProps {
  labels: TacticsLabel[]
  fieldType: FieldType
  interactive?: boolean
  onEditLabel?: (id: string) => void
}

export function LabelLayer({
  labels,
  fieldType,
  interactive,
  onEditLabel,
}: LabelLayerProps) {
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
        const width = label.text.length * 7 + 16

        return (
          <g
            key={label.id}
            style={{ cursor: interactive ? "move" : "default" }}
            onClick={(e) => {
              if (!interactive) return
              e.stopPropagation()
              setSelectedId(label.id)
            }}
            onDoubleClick={(e) => {
              if (!interactive) return
              e.stopPropagation()
              onEditLabel?.(label.id)
            }}
            onMouseDown={(e) => {
              if (!interactive) return
              e.stopPropagation()
              const svg = (e.currentTarget as SVGGElement).ownerSVGElement
              if (!svg) return
              const onMove = (me: MouseEvent) => {
                const rect = svg.getBoundingClientRect()
                const nx = Math.max(
                  0,
                  Math.min(1, (me.clientX - rect.left) / rect.width)
                )
                const ny = Math.max(
                  0,
                  Math.min(1, (me.clientY - rect.top) / rect.height)
                )
                moveLabel(label.id, nx, ny)
              }
              const onUp = () => {
                document.removeEventListener("mousemove", onMove)
                document.removeEventListener("mouseup", onUp)
              }
              document.addEventListener("mousemove", onMove)
              document.addEventListener("mouseup", onUp)
            }}
          >
            <rect
              x={lx - 8}
              y={ly - 15}
              width={width}
              height="22"
              rx="5"
              fill={isSelected ? "rgba(251, 191, 36, 0.25)" : "rgba(0,0,0,0.7)"}
              stroke={isSelected ? "#fbbf24" : "rgba(255,255,255,0.15)"}
              strokeWidth="1.5"
            />
            <text
              x={lx}
              y={ly}
              fontSize="12"
              fontWeight="600"
              fill={label.color ?? "white"}
              style={{ userSelect: "none" }}
            >
              {label.text}
            </text>

            {interactive && isSelected && (
              <g
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation()
                  onEditLabel?.(label.id)
                }}
              >
                <circle
                  cx={lx + width - 16}
                  cy={ly - 19}
                  r="9"
                  fill="#fbbf24"
                  stroke="white"
                  strokeWidth="1"
                />
                <text
                  x={lx + width - 16}
                  y={ly - 15}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill="#1f1f1f"
                  style={{ userSelect: "none" }}
                >
                  ✎
                </text>
              </g>
            )}
          </g>
        )
      })}
    </g>
  )
}
