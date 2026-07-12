// Tiny canvas confetti in the app palette — no dependency needed.

const COLORS = ['#e22a30', '#911223', '#f3dcdc', '#ffffff']
const DURATION_MS = 1800
const PARTICLE_COUNT = 55

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  w: number
  h: number
  color: string
}

/**
 * A gentle celebratory sprinkle from the top of the screen. Returns a cancel
 * function (used by StrictMode double-mount cleanup).
 */
export function burstConfetti(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => {}
  }

  const canvas = document.createElement('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60;'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')

  const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2
    const speed = 3 + Math.random() * 5
    return {
      x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.35,
      y: canvas.height * 0.3,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.25,
      w: 4 + Math.random() * 4,
      h: 6 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }
  })

  const start = performance.now()
  let frame = 0

  function tick(now: number) {
    if (!ctx) return
    const t = (now - start) / DURATION_MS
    if (t >= 1) {
      canvas.remove()
      return
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // Softer than full-strength, fading out over the back half.
    ctx.globalAlpha = 0.85 * (t > 0.55 ? 1 - (t - 0.55) / 0.45 : 1)
    for (const p of particles) {
      p.vy += 0.13
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    }
    frame = requestAnimationFrame(tick)
  }

  frame = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(frame)
    canvas.remove()
  }
}
