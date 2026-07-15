# PROMPT PARA GLM 5.2 — Clon de Landing Page estilo Ironside Computers

## CONTEXTO

Eres un desarrollador frontend experto. Tu tarea es crear una landing page completa, funcional y visualmente impactante para una marca ficticia de PCs gaming personalizadas llamada **"VORTEX COMPUTERS"** (o el nombre que prefieras). La landing debe ser una **copia casi exacta en estructura, diseño y funcionalidades** de https://www.ironsidecomputers.com/, pero con nuestra propia identidad de marca.

La página está construida con **Next.js 15 (App Router) + TypeScript + Tailwind CSS + Framer Motion**. Usa componentes de UI estilo shadcn/ui.

---

## ESPECIFICACIÓN DE DISEÑO Y TEMA

### Paleta de colores (modo oscuro por defecto):
```css
--color-bg: #1f1f1f;              /* Fondo principal */
--color-background: #1f1f1f;       /* Fondo secundario */
--color-secondary: #1f1f1f;        /* Cards/secciones */
--color-secondary-dark: #1d1d1d;   /* Hover/fondo profundo */
--color-text: #ffffff;             /* Texto principal */
--color-text-secondary: #a7a7a7;   /* Texto secundario */
--color-primary: #8867ff;          /* Color de marca (púrpura eléctrico) */
--color-primary-dark: #8867ff;      /* Variante oscura del primario */
--color-primary-light: rgba(136,103,255,.2); /* Variante clara translúcida */
--color-accent: #8867ff;            /* Color de acento */
--color-border: #74767d;            /* Bordes estándar */
--color-border-dark: #a7a7a7;       /* Bordes claros */
--color-border-light: #74767d;      /* Bordes sutiles */
--color-disabled: #74767d;          /* Elementos deshabilitados */
--color-disabled-bg: #1f1f1f;       /* Fondo deshabilitado */
--color-success: #22c55e;           /* Estados de éxito */
--color-error: red;                 /* Estados de error */
--color-info: #3b82f6;              /* Estados informativos */
--color-skeleton: #74767d;          /* Skeleton loaders */
--color-bg-accent: #000;             /* Acento de fondo profundo */
```

### Tipografías:
- **MarundWeb** (o alternativa: `Space Grotesk` desde Google Fonts) — Fuente principal del cuerpo, pesos 300-800
- **ArchitektWeb** (o alternativa: `Sora` desde Google Fonts) — Headings y títulos, pesos 300-600
- **AstroWeb** (o alternativa: `JetBrains Mono` desde Google Fonts) — Texto monoespaciado para efectos "tech/terminal"
- **DigitalWeb** (o alternativa: `Share Tech Mono` desde Google Fonts) — Texto digital/terminal para animaciones de carga

### Estilo visual general:
- **Dark mode por defecto** con toggle a light mode
- Estética **cyberpunk/gaming** con toques terminales, código ASCII art, efectos glitch
- Animaciones suaves con Framer Motion (fade-in, slide-up, parallax)
- Tipografía monoespaciada para elementos decorativos tipo "terminal boot"
- Bordes sutiles, glassmorphism en algunos elementos
- Hover effects en cards de productos (scale, glow, border highlight)

---

## ESTRUCTURA COMPLETA DE LA PÁGINA

### 1. INTRO / BOOT ANIMATION (Overlay de carga)
Al cargar la página, mostrar una animación tipo "terminal boot" con texto monoespaciado que simula un sistema arrancando:

```
555553001000003 // BUILD SYS   // 092XVRTXD // 0011 MC
555553001000004 // LOAD UI     // 092XVRTXD // 0011 MC
555553001000005 // LOAD UX     // 092XVRTXD // 0011 MC
SYS >> ST       $  = CPU       $  =
SPO.LOAD 100    →  450
SPO.LOAD 200    →  200
>>> SYS CHECK.INT 45.09.1000
>>> BOOT COMPLETE
```

- Texto animado letra por letra (efecto typewriter)
- Duración: ~3 segundos
- Botón "SKIP" para saltar
- Al terminar, fade out suave y revela el contenido

