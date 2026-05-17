"use client"

import type { TacticsArrow, FieldType } from "@/types/database"
import { useTacticsStore } from "@/lib/stores/tactics-store"

interface ArrowLayerProps {
  arrows: TacticsArrow[]
  fieldType: FieldType
  interactive?: boolean
}

export function ArrowLayer({ arrows, fieldType, interactive }: ArrowLayerProps) {
  const vbWidth = 1000
  const vbHeight = fieldType === "futsal_rounded" ? 500 : 425
  const selectedId = useTacticsStore((s) => s.selectedId)
  const setSelectedId = useTacticsStore((s) => s.setSelectedId)
  const moveArrowControl = useTacticsStore((s) => s.moveArrowControl)
  const removeArrow = useTacticsStore((s) => s.removeArrow)

  return (
    <g>
      {/* Arrowhead marker */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="white" />
        </marker>
        <marker
          id="arrowhead-selected"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#fbbf24" />
        </marker>
      </defs>

      {arrows.map((arrow) => {
        const sx = arrow.startX * vbWidth
        const sy = arrow.startY * vbHeight
        const ex = arrow.endX * vbWidth
        const ey = arrow.endY * vbHeight
        const isSelected = selectedId === arrow.id
        const markerEnd = isSelected
          ? "url(#arrowhead-selected)"
          : "url(#arrowhead)"
        const strokeColor = isSelected ? "#fbbf24" : "white"

        if (arrow.curved) {
          const cx = (arrow.controlX ?? (arrow.startX + arrow.endX) / 2) * vbWidth
          const cy =
            (arrow.controlY ?? (arrow.startY + arrow.endY) / 2 - 0.1) *
            vbHeight

          return (
            <g key={arrow.id}>
              <path
                d={`M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeDasharray={isSelected ? "6 3" : "none"}
                markerEnd={markerEnd}
                style={{ cursor: interactive ? "pointer" : "default" }}
                onClick={(e) => {
                  if (!interactive) return
                  e.stopPropagation()
                  setSelectedId(arrow.id)
                }}
              />
              {/* Control point handle */}
              {interactive && isSelected && (
                <circle
                  cx={cx}
                  cy={cy}
                  r="6"
                  fill="#fbbf24"
                  stroke="white"
                  strokeWidth="1.5"
                  style={{ cursor: "move" }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    const svg = (
                      e.currentTarget as SVGElement
                    ).ownerSVGElement!
                    const handleDrag = (me: MouseEvent) => {
                      const rect = svg.getBoundingClientRect()
                      const scaleX = vbWidth / rect.width
                      const scaleY = vbHeight / rect.height
                      const nx = ((me.clientX - rect.left) * scaleX) / vbWidth
                      const ny = ((me.clientY - rect.top) * scaleY) / vbHeight
                      moveArrowControl(arrow.id, nx, ny)
                    }
                    const handleUp = () => {
                      document.removeEventListener("mousemove", handleDrag)
                      document.removeEventListener("mouseup", handleUp)
                    }
                    document.addEventListener("mousemove", handleDrag)
                    document.addEventListener("mouseup", handleUp)
                  }}
                />
              )}
            </g>
          )
        }

        return (
          <line
            key={arrow.id}
            x1={sx}
            y1={sy}
            x2={ex}
            y2={ey}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeDasharray={isSelected ? "6 3" : "none"}
            markerEnd={markerEnd}
            style={{ cursor: interactive ? "pointer" : "default" }}
            onClick={(e) => {
              if (!interactive) return
              e.stopPropagation()
              setSelectedId(arrow.id)
            }}
          />
        )
      })}
    </g>
  )
}
