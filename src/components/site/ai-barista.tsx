"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Send, X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "¿Qué café me recomiendas para despertar?",
  "Algo sin cafeína para la tarde",
  "¿Qué antojito pides con café de olla?",
  "Soy vegano, ¿qué puedo pedir?",
];

const GREETING: Msg = {
  role: "assistant",
  content:
    "¡Órale, bienvenido! Soy Tonalli, tu barista virtual. ¿Qué antojo tienes hoy? Puedo recomendarte café, antojitos o postres según tu día.",
};

export function AIBarista() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/barista", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: next
            .slice(-11, -1)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply ?? "¿Me repites?" },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Disculpa, ando en el comal ahorita. ¿Me repites?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:scale-105 hover:bg-primary/90 sm:bottom-6 sm:right-6"
        aria-label={open ? "Cerrar barista" : "Hablar con el barista"}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="coffee"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <Coffee className="h-6 w-6" />
              <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400 ring-2 ring-primary" />
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 z-40 flex h-[480px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:right-6"
            role="dialog"
            aria-label="Chat con el barista Tonalli"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-foreground px-4 py-3 text-background">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-foreground">
                <Coffee className="h-4.5 w-4.5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-foreground bg-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-display text-sm font-semibold leading-tight">
                  Barista Tonalli
                </p>
                <p className="text-[11px] text-background/60">
                  En línea · responde en segundos
                </p>
              </div>
              <Sparkles className="h-4 w-4 text-amber-300" />
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto scroll-warm bg-secondary/30 p-3"
            >
              {messages.map((m, i) => (
                <Bubble key={i} msg={m} />
              ))}
              {loading && (
                <div className="flex items-center gap-3 px-2 py-1 text-muted-foreground" role="status">
                  <span className="barista-steam" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="text-xs">Preparando tu recomendación…</span>
                </div>
              )}

              {/* Suggestions */}
              {messages.length <= 1 && !loading && (
                <div className="space-y-1.5 pt-2">
                  <p className="px-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                    Sugerencias
                  </p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="block min-h-11 w-full cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-left text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-border bg-card p-2.5"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta…"
                className="flex-1 rounded-full border border-border bg-background px-3.5 py-2 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-label="Mensaje al barista"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || loading}
                className="h-11 w-11 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                aria-label="Enviar mensaje"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-card text-card-foreground shadow-sm border border-border"
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}