### 2. HEADER / NAVBAR
- **Logo** a la izquierda (texto o imagen SVG)
- Navegación principal:
  - **Gaming PCs** (dropdown con submenu):
    - Vortex Series (4 prebuilts, 2-day shipping)
    - Forge Your PC (pick your parts)
    - Limited Edition (4 unique themes)
    - Masterworks (custom ultra high-end themes)
    - Partner Collabs (your favorite gamers' PCs)
    - See All → /all-pcs
  - **Cases** → /cases
  - **About** (dropdown):
    - About Us → /company
    - Community → /community
    - Warranty → /warranty
    - Financing → /financing
    - Sponsorship → /sponsorship
    - Employment → /careers
    - Support → /support
  - **Merch** → /merch
- **Iconos a la derecha**:
  - Botón de Support (icono)
  - Botón de Login (icono + texto)
  - Selector de moneda (USD, CAD, EUR, GBP, AUD, MXN) — dropdown
  - Botón de toggle light/dark mode (icono sol/luna)
  - Botón de Achievements/Logros (con contador de badges)
  - Botón de Cart (con contador de items)
  - Botón de menú móvil (hamburguesa)
- Header transparente que se vuelve sólido al hacer scroll
- En móvil: colapsar a menú hamburguesa con drawer lateral

### 3. HERO SECTION (Carrusel de productos destacados)
- **Carrusel full-width** con altura de viewport (~100vh)
- Muestra PCs gaming destacados como slides:
  - Slide 1: "Juicebox" (tema púrpura/kawaii)
  - Slide 2: "Terminal 1" (tema minimalista negro/blanco)
  - Slide 3: "Eden's Veil" (tema botánico/fantasy)
  - Slide 4: "Milkbox" (tema blanco/crema)
- Cada slide tiene:
  - **Imagen del producto** en grande (PC renderizado con fondo transparente)
  - **Overlay de info técnica** estilo terminal con texto monoespaciado:
    ```
    :: PRODUCT: Juicebox
    :: ID: JB7
    :: EDITION: LIMITED
    :: COLORS: GRP
    :: INSPIRATION: KAWAIINESS
    :: STYLE: JUICEBOX - PURPLE
    SYS >> ST $ = CPU $ =
    >> DIMENSIONS
       LENGTH → 473.5mm
       WIDTH  → 215mm
       HEIGHT → 454mm
    >> MATERIALS
       UV-PRINTED PANEL
       ACTIVE MAGNETIC STRAW
    ```
  - **Nombre del producto** grande con tipografía display
  - **Botón "Customize"** o "View Details" que enlaza a la página del producto
- Controles del carrusel:
  - Botones prev/next a los lados
  - Indicadores (dots) en la parte inferior
  - Auto-play cada 5 segundos
  - Pausa en hover
- **Texto decorativo** en la parte superior con efecto glitch:
  ```
  Things are going Grape.
  555553001000004 // 092XVRTXD // JB PC
  ```
- Imágenes de productos flotando con sombra debajo

### 4. ACHIEVEMENTS / GAMIFICATION SYSTEM (Modal)
Sistema de logros/badges gamificado que aparece al hacer clic en el botón de achievements del header:

**9 badges coleccionables:**
1. **The Explorer** — Visit 5 or more pages of the website.
2. **The Fast Shooter** — Click 10 times under 3 seconds anywhere on the website.
3. **The Scavenger** — Find a hidden clickable Scavenger badge somewhere on the website.
4. **The Lurker** — Stay on a single page for 30 seconds.
5. **The Customizer** — Complete a full PC configuration and add it to your cart.
6. **The Collector** — Visit every series page at least once.
7. **The Night Owl** — Switch between light and dark mode.
8. **The Fan Slayer** — Turn off the fan and activate silent mode.
9. **The Champion** — Unlock all 8 other badges and claim your Steam gift card!

**Funcionalidades:**
- Modal con grid de badges (3x3)
- Cada badge muestra: ícono, nombre, descripción, estado (locked/unlocked)
- Badges desbloqueadas se iluminan con color primario
- Badges bloqueadas en gris/oscuro
- Barra de progreso: "X/9 badges unlocked"
- Texto motivador: "* A new adventure awaits! Every action you take exploring the website could earn you a badge. Collect them all to receive a $25 Steam gift card with your PC!"
- Persistencia en localStorage
- Notificación toast cuando se desbloquea un badge
- Badge "The Quest" como banner principal del modal

### 5. CART DRAWER (Sidebar)
- Drawer lateral derecho que se abre al hacer clic en el icono del carrito
- **Header**: "Cart" + botón "Continue shopping" + botón de cerrar (X)
- **Estado vacío**: "No product in the cart."
- **Estado con items**:
  - Lista de productos con imagen, nombre, specs, precio, cantidad
  - Subtotal, shipping, total
  - Botón "Checkout"
  - Botón "Remove" por item
- Animación de slide-in desde la derecha
- Persistencia en localStorage / Zustand store

### 6. "FORGE YOUR PC" SECTION
Sección destacada con CTA para personalizar tu PC:

- **Título**: "Pick your parts" (h2, monoespaciado, pequeño)
- **Heading principal**: "Forge your own gaming machine." (h1, grande, tipografía display)
- **Descripción**: "Pick your components with our advanced customizer, and we'll create the PC of your dreams."
- **Botón CTA**: "Customize" → /forge-your-pc (con flecha animada)
- **Imagen/visual**: Render 3D o ilustración de un PC gaming
- Fondo con efecto sutil (gradiente o patrón)

### 7. FEATURES SECTION (3 columnas)
Tres tarjetas con características clave:

#### Card 1: "Proven Performance"
- Ícono(s) decorativos
- **Título**: "Proven Performance" (h3)
- **Texto**: "Every Vortex PC is carefully built to deliver balanced, reliable performance for gaming, creative work, and everyday tasks. Each system undergoes extended testing to ensure stability and longevity, even after years of intense usage."

#### Card 2: "Built Tough"
- Ícono(s) decorativos
- **Título**: "Built Tough" (h3)
- **Texto**: "We back our gaming PCs with a 3-year parts and 5-year labor Vortex Warranty, free of charge. Our goal: build top-tier creative and gaming rigs with lasting quality."

#### Card 3: "Protect your Investment"
- Ícono(s) decorativos
- **Título**: "Protect your Investment" (h3)
- **Texto**: "Every Vortex PC is double boxed with instafoam to keep components secure. This secure packaging is one of the ways we go the extra mile in our PC building process."

- Cada card con animación de entrada (fade-in + slide-up al hacer scroll)
- Hover effect: border glow con color primario

### 8. ABOUT / BRAND STORY SECTION
- **Texto principal**: "Vortex has been a family-run company for almost 16 years, creating products that represent the individuality of gamers of all kinds. We've kept it pretty simple: we make things we would want to own. That shows up in our thoughtful designs, our meticulous build quality, and our super friendly support team behind every machine."
- **Botón**: "About Us" → /company (con flecha animada)
- **Subtexto**: "Co-founded by four siblings and grounded in a shared passion for gaming, thoughtful design, and creating things we love."
- **Elemento decorativo**: Texto monoespaciado con efecto espejo/duplicado:
  ```
  Co-founded by four siblings and grounded in a shared passion for gaming, thoughtful design, and creating things we love.
  ```
  (duplicado con efecto de reflejo/blur)
- **Código decorativo**: "Y-001265 // B" en texto pequeño monoespaciado

### 9. COLLECTIONS SECTION ("Designed for every player")
- **Eyebrow text**: "Our collections" (con ícono decorativo)
- **Heading**: "Designed for every player" (h2, con palabra "every" en estilo diferente — itálica o con efecto visual)
- **Grid de 5 colecciones** (cards grandes):

#### Colección 1: "Vortex Series"
- Imagen de fondo (PC gaming)
- **Título**: "Vortex Series" (h2)
- **Descripción**: "Prebuilt Signature Builds, Ships in 2 Business Days"
- **Badge**: "4 MODELS AVAILABLE"
- Link → /ironside-series

#### Colección 2: "Limited Edition"
- Imagen de fondo
- **Título**: "Limited Edition" (h2)
- **Descripción**: "Limited Quantity Builds"
- **Badge**: "4 THEMES AVAILABLE"
- Link → /limited-edition

#### Colección 3: "Masterworks"
- Imagen de fondo
- **Título**: "Masterworks" (h2)
- **Descripción**: "Fully Custom, One-of-a-Kind Builds"
- **Badge**: "EXCLUSIVELY FOR COMMUNITY GIVEAWAYS"
- Link → /masterworks

#### Colección 4: "Partner Collabs"
- Imagen de fondo
- **Título**: "Partner Collabs" (h2)
- **Descripción**: "Made with your Favorite Gamers"
- **Badge**: "3 THEMES AVAILABLE"
- Link → /partners

#### Colección 5: "Cases"
- Imagen de fondo
- **Título**: "Cases" (h2)
- **Descripción**: "Limited Edition Vortex Chassis"
- **Badge**: "6 THEMES AVAILABLE"
- Link → /cases

- Cada card con hover effect (scale, overlay, border glow)
- Animación staggered al entrar en viewport
- Layout: grid responsive (1 col móvil, 2 col tablet, 3 col desktop)

### 10. FOOTER
Footer completo con múltiples columnas:

#### Columna 1: Navegación principal
- Gaming PCs → /all-pcs
- Cases → /cases
- Merch → /merch
- About Us → /company
- Community → /community

#### Columna 2: Info corporativa
- Warranty → /warranty
- Financing → /financing
- Sponsorship → /sponsorship
- Careers → /careers
- Support → /support

#### Elemento sorpresa:
- Botón "Click here for a little surprise" (easter egg)

#### Newsletter:
- **Título**: "Newsletter" (h2)
- **Descripción**: "Emails we have fun making, with new products, deals, and giveaways!"
- **Input**: "Your Email Address"
- **Botón**: "Subscribe"
- Mensaje de confirmación al suscribirse

#### Links legales:
- Terms of Service → /terms-of-service
- Return Policy → /return-policy
- Privacy Policy → /privacy-policy
- ADA Compliance → /ada-compliance

#### Bottom bar:
- **Copyright**: "2026 © Vortex Computers"
- **Redes sociales** (iconos):
  - Facebook
  - X (Twitter)
  - Instagram
  - YouTube
  - Twitch
  - TikTok

---

## FUNCIONALIDADES INTERACTIVAS

### 1. Sistema de Logros (Achievements)
- Tracking de acciones del usuario via localStorage
- Detección de:
  - Páginas visitadas (contador)
  - Clicks rápidos (10 clicks en 3 segundos)
  - Tiempo en página (30 segundos)
  - Toggle de theme
  - Visita a todas las series
  - Item añadido al carrito
- Toast notifications al desbloquear
- Modal con progreso visual

### 2. Carrito de Compras
- Zustand store para estado del carrito
- Add/remove items
- Cálculo de subtotal, shipping, total
- Persistencia en localStorage
- Drawer animado

### 3. Toggle de Tema (Dark/Light)
- ThemeProvider con next-themes
- Transición suave entre modos
- Persistencia de preferencia
- Icono sol/luna animado

### 4. Selector de Moneda
- Dropdown con 6 monedas: USD, CAD, EUR, GBP, AUD, MXN
- Conversión de precios en tiempo real (rates estáticos o API)
- Persistencia de selección

### 5. Animaciones de Scroll
- Framer Motion `useInView` para detectar elementos en viewport
- Animaciones: fade-in, slide-up, scale-in
- Stagger children en grids
- Parallax en imágenes de hero

### 6. Boot Animation
- Overlay fullscreen al cargar
- Texto terminal animado (typewriter effect)
- Barra de progreso
- Botón skip
- Fade out al completar

### 7. Easter Eggs
- Badge "Scavenger" escondido en algún lugar de la página
- Botón sorpresa en el footer
- Konami code → activa modo especial

---

## ASSETS E IMÁGENES

Usar placeholders de alta calidad:
- **Productos**: Imágenes de PCs gaming desde Unsplash o renders 3D placeholder
- **Badges**: Íconos SVG personalizados para cada achievement
- **Íconos**: Lucide React para íconos de UI
- **Fondos**: Gradientes sutiles, patrones geométricos, o texturas oscuras
- **Logo**: SVG personalizado para "VORTEX COMPUTERS"

---

## ESTRUCTURA DE ARCHIVOS SUGERIDA

```
src/
├── app/
│   ├── layout.tsx              # Root layout con ThemeProvider
│   ├── page.tsx                # Landing page principal
│   ├── globals.css             # Estilos globales + CSS variables
│   └── api/
│       └── newsletter/
│           └── route.ts        # Endpoint newsletter
├── components/
│   ├── site/
│   │   ├── boot-animation.tsx       # Animación de carga terminal
│   │   ├── navbar.tsx                # Header con navegación
│   │   ├── hero-carousel.tsx         # Carrusel hero de productos
│   │   ├── forge-section.tsx         # Sección "Forge your PC"
│   │   ├── features-section.tsx      # 3 cards de features
│   │   ├── about-section.tsx         # Brand story
│   │   ├── collections-section.tsx   # Grid de colecciones
│   │   ├── site-footer.tsx           # Footer completo
│   │   ├── cart-drawer.tsx           # Drawer del carrito
│   │   ├── achievements-modal.tsx    # Modal de logros
│   │   ├── currency-selector.tsx     # Selector de moneda
│   │   └── theme-toggle.tsx          # Toggle dark/light
│   └── ui/
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── sheet.tsx
│       └── ... (shadcn/ui components)
├── hooks/
│   ├── use-achievements.ts     # Hook sistema de logros
│   ├── use-boot-animation.ts   # Hook animación de carga
│   └── use-cart.ts             # Hook carrito
├── lib/
│   ├── achievements.ts         # Lógica de logros
│   ├── cart-store.ts           # Zustand store carrito
│   ├── currency.ts             # Conversión de monedas
│   └── utils.ts                # Utils (cn, etc.)
└── public/
    └── images/
        ├── products/           # Imágenes de PCs
        ├── achievements/       # Íconos de badges
        └── logo.svg            # Logo de marca
```

---

## REQUISITOS TÉCNICOS

1. **Next.js 15** con App Router y Server Components donde sea posible
2. **TypeScript** estricto
3. **Tailwind CSS** con configuración de tema personalizado (colores, fuentes)
4. **Framer Motion** para todas las animaciones
5. **Zustand** para estado global (carrito, logros, moneda)
6. **next-themes** para toggle dark/light
7. **Lucide React** para íconos
8. **shadcn/ui** para componentes base (Button, Dialog, Sheet, Dropdown, etc.)
9. **Responsive design** completo (mobile-first)
10. **Accesibilidad**: ARIA labels, keyboard navigation, focus states
11. **SEO**: metadata, OpenGraph, structured data
12. **Performance**: lazy loading de imágenes, code splitting, optimización

---

## INSTRUCCIONES DE IMPLEMENTACIÓN

1. **Configura el tema** en `tailwind.config.ts` con la paleta de colores y fuentes especificadas
2. **Crea las CSS variables** en `globals.css` con soporte dark/light
3. **Implementa el ThemeProvider** con next-themes
4. **Crea el BootAnimation** como overlay con efecto terminal
5. **Construye el Navbar** con todos los dropdowns y iconos
6. **Implementa el HeroCarousel** con los 4 productos destacados
7. **Crea el sistema de Achievements** con localStorage y tracking
8. **Implementa el CartDrawer** con Zustand
9. **Construye las secciones** restantes (Forge, Features, About, Collections)
10. **Crea el Footer** completo con newsletter
11. **Añade animaciones** de scroll con Framer Motion
12. **Implementa el selector de moneda** con conversión
13. **Añade easter eggs** (scavenger badge, botón sorpresa, konami code)
14. **Optimiza** para responsive y accesibilidad
15. **Testing** visual en mobile, tablet y desktop

---

## DETALLES DE ESTILO IMPORTANTES

- **Espaciado**: Generoso, secciones con padding vertical de 80-120px en desktop
- **Bordes**: Usar `--color-border` (#74767d) con opacidad baja para cards sutiles
- **Sombras**: Minimalistas, usar glow con color primario en hover states
- **Transiciones**: 200-300ms ease-out para hover, 500-800ms para animaciones de entrada
- **Tipografía monoespaciada**: Usar para elementos decorativos, labels técnicos, texto terminal
- **Efecto glitch**: En el texto decorativo del hero ("Things are going Grape.")
- **Texto espejo/duplicado**: En la sección About (texto repetido con efecto blur/reflection)
- **Cards de colecciones**: Imagen de fondo + overlay oscuro + texto blanco + hover scale
- **Badges**: Estilo pixel art o flat design con bordes redondeados

---

## CONTENIDO DE TEXTO (COPY)

Usar estos textos exactos (adaptando "Ironside" → "Vortex"):

**Hero overlay técnico:**
```
:: PRODUCT: [nombre]
:: ID: [código]
:: EDITION: LIMITED
:: COLORS: [color code]
:: INSPIRATION: [tema]
:: STYLE: [estilo]
SYS >> ST $ = CPU $ =
>> DIMENSIONS
   LENGTH → [X]mm
   WIDTH  → [X]mm
   HEIGHT → [X]mm
>> MATERIALS
   UV-PRINTED PANEL
   ACTIVE MAGNETIC STRAW
```

**Boot sequence:**
```
555553001000003 // BUILD SYS   // 092XVRTXD // 0011 MC
555553001000004 // LOAD UI     // 092XVRTXD // 0011 MC
555553001000005 // LOAD UX     // 092XVRTXD // 0011 MC
SYS >> ST       $  = CPU       $  =
SPO.LOAD 100    →  450
SPO.LOAD 200    →  200
>>> SYS CHECK.INT 45.09.1000
>>> BOOT COMPLETE
```

**About text:**
"Vortex has been a family-run company for almost 16 years, creating products that represent the individuality of gamers of all kinds. We've kept it pretty simple: we make things we would want to own. That shows up in our thoughtful designs, our meticulous build quality, and our super friendly support team behind every machine."

**Features:**
1. "Every Vortex PC is carefully built to deliver balanced, reliable performance for gaming, creative work, and everyday tasks. Each system undergoes extended testing to ensure stability and longevity, even after years of intense usage."
2. "We back our gaming PCs with a 3-year parts and 5-year labor Vortex Warranty, free of charge. Our goal: build top-tier creative and gaming rigs with lasting quality."
3. "Every Vortex PC is double boxed with instafoam to keep components secure. This secure packaging is one of the ways we go the extra mile in our PC building process."

**Collections:**
1. Vortex Series — "Prebuilt Signature Builds, Ships in 2 Business Days" — "4 MODELS AVAILABLE"
2. Limited Edition — "Limited Quantity Builds" — "4 THEMES AVAILABLE"
3. Masterworks — "Fully Custom, One-of-a-Kind Builds" — "EXCLUSIVELY FOR COMMUNITY GIVEAWAYS"
4. Partner Collabs — "Made with your Favorite Gamers" — "3 THEMES AVAILABLE"
5. Cases — "Limited Edition Vortex Chassis" — "6 THEMES AVAILABLE"

**Newsletter:**
"Emails we have fun making, with new products, deals, and giveaways!"

**Achievements intro:**
"* A new adventure awaits! Every action you take exploring the website could earn you a badge. Collect them all to receive a $25 Steam gift card with your PC!"

---

## RESULTADO ESPERADO

Una landing page completa, funcional y visualmente impactante que:
- ✅ Carga con animación terminal boot
- ✅ Tiene navbar completo con dropdowns, moneda, theme toggle, achievements, cart
- ✅ Hero carrusel con 4 productos destacados y overlay técnico
- ✅ Sistema de logros gamificado con 9 badges y tracking real
- ✅ Carrito de compras funcional con drawer
- ✅ Sección "Forge your PC" con CTA
- ✅ 3 cards de features con animaciones
- ✅ Sección About con texto espejo
- ✅ Grid de 5 colecciones con hover effects
- ✅ Footer completo con newsletter, links, redes sociales
- ✅ Dark/light mode toggle funcional
- ✅ Selector de moneda con 6 opciones
- ✅ Easter eggs (scavenger badge, botón sorpresa)
- ✅ Totalmente responsive
- ✅ Animaciones suaves con Framer Motion
- ✅ Estética cyberpunk/gaming con tipografía monoespaciada
