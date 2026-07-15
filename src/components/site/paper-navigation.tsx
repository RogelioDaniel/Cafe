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
import { createPortal } from "react-dom";

type PaperTone = "azul" | "barro" | "crema" | "hoja" | "maiz" | "bugambilia";
type PaperPhase = "idle" | "folding" | "unfolding";

type PaperNavigationOptions = {
  label?: string;
  /** Lets the mobile sheet close before the paper covers the page. */
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

const FOLD_MS = 360;
const UNFOLD_MS = 460;

const PAPER_DESTINATIONS: Record<string, { label: string; tone: PaperTone }> = {
  "#inicio": { label: "El comal abre", tone: "azul" },
  "#menu": { label: "La carta de hoy", tone: "maiz" },
  "#historia": { label: "Del metate a la memoria", tone: "barro" },
  "#reservar": { label: "Tu mesa se prepara", tone: "crema" },
  "#ubicacion": { label: "Rumbo a Roma Norte", tone: "hoja" },
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
  const [mounted, setMounted] = useState(false);
  const [destination, setDestination] = useState(PAPER_DESTINATIONS["#inicio"]);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  const schedule = useCallback((callback: () => void, timeout: number) => {
    const timer = window.setTimeout(callback, timeout);
    timers.current.push(timer);
    return timer;
  }, []);

  const moveToTarget = useCallback((hash: string, target: HTMLElement, focusTarget: boolean) => {
    const root = document.documentElement;
    root.classList.add("paper-navigation--jumping");

    // Keep the URL and browser history useful without allowing the global smooth-scroll
    // rule to reveal the destination before the sheet has covered the viewport.
    if (window.location.hash !== hash) {
      window.history.pushState(null, "", hash);
    }
    target.scrollIntoView({ block: "start", behavior: "auto" });

    window.requestAnimationFrame(() => {
      root.classList.remove("paper-navigation--jumping");
    });

    if (focusTarget) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  }, []);

  const startNavigation = useCallback(
    (hash: string, target: HTMLElement, options: PaperNavigationOptions, focusTarget: boolean) => {
      clearTimers();
      const nextDestination = PAPER_DESTINATIONS[hash] ?? {
        label: options.label ?? "La siguiente parada",
        tone: "bugambilia" as PaperTone,
      };
      setDestination({ ...nextDestination, label: options.label ?? nextDestination.label });

      const beginFold = () => {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (reducedMotion.matches) {
          moveToTarget(hash, target, focusTarget);
          setPhase("idle");
          return;
        }

        setPhase("folding");
        schedule(() => {
          moveToTarget(hash, target, focusTarget);
          setPhase("unfolding");
          schedule(() => setPhase("idle"), UNFOLD_MS);
        }, FOLD_MS);
      };

      if (options.delay) {
        setPhase("idle");
        schedule(beginFold, options.delay);
        return;
      }

      beginFold();
    },
    [clearTimers, moveToTarget, schedule]
  );

  const navigate = useCallback<PaperNavigationContextValue["navigate"]>(
    (event, hash, options = {}) => {
      const anchor = event.currentTarget;
      const target = getHashTarget(hash);
      const isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      const isKeyboardActivation = event.detail === 0;
      const isPrimaryActivation = isKeyboardActivation || event.button === 0;

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
    [startNavigation]
  );

  useEffect(() => {
    setMounted(true);
    return () => {
      clearTimers();
      document.documentElement.classList.remove("paper-navigation--jumping");
    };
  }, [clearTimers]);

  const overlay = (
    <>
      <div
        className={`paper-navigation paper-navigation--${phase}`}
        data-paper-tone={destination.tone}
        aria-hidden="true"
      >
        <div className="paper-navigation__cover" />
        <div className="paper-navigation__sheet">
          <span className="paper-navigation__ruled-lines" />
          <span className="paper-navigation__crease" />
          <span className="paper-navigation__corner" />
          <div className="paper-navigation__copy">
            <span>Comanda de ruta</span>
            <strong>{destination.label}</strong>
            <small>doblar · llevar · desdoblar</small>
          </div>
          <span className="paper-navigation__tear" />
        </div>
      </div>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {phase === "idle" ? "" : `Abriendo ${destination.label}`}
      </span>
    </>
  );

  return (
    <PaperNavigationContext.Provider value={{ navigate }}>
      {children}
      {mounted ? createPortal(overlay, document.body) : null}
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
