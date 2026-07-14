/**
 * Café Tonalli — Realtime Stats Mini-Service
 * ------------------------------------------
 * Standalone socket.io server powering LIVE cafeteria stats
 * (alta concurrencia / high-concurrency showcase).
 *
 * Port: 3003 (hardcoded — DO NOT use PORT env)
 * Path: '/'  (Caddy gateway relies on this — DO NOT change)
 *
 * Frontend connects with: io('/?XTransformPort=3003')
 *
 * Events EMITTED by server:
 *   - 'stats:snapshot'      → full state snapshot (on connect & on 'subscribe')
 *   - 'stats:update'        → partial/full state update (every 4s simulation)
 *   - 'stats:viewers'       → { viewers_now } (on connect & disconnect)
 *   - 'stats:milestone'     → { happy_customers } (every 30s)
 *   - 'pong'                → { t: number } (response to client 'ping')
 *
 * Events RECEIVED from client:
 *   - 'subscribe'  → client requests snapshot
 *   - 'ping'       → client heartbeat
 */

import { createServer, type Server as HttpServer } from 'http'
import { Server, type Socket } from 'socket.io'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Zone = 'sala' | 'terraza' | 'barra'
type TableStatus = 'available' | 'occupied' | 'reserved'

interface CafeTable {
  id: number
  zone: Zone
  seats: number
  status: TableStatus
  occupiedUntil?: string
}

