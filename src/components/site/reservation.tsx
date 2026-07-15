"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { addDays, addMonths, format, parseISO, startOfDay, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, Clock, Users, Loader2, CheckCircle2, Phone, User, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as DateCalendar } from "@/components/ui/calendar";
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

type DayAvailability = {
  date: string;
  slotsLeft: number;
  status: "available" | "limited" | "full";
};

function todayStr(offset = 0): string {
  return format(addDays(new Date(), offset), "yyyy-MM-dd");
}

export function Reservation() {
  const reduceMotion = useReducedMotion();
  const { state } = useCafeStats();
  const [date, setDate] = useState(todayStr(1));
  const [time, setTime] = useState("09:00");
  const [partySize, setPartySize] = useState(2);
  const [zone, setZone] = useState<"sala" | "terraza" | "barra">("sala");
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [availability, setAvailability] = useState<{ slotsLeft: number; alternativeTimes: string[] } | null>(null);
  const [checking, setChecking] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [monthAvailability, setMonthAvailability] = useState<DayAvailability[]>([]);
  const [calendarChecking, setCalendarChecking] = useState(true);
  const [calendarError, setCalendarError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{ id: string } | null>(null);
  const calendarStart = useMemo(() => startOfDay(new Date()), []);
  const calendarEnd = useMemo(() => addMonths(calendarStart, 2), [calendarStart]);
  const selectedDate = useMemo(() => parseISO(date), [date]);
  const calendarModifiers = useMemo(
    () => {
      const bookableDays = monthAvailability.filter((day) => {
        const parsed = parseISO(day.date);
        return parsed >= calendarStart && parsed <= calendarEnd;
      });
      return {
        available: bookableDays
          .filter((day) => day.status === "available")
          .map((day) => parseISO(day.date)),
        limited: bookableDays
          .filter((day) => day.status === "limited")
          .map((day) => parseISO(day.date)),
        full: bookableDays
          .filter((day) => day.status === "full")
          .map((day) => parseISO(day.date)),
      };
    },
    [calendarEnd, calendarStart, monthAvailability]
  );

  // Check availability when date/time/party change (debounced)
  useEffect(() => {
    if (!date || !time) return;
    setChecking(true);
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/reservations/availability?date=${date}&time=${time}&partySize=${partySize}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("No se pudo consultar la disponibilidad.");
        const data = await res.json();
        setAvailability({
          slotsLeft: data.slotsLeft ?? 0,
          alternativeTimes: data.alternativeTimes ?? [],
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setAvailability(null);
      } finally {
        if (!controller.signal.aborted) setChecking(false);
      }
    }, 350);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [date, time, partySize]);

  useEffect(() => {
    const controller = new AbortController();
    const month = format(visibleMonth, "yyyy-MM");
    setCalendarChecking(true);
    setCalendarError(false);

    const loadMonth = async () => {
      try {
        const res = await fetch(
          `/api/reservations/availability?month=${month}&time=${time}&partySize=${partySize}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("No se pudo consultar el calendario.");
        const data = await res.json();
        setMonthAvailability(data.days ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMonthAvailability([]);
        setCalendarError(true);
      } finally {
        if (!controller.signal.aborted) setCalendarChecking(false);
      }
    };

    loadMonth();
    return () => controller.abort();
  }, [visibleMonth, time, partySize]);

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
            initial={
              reduceMotion
                ? false
                : { scale: 1.35, rotate: -14, opacity: 0 }
            }
            animate={{ scale: 1, rotate: -5, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="reservation-stamp mx-auto flex h-32 w-32 flex-col items-center justify-center rounded-full border-[3px] border-primary text-primary"
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.22em]">Tonalli</span>
            <span className="my-1 font-display text-xl font-black uppercase leading-none">Mesa</span>
            <span className="font-display text-xl font-black uppercase leading-none">Apartada</span>
          </motion.div>
          <h2 className="mt-6 font-display text-4xl font-semibold text-foreground">
            El lugar ya es tuyo.
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
    <section id="reservar" className="reservation-section relative scroll-mt-20 bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-w-0 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left — copy + live info */}
          <div className="min-w-0">
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
            className="reservation-ticket -mx-2 min-w-0 rounded-2xl border border-border bg-card p-4 shadow-lg sm:mx-0 sm:p-8"
          >
            <div className="reservation-folio" aria-hidden="true">
              <span>Comanda de mesa</span>
              <strong>Folio · RN 014</strong>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">
                1
              </span>
              <div>
                <p className="font-display text-lg font-semibold text-foreground">
                  Elige cuándo vienes
                </p>
                <p className="text-xs text-muted-foreground">
                  El calendario se actualiza según la hora.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <Label htmlFor="r-time" className="flex items-center gap-1.5 text-sm font-medium">
                <Clock className="h-3.5 w-3.5" /> Hora de llegada
              </Label>
              <select
                id="r-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm"
              >
                {TIMES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <CalendarDays className="h-3.5 w-3.5" /> Fecha
                </Label>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Disponibilidad · {time}
                </span>
              </div>
              <div className="reservation-calendar-shell relative mt-1.5 overflow-hidden rounded-xl border border-border bg-background p-1.5 sm:p-2">
                <DateCalendar
                  mode="single"
                  locale={es}
                  showOutsideDays={false}
                  month={visibleMonth}
                  onMonthChange={setVisibleMonth}
                  selected={selectedDate}
                  onSelect={(day) => {
                    if (day) setDate(format(day, "yyyy-MM-dd"));
                  }}
                  startMonth={startOfMonth(calendarStart)}
                  endMonth={startOfMonth(calendarEnd)}
                  disabled={[
                    { before: calendarStart },
                    { after: calendarEnd },
                    ...calendarModifiers.full,
                  ]}
                  modifiers={calendarModifiers}
                  modifiersClassNames={{
                    available: "reservation-day--available",
                    limited: "reservation-day--limited",
                    full: "reservation-day--full",
                  }}
                  labels={{
                    labelDayButton: (day, modifiers) => {
                      const status = modifiers.full
                        ? "ocupado a esta hora"
                        : modifiers.disabled
                          ? "fecha no disponible"
                        : modifiers.limited
                          ? "última mesa disponible"
                          : modifiers.available
                            ? "disponible"
                            : "sin información";
                      return `${format(day, "PPPP", { locale: es })}, ${status}`;
                    },
                  }}
                  className="w-full bg-transparent p-1 [--cell-size:2.5rem] sm:[--cell-size:2.75rem]"
                  classNames={{
                    root: "w-full",
                    months: "relative flex w-full flex-col",
                    month: "flex w-full flex-col gap-3",
                    month_grid: "w-full border-collapse",
                    weekdays: "flex w-full",
                    weekday: "flex-1 select-none text-center text-[0.7rem] font-medium uppercase text-muted-foreground",
                    week: "mt-1 flex w-full",
                    day: "group/day relative aspect-square flex-1 p-0 text-center",
                    today: "rounded-md bg-secondary/70 text-foreground ring-1 ring-primary/35 data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground",
                    caption_label: "select-none font-display text-base font-semibold capitalize",
                  }}
                />
                {calendarChecking && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/72 backdrop-blur-[2px]" aria-live="polite">
                    <span className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground shadow-sm">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Actualizando fechas…
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground" aria-label="Leyenda de disponibilidad">
                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-500" /> Disponible</span>
                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-amber-500" /> Última mesa</span>
                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-destructive" /> Ocupado a esta hora</span>
              </div>
              {calendarError && (
                <p className="mt-2 text-xs text-destructive" role="status">
                  No pudimos actualizar el mes. Aún puedes elegir una fecha y la verificaremos antes de reservar.
                </p>
              )}
              <p className="mt-2 text-sm text-foreground" aria-live="polite">
                Seleccionaste <strong>{formatDate(date)}</strong> a las <strong>{time}</strong>.
              </p>
            </div>

            <div className="mt-5 border-t border-border pt-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">
                  2
                </span>
                <p className="font-display text-lg font-semibold text-foreground">
                  Arma tu mesa
                </p>
              </div>
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Comensales
              </Label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPartySize(n)}
                    aria-label={`${n} ${n === 1 ? "comensal" : "comensales"}`}
                    aria-pressed={partySize === n}
                    className={`h-11 w-11 cursor-pointer rounded-full border text-sm font-medium transition-all ${
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
                  aria-label="9 o más comensales"
                  aria-pressed={partySize >= 9}
                  className={`h-11 min-w-11 cursor-pointer rounded-full border px-3 text-sm font-medium transition-all ${
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
              <div className="mt-1.5 grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
                {ZONES.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setZone(z.id)}
                    aria-pressed={zone === z.id}
                    className={`min-h-14 cursor-pointer rounded-lg border p-2.5 text-left transition-all ${
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
            <div className="mt-4 flex min-h-10 flex-wrap items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs" aria-live="polite">
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
                <>
                  <span className="text-destructive">Ocupado a las {time}.</span>
                  {availability.alternativeTimes.slice(0, 2).map((alternative) => (
                    <button
                      key={alternative}
                      type="button"
                      onClick={() => setTime(alternative)}
                      className="min-h-8 cursor-pointer rounded-full border border-primary/35 bg-background px-2.5 font-medium text-primary transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Probar {alternative}
                    </button>
                  ))}
                </>
              ) : (
                <span className="text-muted-foreground">Selecciona una fecha para verificarla.</span>
              )}
            </div>

            {/* Contact */}
            <div className="mt-5 space-y-3 border-t border-border pt-5">
              <div className="flex items-center gap-3 pb-1">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">
                  3
                </span>
                <p className="font-display text-lg font-semibold text-foreground">
                  Déjanos tus datos
                </p>
              </div>
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
              disabled={submitting || availability?.slotsLeft === 0}
              className="tonalli-press mt-5 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
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
