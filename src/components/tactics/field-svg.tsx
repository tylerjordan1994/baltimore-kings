"use client"

import type { FieldType } from "@/types/database"

interface FieldSvgProps {
  fieldType: FieldType
  children?: React.ReactNode
  onClick?: (e: React.MouseEvent<SVGSVGElement>) => void
}

export function FieldSvg({ fieldType, children, onClick }: FieldSvgProps) {
  const isFutsal = fieldType === "futsal_rounded"
  const viewBox = isFutsal ? "0 0 1000 500" : "0 0 1000 425"

  return (
    <svg
      viewBox={viewBox}
      className="w-full rounded-lg border border-zinc-700"
      preserveAspectRatio="xMidYMid meet"
      onClick={onClick}
      data-tactics-svg=""
    >
      {isFutsal ? <FutsalField /> : <MaslField />}
      {children}
    </svg>
  )
}

function FutsalField() {
  return (
    <g>
      {/* Surface */}
      <rect x="0" y="0" width="1000" height="500" rx="3" fill="#2d6b30" />

      {/* Outline with rounded corners */}
      <rect
        x="40" y="20" width="920" height="460" rx="12"
        fill="none" stroke="white" strokeWidth="2"
      />

      {/* Center line */}
      <line x1="500" y1="20" x2="500" y2="480" stroke="white" strokeWidth="2" />

      {/* Center circle */}
      <circle cx="500" cy="250" r="60" fill="none" stroke="white" strokeWidth="2" />
      <circle cx="500" cy="250" r="3" fill="white" />

      {/* Left penalty area (D-shaped) */}
      <path
        d="M 40,175 L 130,175 A 75,75 0 0,1 130,325 L 40,325"
        fill="none" stroke="white" strokeWidth="2"
      />
      {/* Left penalty spot (6m) */}
      <circle cx="100" cy="250" r="3" fill="white" />
      {/* Left second penalty spot (10m) */}
      <circle cx="160" cy="250" r="3" fill="white" />
      {/* Left penalty arc from second spot */}
      <path
        d="M 160,225 A 25,25 0 0,1 160,275"
        fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3 3"
      />

      {/* Right penalty area (D-shaped) */}
      <path
        d="M 960,175 L 870,175 A 75,75 0 0,0 870,325 L 960,325"
        fill="none" stroke="white" strokeWidth="2"
      />
      {/* Right penalty spot (6m) */}
      <circle cx="900" cy="250" r="3" fill="white" />
      {/* Right second penalty spot (10m) */}
      <circle cx="840" cy="250" r="3" fill="white" />
      {/* Right penalty arc from second spot */}
      <path
        d="M 840,225 A 25,25 0 0,0 840,275"
        fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3 3"
      />

      {/* Left goal */}
      <rect
        x="20" y="215" width="20" height="70"
        fill="none" stroke="white" strokeWidth="2.5"
      />
      {/* Goal depth shading */}
      <rect x="20" y="215" width="20" height="70" fill="rgba(255,255,255,0.08)" />

      {/* Right goal */}
      <rect
        x="960" y="215" width="20" height="70"
        fill="none" stroke="white" strokeWidth="2.5"
      />
      <rect x="960" y="215" width="20" height="70" fill="rgba(255,255,255,0.08)" />

      {/* Corner arcs */}
      <path d="M 40,35 A 15,15 0 0,1 55,20" fill="none" stroke="white" strokeWidth="2" />
      <path d="M 945,20 A 15,15 0 0,1 960,35" fill="none" stroke="white" strokeWidth="2" />
      <path d="M 55,480 A 15,15 0 0,1 40,465" fill="none" stroke="white" strokeWidth="2" />
      <path d="M 960,465 A 15,15 0 0,1 945,480" fill="none" stroke="white" strokeWidth="2" />

      {/* Substitution zones (near halfway line, both sides) */}
      {/* Home substitution zone */}
      <line x1="460" y1="480" x2="460" y2="490" stroke="#fbbf24" strokeWidth="2" />
      <line x1="500" y1="480" x2="500" y2="490" stroke="#fbbf24" strokeWidth="2" />
      <line x1="460" y1="488" x2="500" y2="488" stroke="#fbbf24" strokeWidth="1.5" />
      {/* Away substitution zone */}
      <line x1="500" y1="480" x2="500" y2="490" stroke="#fbbf24" strokeWidth="2" />
      <line x1="540" y1="480" x2="540" y2="490" stroke="#fbbf24" strokeWidth="2" />
      <line x1="500" y1="488" x2="540" y2="488" stroke="#fbbf24" strokeWidth="1.5" />
    </g>
  )
}

