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
  const updateArrow = useTacticsStore((s) => s.updateArrow)

  /** Drag an arrow handle, writing normalized coords back to the store. */
  function startHandleDrag(
    e: React.MouseEvent<SVGCircleElement>,
    apply: (nx: number, ny: number) => void
  ) {
    e.stopPropagation()
    const svg = e.currentTarget.ownerSVGElement
    if (!svg) return
    const onMove = (me: MouseEvent) => {
      const rect = svg.getBoundingClientRect()
      const nx = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width))
      const ny = Math.max(0, Math.min(1, (me.clientY - rect.top) / rect.height))
      apply(nx, ny)
    }
    const onUp = () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }

  return (
    <g>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="8"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="white" />
        </marker>
        <marker
          id="arrowhead-selected"
          markerWidth="10"
          markerHeight="7"
          refX="8"
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
        const dash = arrow.style === "dashed" ? "9 6" : undefined

        const cx =
          (arrow.controlX ?? (arrow.startX + arrow.endX) / 2) * vbWidth
        const cy =
          (arrow.controlY ?? (arrow.startY + arrow.endY) / 2 - 0.1) * vbHeight

        return (
          <g key={arrow.id}>
            {arrow.curved ? (
              <path
                d={`M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="3"
                strokeDasharray={dash}
                strokeLinecap="round"
                markerEnd={markerEnd}
                style={{ cursor: interactive ? "pointer" : "default" }}
                onClick={(e) => {
                  if (!interactive) return
                  e.stopPropagation()
                  setSelectedId(arrow.id)
                }}
              />
            ) : (
              <line
                x1={sx}
                y1={sy}
                x2={ex}
                y2={ey}
                stroke={strokeColor}
                strokeWidth="3"
                strokeDasharray={dash}
                strokeLinecap="round"
                markerEnd={markerEnd}
                style={{ cursor: interactive ? "pointer" : "default" }}
                onClick={(e) => {
                  if (!interactive) return
                  e.stopPropagation()
                  setSelectedId(arrow.id)
                }}
              />
            )}

            {/* Wider invisible hit area for easier selection */}
            {interactive && !arrow.curved && (
              <line
                x1={sx}
                y1={sy}
                x2={ex}
                y2={ey}
                stroke="transparent"
                strokeWidth="14"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedId(arrow.id)
                }}
              />
            )}

            {/* Endpoint + control handles when selected */}
            {interactive && isSelected && (
              <>
                <circle
                  cx={sx}
                  cy={sy}
                  r="7"
                  fill="#22c55e"
                  stroke="white"
                  strokeWidth="1.5"
                  style={{ cursor: "move" }}
                  onMouseDown={(e) =>
                    startHandleDrag(e, (nx, ny) =>
                      updateArrow(arrow.id, { startX: nx, startY: ny })
                    )
                  }
                />
                <circle
                  cx={ex}
                  cy={ey}
                  r="7"
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth="1.5"
                  style={{ cursor: "move" }}
                  onMouseDown={(e) =>
                    startHandleDrag(e, (nx, ny) =>
                      updateArrow(arrow.id, { endX: nx, endY: ny })
                    )
                  }
                />
                {arrow.curved && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="6"
                    fill="#fbbf24"
                    stroke="white"
                    strokeWidth="1.5"
                    style={{ cursor: "move" }}
                    onMouseDown={(e) =>
                      startHandleDrag(e, (nx, ny) =>
                        updateArrow(arrow.id, { controlX: nx, controlY: ny })
                      )
                    }
                  />
                )}
              </>
            )}
          </g>
        )
      })}
    </g>
  )
}
