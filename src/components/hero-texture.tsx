/**
 * Moving line-grid texture layered over the hero background: two grids of thin
 * lines (a fine paper grid and a wider accent grid) panning in opposite
 * directions, plus a floating warm glow for depth. Pure CSS, decorative only.
 * Each grid is oversized (inset -50%) so it can translate one full cell and
 * loop seamlessly. Keyframes live in globals.css.
 */
export function HeroTexture() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      // Fade the grids out toward the top so they don't fight the headline.
      style={{
        maskImage: "linear-gradient(to bottom, transparent, #000 22%, #000 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 22%, #000 100%)",
      }}
    >
      {/* Fine grid, panning down-right */}
      <div
        className="absolute inset-[-50%] animate-[bk-grid-pan_6s_linear_infinite] opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(246,244,238,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(246,244,238,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      {/* Wider accent grid, panning up-left for parallax */}
      <div
        className="absolute inset-[-50%] animate-[bk-grid-pan-rev_14s_linear_infinite] opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(201,169,78,0.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(201,169,78,0.7) 1px, transparent 1px)",
          backgroundSize: "180px 180px",
        }}
      />
      {/* Floating warm glow */}
      <div className="absolute left-[28%] top-[36%] h-[55vmax] w-[55vmax] -translate-x-1/2 -translate-y-1/2 animate-[bk-glow-float_22s_ease-in-out_infinite_alternate] rounded-full bg-[radial-gradient(circle,rgba(201,169,78,0.16),transparent_60%)] blur-2xl" />
    </div>
  )
}
