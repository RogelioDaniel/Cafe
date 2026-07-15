"use client";

import { useState } from "react";
import { Coffee, Mail, Instagram, Facebook, Send, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { TonalliBeanDoodle, TonalliConchaDoodle, TonalliCupDoodle } from "./tonalli-doodles";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Escribe un correo válido.");
      return;
    }
    setSubmitting(true);
    // Simulate — in a real app this would POST to an API
    setTimeout(() => {
      setSubmitting(false);
      setEmail("");
      toast.success("¡Listo! Te avisamos de lo nuevo en Tonalli.");
    }, 800);
  }

  return (
    <footer className="tonalli-footer relative mt-auto bg-[#1f7df0] text-[#fff8d8]">
      <div className="footer-papel-trim" aria-hidden="true" />
      {/* Newsletter band */}
      <div className="border-b-[3px] border-[#1d2059] bg-[#1d2059]">
        <div className="footer-newsletter-panel relative mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
          <TonalliBeanDoodle className="footer-doodle footer-doodle--bean" />
          <TonalliCupDoodle className="footer-doodle footer-doodle--cup" />
          <TonalliConchaDoodle className="footer-doodle footer-doodle--concha" />
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-md">
              <h3 className="font-display text-2xl text-[#1d2059] sm:text-3xl">
                Noticias del comal
              </h3>
              <p className="mt-2 max-w-lg text-sm font-semibold text-[#1d2059]/70">
                Recetas, eventos y nuevos cafés de temporada. Una vez al mes, sin
                ruido.
              </p>
            </div>
            <form onSubmit={subscribe} className="flex w-full max-w-md gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1d2059]/55" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="h-11 border-2 border-[#1d2059] bg-[#fffdf1] pl-9 font-semibold text-[#1d2059] placeholder:text-[#1d2059]/45 focus:ring-[#1d2059]/20"
                  autoComplete="email"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="h-11 w-11 cursor-pointer rounded-lg border-2 border-[#1d2059] bg-[#e7642d] text-[#1d2059] shadow-[3px_4px_0_#1d2059] hover:bg-[#f26d9d]"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Suscribirme</span>
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#1d2059] bg-[#f3df4d] text-[#1d2059] shadow-[2px_3px_0_#1d2059]">
                <Coffee className="h-4.5 w-4.5" strokeWidth={2.2} />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg">
                  Café Tonalli
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#fff5df]/50">
                  CDMX · Roma Norte
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-[#fff5df]/70">
              Cafetería mexicana de autor. Del metate a la taza, todos los días.
              Hecho con café de altura, maíz nixtamalizado y mucho orgullo.
            </p>
            <div className="mt-5 flex gap-2">
              <Button
                asChild
                size="icon"
                variant="outline"
                className="h-11 w-11 rounded-full border-[#fff5df]/20 bg-[#fff5df]/5 text-[#fff5df] hover:bg-[#fff5df]/10"
              >
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="icon"
                variant="outline"
                className="h-11 w-11 rounded-full border-[#fff5df]/20 bg-[#fff5df]/5 text-[#fff5df] hover:bg-[#fff5df]/10"
              >
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#fff5df]/50">
              Explora
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#menu" className="text-[#fff5df]/80 transition-colors hover:text-amber-300">Menú</a></li>
              <li><a href="#historia" className="text-[#fff5df]/80 transition-colors hover:text-amber-300">Nuestra historia</a></li>
              <li><a href="#reservar" className="text-[#fff5df]/80 transition-colors hover:text-amber-300">Reservar mesa</a></li>
              <li><a href="#ubicacion" className="text-[#fff5df]/80 transition-colors hover:text-amber-300">Ubicación</a></li>
            </ul>
          </div>

          {/* Visit */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#fff5df]/50">
              Visítanos
            </h4>
            <address className="mt-3 space-y-1 text-sm not-italic text-[#fff5df]/80">
              <p>Av. Álvaro Obregón 142</p>
              <p>Col. Roma Norte, 06700</p>
              <p>Ciudad de México</p>
              <p className="pt-2">
                <a href="tel:+525512345678" className="hover:text-amber-300 transition-colors">
                  +52 55 1234 5678
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#fff5df]/10 pt-6 text-xs text-[#fff5df]/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Café Tonalli. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5">
            Hecho con <Heart className="h-3 w-3 fill-accent text-accent" /> en la Ciudad de México
          </p>
        </div>
      </div>
    </footer>
  );
}
