"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DISPLAY_MS = 2200;
const REDUCED_MOTION_DISPLAY_MS = 650;
const EXIT_MS = 300;
const HARD_TIMEOUT_MS = 2900;

type IntroPhase = "visible" | "leaving" | "hidden";

export function CoffeeIntro() {
  const [phase, setPhase] = useState<IntroPhase>("visible");
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hardTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishing = useRef(false);

  const finish = useCallback(() => {
    if (finishing.current) return;
    finishing.current = true;

    if (exitTimer.current) clearTimeout(exitTimer.current);
    if (hardTimer.current) clearTimeout(hardTimer.current);

    setPhase("leaving");
    hideTimer.current = setTimeout(() => {
      setPhase("hidden");
      document.body.style.removeProperty("overflow");
    }, EXIT_MS);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    document.documentElement.classList.remove("tonalli-intro-seen");
    document.body.style.overflow = "hidden";

    exitTimer.current = setTimeout(
      finish,
      reducedMotion.matches ? REDUCED_MOTION_DISPLAY_MS : DISPLAY_MS
    );
    hardTimer.current = setTimeout(finish, HARD_TIMEOUT_MS);

    const onMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) finish();
    };
    reducedMotion.addEventListener("change", onMotionChange);

    return () => {
      reducedMotion.removeEventListener("change", onMotionChange);
      if (exitTimer.current) clearTimeout(exitTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (hardTimer.current) clearTimeout(hardTimer.current);
      document.body.style.removeProperty("overflow");
    };
  }, [finish]);

  if (phase === "hidden") return null;

  return (
    <div
      className={`coffee-intro ${phase === "leaving" ? "is-leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Café Tonalli está cargando"
    >
      <div className="coffee-intro__grain" aria-hidden="true" />

      <button className="coffee-intro__skip" type="button" onClick={finish}>
        Saltar introducción
      </button>

      <div className="coffee-intro__stage" aria-hidden="true">
        <div className="coffee-intro__loader-mark">
          <span className="coffee-intro__stream" />
          <span className="coffee-intro__cup">
            <span className="coffee-intro__fill" />
          </span>
        </div>
      </div>

      <div className="coffee-intro__copy">
        <p className="coffee-intro__eyebrow">Café Tonalli · Roma Norte</p>
        <p className="coffee-intro__title">El ritual está por comenzar.</p>
        <div className="coffee-intro__steps" aria-live="polite">
          <span>Moler</span>
          <span>Verter</span>
          <span>Servir</span>
        </div>
      </div>
    </div>
  );
}
