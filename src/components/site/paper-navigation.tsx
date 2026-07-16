"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  invalidatePageCrumpleSnapshot,
  preparePageCrumple,
  primePageCrumpleSnapshot,
  runPageCrumpleTransition,
  type PageCrumplePhase,
} from "./page-crumple-transition";

type PaperPhase = "idle" | PageCrumplePhase;

type PaperNavigationOptions = {
  label?: string;
  /** Lets the mobile menu close before capturing the current viewport. */
  delay?: number;
};

type PaperNavigationContextValue = {
  navigate: (
    event: MouseEvent<HTMLAnchorElement>,
    hash: string,
    options?: PaperNavigationOptions
  ) => void;
};

const PaperNavigationContext = createContext<PaperNavigationContextValue | null>(null);

const PAPER_DESTINATIONS: Record<string, string> = {
  "#inicio": "El comal abre",
  "#menu": "La carta de hoy",
  "#historia": "Del metate a la memoria",
  "#reservar": "Tu mesa se prepara",
  "#ubicacion": "Rumbo a Roma Norte",
};

const PHASE_MESSAGES: Record<Exclude<PaperPhase, "idle">, string> = {
  capturing: "Preparando esta página como una hoja",
  crumpling: "Arrugando la página actual",
  swapping: "Cambiando la comanda dentro del papel",
  uncrumpling: "Desarrugando la página de destino",
};

function getHashTarget(hash: string) {
  if (!hash.startsWith("#") || hash.length < 2) return null;

  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
}

export function PaperNavigationProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<PaperPhase>("idle");
  const [destination, setDestination] = useState(PAPER_DESTINATIONS["#inicio"]);
  const timers = useRef<number[]>([]);
  const transitionAbort = useRef<AbortController | null>(null);
  const running = useRef(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  const schedule = useCallback((callback: () => void, timeout: number) => {
    const timer = window.setTimeout(callback, timeout);
    timers.current.push(timer);
    return timer;
  }, []);

  const commitTarget = useCallback((hash: string, target: HTMLElement) => {
    const root = document.documentElement;
    root.classList.add("paper-navigation--jumping");

    if (window.location.hash !== hash) {
      window.history.pushState(null, "", hash);
    }
    target.scrollIntoView({ block: "start", behavior: "auto" });

    window.requestAnimationFrame(() => {
      root.classList.remove("paper-navigation--jumping");
    });
  }, []);

  const focusDestination = useCallback((target: HTMLElement, shouldFocus: boolean) => {
    if (!shouldFocus) return;
    const previousTabIndex = target.getAttribute("tabindex");
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });

    if (previousTabIndex === null) {
      target.addEventListener(
        "blur",
        () => target.removeAttribute("tabindex"),
        { once: true }
      );
    }
  }, []);

  const startNavigation = useCallback(
    (hash: string, target: HTMLElement, options: PaperNavigationOptions, focusTarget: boolean) => {
      clearTimers();
      running.current = true;
      const label = options.label ?? PAPER_DESTINATIONS[hash] ?? "La siguiente parada";
      setDestination(label);

      const begin = async () => {
        const controller = new AbortController();
        transitionAbort.current = controller;
        let committed = false;

        const commitOnce = () => {
          if (committed) return;
          committed = true;
          commitTarget(hash, target);
        };

        const hardTimer = window.setTimeout(() => controller.abort(), 7600);
        timers.current.push(hardTimer);

        try {
          const animated = await runPageCrumpleTransition({
            signal: controller.signal,
            onCovered: commitOnce,
            onPhaseChange: setPhase,
          });
          if (!animated) commitOnce();
        } catch {
          commitOnce();
        } finally {
          window.clearTimeout(hardTimer);
          commitOnce();
          focusDestination(target, focusTarget);
          transitionAbort.current = null;
          running.current = false;
          setPhase("idle");
        }
      };

      if (options.delay) {
        schedule(() => void begin(), options.delay);
      } else {
        void begin();
      }
    },
    [clearTimers, commitTarget, focusDestination, schedule]
  );

  const navigate = useCallback<PaperNavigationContextValue["navigate"]>(
    (event, hash, options = {}) => {
      const anchor = event.currentTarget;
      const target = getHashTarget(hash);
      const isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      const isKeyboardActivation = event.detail === 0;
      const isPrimaryActivation = isKeyboardActivation || event.button === 0;

      if (running.current || phase !== "idle") {
        event.preventDefault();
        return;
      }

      if (
        event.defaultPrevented ||
        !isPrimaryActivation ||
        isModified ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        !target
      ) {
        return;
      }

      event.preventDefault();
      startNavigation(hash, target, options, isKeyboardActivation);
    },
    [phase, startNavigation]
  );

  useEffect(() => {
    const warmup = window.setTimeout(preparePageCrumple, 900);

    // La cache de captura en background se valida por tamaño + posición de
    // scroll. Invalidamos al asentarse scroll/resize para forzar una
    // recaptura fresca antes del siguiente click.
    const onViewportSettled = () => {
      invalidatePageCrumpleSnapshot();
      // Recalentamos la cache en idle tras un breve asentamiento.
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(() => void primePageCrumpleSnapshot(), { timeout: 2000 });
      } else {
        window.setTimeout(() => void primePageCrumpleSnapshot(), 400);
      }
    };
    let settleTimer: number | null = null;
    const debouncedSettle = () => {
      if (settleTimer !== null) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        settleTimer = null;
        onViewportSettled();
      }, 500);
    };
    window.addEventListener("scroll", debouncedSettle, { passive: true });
    window.addEventListener("resize", debouncedSettle, { passive: true });

    return () => {
      window.clearTimeout(warmup);
      if (settleTimer !== null) window.clearTimeout(settleTimer);
      window.removeEventListener("scroll", debouncedSettle);
      window.removeEventListener("resize", debouncedSettle);
      transitionAbort.current?.abort();
      clearTimers();
      running.current = false;
      document.documentElement.classList.remove("paper-navigation--jumping");
    };
  }, [clearTimers]);

  return (
    <PaperNavigationContext.Provider value={{ navigate }}>
      {children}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {phase === "idle" ? "" : `${PHASE_MESSAGES[phase]}. Abriendo ${destination}`}
      </span>
    </PaperNavigationContext.Provider>
  );
}

export function usePaperNavigation() {
  const context = useContext(PaperNavigationContext);
  if (!context) {
    throw new Error("usePaperNavigation must be used inside PaperNavigationProvider");
  }
  return context;
}
