"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

const SESSION_KEY = "tonalli:intro:v2";
const HARD_TIMEOUT_MS = 4500;
const SCENE_DURATION_MS = 2600;

const CoffeePourScene = dynamic(
  () => import("./coffee-pour-scene").then((mod) => mod.CoffeePourScene),
  { ssr: false }
);

type IntroPhase = "visible" | "leaving" | "hidden";

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

export function CoffeeIntro() {
  const [phase, setPhase] = useState<IntroPhase>("visible");
  const [canRenderScene, setCanRenderScene] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = useCallback(() => {
    if (exitTimer.current) clearTimeout(exitTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);

    setPhase("leaving");
    hideTimer.current = setTimeout(() => {
      setPhase("hidden");
      document.documentElement.classList.add("tonalli-intro-seen");
      document.body.style.removeProperty("overflow");
      try {
        sessionStorage.setItem(SESSION_KEY, "seen");
      } catch {
        // Storage can be unavailable in private or hardened browsing modes.
      }
    }, 360);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData;
    let alreadySeen = document.documentElement.classList.contains(
      "tonalli-intro-seen"
    );

    try {
      alreadySeen = alreadySeen || sessionStorage.getItem(SESSION_KEY) === "seen";
    } catch {
      // Keep the intro available when session storage cannot be read.
    }

    if (alreadySeen || reducedMotion.matches || saveData) {
      document.documentElement.classList.add("tonalli-intro-seen");
      setPhase("hidden");
      return;
    }

    document.body.style.overflow = "hidden";
    setCanRenderScene(true);

    const hardTimeout = setTimeout(finish, HARD_TIMEOUT_MS);
    const onMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) finish();
    };
    reducedMotion.addEventListener("change", onMotionChange);

    return () => {
      clearTimeout(hardTimeout);
      reducedMotion.removeEventListener("change", onMotionChange);
      if (exitTimer.current) clearTimeout(exitTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      document.body.style.removeProperty("overflow");
    };
  }, [finish]);

  useEffect(() => {
    if (!sceneReady || phase !== "visible") return;
    exitTimer.current = setTimeout(finish, SCENE_DURATION_MS);
    return () => {
      if (exitTimer.current) clearTimeout(exitTimer.current);
    };
  }, [finish, phase, sceneReady]);

  if (phase === "hidden") return null;

  return (
    <div
      className={`coffee-intro ${phase === "leaving" ? "is-leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Introducción de Café Tonalli"
    >
      <div className="coffee-intro__grain" aria-hidden="true" />

      <button className="coffee-intro__skip" type="button" onClick={finish}>
        Saltar introducción
      </button>

      <div className="coffee-intro__stage" aria-hidden="true">
        <div
          className={`coffee-intro__fallback ${sceneReady ? "is-ready" : ""}`}
        >
          <span className="coffee-intro__stream" />
          <span className="coffee-intro__cup">
            <span className="coffee-intro__fill" />
          </span>
        </div>
        {canRenderScene && (
          <CoffeePourScene onReady={() => setSceneReady(true)} />
        )}
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
