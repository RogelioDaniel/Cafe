"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DISPLAY_MS = 2600;
const REDUCED_MOTION_DISPLAY_MS = 650;
const EXIT_MS = 900;
const HARD_TIMEOUT_MS = 4200;

const CUP_MODELS = [
  "bandas",
  "jarrito",
  "pocillo",
  "olla",
  "espresso",
  "campana",
  "jicara",
  "tarro",
  "barro-negro",
  "talavera",
] as const;

type IntroPhase = "visible" | "leaving" | "hidden";
type CupModel = (typeof CUP_MODELS)[number];

const INTRO_TONES = ["azul", "maiz", "bugambilia", "hoja", "barro"] as const;
const CUP_MOODS = ["feliz", "guino", "sorpresa"] as const;

type IntroTone = (typeof INTRO_TONES)[number];
type CupMood = (typeof CUP_MOODS)[number];

export function CoffeeIntro() {
  const [phase, setPhase] = useState<IntroPhase>("visible");
  const [cupModel, setCupModel] = useState<CupModel | null>(null);
  const [introTone, setIntroTone] = useState<IntroTone>("azul");
  const [cupMood, setCupMood] = useState<CupMood>("feliz");
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hardTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);
  const finishing = useRef(false);
  const reducedMotionRef = useRef(false);

  const resetToStart = useCallback(() => {
    const cleanUrl = `${window.location.pathname}${window.location.search}`;
    if (window.location.hash) {
      window.history.replaceState(window.history.state, "", cleanUrl);
    }

    document.documentElement.classList.add("paper-navigation--jumping");
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      window.requestAnimationFrame(() => {
        document.documentElement.classList.remove("paper-navigation--jumping");
      });
    });
  }, []);

  const finish = useCallback(() => {
    if (finishing.current) return;
    finishing.current = true;

    if (exitTimer.current) clearTimeout(exitTimer.current);
    document.documentElement.classList.add("tonalli-hero-ready");
    document.documentElement.classList.add("tonalli-intro-tearing");
    window.dispatchEvent(new Event("tonalli:intro-complete"));
    setPhase("leaving");
    hideTimer.current = setTimeout(() => {
      setPhase("hidden");
      document.documentElement.classList.remove("tonalli-intro-tearing");
      document.documentElement.style.removeProperty("overflow");
      document.body.style.removeProperty("overflow");
      document.querySelector<HTMLElement>(".tonalli-site-stage")?.removeAttribute("inert");
      resetToStart();
      if (hardTimer.current) clearTimeout(hardTimer.current);
    }, reducedMotionRef.current ? 40 : EXIT_MS);
  }, [resetToStart]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const previousScrollRestoration = window.history.scrollRestoration;
    const randomValues = new Uint32Array(3);
    window.crypto.getRandomValues(randomValues);
    setCupModel(CUP_MODELS[randomValues[0] % CUP_MODELS.length]);
    setIntroTone(INTRO_TONES[randomValues[1] % INTRO_TONES.length]);
    setCupMood(CUP_MOODS[randomValues[2] % CUP_MOODS.length]);
    reducedMotionRef.current = reducedMotion.matches;
    window.history.scrollRestoration = "manual";
    resetToStart();
    document.documentElement.classList.remove("tonalli-intro-seen");
    document.documentElement.classList.remove("tonalli-hero-ready");
    document.documentElement.classList.remove("tonalli-intro-tearing");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.querySelector<HTMLElement>(".tonalli-site-stage")?.setAttribute("inert", "");
    skipButtonRef.current?.focus({ preventScroll: true });

    exitTimer.current = setTimeout(
      finish,
      reducedMotion.matches ? REDUCED_MOTION_DISPLAY_MS : DISPLAY_MS
    );
    hardTimer.current = setTimeout(() => {
      if (!finishing.current) {
        finishing.current = true;
        window.dispatchEvent(new Event("tonalli:intro-complete"));
      }
      document.documentElement.classList.add("tonalli-hero-ready");
      document.documentElement.classList.remove("tonalli-intro-tearing");
      setPhase("hidden");
      document.documentElement.style.removeProperty("overflow");
      document.body.style.removeProperty("overflow");
      document.querySelector<HTMLElement>(".tonalli-site-stage")?.removeAttribute("inert");
      resetToStart();
    }, HARD_TIMEOUT_MS);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      event.preventDefault();
      skipButtonRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener("keydown", onKeyDown);

    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      window.history.scrollRestoration = "manual";
      resetToStart();
    };
    window.addEventListener("pageshow", onPageShow);

    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      if (event.matches) finish();
    };
    reducedMotion.addEventListener("change", onMotionChange);

    return () => {
      reducedMotion.removeEventListener("change", onMotionChange);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pageshow", onPageShow);
      window.history.scrollRestoration = previousScrollRestoration;
      if (exitTimer.current) clearTimeout(exitTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (hardTimer.current) clearTimeout(hardTimer.current);
      document.documentElement.classList.remove("tonalli-intro-tearing");
      document.documentElement.style.removeProperty("overflow");
      document.body.style.removeProperty("overflow");
      document.querySelector<HTMLElement>(".tonalli-site-stage")?.removeAttribute("inert");
    };
  }, [finish, resetToStart]);

  if (phase === "hidden") return null;

  return (
    <div
      className={`coffee-intro ${phase === "leaving" ? "is-leaving" : ""}`}
      data-intro-tone={introTone}
      role="dialog"
      aria-modal="true"
      aria-label="Café Tonalli está cargando"
    >
      <div className="coffee-intro__paper-lines" aria-hidden="true" />
      <div className="coffee-intro__grain" aria-hidden="true" />
      <div className="coffee-intro__perforation" aria-hidden="true" />

      <button ref={skipButtonRef} className="coffee-intro__skip" type="button" onClick={finish}>
        Saltar introducción
      </button>

      <div className="coffee-intro__stage" aria-hidden="true">
        <div
          className={`coffee-intro__loader-mark ${cupModel ? "is-ready" : ""}`}
          data-cup-model={cupModel ?? undefined}
          data-cup-mood={cupMood}
        >
          <span className="coffee-intro__spark coffee-intro__spark--one" />
          <span className="coffee-intro__spark coffee-intro__spark--two" />
          <span className="coffee-intro__stream" />
          <span className="coffee-intro__cup">
            <span className="coffee-intro__well">
              <span className="coffee-intro__fill" />
            </span>
            <span className="coffee-intro__face">
              <span className="coffee-intro__eye coffee-intro__eye--left" />
              <span className="coffee-intro__eye coffee-intro__eye--right" />
              <span className="coffee-intro__mouth" />
            </span>
            <span className="coffee-intro__foot coffee-intro__foot--left" />
            <span className="coffee-intro__foot coffee-intro__foot--right" />
          </span>
        </div>
      </div>

      <div className="coffee-intro__copy">
        <p className="coffee-intro__eyebrow">Comanda ilustrada · Roma Norte</p>
        <p className="coffee-intro__title">Tu primera taza está despertando.</p>
        <div className="coffee-intro__steps" aria-live="polite">
          <span>Tostar</span>
          <span>Verter</span>
          <span>Despertar</span>
        </div>
      </div>
    </div>
  );
}
