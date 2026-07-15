"use client";

import { useEffect, useRef, useState } from "react";

type TransitionTone = "azul" | "barro" | "crema" | "hoja" | "maiz" | "noche";

type CoffeeSectionTransitionProps = {
  from: TransitionTone;
  to: TransitionTone;
  label: string;
};

export function CoffeeSectionTransition({
  from,
  to,
  label,
}: CoffeeSectionTransitionProps) {
  const transitionRef = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = transitionRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || reducedMotion.matches) return;

    setArmed(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.3, rootMargin: "0px 0px -10%" }
    );
    observer.observe(element);

    const onMotionChange = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      observer.disconnect();
      setArmed(false);
      setVisible(true);
    };
    reducedMotion.addEventListener("change", onMotionChange);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div
      ref={transitionRef}
      className={`brew-wave brew-wave--from-${from} brew-wave--to-${to} ${armed ? "is-armed" : ""} ${visible ? "is-visible" : ""}`}
      aria-hidden="true"
    >
      <span className="brew-wave__next" />
      <span className="brew-wave__coffee brew-wave__coffee--back" />
      <span className="brew-wave__coffee brew-wave__coffee--front" />
      <span className="brew-wave__ring brew-wave__ring--one" />
      <span className="brew-wave__ring brew-wave__ring--two" />
      <span className="brew-wave__label">{label}</span>
    </div>
  );
}
