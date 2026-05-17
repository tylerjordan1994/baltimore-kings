"use client"

import { useDraggable } from "@dnd-kit/core"
import type { TacticsPlayer, FieldType } from "@/types/database"

interface PlayerTokenProps {
  player: TacticsPlayer
  fieldType: FieldType
  isSelected: boolean
  onSelect: (id: string) => void
  disabled?: boolean
}

// Baltimore Kings colors
const HOME_BG = "#1B2A4A" // Baltimore blue
const HOME_ACCENT = "#C9A94E" // Baltimore gold
const AWAY_BG = "#8a1f1f" // Opponent red
const AWAY_ACCENT = "#e05555"

const R = 16 // token radius — smaller than the old r=22

export function PlayerToken({
  player,
  fieldType,
  isSelected,
  onSelect,
  disabled,
}: PlayerTokenProps) {
  const vbWidth = 1000
  const vbHeight = fieldType === "futsal_rounded" ? 500 : 425

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: player.id, disabled })

  const cx = player.x * vbWidth
  const cy = player.y * vbHeight
  const dx = transform?.x ?? 0
  const dy = transform?.y ?? 0

  const isBall = player.tokenType === "ball"

  if (isBall) {
    return (
      <g
        ref={setNodeRef as unknown as React.Ref<SVGGElement>}
        {...listeners}
        {...attributes}
        style={{
          transform: `translate(${dx}px, ${dy}px)`,
          cursor: disabled ? "default" : "grab",
          opacity: isDragging ? 0.7 : 1,
        }}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(player.id)
        }}
      >
        {isSelected && (
          <circle
            cx={cx}
            cy={cy}
            r="13"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        )}
        <circle cx={cx} cy={cy} r="8" fill="white" stroke="#1f1f1f" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="3" fill="none" stroke="#1f1f1f" strokeWidth="1" />
        <title>Ball</title>
      </g>
    )
  }

  const isHome = player.team === "home"
  const bgColor = player.color ?? (isHome ? HOME_BG : AWAY_BG)
  const accentColor = isHome ? HOME_ACCENT : AWAY_ACCENT
  const borderColor = isSelected ? "#fbbf24" : accentColor
  const label = player.position || player.name.split(" ")[0]

  return (
    <g
      ref={setNodeRef as unknown as React.Ref<SVGGElement>}
      {...listeners}
      {...attributes}
      style={{
        transform: `translate(${dx}px, ${dy}px)`,
        cursor: disabled ? "default" : "grab",
        opacity: isDragging ? 0.7 : 1,
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(player.id)
      }}
    >
      {isSelected && (
        <circle
          cx={cx}
          cy={cy}
          r={R + 4}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
      )}

      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill={bgColor}
        stroke={borderColor}
        strokeWidth="2.5"
      />

      {player.photoUrl && (
        <>
          <defs>
            <clipPath id={`clip-${player.id}`}>
              <circle cx={cx} cy={cy} r={R - 2} />
            </clipPath>
          </defs>
          <image
            href={player.photoUrl}
            x={cx - (R - 2)}
            y={cy - (R - 2)}
            width={(R - 2) * 2}
            height={(R - 2) * 2}
            clipPath={`url(#clip-${player.id})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </>
      )}

      {!player.photoUrl && (
        <text
          x={cx}
          y={cy + 3}
          textAnchor="middle"
          fontSize="9"
          fontWeight="bold"
          fill="white"
          style={{ userSelect: "none" }}
        >
          {label.slice(0, 3)}
        </text>
      )}

      <title>
        {player.name}
        {player.position ? ` (${player.position})` : ""}
      </title>

      <text
        x={cx}
        y={cy + R + 11}
        textAnchor="middle"
        fontSize="10"
        fill="white"
        fontWeight="600"
        style={{ userSelect: "none", paintOrder: "stroke" }}
        stroke="rgba(0,0,0,0.7)"
        strokeWidth="2.5"
      >
        {label}
      </text>
    </g>
  )
}
