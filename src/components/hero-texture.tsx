/**
 * Subtle animated texture layered over the hero background: a slowly drifting
 * dot grid, a floating accent glow, and a soft diagonal sheen sweep. Pure CSS
 * (keyframes in globals.css), decorative only.
 */
export function HeroTexture() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Drifting dot grid */}
      <div className="absolute inset-[-25%] animate-[bk-grid-drift_28s_linear_infinite] bg-[radial-gradient(rgba(246,244,238,0.55)_1px,transparent_1.5px)] bg-[length:28px_28px] opacity-[0.08]" />
      {/* Floating warm glow */}
      <div className="absolute left-[28%] top-[34%] h-[55vmax] w-[55vmax] -translate-x-1/2 -translate-y-1/2 animate-[bk-glow-float_22s_ease-in-out_infinite_alternate] rounded-full bg-[radial-gradient(circle,rgba(201,169,78,0.16),transparent_60%)] blur-2xl" />
      {/* Diagonal sheen sweep */}
      <div className="absolute inset-0 animate-[bk-sheen_11s_ease-in-out_infinite] bg-[linear-gradient(115deg,transparent_42%,rgba(246,244,238,0.05)_50%,transparent_58%)] [background-size:250%_250%]" />
    </div>
  )
}
