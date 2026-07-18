import { useEffect, useRef, useState } from "react";
import { Card, type CardSide } from "./Card";
import { haptics } from "../utils/haptics";
import type { Choice, Pair } from "../types";

interface CardGameProps {
  pairs: Pair[];
  onComplete: (choices: Choice[]) => void;
}

const ADVANCE_DELAY_MS = 450;

export function CardGame({ pairs, onComplete }: CardGameProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<CardSide | null>(null);
  const [nudge, setNudge] = useState(false);
  const choicesRef = useRef<Choice[]>([]);
  const timerRef = useRef<number | undefined>(undefined);

  const pair = pairs[index];
  const remaining = pairs.length - index - 1;

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  // Wiggle the cards if the player has been staring at this pair for a while.
  useEffect(() => {
    setNudge(false);
    const timer = window.setTimeout(() => setNudge(true), 6000);
    return () => window.clearTimeout(timer);
  }, [index]);

  // Keyboard: arrow keys pick a side.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") choose("left");
      if (e.key === "ArrowRight") choose("right");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function choose(side: CardSide) {
    if (picked || !pair) return;
    setPicked(side);
    haptics.pick();

    const chosen = side === "left" ? pair.left : pair.right;
    const other = side === "left" ? pair.right : pair.left;
    choicesRef.current = [
      ...choicesRef.current,
      { pairId: pair.id, chosen, other },
    ];

    timerRef.current = window.setTimeout(() => {
      if (index + 1 >= pairs.length) {
        haptics.finish();
        onComplete(choicesRef.current);
      } else {
        setPicked(null);
        setIndex(index + 1);
      }
    }, ADVANCE_DELAY_MS);
  }

  if (!pair) return null;

  const stackMods = `${remaining > 0 ? " stack--one" : ""}${remaining > 1 ? " stack--two" : ""}`;

  return (
    <>
      <div className="masthead__sub">{pair.title}</div>
      <div className={`arena${nudge && !picked ? " arena--nudge" : ""}`}>
        <div className={`stack stack--left${stackMods}`}>
          <Card
            key={`${pair.id}-left`}
            label={pair.left}
            side="left"
            number={index + 1}
            state={
              picked === "left"
                ? "picked"
                : picked === "right"
                  ? "faded"
                  : "idle"
            }
            onChoose={() => choose("left")}
          />
        </div>
        <div className="vs" key={`${pair.id}-vs`}>
          VS
        </div>
        <div className={`stack stack--right${stackMods}`}>
          <Card
            key={`${pair.id}-right`}
            label={pair.right}
            side="right"
            number={index + 1}
            state={
              picked === "right"
                ? "picked"
                : picked === "left"
                  ? "faded"
                  : "idle"
            }
            onChoose={() => choose("right")}
          />
        </div>
      </div>

      <div className="hint">Swipe outward, or tap to choose</div>
      <div
        className="progress"
        aria-label={`Question ${index + 1} of ${pairs.length}`}>
        {pairs.map((p, i) => (
          <span
            key={p.id}
            className={`pip${i < index ? " pip--done" : ""}${i === index ? " pip--current" : ""}`}
          />
        ))}
      </div>
    </>
  );
}
