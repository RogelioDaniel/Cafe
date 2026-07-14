import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

const SYSTEM_PROMPT = `Eres Tonalli, el barista virtual de Café Tonalli, una cafetería mexicana de autor en Colonia Roma Norte, CDMX. Hablas español mexicano con calidez y orgullo. Tu trabajo es recomendar café y antojitos del menú según el estado de ánimo, hora del día y gustos del cliente.

Nuestro menú destacado:
- Café de Olla Clásico (veracruz, canela, piloncillo) — $48
- Café de Olla Especial Tonalli (chiapas, chocolate de mesa) — $62
- Americanano Tonalli (oaxaca, notas a chocolate) — $42
- Chocolate de Agua (cacao Soconusco, prehispánico) — $52
- Tacos al Pastor (3 pzs) — $95
- Chilaquiles Rojos de Comal — $118
- Tamal Oaxaqueño de Mole — $78
- Conchas Artesanales (2 pzs) — $45
- Tres Leches Tonalli — $85

Sé conciso (2-4 frases), cálido, usa palabras mexicanas naturales ("órale", "padre", "antójito"). Recomienda UNA bebida y/o UN antojito concretos, explica por qué encajan con lo que pidió el cliente. Si te preguntan algo fuera de tema, redirige amablemente al café y la comida. Nunca inventes precios o productos que no estén en la lista.`;

const FALLBACK_REPLY = "Disculpa, ando en el comal ahorita. ¿Me repites?";

type ChatRole = "user" | "assistant";
interface ChatMessage {
  role: ChatRole;
  content: string;
}

function sanitizeHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) return [];
  const out: ChatMessage[] = [];
  for (const raw of history) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as { role?: unknown; content?: unknown };
    if (r.role !== "user" && r.role !== "assistant") continue;
    if (typeof r.content !== "string" || !r.content.trim()) continue;
    out.push({ role: r.role, content: r.content });
  }
  // Cap history at last 10 turns to keep tokens bounded
  return out.slice(-10);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const message = body?.message;
    const history = sanitizeHistory(body?.history);

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return NextResponse.json(
        { error: "El mensaje es obligatorio." },
        { status: 400 }
      );
    }

    // Per z-ai-web-dev-sdk convention (see skills/LLM/SKILL.md) the system
    // prompt is delivered as the first `assistant` message, followed by the
    // conversation history and finally the new user message.
    const messages: ChatMessage[] = [
      { role: "assistant", content: SYSTEM_PROMPT },
      ...history,
      { role: "user", content: message },
    ];

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
    });

    const reply =
      completion?.choices?.[0]?.message?.content?.trim() || FALLBACK_REPLY;

    return NextResponse.json(
      { reply },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    // Never break the chat UX — return the warm fallback on any failure
    console.error("[api/ai/barista] error", e);
    return NextResponse.json(
      { reply: FALLBACK_REPLY },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}
