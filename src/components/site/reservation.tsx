"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, Loader2, CheckCircle2, Phone, User, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCafeStats } from "@/hooks/use-cafe-stats";
import { toast } from "sonner";

const TIMES = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
];

const ZONES = [
  { id: "sala", label: "Sala", desc: "Mesas de madera, papel picado" },
  { id: "terraza", label: "Terraza", desc: "Luz natural, plantas" },
  { id: "barra", label: "Barra", desc: "Frente al comal" },
] as const;

function todayStr(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function Reservation() {
  const { state } = useCafeStats();
  const [date, setDate] = useState(todayStr(1));
  const [time, setTime] = useState("09:00");
  const [partySize, setPartySize] = useState(2);
  const [zone, setZone] = useState<"sala" | "terraza" | "barra">("sala");
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [availability, setAvailability] = useState<{ slotsLeft: number; alternativeTimes: string[] } | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{ id: string } | null>(null);

  // Check availability when date/time/party change (debounced)
  useEffect(() => {
    if (!date || !time) return;
    setChecking(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/reservations/availability?date=${date}&time=${time}&partySize=${partySize}`
        );
        const data = await res.json();
        setAvailability({
          slotsLeft: data.slotsLeft ?? 0,
          alternativeTimes: data.alternativeTimes ?? [],
        });
      } catch {
        setAvailability(null);
      } finally {
        setChecking(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [date, time, partySize]);

  const tablesAvailable = state?.tables?.filter((t) => t.status === "available").length ?? 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Tu nombre es obligatorio.");
    if (!form.phone.trim() || form.phone.trim().length < 8)
      return toast.error("Necesitamos un teléfono válido.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          partySize,
          date,
          time,
          tableZone: zone,
          specialRequests: form.notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (res.status === 409) {
          toast.error(data.error ?? "Ese horario se llenó. Intenta otro.");
          return;
        }
        throw new Error(data.error ?? "Error al reservar.");
      }
      setConfirmed({ id: data.reservation.id });
      toast.success("¡Mesa reservada! Te esperamos.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Algo salió mal. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <section id="reservar" className="scroll-mt-20 bg-secondary/40 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
          >
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </motion.div>
          <h2 className="mt-6 font-display text-4xl font-semibold text-foreground">
            ¡Tu mesa está lista!
          </h2>
          <p className="mt-3 text-muted-foreground">
            Te esperamos el <strong className="text-foreground">{formatDate(date)}</strong> a las{" "}
            <strong className="text-foreground">{time}</strong> en zona{" "}
            <strong className="text-foreground">{zone}</strong> para{" "}
            <strong className="text-foreground">{partySize}</strong>{" "}
            {partySize === 1 ? "persona" : "personas"}.
          </p>
          <p className="mt-2 rounded-full bg-card px-3 py-1 font-mono text-xs text-muted-foreground inline-block">
            Reserva #{confirmed.id.slice(-6).toUpperCase()}
          </p>
          <div className="mt-8">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmed(null);
                setForm({ name: "", phone: "", email: "", notes: "" });
              }}
              className="rounded-full"
            >
              Hacer otra reserva
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="reservar" className="relative scroll-mt-20 bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left — copy + live info */}
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
              Reservación
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Aparta tu mesa
              <br />
              <span className="italic text-primary">en 30 segundos.</span>
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              Sin llamadas, sin esperas. Elige día, hora y zona; te confirmamos
              al instante. Para grupos de 8 o más, escríbenos por WhatsApp.
            </p>

            {/* Live availability cards */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  Mesas disponibles
                </div>
                <div className="mt-1 font-display text-3xl font-semibold text-foreground tabular-nums">
                  {tablesAvailable}
                </div>
                <div className="text-xs text-muted-foreground">de 12 en este momento</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> Espera aprox.
                </div>
                <div className="mt-1 font-display text-3xl font-semibold text-foreground tabular-nums">
                  {state?.wait_time_minutes ?? 8} min
                </div>
                <div className="text-xs text-muted-foreground">sin reserva</div>
              </div>
            </div>

            {/* Address card */}
            <div className="mt-4 rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Café Tonalli — Roma Norte</p>
                  <p className="text-sm text-muted-foreground">
                    Av. Álvaro Obregón 142, Col. Roma Norte, 06700, CDMX
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Lun – Dom · 07:00 – 22:00
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <form
            onSubmit={submit}
            className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8"
          >
            {/* Date / time / party */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="r-date" className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Fecha
                </Label>
                <Input
                  id="r-date"
                  type="date"
                  value={date}
                  min={todayStr()}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="r-time" className="text-sm font-medium flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Hora
                </Label>
                <select
                  id="r-time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {TIMES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Comensales
              </Label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPartySize(n)}
                    className={`h-9 w-9 rounded-full border text-sm font-medium transition-all ${
                      partySize === n
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPartySize(9)}
                  className={`h-9 rounded-full border px-3 text-sm font-medium transition-all ${
                    partySize >= 9
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  9+
                </button>
              </div>
            </div>

            <div className="mt-4">
              <Label className="text-sm font-medium">Zona</Label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {ZONES.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setZone(z.id)}
                    className={`rounded-lg border p-2.5 text-left transition-all ${
                      zone === z.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <div className="text-sm font-medium text-foreground">{z.label}</div>
                    <div className="text-[11px] text-muted-foreground">{z.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live availability indicator */}
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs">
              {checking ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Verificando disponibilidad…</span>
                </>
              ) : availability && availability.slotsLeft > 0 ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-foreground">
                    {availability.slotsLeft} {availability.slotsLeft === 1 ? "lugar disponible" : "lugares disponibles"} a esta hora
                  </span>
                </>
              ) : availability ? (
                <span className="text-accent">
                  Lleno a esa hora · intenta {availability.alternativeTimes.slice(0, 2).join(" o ")}
                </span>
              ) : (
                <span className="text-muted-foreground">Selecciona fecha y hora</span>
              )}
            </div>

            {/* Contact */}
            <div className="mt-5 space-y-3 border-t border-border pt-5">
              <div>
                <Label htmlFor="r-name" className="text-sm font-medium flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Nombre *
                </Label>
                <Input
                  id="r-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Tu nombre"
                  className="mt-1.5"
                  autoComplete="name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="r-phone" className="text-sm font-medium flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Teléfono / WhatsApp *
                </Label>
                <Input
                  id="r-phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="55 1234 5678"
                  className="mt-1.5"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                />
              </div>
              <div>
                <Label htmlFor="r-email" className="text-sm font-medium flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email (opcional)
                </Label>
                <Input
                  id="r-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="tucorreo@ejemplo.com"
                  className="mt-1.5"
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="r-notes" className="text-sm font-medium">
                  Notas (ocasión especial, alergias, etc.)
                </Label>
                <textarea
                  id="r-notes"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Cumpleaños, mesa cerca de la ventana…"
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reservando…
                </>
              ) : (
                "Confirmar reservación"
              )}
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Sin costo. Cancela hasta 2h antes.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