interface CafeState {
  cups_today: number
  orders_today: number
  reservations_today: number
  happy_customers: number
  viewers_now: number
  tables: CafeTable[]
  wait_time_minutes: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ts = (): string => new Date().toISOString()

const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const chance = (p: number): boolean => Math.random() < p

// ---------------------------------------------------------------------------
// In-memory state initialization
// ---------------------------------------------------------------------------

function buildInitialTables(): CafeTable[] {
  const tables: CafeTable[] = []
  let id = 1

  // 4 sala — 4 seats each
  for (let i = 0; i < 4; i++) {
    tables.push(makeTable(id++, 'sala', 4))
  }
  // 4 terraza — 2 to 6 seats
  for (let i = 0; i < 4; i++) {
    tables.push(makeTable(id++, 'terraza', pick([2, 4, 6])))
  }
  // 4 barra — 2 seats each
  for (let i = 0; i < 4; i++) {
    tables.push(makeTable(id++, 'barra', 2))
  }

  // Force ~5 available tables (randomize the rest)
  const statuses: TableStatus[] = [
    'available', 'available', 'available', 'available', 'available',
    'occupied', 'occupied', 'occupied', 'occupied',
    'reserved', 'reserved',
  ]
  // Fisher-Yates shuffle
  for (let i = statuses.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[statuses[i], statuses[j]] = [statuses[j], statuses[i]]
  }
  tables.forEach((t, i) => {
    t.status = statuses[i] ?? 'available'
    if (t.status === 'occupied') {
      t.occupiedUntil = new Date(Date.now() + randInt(10, 75) * 60_000).toISOString()
    }
  })

  return tables
}

function makeTable(id: number, zone: Zone, seats: number): CafeTable {
  return { id, zone, seats, status: 'available' }
}

const state: CafeState = {
  cups_today: 1847,
  orders_today: 312,
  reservations_today: 48,
  happy_customers: 28493,
  viewers_now: 0,
  tables: buildInitialTables(),
  wait_time_minutes: 8,
}

// ---------------------------------------------------------------------------
// HTTP + Socket.io server
// ---------------------------------------------------------------------------

const httpServer: HttpServer = createServer()
const io = new Server(httpServer, {
  // DO NOT change the path — Caddy gateway relies on it
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60_000,
  pingInterval: 25_000,
})

const PORT = 3003

// ---------------------------------------------------------------------------
// Snapshot helper (returns a shallow clone so clients get a stable object)
// ---------------------------------------------------------------------------

function snapshot(): CafeState {
  return {
    cups_today: state.cups_today,
    orders_today: state.orders_today,
    reservations_today: state.reservations_today,
    happy_customers: state.happy_customers,
    viewers_now: state.viewers_now,
    tables: state.tables.map((t) => ({ ...t })),
    wait_time_minutes: state.wait_time_minutes,
  }
}

// ---------------------------------------------------------------------------
// Simulation cycle — every 4s
// ---------------------------------------------------------------------------

function simulationCycle(): void {
  const changes: Partial<CafeState> = {}
  let touched = false

  // 60% — cups_today +1..3
  if (chance(0.6)) {
    state.cups_today += randInt(1, 3)
    changes.cups_today = state.cups_today
    touched = true
  }

  // 25% — orders_today +1
  if (chance(0.25)) {
    state.orders_today += 1
    changes.orders_today = state.orders_today
    touched = true
  }

  // 10% — toggle a random table's status (occupied ↔ available)
  if (chance(0.1)) {
    const tbl = pick(state.tables)
    if (tbl.status === 'occupied' || tbl.status === 'reserved') {
      tbl.status = 'available'
      tbl.occupiedUntil = undefined
    } else {
      tbl.status = 'occupied'
      tbl.occupiedUntil = new Date(Date.now() + randInt(10, 75) * 60_000).toISOString()
    }
    changes.tables = state.tables.map((t) => ({ ...t }))
    touched = true
  }

  // 15% — wait_time_minutes ±1 (clamp 3..20)
  if (chance(0.15)) {
    const delta = chance(0.5) ? 1 : -1
    state.wait_time_minutes = Math.min(20, Math.max(3, state.wait_time_minutes + delta))
    changes.wait_time_minutes = state.wait_time_minutes
    touched = true
  }

  // 5% — reservations_today +1
  if (chance(0.05)) {
    state.reservations_today += 1
    changes.reservations_today = state.reservations_today
    touched = true
  }

  if (touched) {
    io.emit('stats:update', changes)
    console.log(`[${ts()}] sim cycle → ${JSON.stringify(changes)}`)
  }
}

const SIM_INTERVAL_MS = 4_000
const simTimer = setInterval(simulationCycle, SIM_INTERVAL_MS)

// ---------------------------------------------------------------------------
// Milestone cycle — every 30s (happy_customers)
// ---------------------------------------------------------------------------

function milestoneCycle(): void {
  state.happy_customers += randInt(1, 2)
  io.emit('stats:milestone', { happy_customers: state.happy_customers })
  console.log(`[${ts()}] milestone → happy_customers=${state.happy_customers}`)
}

const MILESTONE_INTERVAL_MS = 30_000
const milestoneTimer = setInterval(milestoneCycle, MILESTONE_INTERVAL_MS)

// ---------------------------------------------------------------------------
// Connection handling
// ---------------------------------------------------------------------------

io.on('connection', (socket: Socket) => {
  state.viewers_now += 1
  console.log(`[${ts()}] connect ${socket.id} (viewers_now=${state.viewers_now})`)

  // Initial snapshot to the newly connected client
  socket.emit('stats:snapshot', snapshot())

  // Broadcast the new viewer count to everyone
  io.emit('stats:viewers', { viewers_now: state.viewers_now })

  // Client requests a fresh snapshot
  socket.on('subscribe', () => {
    socket.emit('stats:snapshot', snapshot())
    console.log(`[${ts()}] subscribe → snapshot sent to ${socket.id}`)
  })

  // Client heartbeat
  socket.on('ping', () => {
    socket.emit('pong', { t: Date.now() })
  })

  socket.on('disconnect', (reason: string) => {
    state.viewers_now = Math.max(0, state.viewers_now - 1)
    console.log(
      `[${ts()}] disconnect ${socket.id} reason=${reason} (viewers_now=${state.viewers_now})`,
    )
    io.emit('stats:viewers', { viewers_now: state.viewers_now })
  })

  socket.on('error', (err: unknown) => {
    console.error(`[${ts()}] socket error ${socket.id}:`, err)
  })
})

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

httpServer.listen(PORT, () => {
  console.log(`[${ts()}] Café Tonalli realtime service listening on :${PORT} (path: '/')`)
  console.log(
    `[${ts()}] initial state → cups=${state.cups_today} orders=${state.orders_today} ` +
      `reservations=${state.reservations_today} happy=${state.happy_customers} ` +
      `tables=${state.tables.length} wait=${state.wait_time_minutes}min`,
  )
})

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

function shutdown(signal: string): void {
  console.log(`[${ts()}] received ${signal}, shutting down...`)
  clearInterval(simTimer)
  clearInterval(milestoneTimer)
  io.close(() => {
    httpServer.close(() => {
      console.log(`[${ts()}] realtime service closed`)
      process.exit(0)
    })
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
