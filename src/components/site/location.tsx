"use client";

import { MapPin, Clock, Phone, Instagram, Facebook, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { TonalliOllaDoodle } from "./tonalli-doodles";

const HOURS = [
  { day: "Lunes", hours: "07:00 – 22:00" },
  { day: "Martes", hours: "07:00 – 22:00" },
  { day: "Miércoles", hours: "07:00 – 22:00" },
  { day: "Jueves", hours: "07:00 – 22:00" },
  { day: "Viernes", hours: "07:00 – 23:00" },
  { day: "Sábado", hours: "08:00 – 23:00" },
  { day: "Domingo", hours: "08:00 – 21:00" },
];

function todayName(): string {
  return new Date().toLocaleDateString("es-MX", { weekday: "long" });
}

export function LocationSection() {
  const today = todayName();
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <section id="ubicacion" className="location-section relative scroll-mt-20 overflow-hidden py-20 sm:py-28">
      <div className="azulejo-trim" aria-hidden="true" />
      <TonalliOllaDoodle className="location-doodle" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex rounded-full border-2 border-[#1d2059] bg-[#f3df4d] px-3 py-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#1d2059] shadow-[3px_4px_0_#1d2059]">
            Ven a vernos
          </p>
          <h2 className="mt-6 font-display text-4xl leading-[0.98] tracking-[-0.035em] text-[#1d2059] drop-shadow-[3px_4px_0_#fff8d8] sm:text-5xl lg:text-6xl">
            En el corazón de la Roma
          </h2>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Map / interior image */}
          <div className="location-postcard relative aspect-[4/3] overflow-hidden rounded-[1.6rem] border-[3px] border-[#1d2059] shadow-[9px_11px_0_#1d2059]">
            <Image
              src="/images/interior/cafe-interior.png"
              alt="Interior cálido de Café Tonalli en Roma Norte con mesas de madera, lámparas de cobre y papel picado"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#170b07]/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-[#fff5df]">
              <p className="font-display text-2xl">Café Tonalli</p>
              <p className="text-sm text-[#fff5df]/80">
                Av. Álvaro Obregón 142, Roma Norte
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            {/* Address */}
            <div className="location-tile rounded-[1.35rem] border-[3px] border-[#1d2059] bg-[#f5b3e7] p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#1d2059] bg-[#fff8d8] shadow-[2px_3px_0_#1d2059]">
                  <MapPin className="h-5 w-5 text-[#1d2059]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Dirección
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Av. Álvaro Obregón 142
                    <br />
                    Col. Roma Norte, 06700
                    <br />
                    Ciudad de México
                  </p>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="poster-button poster-button--cream mt-3 font-black"
                  >
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Av.+%C3%81lvaro+Obreg%C3%B3n+142,+Roma+Norte,+CDMX"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation className="mr-1.5 h-3.5 w-3.5" /> Cómo llegar
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="location-tile rounded-[1.35rem] border-[3px] border-[#1d2059] bg-[#b9dcff] p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#1d2059] bg-[#fff8d8] shadow-[2px_3px_0_#1d2059]">
                  <Clock className="h-5 w-5 text-[#1d2059]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Horario
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {HOURS.map((h) => (
                      <li
                        key={h.day}
                        className={`flex justify-between ${
                          h.day === todayCap
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {h.day === todayCap && (
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                            </span>
                          )}
                          {h.day}
                          {h.day === todayCap && (
                            <span className="rounded-full bg-green-500/15 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-400">
                              Hoy
                            </span>
                          )}
                        </span>
                        <span className="tabular-nums">{h.hours}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="location-tile rounded-[1.35rem] border-[3px] border-[#1d2059] bg-[#efad43] p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#1d2059] bg-[#fff8d8] shadow-[2px_3px_0_#1d2059]">
                  <Phone className="h-5 w-5 text-[#1d2059]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Contacto
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <a href="tel:+525512345678" className="hover:text-foreground">
                      +52 55 1234 5678
                    </a>
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button asChild size="sm" variant="outline" className="poster-icon-button rounded-full">
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="poster-icon-button rounded-full">
                      <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook"
                      >
                        <Facebook className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
