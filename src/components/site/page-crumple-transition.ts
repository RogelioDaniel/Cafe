"use client";

type ThreeModule = typeof import("three");
type CaptureModule = typeof import("modern-screenshot");

export type PageCrumplePhase =
  | "capturing"
  | "crumpling"
  | "swapping"
  | "uncrumpling";

type PageCrumpleOptions = {
  signal: AbortSignal;
  onCovered: () => void;
  onPhaseChange: (phase: PageCrumplePhase) => void;
};

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

const CRUMPLE_DURATION = 1060;
const TEXTURE_SWAP_DURATION = 90;
const UNCRUMPLE_DURATION = 1180;
const CAPTURE_TIMEOUT = 2400;
const PAPER_INK = 0x1d2059;

let modulePromise: Promise<[ThreeModule, CaptureModule]> | null = null;

const vertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;

  attribute vec3 aCrumpled;
  attribute vec3 aFolded;
  attribute float aDelay;
  attribute float aCrease;

  varying vec2 vUv;
  varying vec3 vDeformed;
  varying float vCrease;
  varying float vProgress;

  float easeInOut(float value) {
    return value < 0.5
      ? 4.0 * value * value * value
      : 1.0 - pow(-2.0 * value + 2.0, 3.0) * 0.5;
  }

  void main() {
    vUv = uv;

    float delayed = clamp(
      (uProgress - aDelay * 0.35) / max(0.001, 1.0 - aDelay * 0.35),
      0.0,
      1.0
    );
    float wrinkle = smoothstep(0.02, 0.30, delayed);
    float wrinkleHold = 1.0 - smoothstep(0.78, 1.0, delayed);
    float fold = easeInOut(smoothstep(0.28, 0.76, delayed));
    float ball = easeInOut(smoothstep(0.72, 1.0, delayed));
    float edge = max(abs(uv.x - 0.5), abs(uv.y - 0.5)) * 2.0;

    vec2 directionA = normalize(vec2(0.82, 0.57));
    vec2 directionB = normalize(vec2(-0.46, 0.89));
    float waveA = sin(dot(position.xy, directionA) * 11.0 + aCrease * 0.55);
    float waveB = sin(dot(position.xy, directionB) * 17.0 - aCrease * 0.38);
    float ridgeA = sign(waveA) * pow(abs(waveA), 7.0);
    float ridgeB = sign(waveB) * pow(abs(waveB), 9.0);
    float crease = ridgeA * 0.72 + ridgeB * 0.46;

    vec3 wrinkled = position;
    wrinkled.z += wrinkle * wrinkleHold * (crease * 0.082 + edge * edge * 0.036);
    wrinkled.xy += wrinkle * wrinkleHold * (
      directionA * ridgeA * 0.016 + directionB * ridgeB * 0.011
    );

    vec3 folded = mix(wrinkled, aFolded, fold);
    folded.z += wrinkle * (1.0 - ball) * (ridgeA * 0.043 + ridgeB * 0.028);

    vec3 deformed = mix(folded, aCrumpled, ball);
    deformed.z += sin(uTime * 0.002 + aCrease * 12.0) * uProgress * 0.004;

    vDeformed = deformed;
    vCrease = clamp(abs(ridgeA) * 0.62 + abs(ridgeB) * 0.46 + fold * 0.12, 0.0, 1.0);
    vProgress = uProgress;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(deformed, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uSourceMap;
  uniform sampler2D uTargetMap;
  uniform float uTextureMix;

  varying vec2 vUv;
  varying vec3 vDeformed;
  varying float vCrease;
  varying float vProgress;

  void main() {
    vec4 sourceColor = texture2D(uSourceMap, vUv);
    vec4 targetColor = texture2D(uTargetMap, vUv);
    vec4 paperColor = mix(sourceColor, targetColor, uTextureMix);

    vec3 normal = normalize(cross(dFdx(vDeformed), dFdy(vDeformed)));
    if (!gl_FrontFacing) normal *= -1.0;

    vec3 lightDirection = normalize(vec3(-0.38, 0.58, 0.94));
    float diffuse = clamp(dot(normal, lightDirection), -0.34, 1.0);
    float depth = smoothstep(0.015, 0.72, vProgress);
    float creaseShadow = smoothstep(0.58, 1.0, vCrease) * depth;
    float paperLight = 0.78 + diffuse * 0.28 - creaseShadow * 0.15;

    vec3 shaded = paperColor.rgb * paperLight;
    shaded += vec3(1.0, 0.92, 0.69) * max(diffuse, 0.0) * depth * 0.055;

    if (!gl_FrontFacing) {
      vec3 paperBack = vec3(1.0, 0.969, 0.82) * (0.78 + max(diffuse, 0.0) * 0.22);
      shaded = mix(paperBack, shaded, 0.16);
    }

    vec3 finalColor = mix(paperColor.rgb, shaded, depth);
    gl_FragColor = vec4(finalColor, paperColor.a);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function getModules() {
  modulePromise ??= Promise.all([import("three"), import("modern-screenshot")]);
  return modulePromise;
}

function abortError() {
  return new DOMException("La transición fue interrumpida", "AbortError");
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw abortError();
}

function nextFrame(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    throwIfAborted(signal);
    const frame = window.requestAnimationFrame(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    });
    const onAbort = () => {
      window.cancelAnimationFrame(frame);
      reject(abortError());
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function wait(milliseconds: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    throwIfAborted(signal);
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, milliseconds);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(abortError());
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number, signal: AbortSignal) {
  return new Promise<T>((resolve, reject) => {
    throwIfAborted(signal);
    const timer = window.setTimeout(() => reject(new Error("Tiempo de captura agotado")), milliseconds);
    const onAbort = () => reject(abortError());
    signal.addEventListener("abort", onAbort, { once: true });

    promise.then(
      (value) => {
        window.clearTimeout(timer);
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        signal.removeEventListener("abort", onAbort);
        reject(error);
      }
    );
  });
}

function pseudoRandom(x: number, y: number, seed: number) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return value - Math.floor(value);
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function dispatchPaperTransition(active: boolean) {
  window.dispatchEvent(
    new CustomEvent("tonalli:paper-transition", {
      detail: { active },
    })
  );
}

async function waitForViewportAssets(signal: AbortSignal) {
  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  await Promise.race([fontsReady, wait(260, signal)]);
  throwIfAborted(signal);

  const visibleImages = Array.from(document.images).filter((image) => {
    const rect = image.getBoundingClientRect();
    return rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
  });

  await Promise.race([
    Promise.all(
      visibleImages.map((image) =>
        image.complete ? Promise.resolve() : image.decode().catch(() => undefined)
      )
    ),
    wait(260, signal),
  ]);
}

function placeReplicaElement(
  replica: HTMLElement,
  rect: DOMRect,
  viewportWidth: number
) {
  replica.style.setProperty("position", "absolute", "important");
  replica.style.setProperty("inset", "auto", "important");
  replica.style.setProperty("top", `${rect.top}px`, "important");
  replica.style.setProperty("left", `${rect.left}px`, "important");
  replica.style.setProperty("width", `${Math.min(rect.width, viewportWidth)}px`, "important");
  replica.style.setProperty("height", `${rect.height}px`, "important");
  replica.style.setProperty("margin", "0", "important");
  replica.style.setProperty("transform", "none", "important");
}

function prepareReplicaContent(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(".coffee-ritual__fallback").forEach((fallback) => {
    fallback.style.setProperty("display", "block", "important");
    fallback.style.setProperty("opacity", "0.48", "important");
  });
  root.querySelectorAll<HTMLElement>(".coffee-ritual__three").forEach((host) => {
    host.style.setProperty("display", "none", "important");
  });
  root.querySelectorAll("canvas, nextjs-portal, script").forEach((element) => element.remove());
}

function cloneVisibleTree(source: HTMLElement, viewportHeight: number): HTMLElement {
  const clone = source.cloneNode(false) as HTMLElement;

  if (source instanceof HTMLInputElement && clone instanceof HTMLInputElement) {
    clone.value = source.value;
    clone.checked = source.checked;
  } else if (source instanceof HTMLTextAreaElement && clone instanceof HTMLTextAreaElement) {
    clone.value = source.value;
    clone.textContent = source.value;
  } else if (source instanceof HTMLSelectElement && clone instanceof HTMLSelectElement) {
    clone.value = source.value;
  }

  source.childNodes.forEach((child) => {
    if (!(child instanceof HTMLElement)) {
      clone.appendChild(child.cloneNode(true));
      return;
    }

    const rect = child.getBoundingClientRect();
    const isOutside = rect.height > 0 && (rect.bottom < -48 || rect.top > viewportHeight + 48);
    if (!isOutside) {
      clone.appendChild(cloneVisibleTree(child, viewportHeight));
      return;
    }

    const placeholder = child.cloneNode(false) as HTMLElement;
    placeholder.removeAttribute("id");
    placeholder.setAttribute("aria-hidden", "true");
    placeholder.style.setProperty("visibility", "hidden", "important");
    placeholder.style.setProperty("pointer-events", "none", "important");
    placeholder.style.setProperty("contain", "strict", "important");
    placeholder.style.setProperty("min-width", "0", "important");
    placeholder.style.setProperty("min-height", "0", "important");
    placeholder.style.setProperty("width", `${rect.width}px`, "important");
    placeholder.style.setProperty("height", `${rect.height}px`, "important");
    clone.appendChild(placeholder);
  });

  return clone;
}

function createViewportReplica(width: number, height: number) {
  const originalStage = document.querySelector<HTMLElement>(".tonalli-site-stage");
  const originalCanvas = originalStage?.querySelector<HTMLElement>(".tonalli-site-canvas");
  const originalMain = originalCanvas?.querySelector<HTMLElement>("#main-content");
  if (!originalStage || !originalCanvas || !originalMain) return null;

  const stage = originalStage.cloneNode(false) as HTMLElement;
  const canvas = originalCanvas.cloneNode(false) as HTMLElement;
  const main = originalMain.cloneNode(false) as HTMLElement;

  stage.className = [
    document.documentElement.className,
    document.body.className,
    originalStage.className,
  ]
    .filter(Boolean)
    .join(" ");
  stage.removeAttribute("inert");
  stage.removeAttribute("aria-busy");
  stage.setAttribute("aria-hidden", "true");
  stage.setAttribute("data-page-crumple-capture", "");
  stage.style.setProperty("position", "fixed", "important");
  stage.style.setProperty("inset", "0", "important");
  stage.style.setProperty("z-index", "-2147483647", "important");
  stage.style.setProperty("width", `${width}px`, "important");
  stage.style.setProperty("height", `${height}px`, "important");
  stage.style.setProperty("min-height", "0", "important");
  stage.style.setProperty("overflow", "hidden", "important");
  stage.style.setProperty("pointer-events", "none", "important");
  stage.style.setProperty("contain", "strict", "important");
  stage.style.setProperty("font-family", window.getComputedStyle(document.body).fontFamily);

  canvas.style.setProperty("position", "absolute", "important");
  canvas.style.setProperty("inset", "0", "important");
  canvas.style.setProperty("width", `${width}px`, "important");
  canvas.style.setProperty("height", `${height}px`, "important");
  canvas.style.setProperty("min-height", "0", "important");
  canvas.style.setProperty("overflow", "hidden", "important");
  canvas.style.setProperty("transform", "none", "important");

  main.style.setProperty("position", "absolute", "important");
  main.style.setProperty("inset", "0", "important");
  main.style.setProperty("display", "block", "important");
  main.style.setProperty("width", `${width}px`, "important");
  main.style.setProperty("height", `${height}px`, "important");
  main.style.setProperty("overflow", "visible", "important");

  const header = originalCanvas.querySelector<HTMLElement>(".poster-navbar");
  if (header) {
    const headerClone = cloneVisibleTree(header, height);
    placeReplicaElement(headerClone, header.getBoundingClientRect(), width);
    canvas.appendChild(headerClone);
  }

  Array.from(originalMain.children).forEach((child) => {
    if (!(child instanceof HTMLElement)) return;
    const rect = child.getBoundingClientRect();
    if (rect.bottom <= -2 || rect.top >= height + 2) return;
    const clone = cloneVisibleTree(child, height);
    placeReplicaElement(clone, rect, width);
    main.appendChild(clone);
  });

  canvas.appendChild(main);

  const footer = originalCanvas.querySelector<HTMLElement>("footer");
  if (footer) {
    const rect = footer.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < height) {
      const footerClone = cloneVisibleTree(footer, height);
      placeReplicaElement(footerClone, rect, width);
      canvas.appendChild(footerClone);
    }
  }

  stage.appendChild(canvas);

  Array.from(document.body.children).forEach((child) => {
    if (
      !(child instanceof HTMLElement) ||
      child === originalStage ||
      child.matches("script, next-route-announcer, .skip-link, .sr-only, [data-page-crumple-capture]")
    ) {
      return;
    }
    const rect = child.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0 || rect.bottom <= 0 || rect.top >= height) return;
    const clone = cloneVisibleTree(child, height);
    placeReplicaElement(clone, rect, width);
    stage.appendChild(clone);
  });

  prepareReplicaContent(stage);
  document.body.appendChild(stage);
  return stage;
}

async function captureViewport(
  domToCanvas: CaptureModule["domToCanvas"],
  signal: AbortSignal
) {
  throwIfAborted(signal);
  const root = document.documentElement;
  const width = root.clientWidth;
  const height = window.innerHeight;
  const scale = Math.max(
    0.75,
    Math.min(window.devicePixelRatio || 1, 1.25, 2048 / Math.max(width, height))
  );

  await Promise.race([document.fonts?.ready ?? Promise.resolve(), wait(320, signal)]);

  const replica = createViewportReplica(width, height);
  if (!replica) throw new Error("No fue posible preparar la página visible");

  const capture = domToCanvas(replica, {
    width,
    height,
    scale,
    timeout: 1100,
    backgroundColor: window.getComputedStyle(document.body).backgroundColor || "#1d2059",
    font: { preferredFormat: "woff2" },
    features: {
      copyScrollbar: false,
      restoreScrollPosition: true,
    },
    filter(node) {
      if (!(node instanceof Element)) return true;
      return !node.matches(
        ".page-crumple-transition, .coffee-intro, .coffee-ritual__canvas, nextjs-portal, [data-page-crumple-ignore], [data-sonner-toaster]"
      );
    },
  });

  try {
    return await withTimeout(capture, CAPTURE_TIMEOUT, signal);
  } finally {
    replica.remove();
  }
}

function createTexture(THREE: ThreeModule, canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function animateValue(
  from: number,
  to: number,
  duration: number,
  signal: AbortSignal,
  update: (value: number, elapsed: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    throwIfAborted(signal);
    const startedAt = performance.now();
    let frame = 0;

    const onAbort = () => {
      window.cancelAnimationFrame(frame);
      reject(abortError());
    };

    const tick = (now: number) => {
      const raw = Math.min(1, (now - startedAt) / duration);
      const eased = easeInOutCubic(raw);
      update(from + (to - from) * eased, now - startedAt);
      if (raw >= 1) {
        signal.removeEventListener("abort", onAbort);
        resolve();
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    signal.addEventListener("abort", onAbort, { once: true });
    frame = window.requestAnimationFrame(tick);
  });
}

export function shouldUsePageCrumple() {
  if (typeof window === "undefined") return false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = (navigator as NavigatorWithConnection).connection?.saveData;
  return !reducedMotion && !saveData;
}

export function preparePageCrumple() {
  if (!shouldUsePageCrumple()) return;
  void getModules();
}

export async function runPageCrumpleTransition({
  signal: externalSignal,
  onCovered,
  onPhaseChange,
}: PageCrumpleOptions) {
  if (!shouldUsePageCrumple()) return false;

  const [THREE, { domToCanvas }] = await getModules();
  throwIfAborted(externalSignal);

  const internalAbort = new AbortController();
  const relayAbort = () => internalAbort.abort();
  externalSignal.addEventListener("abort", relayAbort, { once: true });
  const signal = internalAbort.signal;

  let overlay: HTMLDivElement | null = null;
  let renderer: import("three").WebGLRenderer | null = null;
  let geometry: import("three").PlaneGeometry | null = null;
  let material: import("three").ShaderMaterial | null = null;
  let sourceTexture: import("three").CanvasTexture | null = null;
  let targetTexture: import("three").CanvasTexture | null = null;
  let sourceCanvas: HTMLCanvasElement | null = null;
  let targetCanvas: HTMLCanvasElement | null = null;
  let covered = false;
  let transitionStarted = false;

  const root = document.documentElement;
  const body = document.body;
  const stage = document.querySelector<HTMLElement>(".tonalli-site-stage");
  const previousRootOverflow = root.style.overflow;
  const previousBodyOverflow = body.style.overflow;
  const wasInert = stage?.hasAttribute("inert") ?? false;
  const previousBusy = stage?.getAttribute("aria-busy");
  const initialWidth = root.clientWidth;
  const initialHeight = window.innerHeight;

  const preventScroll = (event: Event) => event.preventDefault();
  const abortOnEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") internalAbort.abort();
  };
  const abortOnVisibility = () => {
    if (document.hidden) internalAbort.abort();
  };
  const abortOnResize = () => {
    if (
      Math.abs(root.clientWidth - initialWidth) > 40 ||
      Math.abs(window.innerHeight - initialHeight) > 80
    ) {
      internalAbort.abort();
    }
  };

  try {
    onPhaseChange("capturing");
    dispatchPaperTransition(true);
    transitionStarted = true;
    stage?.setAttribute("inert", "");
    stage?.setAttribute("aria-busy", "true");
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", abortOnEscape);
    window.addEventListener("resize", abortOnResize);
    document.addEventListener("visibilitychange", abortOnVisibility);

    await nextFrame(signal);
    sourceCanvas = await captureViewport(domToCanvas, signal);
    throwIfAborted(signal);

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    root.classList.add("page-crumple-active");

    overlay = document.createElement("div");
    overlay.className = "page-crumple-transition";
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("data-page-crumple-ignore", "");
    const shadow = document.createElement("span");
    shadow.className = "page-crumple-transition__shadow";
    overlay.appendChild(shadow);
    body.appendChild(overlay);

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setSize(initialWidth, initialHeight, false);
    renderer.setClearColor(PAPER_INK, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.domElement.className = "page-crumple-transition__canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    overlay.appendChild(renderer.domElement);

    const aspect = initialWidth / initialHeight;
    const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 8);
    camera.position.z = 3;
    const scene = new THREE.Scene();
    const segmentsX = initialWidth < 640 ? 30 : 48;
    const segmentsY = initialWidth < 640 ? 48 : 30;
    geometry = new THREE.PlaneGeometry(aspect * 2, 2, segmentsX, segmentsY);

    const uv = geometry.getAttribute("uv");
    const count = uv.count;
    const crumpled = new Float32Array(count * 3);
    const folded = new Float32Array(count * 3);
    const delays = new Float32Array(count);
    const creases = new Float32Array(count);
    const seed = Math.random() * 10;
    const ballRadius = initialWidth < 640 ? 0.225 : 0.24;

    for (let index = 0; index < count; index += 1) {
      const u = uv.getX(index);
      const v = uv.getY(index);
      const nx = u * 2 - 1;
      const ny = v * 2 - 1;
      const random = pseudoRandom(u * 17, v * 19, seed);
      const smoothNoise =
        Math.sin(u * 18.7 + v * 9.2 + seed) * 0.5 +
        Math.sin(u * 7.1 - v * 15.3 + seed * 0.7) * 0.5;
      const creaseField = Math.max(
        0,
        Math.min(
          1,
          0.5 +
            Math.sin(u * Math.PI * 4.2 + seed) * 0.25 +
            Math.sin(v * Math.PI * 3.4 - seed * 0.7) * 0.25
        )
      );
      const triangleX =
        (2 / Math.PI) * Math.asin(Math.sin((u - 0.5) * Math.PI * 3.4 + seed * 0.11));
      const triangleY =
        (2 / Math.PI) * Math.asin(Math.sin((v - 0.5) * Math.PI * 2.6 - seed * 0.07));
      const foldedX = triangleX * aspect * 0.52 + Math.sin(v * Math.PI * 3 + seed) * 0.035;
      const foldedY = triangleY * 0.56 + Math.sin(u * Math.PI * 2 - seed) * 0.028;
      const foldedZ =
        Math.cos((u - 0.5) * Math.PI * 3.4) * 0.15 +
        Math.cos((v - 0.5) * Math.PI * 2.6) * 0.11 +
        smoothNoise * 0.025;

      folded[index * 3] = foldedX;
      folded[index * 3 + 1] = foldedY;
      folded[index * 3 + 2] = foldedZ;

      const radial = Math.min(1, Math.hypot(nx, ny) / Math.SQRT2);
      const angle = Math.atan2(foldedY, foldedX) + smoothNoise * 0.2;
      const polar = Math.pow(radial, 0.76) * Math.PI * 0.96;
      const lobes =
        Math.sin(angle * 3 + seed) * 0.095 +
        Math.sin(angle * 7 - seed) * 0.045;
      const radius = ballRadius * (0.9 + lobes + smoothNoise * 0.055 + (random - 0.5) * 0.024);
      const ring = Math.sin(polar);

      crumpled[index * 3] = Math.cos(angle) * ring * radius * 1.08 + foldedX * 0.035;
      crumpled[index * 3 + 1] = Math.sin(angle) * ring * radius * 0.9 + foldedY * 0.035;
      crumpled[index * 3 + 2] = Math.cos(polar) * radius + smoothNoise * 0.012;

      const distanceFromCenter = Math.min(1, Math.hypot(nx, ny) / Math.SQRT2);
      delays[index] = Math.max(
        0,
        (1 - distanceFromCenter) * 0.04 + Math.max(0, creaseField - 0.5) * 0.018
      );
      creases[index] = creaseField;
    }

    geometry.setAttribute("aCrumpled", new THREE.BufferAttribute(crumpled, 3));
    geometry.setAttribute("aFolded", new THREE.BufferAttribute(folded, 3));
    geometry.setAttribute("aDelay", new THREE.BufferAttribute(delays, 1));
    geometry.setAttribute("aCrease", new THREE.BufferAttribute(creases, 1));

    sourceTexture = createTexture(THREE, sourceCanvas);
    material = new THREE.ShaderMaterial({
      uniforms: {
        uSourceMap: { value: sourceTexture },
        uTargetMap: { value: sourceTexture },
        uTextureMix: { value: 0 },
        uProgress: { value: 0 },
        uTime: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      transparent: false,
      depthTest: true,
      depthWrite: true,
    });
    const paper = new THREE.Mesh(geometry, material);
    scene.add(paper);

    const render = (progress: number, elapsed: number, revealing: boolean) => {
      if (!renderer || !material || !overlay) return;
      material.uniforms.uProgress.value = progress;
      material.uniforms.uTime.value = elapsed;
      shadow.style.opacity = String(Math.max(0, Math.min(0.72, (progress - 0.58) * 1.8)));
      shadow.style.transform = `translate(-50%, -50%) scale(${0.65 + progress * 0.35})`;
      overlay.style.opacity = revealing && progress < 0.11
        ? String(Math.max(0, progress / 0.11))
        : String(Math.min(1, progress / 0.055));
      renderer.render(scene, camera);
    };

    render(0, 0, false);
    await nextFrame(signal);
    onPhaseChange("crumpling");
    await animateValue(0, 1, CRUMPLE_DURATION, signal, (progress, elapsed) => {
      render(progress, elapsed, false);
    });

    onPhaseChange("swapping");
    onCovered();
    covered = true;
    await nextFrame(signal);
    await nextFrame(signal);
    await waitForViewportAssets(signal);
    targetCanvas = await captureViewport(domToCanvas, signal);
    targetTexture = createTexture(THREE, targetCanvas);
    material.uniforms.uTargetMap.value = targetTexture;

    await animateValue(0, 1, TEXTURE_SWAP_DURATION, signal, (mix) => {
      if (!renderer || !material) return;
      material.uniforms.uTextureMix.value = mix;
      renderer.render(scene, camera);
    });

    onPhaseChange("uncrumpling");
    await animateValue(1, 0, UNCRUMPLE_DURATION, signal, (progress, elapsed) => {
      render(progress, CRUMPLE_DURATION + TEXTURE_SWAP_DURATION + elapsed, true);
    });

    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      root.dataset.pageCrumpleError =
        error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    }
    if (covered && overlay) {
      overlay.style.transition = "opacity 160ms ease-out";
      overlay.style.opacity = "0";
      await new Promise((resolve) => window.setTimeout(resolve, 170));
    }
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return false;
  } finally {
    externalSignal.removeEventListener("abort", relayAbort);
    window.removeEventListener("wheel", preventScroll);
    window.removeEventListener("touchmove", preventScroll);
    window.removeEventListener("keydown", abortOnEscape);
    window.removeEventListener("resize", abortOnResize);
    document.removeEventListener("visibilitychange", abortOnVisibility);

    root.style.overflow = previousRootOverflow;
    body.style.overflow = previousBodyOverflow;
    root.classList.remove("page-crumple-active");
    if (!wasInert) stage?.removeAttribute("inert");
    if (previousBusy == null) stage?.removeAttribute("aria-busy");
    else stage?.setAttribute("aria-busy", previousBusy);

    material?.dispose();
    geometry?.dispose();
    sourceTexture?.dispose();
    targetTexture?.dispose();
    renderer?.dispose();
    renderer?.forceContextLoss();
    renderer?.domElement.remove();
    overlay?.remove();
    if (sourceCanvas) sourceCanvas.width = sourceCanvas.height = 1;
    if (targetCanvas) targetCanvas.width = targetCanvas.height = 1;
    if (transitionStarted) dispatchPaperTransition(false);
  }
}
