"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Review } from "@/lib/types";

const SOURCE_LABELS: Record<string, string> = {
  google: "Google",
  tripadvisor: "Tripadvisor",
  instagram: "Instagram",
};

export function Testimonials({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews] = useState<Review[]>(initialReviews);
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || reviews.length === 0) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(t);
  }, [auto, reviews.length]);

  if (reviews.length === 0) return null;

  const current = reviews[idx];

  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
            Lo que dice la gente
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            4.9 de 5,
            <br />
            <span className="italic text-primary">2,849 reseñas.</span>
          </h2>
          <div className="mt-4 flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>

        {/* Featured review */}
        <div
          className="relative mt-12 overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-lg sm:p-12"
          onMouseEnter={() => setAuto(false)}
          onMouseLeave={() => setAuto(true)}
        >
          <Quote className="absolute right-6 top-6 h-16 w-16 text-primary/8" />

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 20 }}
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
                    className="h-9 w-9 rounded-full"
                    onClick={() => setIdx((i) => (i - 1 + reviews.length) % reviews.length)}
                    aria-label="Reseña anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full"
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
        <div className="mt-6 flex justify-center gap-1.5">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-primary/40"
              }`}
              aria-label={`Ir a reseña ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
