"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface CoffeePourSceneProps {
  onReady?: () => void;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeInOut = (value: number) => value * value * (3 - 2 * value);
const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
const easeOutBack = (value: number) => {
  const c1 = 1.3;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2);
};

function createClayTexture(renderer: THREE.WebGLRenderer) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");

  if (context) {
    context.fillStyle = "#86351f";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = context.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, "rgba(255, 170, 104, 0.18)");
    gradient.addColorStop(0.48, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(1, "rgba(45, 10, 4, 0.2)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);

    let seed = 9173;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let index = 0; index < 1250; index += 1) {
      const light = random() > 0.68;
      context.fillStyle = light
        ? `rgba(255, 202, 145, ${0.04 + random() * 0.11})`
        : `rgba(50, 12, 6, ${0.035 + random() * 0.1})`;
      const size = 0.35 + random() * 1.45;
      context.beginPath();
      context.arc(random() * 256, random() * 256, size, 0, Math.PI * 2);
      context.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3.2, 2.2);
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return texture;
}

function createShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");

  if (context) {
    const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 62);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.62)");
    gradient.addColorStop(0.52, "rgba(0, 0, 0, 0.25)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }

  return new THREE.CanvasTexture(canvas);
}

export function CoffeePourScene({ onReady = () => undefined }: CoffeePourSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let frame = 0;
    let disposed = false;
    let completed = false;
    let touchDragging = false;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "coffee-ritual__canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x2a120b, 0.055);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    const cameraBase = new THREE.Vector3(3.2, 1.85, 5.25);

    scene.add(new THREE.HemisphereLight(0xffe2b0, 0x210a05, 1.7));
    const keyLight = new THREE.DirectionalLight(0xffd29b, 3.6);
    keyLight.position.set(-3.2, 4.8, 4.4);
    scene.add(keyLight);
    const emberLight = new THREE.PointLight(0xdf6338, 8.5, 10, 2);
    emberLight.position.set(3.5, 1.2, -2.4);
    scene.add(emberLight);
    const softFill = new THREE.PointLight(0xffc27e, 3.2, 9, 2);
    softFill.position.set(-3, -0.5, 3);
    scene.add(softFill);

    const clayTexture = createClayTexture(renderer);
    const shadowTexture = createShadowTexture();
    const potteryMaterial = new THREE.MeshStandardMaterial({
      map: clayTexture,
      bumpMap: clayTexture,
      bumpScale: 0.022,
      roughness: 0.9,
      metalness: 0,
    });
    const darkClayMaterial = new THREE.MeshStandardMaterial({
      color: 0x5b2015,
      map: clayTexture,
      bumpMap: clayTexture,
      bumpScale: 0.018,
      roughness: 0.94,
      metalness: 0,
    });
    const slipMaterial = new THREE.MeshStandardMaterial({
      color: 0xd69258,
      roughness: 0.78,
      metalness: 0,
    });
    const coffeeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2a0c05,
      roughness: 0.13,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.09,
    });
    const rippleMaterial = new THREE.MeshBasicMaterial({
      color: 0xe2a167,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    const cup = new THREE.Group();
    cup.rotation.set(0.035, -0.52, 0);
    scene.add(cup);

    const profile = [
      new THREE.Vector2(0.72, 0.84),
      new THREE.Vector2(0.67, 0.66),
      new THREE.Vector2(0.52, -0.55),
      new THREE.Vector2(0.22, -0.72),
      new THREE.Vector2(0, -0.75),
      new THREE.Vector2(0, -0.84),
      new THREE.Vector2(0.54, -0.84),
      new THREE.Vector2(0.74, -0.67),
      new THREE.Vector2(0.98, 0.82),
    ];
    const cupBody = new THREE.Mesh(new THREE.LatheGeometry(profile, 72), potteryMaterial);
    cup.add(cupBody);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.86, 0.072, 18, 72),
      slipMaterial
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.84;
    cup.add(rim);

    [
      { radius: 0.91, y: 0.52 },
      { radius: 0.81, y: -0.1 },
    ].forEach(({ radius, y }) => {
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.022, 8, 72),
        slipMaterial
      );
      band.rotation.x = Math.PI / 2;
      band.position.y = y;
      cup.add(band);
    });

    const handleCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.88, 0.54, 0),
      new THREE.Vector3(1.75, 0.52, 0),
      new THREE.Vector3(1.68, -0.62, 0),
      new THREE.Vector3(0.69, -0.57, 0)
    );
    const handle = new THREE.Mesh(
      new THREE.TubeGeometry(handleCurve, 48, 0.105, 14, false),
      potteryMaterial
    );
    cup.add(handle);

    const coaster = new THREE.Group();
    coaster.position.y = -0.94;
    scene.add(coaster);
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.38, 1.52, 0.12, 72),
      darkClayMaterial
    );
    coaster.add(plate);
    const plateRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.19, 0.045, 10, 72),
      slipMaterial
    );
    plateRing.rotation.x = Math.PI / 2;
    plateRing.position.y = 0.07;
    coaster.add(plateRing);

    const cinnamonMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b3d20,
      roughness: 0.96,
    });
    [-0.09, 0.09].forEach((offset, index) => {
      const cinnamon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.04, 0.82, 12),
        cinnamonMaterial
      );
      cinnamon.rotation.z = Math.PI / 2;
      cinnamon.rotation.y = -0.2 + index * 0.05;
      cinnamon.position.set(-0.58, 0.14 + offset, 0.58 + index * 0.07);
      coaster.add(cinnamon);
    });

    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.7, 2.15),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(0.08, -1.02, 0.05);
    scene.add(contactShadow);

    const coffee = new THREE.Mesh(
      new THREE.CylinderGeometry(0.71, 0.49, 1, 72),
      coffeeMaterial
    );
    cup.add(coffee);
    const surface = new THREE.Mesh(new THREE.CircleGeometry(0.71, 72), coffeeMaterial);
    surface.rotation.x = -Math.PI / 2;
    cup.add(surface);

    const ripples = [0, 1].map(() => {
      const ripple = new THREE.Mesh(
        new THREE.TorusGeometry(0.33, 0.012, 8, 52),
        rippleMaterial.clone()
      );
      ripple.rotation.x = Math.PI / 2;
      cup.add(ripple);
      return ripple;
    });

    const stream = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.055, 1, 18),
      coffeeMaterial
    );
    scene.add(stream);
    const droplet = new THREE.Mesh(new THREE.SphereGeometry(0.07, 18, 14), coffeeMaterial);
    droplet.scale.set(0.72, 1.45, 0.72);
    scene.add(droplet);

    const steam = [
      [
        new THREE.Vector3(-0.26, 0.87, 0),
        new THREE.Vector3(-0.38, 1.18, 0.02),
        new THREE.Vector3(-0.1, 1.52, -0.03),
        new THREE.Vector3(-0.3, 1.89, 0),
      ],
      [
        new THREE.Vector3(0.16, 0.88, 0.02),
        new THREE.Vector3(0.34, 1.22, 0),
        new THREE.Vector3(0.09, 1.58, 0.02),
        new THREE.Vector3(0.28, 1.9, -0.02),
      ],
      [
        new THREE.Vector3(0, 0.9, -0.12),
        new THREE.Vector3(-0.08, 1.14, -0.14),
        new THREE.Vector3(0.15, 1.42, -0.1),
        new THREE.Vector3(0.04, 1.72, -0.08),
      ],
    ].map((points, index) => {
      const material = new THREE.MeshBasicMaterial({
        color: 0xffe7c5,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const steamLine = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 34, 0.014 + index * 0.003, 8, false),
        material
      );
      cup.add(steamLine);
      return steamLine;
    });

    const timer = new THREE.Timer();
    timer.connect(document);
    const liquidBottom = -0.57;
    const streamTop = 2.72;
    let firstFrame = true;

    const resize = () => {
      if (!renderer || disposed) return;
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      const aspect = width / height;
      if (width < 640 || aspect < 0.85) {
        cameraBase.set(2.95, 2.08, 7.1);
      } else {
        cameraBase.set(3.2, 1.85, 5.25);
      }
      camera.position.copy(cameraBase);
      camera.lookAt(0, 0.08, 0);
      renderer.setSize(width, height, false);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const renderScene = () => {
      renderer?.render(scene, camera);
    };

    const render = (timestamp?: number) => {
      if (!renderer || disposed) return;
      timer.update(timestamp);
      const elapsed = timer.getElapsed();
      const entrance = easeOutBack(clamp01(elapsed / 1.3));
      const pourProgress = easeInOut(clamp01((elapsed - 0.72) / 2.35));
      const liquidHeight = 0.045 + pourProgress * 1.34;
      const liquidTop = liquidBottom + liquidHeight;

      cup.scale.setScalar(0.82 + entrance * 0.18);
      cup.position.y = (1 - entrance) * 0.32 + Math.sin(elapsed * 2.1) * 0.006 * (1 - pourProgress);
      cup.rotation.y = THREE.MathUtils.lerp(-1.28, -0.52, entrance) + Math.sin(elapsed * 0.9) * 0.012;
      cup.rotation.z = (1 - entrance) * -0.07;
      coaster.scale.setScalar(0.88 + easeOutCubic(clamp01((elapsed - 0.1) / 1.05)) * 0.12);

      coffee.scale.y = liquidHeight;
      coffee.position.y = liquidBottom + liquidHeight / 2;
      surface.position.y = liquidTop + 0.007;
      surface.scale.setScalar(0.94 + pourProgress * 0.06);

      const streamLength = Math.max(0.01, streamTop - liquidTop);
      const streamVisible = elapsed > 0.58 && pourProgress < 0.988;
      stream.visible = streamVisible;
      stream.scale.set(
        0.84 + Math.sin(elapsed * 18) * 0.045,
        streamLength,
        0.84 + Math.cos(elapsed * 17) * 0.04
      );
      stream.position.set(-0.055 + Math.sin(elapsed * 7) * 0.012, liquidTop + streamLength / 2, 0.02);

      droplet.visible = streamVisible;
      if (streamVisible) {
        const fall = (elapsed * 2.35) % 1;
        droplet.position.set(-0.055, THREE.MathUtils.lerp(streamTop - 0.15, liquidTop + 0.12, fall), 0.02);
        droplet.scale.y = 1.15 + fall * 0.65;
      }

      ripples.forEach((ripple, index) => {
        ripple.position.y = liquidTop + 0.018 + index * 0.003;
        const pulse = (elapsed * 1.65 + index * 0.52) % 1;
        ripple.scale.setScalar(0.45 + pulse * 0.9);
        (ripple.material as THREE.MeshBasicMaterial).opacity = streamVisible
          ? (1 - pulse) * 0.34
          : Math.max(0, (1 - clamp01((elapsed - 3.05) / 0.7)) * 0.12);
      });

      const steamProgress = easeOutCubic(clamp01((elapsed - 2.35) / 1.05));
      steam.forEach((steamLine, index) => {
        const material = steamLine.material as THREE.MeshBasicMaterial;
        material.opacity = steamProgress * (0.2 - index * 0.025);
        steamLine.position.x = Math.sin(elapsed * 1.05 + index * 1.7) * 0.035;
        steamLine.position.y = Math.sin(elapsed * 1.35 + index) * 0.025;
        steamLine.rotation.z = Math.sin(elapsed * 0.72 + index) * 0.03;
      });

      camera.position.copy(cameraBase);
      camera.position.z += (1 - easeOutCubic(clamp01(elapsed / 1.6))) * 0.72;
      camera.lookAt(0, 0.08, 0);
      renderScene();

      if (firstFrame) {
        firstFrame = false;
        onReadyRef.current();
      }

      if (elapsed < 5.4) {
        frame = requestAnimationFrame(render);
      } else {
        completed = true;
        cup.position.y = 0;
        cup.rotation.set(0.035, -0.52, 0);
        renderScene();
      }
    };

    const rotateFromPointer = (clientX: number, clientY: number) => {
      if (!completed || disposed) return;
      const rect = host.getBoundingClientRect();
      const x = clamp01((clientX - rect.left) / rect.width) * 2 - 1;
      const y = clamp01((clientY - rect.top) / rect.height) * 2 - 1;
      cup.rotation.y = -0.52 + x * 0.24;
      cup.rotation.x = 0.035 + y * 0.065;
      coaster.rotation.y = x * 0.035;
      renderScene();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" || !completed) return;
      touchDragging = true;
      host.setPointerCapture?.(event.pointerId);
      rotateFromPointer(event.clientX, event.clientY);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && !touchDragging) return;
      rotateFromPointer(event.clientX, event.clientY);
    };
    const onPointerUp = (event: PointerEvent) => {
      touchDragging = false;
      if (host.hasPointerCapture?.(event.pointerId)) host.releasePointerCapture(event.pointerId);
    };
    const onPointerLeave = (event: PointerEvent) => {
      if (!completed || event.pointerType !== "mouse") return;
      cup.rotation.set(0.035, -0.52, 0);
      coaster.rotation.y = 0;
      renderScene();
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
      } else if (!completed) {
        frame = requestAnimationFrame(render);
      }
    };

    host.addEventListener("pointerdown", onPointerDown);
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerup", onPointerUp);
    host.addEventListener("pointercancel", onPointerUp);
    host.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerup", onPointerUp);
      host.removeEventListener("pointercancel", onPointerUp);
      host.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      resizeObserver.disconnect();
      timer.dispose();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      clayTexture.dispose();
      shadowTexture.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
      renderer?.domElement.remove();
      renderer = null;
    };
  }, []);

  return <div ref={hostRef} className="coffee-ritual__three" />;
}
