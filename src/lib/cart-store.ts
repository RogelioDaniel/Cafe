"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, MenuItem } from "@/lib/types";

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  add: (item: MenuItem) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      add: (item) =>
        set((s) => {
          const existing = s.lines.find((l) => l.slug === item.slug);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.slug === item.slug ? { ...l, qty: l.qty + 1 } : l
              ),
              isOpen: true,
            };
          }
          return {
            lines: [
              ...s.lines,
              {
                slug: item.slug,
                name: item.name,
                price: item.price,
                image: item.image,
                qty: 1,
              },
            ],
            isOpen: true,
          };
        }),
      remove: (slug) =>
        set((s) => ({ lines: s.lines.filter((l) => l.slug !== slug) })),
      setQty: (slug, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => l.slug !== slug)
              : s.lines.map((l) =>
                  l.slug === slug ? { ...l, qty } : l
                ),
        })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      count: () => get().lines.reduce((acc, l) => acc + l.qty, 0),
      subtotal: () =>
        get().lines.reduce((acc, l) => acc + l.price * l.qty, 0),
    }),
    {
      name: "tonalli-cart",
      partialize: (s) => ({ lines: s.lines }),
    }
  )
);
