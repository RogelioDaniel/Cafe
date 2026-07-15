"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Review } from "@/lib/types";

const SOURCE_LABELS: Record<string, string> = {
  google: "Google",
  tripadvisor: "Tripadvisor",
  instagram: "Instagram",
};

export function Testimonials({ initialReviews }: { initialReviews: Review[] }) {
  const reduceMotion = useReducedMotion();
  const [reviews] = useState<Review[]>(initialReviews);
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || reduceMotion || reviews.length === 0) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(t);
  }, [auto, reduceMotion, reviews.length]);

  if (reviews.length === 0) return null;

  const current = reviews[idx];

  return (
    <section className="sobremesa-section relative overflow-hidden bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 border-b border-foreground/18 pb-8 sm:grid-cols-[1fr_auto] sm:items-end sm:text-left">
          <div>
          <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-primary">
            <span className="coffee-bean-mark" aria-hidden="true" />
            Lo que dice la gente
          </p>
          <h2 className="mt-3 font-display text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-foreground sm:text-6xl">
            Sobremesas que
            <br />
            <span className="font-normal italic text-primary">se vuelven reseñas.</span>
          </h2>
          </div>
          <div className="sm:text-right">
          <div className="flex items-center gap-1 sm:justify-end">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="mt-2 font-display text-2xl font-semibold text-foreground">4.9 de 5</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">2,849 reseñas</p>
          </div>
        </div>

        {/* Featured review */}
        <div
          className="coffee-note relative mt-12 overflow-hidden rounded-sm border border-border bg-card p-8 shadow-[0_18px_50px_rgba(70,31,15,0.08)] sm:p-12"
          onMouseEnter={() => setAuto(false)}
          onMouseLeave={() => setAuto(true)}
          onFocusCapture={() => setAuto(false)}
          onBlurCapture={() => setAuto(true)}
        >
          <Quote className="absolute right-6 top-6 h-16 w-16 text-primary/8" />

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: current.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="mt-4 font-display text-2xl font-medium leading-relaxed text-foreground sm:text-3xl">
                “{current.comment}”
              </blockquote>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 font-display text-lg font-semibold text-primary">
                    {current.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{current.name}</p>
                    <p className="text-xs text-muted-foreground">
                      vía {SOURCE_LABELS[current.source] ?? current.source}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-full"
                    onClick={() => setIdx((i) => (i - 1 + reviews.length) % reviews.length)}
                    aria-label="Reseña anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-full"
                    onClick={() => setIdx((i) => (i + 1) % reviews.length)}
                    aria-label="Siguiente reseña"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="mt-4 flex justify-center gap-0.5">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="group flex h-11 w-11 cursor-pointer items-center justify-center rounded-full"
              aria-label={`Ir a reseña ${i + 1}`}
            >
              <span className={`block h-1.5 rounded-full transition-all ${
                i === idx ? "w-6 bg-primary" : "w-1.5 bg-border group-hover:bg-primary/40"
              }`} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
