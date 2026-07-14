"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface CoffeePourSceneProps {
  onReady: () => void;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeInOut = (value: number) =>
  value * value * (3 - 2 * value);

export function CoffeePourScene({ onReady }: CoffeePourSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const fallback = host.parentElement?.querySelector<HTMLElement>(
      ".coffee-intro__fallback"
    );

    let renderer: THREE.WebGLRenderer | null = null;
    let frame = 0;
    let disposed = false;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "coffee-intro__canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);
    host.parentElement?.classList.add("has-webgl");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(3.45, 2.05, 5.15);
    camera.lookAt(0, 0.15, 0);

    scene.add(new THREE.HemisphereLight(0xffe4b5, 0x32150d, 2.1));
    const keyLight = new THREE.DirectionalLight(0xffc77c, 5.2);
    keyLight.position.set(-3, 5, 4);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xff6b32, 18, 12, 2);
    rimLight.position.set(4, 1.5, -2);
    scene.add(rimLight);

    const potteryMaterial = new THREE.MeshStandardMaterial({
      color: 0xa94322,
      roughness: 0.73,
      metalness: 0.02,
    });
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xd66b36,
      roughness: 0.62,
      metalness: 0.01,
    });
    const coffeeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2d0d05,
      roughness: 0.19,
      metalness: 0.03,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
    });

    const cup = new THREE.Group();
    cup.rotation.y = -0.32;
    cup.rotation.x = 0.03;
    scene.add(cup);

    const profile = [
      new THREE.Vector2(0.72, 0.9),
      new THREE.Vector2(0.68, 0.73),
      new THREE.Vector2(0.51, -0.56),
      new THREE.Vector2(0.08, -0.7),
      new THREE.Vector2(0, -0.72),
      new THREE.Vector2(0, -0.94),
      new THREE.Vector2(0.5, -0.94),
      new THREE.Vector2(0.67, -0.8),
      new THREE.Vector2(0.9, 0.9),
    ];
    const cupBody = new THREE.Mesh(
      new THREE.LatheGeometry(profile, 64),
      potteryMaterial
    );
    cup.add(cupBody);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.81, 0.075, 16, 64),
      rimMaterial
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.9;
    cup.add(rim);

    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.105, 18, 64),
      potteryMaterial
    );
    handle.position.set(0.9, 0.02, 0);
    handle.scale.set(1.08, 1.18, 1);
    cup.add(handle);

    const coaster = new THREE.Mesh(
      new THREE.CylinderGeometry(1.28, 1.42, 0.12, 64),
      new THREE.MeshStandardMaterial({
        color: 0x6f2617,
        roughness: 0.9,
      })
    );
    coaster.position.y = -1.03;
    scene.add(coaster);

    const coffee = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.53, 1, 64),
      coffeeMaterial
    );
    cup.add(coffee);

    const surface = new THREE.Mesh(
      new THREE.CircleGeometry(0.68, 64),
      coffeeMaterial
    );
    surface.rotation.x = -Math.PI / 2;
    cup.add(surface);

    const stream = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.066, 1, 18),
      coffeeMaterial
    );
    scene.add(stream);

    const steamMaterial = new THREE.MeshBasicMaterial({
      color: 0xffe8cb,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const steamCurves = [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.24, 0.9, 0),
        new THREE.Vector3(-0.4, 1.3, 0.02),
        new THREE.Vector3(-0.12, 1.68, -0.03),
        new THREE.Vector3(-0.3, 2.02, 0),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.22, 0.92, 0.02),
        new THREE.Vector3(0.38, 1.28, 0),
        new THREE.Vector3(0.13, 1.62, 0.02),
        new THREE.Vector3(0.3, 1.94, -0.02),
      ]),
    ];
    const steam = steamCurves.map((curve) => {
      const mesh = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 30, 0.018, 8, false),
        steamMaterial.clone()
      );
      scene.add(mesh);
      return mesh;
    });

    const timer = new THREE.Timer();
    timer.connect(document);
    const liquidBottom = -0.57;
    let firstFrame = true;

    const resize = () => {
      if (!renderer || disposed) return;
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      const aspect = width / height;
      if (aspect < 0.72) {
        camera.position.set(3.05, 1.95, 8.4);
      } else {
        camera.position.set(3.45, 2.05, 5.15);
      }
      camera.lookAt(0, 0.15, 0);
      renderer.setSize(width, height, false);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const render = (timestamp?: number) => {
      if (!renderer || disposed) return;
      timer.update(timestamp);
      const elapsed = timer.getElapsed();
      const pourProgress = easeInOut(clamp01((elapsed - 0.18) / 1.85));
      const liquidHeight = 0.035 + pourProgress * 1.3;
      const liquidTop = liquidBottom + liquidHeight;

      coffee.scale.y = liquidHeight;
      coffee.position.y = liquidBottom + liquidHeight / 2;
      surface.position.y = liquidTop + 0.006;
      surface.scale.setScalar(0.96 + pourProgress * 0.04);

      const streamTop = 2.54;
      const streamLength = Math.max(0.01, streamTop - liquidTop);
      stream.scale.y = streamLength;
      stream.position.set(-0.06, liquidTop + streamLength / 2, 0.02);
      stream.visible = elapsed > 0.1 && pourProgress < 0.985;
      stream.scale.x = stream.scale.z = 0.82 + Math.sin(elapsed * 16) * 0.05;

      cup.rotation.y = -0.32 + Math.sin(elapsed * 0.85) * 0.025;
      cup.position.y = Math.sin(elapsed * 1.1) * 0.012;

      const steamProgress = clamp01((elapsed - 1.65) / 0.8);
      steam.forEach((mesh, index) => {
        const material = mesh.material as THREE.MeshBasicMaterial;
        material.opacity = steamProgress * (0.26 - index * 0.04);
        mesh.position.y = Math.sin(elapsed * 1.4 + index) * 0.035;
        mesh.position.x = Math.sin(elapsed * 0.8 + index) * 0.025;
      });

      renderer.render(scene, camera);
      if (firstFrame) {
        firstFrame = false;
        fallback?.style.setProperty("display", "none");
        onReadyRef.current();
      }
      frame = requestAnimationFrame(render);
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
      } else {
        frame = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
      resizeObserver.disconnect();
      timer.dispose();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => material.dispose());
      });
      renderer?.dispose();
      renderer?.forceContextLoss();
      renderer?.domElement.remove();
      host.parentElement?.classList.remove("has-webgl");
      fallback?.style.removeProperty("display");
      renderer = null;
    };
  }, []);

  return <div ref={hostRef} className="coffee-intro__three" />;
}
