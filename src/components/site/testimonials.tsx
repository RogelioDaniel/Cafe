"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Review } from "@/lib/types";
import { TonalliConchaDoodle } from "./tonalli-doodles";

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
    const timer = setInterval(() => {
      setIdx((current) => (current + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [auto, reduceMotion, reviews.length]);

  if (reviews.length === 0) return null;

  const visibleReviews = Array.from(
    { length: Math.min(3, reviews.length) },
    (_, offset) => reviews[(idx + offset) % reviews.length]
  );

  return (
    <section className="sobremesa-section relative overflow-hidden py-20 sm:py-28">
      <TonalliConchaDoodle className="testimonial-doodle" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 border-b-2 border-[#fff8d8]/25 pb-8 sm:grid-cols-[1fr_auto] sm:items-end sm:text-left">
          <div>
            <p className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#f3df4d]">
              <span className="coffee-bean-mark" aria-hidden="true" />
              Lo que dice la gente
            </p>
            <h2 className="mt-4 font-display text-4xl leading-[0.98] tracking-[-0.035em] text-[#fff8d8] sm:text-5xl lg:text-6xl">
              Sobremesas que
              <br />
              <span className="text-[#f3df4d]">se vuelven reseñas.</span>
            </h2>
          </div>
          <div className="sm:text-right">
            <div className="flex items-center gap-1 sm:justify-end">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 fill-[#f3df4d] text-[#f3df4d]" />
              ))}
            </div>
            <p className="mt-2 font-display text-2xl text-[#fff8d8]">4.9 de 5</p>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#fff8d8]/62">
              2,849 reseñas
            </p>
          </div>
        </div>

        <div
          className="mt-12"
          onMouseEnter={() => setAuto(false)}
          onMouseLeave={() => setAuto(true)}
          onFocusCapture={() => setAuto(false)}
          onBlurCapture={() => setAuto(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.42 }}
              className="grid gap-5 md:grid-cols-3"
              aria-live="polite"
            >
              {visibleReviews.map((review, offset) => (
                <article
                  className={`coffee-note testimonial-card testimonial-card--${offset + 1} relative flex min-h-[22rem] flex-col overflow-hidden rounded-[1.45rem] border-[3px] border-[#1d2059] p-6 text-[#1d2059] shadow-[7px_9px_0_#0d103d] sm:p-7`}
                  key={`${review.id}-${offset}`}
                >
                  <Quote className="absolute right-5 top-5 h-12 w-12 opacity-15" />
                  <div className="flex items-center gap-1">
                    {Array.from({ length: review.rating }).map((_, star) => (
                      <Star key={star} className="h-4 w-4 fill-[#1d2059] text-[#1d2059]" />
                    ))}
                  </div>
                  <blockquote className="mt-6 font-display text-xl leading-[1.25] sm:text-2xl">
                    “{review.comment}”
                  </blockquote>
                  <div className="mt-auto flex items-center gap-3 pt-7">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#1d2059] bg-[#fff8d8] font-display text-base shadow-[2px_3px_0_#1d2059]">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-extrabold">{review.name}</p>
                      <p className="text-xs font-semibold text-[#1d2059]/65">
                        vía {SOURCE_LABELS[review.source] ?? review.source}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-7 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="testimonial-control h-11 w-11 cursor-pointer rounded-full"
            onClick={() => setIdx((current) => (current - 1 + reviews.length) % reviews.length)}
            aria-label="Reseña anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-1">
            {reviews.map((_, reviewIndex) => (
              <button
                key={reviewIndex}
                onClick={() => setIdx(reviewIndex)}
                className="group flex h-11 w-8 cursor-pointer items-center justify-center rounded-full"
                aria-label={`Ir a reseña ${reviewIndex + 1}`}
              >
                <span className={`block h-2 rounded-full border border-[#fff8d8]/35 transition-all ${reviewIndex === idx ? "w-6 bg-[#f3df4d]" : "w-2 bg-[#fff8d8]/35 group-hover:bg-[#fff8d8]/70"}`} />
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="testimonial-control h-11 w-11 cursor-pointer rounded-full"
            onClick={() => setIdx((current) => (current + 1) % reviews.length)}
            aria-label="Siguiente reseña"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
