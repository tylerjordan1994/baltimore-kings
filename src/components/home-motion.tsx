"use client"

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react"

/* ────────────────────────────────────────────────
   Reveal — wraps content and animates it in on scroll
   via IntersectionObserver. `variant` picks the CSS
   class; `delay` staggers siblings.
   ──────────────────────────────────────────────── */
type RevealVariant = "up" | "left" | "right" | "scale" | "clip"

const VARIANT_CLASS: Record<RevealVariant, string> = {
  up: "reveal",
  left: "reveal-left",
  right: "reveal-right",
  scale: "reveal-scale",
  clip: "reveal-clip",
}

export function Reveal({
  children,
  variant = "up",
  delay = 0,
  as: Tag = "div",
  className = "",
  once = true,
}: {
  children: ReactNode
  variant?: RevealVariant
  delay?: number
  as?: ElementType
  className?: string
  once?: boolean
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) obs.disconnect()
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [once])

  return (
    <Tag
      ref={ref}
      className={`${VARIANT_CLASS[variant]} ${visible ? "is-visible" : ""} ${className}`}
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}

/* ────────────────────────────────────────────────
   Parallax — translates a child image as it scrolls
   through the viewport. Place inside an overflow-hidden
   frame; the image is scaled up in CSS to hide edges.
   ──────────────────────────────────────────────── */
export function Parallax({
  src,
  alt,
  strength = 60,
  className = "",
  imgClassName = "",
}: {
  src: string
  alt: string
  strength?: number
  className?: string
  imgClassName?: string
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const img = imgRef.current
    if (!wrap || !img) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = wrap.getBoundingClientRect()
      const vh = window.innerHeight
      if (rect.bottom < 0 || rect.top > vh) return
      // progress: -1 (entering bottom) → 1 (leaving top)
      const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2)
      img.style.setProperty("--parallax", `${(-progress * strength).toFixed(1)}px`)
    }
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [strength])

  return (
    <div ref={wrapRef} className={`overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`parallax-img h-full w-full object-cover ${imgClassName}`}
      />
    </div>
  )
}

/* ────────────────────────────────────────────────
   CountUp — animates a number from 0 → value when it
   scrolls into view.
   ──────────────────────────────────────────────── */
export function CountUp({
  value,
  suffix = "",
  prefix = "",
  duration = 1800,
  className = "",
}: {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value)
      return
    }
    let raf = 0
    let start = 0
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        obs.disconnect()
        const step = (ts: number) => {
          if (!start) start = ts
          const t = Math.min((ts - start) / duration, 1)
          // ease-out-cubic
          const eased = 1 - Math.pow(1 - t, 3)
          setDisplay(Math.round(eased * value))
          if (t < 1) raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
      },
      { threshold: 0.4 },
    )
    obs.observe(el)
    return () => {
      obs.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [value, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}

/* ────────────────────────────────────────────────
   MagneticButton — the inner content drifts toward the
   cursor while hovering, then snaps back. Pure transform,
   no layout impact. Renders an <a> for navigation.
   ──────────────────────────────────────────────── */
export function MagneticButton({
  href,
  children,
  className = "",
  strength = 0.35,
}: {
  href: string
  children: ReactNode
  className?: string
  strength?: number
}) {
  const ref = useRef<HTMLAnchorElement | null>(null)

  function handleMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    el.style.transform = `translate(${x}px, ${y}px)`
  }

  function handleLeave() {
    const el = ref.current
    if (el) el.style.transform = "translate(0px, 0px)"
  }

  return (
    <a
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{ transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1)" }}
    >
      {children}
    </a>
  )
}

/* ────────────────────────────────────────────────
   TiltCard — card rotates slightly toward the cursor
   for a premium 3D hover. Wraps any content.
   ──────────────────────────────────────────────── */
export function TiltCard({
  children,
  className = "",
  max = 7,
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-6px)`
  }

  function handleLeave() {
    const el = ref.current
    if (el)
      el.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)"
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{ transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)" }}
    >
      {children}
    </div>
  )
}

/* ────────────────────────────────────────────────
   HeroParallaxScene — the hero image card scales/lifts
   slightly as the page scrolls past it, plus a subtle
   inner-image drift. Used only for the hero.
   ──────────────────────────────────────────────── */
export function HeroParallax({
  src,
  alt,
  children,
}: {
  src: string
  alt: string
  children?: ReactNode
}) {
  const frameRef = useRef<HTMLDivElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = imgRef.current
    if (!img) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY
      img.style.transform = `translate3d(0, ${(y * 0.12).toFixed(1)}px, 0) scale(1.16)`
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={frameRef} className="relative h-full w-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        style={{ transform: "scale(1.16)", willChange: "transform" }}
      />
      {children}
    </div>
  )
}
