import { Coffee, Sparkles } from "lucide-react";

type BrandMarqueeProps = {
  tone?: "maiz" | "barro" | "bugambilia";
  label?: string;
};

const WORDS = [
  "Café de altura",
  "Barro caliente",
  "Pan de barrio",
  "Masa al comal",
];

export function BrandMarquee({
  tone = "maiz",
  label = "Café de altura, barro caliente, pan de barrio y masa al comal",
}: BrandMarqueeProps) {
  return (
    <div
      className={`brand-marquee brand-marquee--${tone}`}
      aria-label={label}
      role="note"
    >
      <div className="brand-marquee__track" aria-hidden="true">
        {[0, 1].map((copy) => (
          <div className="brand-marquee__group" key={copy}>
            {WORDS.map((word, index) => (
              <span className="brand-marquee__item" key={`${copy}-${word}`}>
                {index % 2 === 0 ? <Coffee /> : <Sparkles />}
                {word}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
