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

// Baltimore Kings colors
const HOME_BG = "#1B2A4A" // Baltimore blue
const HOME_ACCENT = "#C9A94E" // Baltimore gold
const AWAY_BG = "#cc2222" // Opponent red
const AWAY_ACCENT = "#ff4444"

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

  const isBall = player.tokenType === "ball"
  const isHome = player.team === "home"

  if (isBall) {
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
        {isSelected && (
          <circle
            cx={cx}
            cy={cy}
            r="14"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        )}
        {/* Ball - white circle with pattern */}
        <circle cx={cx} cy={cy} r="10" fill="white" stroke="#333" strokeWidth="1.5" />
        {/* Pentagon pattern to look like a soccer ball */}
        <circle cx={cx} cy={cy} r="4" fill="none" stroke="#333" strokeWidth="1" />
        <title>Ball</title>
      </g>
    )
  }

  const bgColor = isHome ? HOME_BG : AWAY_BG
  const accentColor = isHome ? HOME_ACCENT : AWAY_ACCENT
  const borderColor = isSelected ? "#fbbf24" : accentColor
  const textColor = "white"

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

      {/* Position abbreviation (center of token) */}
      {player.position && (
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill={textColor}
          style={{ userSelect: "none" }}
        >
          {player.position}
        </text>
      )}

      {/* Jersey number badge */}
      <circle
        cx={cx + 14}
        cy={cy - 14}
        r="9"
        fill={accentColor}
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
        {player.name} #{player.jerseyNumber} {player.position ? `(${player.position})` : ""}
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
