import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { CardIcon } from "./CardIcon";
import { haptics } from "../utils/haptics";

export type CardSide = "left" | "right";
export type CardState = "idle" | "picked" | "faded";

interface CardProps {
  label: string;
  side: CardSide;
  number: number;
  state: CardState;
  onChoose: () => void;
}

const SWIPE_THRESHOLD = 70;
// Horizontal speed (px/ms) that counts as a flick even short of the distance threshold.
const FLICK_VELOCITY = 0.55;

/**
 * A swipeable playing card. Drag it outward past the threshold (or simply
 * tap it) to choose it. Drag transforms are applied directly to the DOM node
 * so the gesture stays smooth without re-rendering on every pointer move.
 */
export function Card({ label, side, state, onChoose }: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0,
    active: false,
    moved: false,
    armed: false,
    // Smoothed horizontal velocity in px/ms, for flick detection and momentum.
    vx: 0,
    lastX: 0,
    lastT: 0,
  });

  function isOutward(dx: number) {
    return side === "left" ? dx < -SWIPE_THRESHOLD : dx > SWIPE_THRESHOLD;
  }

  function pointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (state !== "idle") return;
    const el = ref.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      dx: 0,
      dy: 0,
      active: true,
      moved: false,
      armed: false,
      vx: 0,
      lastX: e.clientX,
      lastT: performance.now(),
    };
    el.style.transition = "none";
    // Cancel the deal-in animation so it can't fight the drag transform.
    el.style.animation = "none";
  }

  function pointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    const el = ref.current;
    if (!d.active || !el) return;
    d.dx = e.clientX - d.startX;
    d.dy = e.clientY - d.startY;
    if (Math.abs(d.dx) > 5 || Math.abs(d.dy) > 5) d.moved = true;
    const now = performance.now();
    const dt = now - d.lastT;
    if (dt > 0) {
      // Exponential smoothing keeps one jittery pointer sample from spiking the velocity.
      d.vx = 0.75 * d.vx + 0.25 * ((e.clientX - d.lastX) / dt);
      d.lastX = e.clientX;
      d.lastT = now;
    }
    // A small buzz when the swipe crosses the release threshold.
    const outward = isOutward(d.dx);
    if (outward && !d.armed) haptics.tick();
    d.armed = outward;
    const rot = d.dx / 25;
    el.style.transform = `translate(${d.dx}px, ${d.dy * 0.3}px) rotate(${rot}deg)`;
  }

  function pointerUp() {
    const d = drag.current;
    const el = ref.current;
    if (!d.active || !el) return;
    d.active = false;

    const dir = side === "left" ? -1 : 1;
    const flicked = d.moved && d.vx * dir > FLICK_VELOCITY;

    if (isOutward(d.dx) || flicked || !d.moved) {
      // Fly outward with the release momentum, then let the parent advance.
      const speed = Math.min(Math.abs(d.vx), 3);
      const flyX = dir * (90 + speed * 70);
      const rot = dir * Math.min(4 + speed * 5, 16);
      el.style.transition = "";
      el.style.transform = `translate(${flyX}px, ${d.dy * 0.3}px) rotate(${rot}deg) scale(1.05)`;
      onChoose();
    } else {
      // Spring back with a little overshoot.
      el.style.transition =
        "transform 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.35), opacity 0.35s ease, box-shadow 0.2s ease";
      el.style.transform = "";
    }
    d.dx = 0;
    d.dy = 0;
    d.vx = 0;
  }

  return (
    <div
      ref={ref}
      className={`card card--${side}${state === "picked" ? " card--picked" : ""}${state === "faded" ? " card--faded" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`Choose ${label}`}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerUp}
      onKeyDown={(e) => {
        if (state === "idle" && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onChoose();
        }
      }}>
      <div className="card__inner">
        <div className="card__label">{label}</div>
        <div className="card__icon">
          <CardIcon label={label} />
        </div>
        {/* <div className="card__number">{number}</div> */}
      </div>
    </div>
  );
}
