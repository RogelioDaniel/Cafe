"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X, Loader2, CheckCircle2, Clock } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart-store";
import { formatMXN } from "@/lib/format";
import { toast } from "sonner";
import type { CartLine } from "@/lib/types";

const PICKUP_TIMES = [
  "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00",
  "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
];

export function CartDrawer() {
  const { isOpen, close, lines, setQty, remove, subtotal, clear } = useCart();
  const [stage, setStage] = useState<"cart" | "checkout" | "success">("cart");
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pickupTime, setPickupTime] = useState("09:00");
  const [form, setForm] = useState({ name: "", phone: "", notes: "" });

  const total = subtotal();
  const itemCount = lines.reduce((a, l) => a + l.qty, 0);

  function handleClose(open: boolean) {
    if (!open) {
      close();
      // reset after close animation
      setTimeout(() => {
        if (stage === "success") {
          setStage("cart");
          clear();
          setForm({ name: "", phone: "", notes: "" });
        }
      }, 300);
    }
  }

  async function submitOrder() {
    if (!form.name.trim()) {
      toast.error("Tu nombre es obligatorio.");
      return;
    }
    if (!form.phone.trim() || form.phone.trim().length < 8) {
      toast.error("Necesitamos un teléfono válido para avisarte.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/cart/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name.trim(),
          customerPhone: form.phone.trim(),
          items: lines.map((l) => ({ slug: l.slug, qty: l.qty })),
          pickupTime,
          notes: form.notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Error al procesar tu orden.");
      }
      setOrderId(data.order.id);
      setStage("success");
      toast.success("¡Orden recibida! La preparamos enseguida.");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Algo se quemó en la cocina. Intenta de nuevo."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-border bg-background p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2 font-display text-xl">
            {stage === "success" ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                ¡Listo!
              </>
            ) : (
              <>
                <ShoppingBag className="h-5 w-5 text-primary" />
                {stage === "checkout" ? "Recoger en sucursal" : `Tu carrito (${itemCount})`}
              </>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {stage === "success"
              ? "Orden confirmada"
              : "Revisa y confirma tu pedido para recoger"}
          </SheetDescription>
        </SheetHeader>

        {/* Body */}
        {stage === "cart" && (
          <>
            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <ShoppingBag className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="font-display text-lg font-medium text-foreground">
                  Tu carrito está vacío
                </p>
                <p className="text-sm text-muted-foreground">
                  Explora el menú y agrega algo rico para empezar.
                </p>
                <Button onClick={close} variant="outline" className="mt-2 rounded-full">
                  Ver el menú
                </Button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto scroll-warm px-3 py-3">
                {lines.map((line) => (
                  <CartLineRow
                    key={line.slug}
                    line={line}
                    onInc={() => setQty(line.slug, line.qty + 1)}
                    onDec={() => setQty(line.slug, line.qty - 1)}
                    onRemove={() => remove(line.slug)}
                  />
                ))}
              </div>
            )}

            {lines.length > 0 && (
              <CartFooter
                total={total}
                itemCount={itemCount}
                onContinue={() => setStage("checkout")}
                onClear={clear}
              />
            )}
          </>
        )}

        {stage === "checkout" && (
          <div className="flex-1 overflow-y-auto scroll-warm px-5 py-5">
            <button
              onClick={() => setStage("cart")}
              className="mb-4 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Volver al carrito
            </button>

            <div className="space-y-4">
              <div>
                <Label htmlFor="cust-name" className="text-sm font-medium">
                  Nombre *
                </Label>
                <Input
                  id="cust-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Tu nombre"
                  className="mt-1.5"
                  autoComplete="name"
                />
              </div>
              <div>
                <Label htmlFor="cust-phone" className="text-sm font-medium">
                  Teléfono / WhatsApp *
                </Label>
                <Input
                  id="cust-phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="55 1234 5678"
                  className="mt-1.5"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </div>
              <div>
                <Label htmlFor="pickup-time" className="text-sm font-medium">
                  Hora de recolección
                </Label>
                <select
                  id="pickup-time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {PICKUP_TIMES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notas (opcional)
                </Label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Sin azúcar, extra canela, etc."
                  rows={2}
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-secondary/60 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Resumen
              </p>
              <div className="space-y-1.5 text-sm">
                {lines.map((l) => (
                  <div key={l.slug} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {l.qty}× {l.name}
                    </span>
                    <span className="tabular-nums">{formatMXN(l.price * l.qty)}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
                  <span>Total</span>
                  <span className="font-display text-lg text-primary">
                    {formatMXN(total)}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Paga en sucursal al recoger. Cancela hasta 15 min antes de tu hora.
            </p>

            <Button
              onClick={submitOrder}
              disabled={submitting}
              className="mt-4 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando…
                </>
              ) : (
                `Confirmar orden · ${formatMXN(total)}`
              )}
            </Button>
          </div>
        )}

        {stage === "success" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-foreground">
                ¡Tu orden está en el comal!
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                La tendremos lista a las <strong className="text-foreground">{pickupTime}</strong>.
                Te avisamos por WhatsApp cuando esté lista para recoger.
              </p>
            </div>
            {orderId && (
              <p className="rounded-full bg-secondary px-3 py-1 font-mono text-xs text-muted-foreground">
                Orden #{orderId.slice(-6).toUpperCase()}
              </p>
            )}
            <Button onClick={close} className="mt-2 rounded-full">
              Listo
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartLineRow({
  line,
  onInc,
  onDec,
  onRemove,
}: {
  line: CartLine;
  onInc: () => void;
  onDec: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-secondary/40">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
        {line.image && (
          <img
            src={line.image}
            alt={line.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{line.name}</p>
        <p className="text-xs text-muted-foreground">{formatMXN(line.price)} c/u</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onDec}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Quitar uno"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-6 text-center text-sm font-semibold tabular-nums">
          {line.qty}
        </span>
        <button
          onClick={onInc}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Agregar uno"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <button
        onClick={onRemove}
        className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
        aria-label={`Quitar ${line.name} del carrito`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function CartFooter({
  total,
  itemCount,
  onContinue,
  onClear,
}: {
  total: number;
  itemCount: number;
  onContinue: () => void;
  onClear: () => void;
}) {
  return (
    <div className="border-t border-border bg-card px-5 py-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">
          Subtotal ({itemCount} {itemCount === 1 ? "pieza" : "piezas"})
        </span>
        <span className="font-display text-2xl font-semibold text-primary">
          {formatMXN(total)}
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onClear}
          className="rounded-full"
          size="sm"
        >
          Vaciar
        </Button>
        <Button
          onClick={onContinue}
          className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Ordenar para recoger
        </Button>
      </div>
    </div>
  );
}
