"use client"

import { useDraggable } from "@dnd-kit/core"
import type { TacticsPlayer } from "@/types/database"
import type { FieldType } from "@/types/database"

interface PlayerTokenProps {
  player: TacticsPlayer
  fieldType: FieldType
  isSelected: boolean
  onSelect: (id: string) => void
  disabled?: boolean
}

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
    useDraggable({
      id: player.id,
      disabled,
    })

  const cx = player.x * vbWidth
  const cy = player.y * vbHeight

  const dx = transform?.x ?? 0
  const dy = transform?.y ?? 0

  const isHome = player.team === "home"
  const bgColor = isHome ? "#1a1a2e" : "#e0e0e0"
  const textColor = isHome ? "white" : "#1a1a2e"
  const borderColor = isSelected ? "#fbbf24" : isHome ? "#3b82f6" : "#6b7280"

  return (
    <g
      ref={setNodeRef as any}
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
      {/* Selection ring */}
      {isSelected && (
        <circle
          cx={cx}
          cy={cy}
          r="26"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
      )}

      {/* Main token circle */}
      <circle
        cx={cx}
        cy={cy}
        r="22"
        fill={bgColor}
        stroke={borderColor}
        strokeWidth="2.5"
      />

      {/* Photo clip (if available) */}
      {player.photoUrl && (
        <>
          <defs>
            <clipPath id={`clip-${player.id}`}>
              <circle cx={cx} cy={cy} r="20" />
            </clipPath>
          </defs>
          <image
            href={player.photoUrl}
            x={cx - 20}
            y={cy - 20}
            width="40"
            height="40"
            clipPath={`url(#clip-${player.id})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </>
      )}

      {/* Jersey number badge */}
      <circle
        cx={cx + 14}
        cy={cy - 14}
        r="9"
        fill={isHome ? "#3b82f6" : "#6b7280"}
        stroke="white"
        strokeWidth="1"
      />
      <text
        x={cx + 14}
        y={cy - 10}
        textAnchor="middle"
        fontSize="9"
        fontWeight="bold"
        fill="white"
      >
        {player.jerseyNumber}
      </text>

      {/* Name (visible on hover via CSS, always rendered here for simplicity) */}
      <title>
        {player.name} #{player.jerseyNumber}
      </title>

      {/* Player name below token */}
      <text
        x={cx}
        y={cy + 34}
        textAnchor="middle"
        fontSize="10"
        fill={textColor}
        fontWeight="500"
        opacity="0.9"
      >
        {player.name.split(" ")[0]}
      </text>
    </g>
  )
}