function MaslField() {
  return (
    <g>
      {/* Surface - arena blue/gray */}
      <rect x="0" y="0" width="1000" height="425" rx="8" fill="#2a3a4a" />

      {/* Dasher boards (rounded rectangle) */}
      <rect
        x="30" y="15" width="940" height="395" rx="40"
        fill="none" stroke="#88aacc" strokeWidth="4"
      />

      {/* Red center line */}
      <line x1="500" y1="15" x2="500" y2="410" stroke="#cc3333" strokeWidth="3" />

      {/* Blue lines (territorial markers) */}
      <line x1="300" y1="15" x2="300" y2="410" stroke="#3366cc" strokeWidth="2.5" />
      <line x1="700" y1="15" x2="700" y2="410" stroke="#3366cc" strokeWidth="2.5" />

      {/* Red lines (behind goals - 3-line violation reference) */}
      <line x1="130" y1="55" x2="130" y2="370" stroke="#cc3333" strokeWidth="2" />
      <line x1="870" y1="55" x2="870" y2="370" stroke="#cc3333" strokeWidth="2" />

      {/* Center circle */}
      <circle cx="500" cy="212" r="55" fill="none" stroke="white" strokeWidth="2" />
      <circle cx="500" cy="212" r="3" fill="white" />

      {/* Left penalty arc */}
      <path
        d="M 130,120 A 100,100 0 0,1 130,305"
        fill="none" stroke="white" strokeWidth="2"
      />
      {/* Left penalty spot */}
      <circle cx="155" cy="212" r="3" fill="white" />

      {/* Right penalty arc */}
      <path
        d="M 870,120 A 100,100 0 0,0 870,305"
        fill="none" stroke="white" strokeWidth="2"
      />
      {/* Right penalty spot */}
      <circle cx="845" cy="212" r="3" fill="white" />

      {/* Left goal crease (semi-circular) */}
      <path
        d="M 30,170 A 50,50 0 0,1 30,255"
        fill="none" stroke="#ffcc00" strokeWidth="2.5"
      />
      <rect x="30" y="170" width="35" height="85" fill="rgba(255,204,0,0.06)" />

      {/* Right goal crease (semi-circular) */}
      <path
        d="M 970,170 A 50,50 0 0,0 970,255"
        fill="none" stroke="#ffcc00" strokeWidth="2.5"
      />
      <rect x="935" y="170" width="35" height="85" fill="rgba(255,204,0,0.06)" />

      {/* Left goal */}
      <rect
        x="10" y="185" width="20" height="55"
        fill="none" stroke="white" strokeWidth="2.5"
      />
      <rect x="10" y="185" width="20" height="55" fill="rgba(255,255,255,0.08)" />

      {/* Right goal */}
      <rect
        x="970" y="185" width="20" height="55"
        fill="none" stroke="white" strokeWidth="2.5"
      />
      <rect x="970" y="185" width="20" height="55" fill="rgba(255,255,255,0.08)" />

      {/* Corner dots */}
      <circle cx="65" cy="50" r="3" fill="#88aacc" opacity="0.5" />
      <circle cx="935" cy="50" r="3" fill="#88aacc" opacity="0.5" />
      <circle cx="65" cy="375" r="3" fill="#88aacc" opacity="0.5" />
      <circle cx="935" cy="375" r="3" fill="#88aacc" opacity="0.5" />
    </g>
  )
}

/** Convert a mouse event on the SVG to normalized 0-1 coordinates */
export function svgPointFromEvent(
  e: React.MouseEvent<SVGSVGElement>,
  fieldType: FieldType
): { x: number; y: number } {
  const svg = e.currentTarget
  const rect = svg.getBoundingClientRect()
  const isFutsal = fieldType === "futsal_rounded"
  const vbWidth = 1000
  const vbHeight = isFutsal ? 500 : 425

  const scaleX = vbWidth / rect.width
  const scaleY = vbHeight / rect.height

  const svgX = (e.clientX - rect.left) * scaleX
  const svgY = (e.clientY - rect.top) * scaleY

  return {
    x: svgX / vbWidth,
    y: svgY / vbHeight,
  }
}
