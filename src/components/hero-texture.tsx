/**
 * Gold & black smoke rising subtly from the bottom of the hero — layered over
 * the background image but behind the content. Several large, heavily-blurred
 * radial "puffs" drift upward and fade on a loop; negative animation delays
 * keep the smoke continuous. Pure CSS (keyframes in globals.css), decorative.
 */

type Puff = {
  left: string
  size: number
  color: string
  dur: number
  delay: number
  drift: number
  spin: number
}

// Alternating warm-gold and charcoal-black puffs across the width.
const PUFFS: Puff[] = [
  { left: "10%", size: 300, color: "rgba(201,169,78,0.22)", dur: 14, delay: 0, drift: -28, spin: -10 },
  { left: "24%", size: 380, color: "rgba(22,20,17,0.60)", dur: 18, delay: -7, drift: 24, spin: 8 },
  { left: "40%", size: 320, color: "rgba(201,169,78,0.16)", dur: 15, delay: -11, drift: -16, spin: 12 },
  { left: "56%", size: 420, color: "rgba(18,16,14,0.55)", dur: 20, delay: -4, drift: 34, spin: -8 },
  { left: "70%", size: 320, color: "rgba(201,169,78,0.20)", dur: 16, delay: -9, drift: -24, spin: 10 },
  { left: "86%", size: 360, color: "rgba(22,20,17,0.55)", dur: 17, delay: -13, drift: 16, spin: -12 },
]

export function HeroTexture() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft gold bed glowing along the bottom edge */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(201,169,78,0.10),transparent)]" />
      {PUFFS.map((p, i) => (
        <span
          key={i}
          className="absolute bottom-[-8%] block rounded-full blur-2xl will-change-transform"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, ${p.color}, transparent 70%)`,
            // CSS vars consumed by the bk-smoke keyframes (drift + spin)
            ["--drift" as string]: `${p.drift}px`,
            ["--spin" as string]: `${p.spin}deg`,
            animation: `bk-smoke ${p.dur}s ease-in ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
