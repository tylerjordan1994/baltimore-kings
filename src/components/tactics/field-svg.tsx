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

      {/* Outline */}
      <rect
        x="40" y="20" width="920" height="460" rx="3"
        fill="none" stroke="white" strokeWidth="2"
      />

      {/* Center line */}
      <line x1="500" y1="20" x2="500" y2="480" stroke="white" strokeWidth="2" />

      {/* Center circle */}
      <circle cx="500" cy="250" r="60" fill="none" stroke="white" strokeWidth="2" />
      <circle cx="500" cy="250" r="3" fill="white" />

      {/* Left penalty area */}
      <rect
        x="40" y="150" width="120" height="200"
        fill="none" stroke="white" strokeWidth="2"
      />
      {/* Left penalty spot */}
      <circle cx="100" cy="250" r="3" fill="white" />
      {/* Left second penalty spot */}
      <circle cx="160" cy="250" r="3" fill="white" />

      {/* Right penalty area */}
      <rect
        x="840" y="150" width="120" height="200"
        fill="none" stroke="white" strokeWidth="2"
      />
      {/* Right penalty spot */}
      <circle cx="900" cy="250" r="3" fill="white" />
      {/* Right second penalty spot */}
      <circle cx="840" cy="250" r="3" fill="white" />

      {/* Left goal */}
      <rect
        x="20" y="210" width="20" height="80"
        fill="none" stroke="white" strokeWidth="2"
      />

      {/* Right goal */}
      <rect
        x="960" y="210" width="20" height="80"
        fill="none" stroke="white" strokeWidth="2"
      />

      {/* Corner arcs */}
      <path d="M 40,20 A 15,15 0 0,1 55,20" fill="none" stroke="white" strokeWidth="2" />
      <path d="M 945,20 A 15,15 0 0,1 960,20" fill="none" stroke="white" strokeWidth="2" />
      <path d="M 40,480 A 15,15 0 0,0 55,480" fill="none" stroke="white" strokeWidth="2" />
      <path d="M 945,480 A 15,15 0 0,0 960,480" fill="none" stroke="white" strokeWidth="2" />
    </g>
  )
}

function MaslField() {
  return (
    <g>
      {/* Surface - arena blue/gray */}
      <rect x="0" y="0" width="1000" height="425" rx="8" fill="#2a3a4a" />

      {/* Dasher boards */}
      <rect
        x="30" y="15" width="940" height="395" rx="8"
        fill="none" stroke="#88aacc" strokeWidth="3"
      />

      {/* Center line (red) */}
      <line x1="500" y1="15" x2="500" y2="410" stroke="#cc3333" strokeWidth="3" />

      {/* Center circle */}
      <circle cx="500" cy="212" r="55" fill="none" stroke="white" strokeWidth="2" />
      <circle cx="500" cy="212" r="3" fill="white" />

      {/* Left penalty arc */}
      <path
        d="M 130,120 A 100,100 0 0,1 130,305"
        fill="none" stroke="white" strokeWidth="2"
      />
      {/* Left penalty spot */}
      <circle cx="130" cy="212" r="3" fill="white" />

      {/* Right penalty arc */}
      <path
        d="M 870,120 A 100,100 0 0,0 870,305"
        fill="none" stroke="white" strokeWidth="2"
      />
      {/* Right penalty spot */}
      <circle cx="870" cy="212" r="3" fill="white" />

      {/* Left goal crease */}
      <rect
        x="30" y="162" width="40" height="100"
        fill="none" stroke="#ffcc00" strokeWidth="2"
      />

      {/* Right goal crease */}
      <rect
        x="930" y="162" width="40" height="100"
        fill="none" stroke="#ffcc00" strokeWidth="2"
      />

      {/* Left goal */}
      <rect
        x="10" y="180" width="20" height="65"
        fill="none" stroke="white" strokeWidth="2"
      />

      {/* Right goal */}
      <rect
        x="970" y="180" width="20" height="65"
        fill="none" stroke="white" strokeWidth="2"
      />

      {/* Corner markings */}
      <path d="M 30,15 Q 30,15 30,15" fill="none" stroke="#88aacc" strokeWidth="2" />
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
