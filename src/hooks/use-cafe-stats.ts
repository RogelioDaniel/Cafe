"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { CafeState, Stats } from "@/lib/types";

interface UseCafeStatsResult {
  state: CafeState | null;
  connected: boolean;
}

const INITIAL_FALLBACK: CafeState = {
  cups_today: 1847,
  orders_today: 312,
  reservations_today: 48,
  happy_customers: 28493,
  viewers_now: 23,
  tables: [],
  wait_time_minutes: 8,
};

export function useCafeStats(): UseCafeStatsResult {
  const [state, setState] = useState<CafeState | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Fetch initial stats from API (works even if WS is down)
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data: Stats) => {
        setState((prev) =>
          prev
            ? { ...prev, ...data }
            : { ...INITIAL_FALLBACK, ...data }
        );
      })
      .catch(() => {
        setState((prev) => prev ?? INITIAL_FALLBACK);
      });

    // Connect WebSocket — path "/" with XTransformPort for Caddy gateway
    const socket = io("/?XTransformPort=3003", {
      transports: ["websocket", "polling"],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1500,
      timeout: 12000,
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("stats:snapshot", (snap: CafeState) => {
      setState(snap);
    });

    socket.on("stats:update", (patch: Partial<CafeState>) => {
      setState((prev) => (prev ? { ...prev, ...patch } : prev));
    });

    socket.on("stats:viewers", (patch: { viewers_now: number }) => {
      setState((prev) => (prev ? { ...prev, ...patch } : prev));
    });

    socket.on("stats:milestone", (patch: { happy_customers: number }) => {
      setState((prev) => (prev ? { ...prev, ...patch } : prev));
    });

    // Request a fresh snapshot shortly after connect
    socket.on("connect", () => {
      socket.emit("subscribe");
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { state, connected };
}
