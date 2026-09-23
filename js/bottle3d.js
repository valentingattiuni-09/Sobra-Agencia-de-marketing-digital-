/* ============================================================
   Botella 3D (Three.js) — hero + formato
   Construida por código (LatheGeometry), sin modelos externos.
   Controla: giro con inercia atado al scroll, los 7 beneficios
   sincronizados con el giro, el despegue de etiqueta y el cierre.
   Si WebGL no está disponible, main.js nunca llama a init() y se
   queda el fallback PNG (ver .no-3d en el HTML/CSS).
   ============================================================ */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export function isWebglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) {
    return false;
  }
}

export function initBottle3D(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);

  /* ---- Ambiente para que el vidrio (transmission) tenga algo que
     refractar — sin esto, el material físico se ve blanco/lavado. */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0xdfeff7);
  const envA = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  envA.position.set(-2, 1, 2);
  envA.lookAt(0, 0, 0);
  envScene.add(envA);
  const envB = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ color: 0x7fd4ef }));
  envB.position.set(2, -1, 1.5);
  envB.lookAt(0, 0, 0);
  envScene.add(envB);
  scene.environment = pmrem.fromScene(envScene, 0.06).texture;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x9cc8e0, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(2, 3, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7fd4ef, 0.8);
  rim.position.set(-2, 1.5, -2);
  scene.add(rim);

  // Solo para que el vidrio (transmission) tenga algo que refractar;
  // toneMapped:false para que el color salga exacto y calce con el
  // fondo celeste real de la página en vez de verse gris lavado.
  const backdropMat = new THREE.MeshBasicMaterial({ color: 0xdff1fa, toneMapped: false });
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), backdropMat);
  backdrop.position.z = -0.9;
  scene.add(backdrop);

  /* ---- Perfil de la botella (perfil real de 500 ml: angosta y alta) ---- */
  const P = (r, y) => new THREE.Vector2(r, y);
  const profile = [
    P(0.001, 0.000), P(0.130, 0.000), P(0.150, 0.016), P(0.156, 0.040),
    P(0.156, 0.100), P(0.156, 0.440), P(0.150, 0.505), P(0.128, 0.575),
    P(0.088, 0.645), P(0.063, 0.690), P(0.060, 0.730), P(0.060, 0.755),
    P(0.067, 0.767), P(0.060, 0.778), P(0.060, 0.800), P(0.052, 0.805),
  ];
  const bottleGeo = new THREE.LatheGeometry(profile, 64);
  const bottleMat = new THREE.MeshPhysicalMaterial({
    color: 0xdcf3fa, roughness: 0.06, transmission: 1, thickness: 0.06,
    ior: 1.45, envMapIntensity: 1.1, clearcoat: 0.5, clearcoatRoughness: 0.18,
    side: THREE.DoubleSide,
  });

  const bottleGroup = new THREE.Group();
  bottleGroup.add(new THREE.Mesh(bottleGeo, bottleMat));

  const waterProfile = profile.filter((p) => p.y <= 0.66).map((p) => new THREE.Vector2(Math.max(p.x - 0.012, 0.001), p.y));
  const waterGeo = new THREE.LatheGeometry(waterProfile, 48);
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0xbfe9f7, transmission: 0.9, roughness: 0.15, thickness: 0.2, ior: 1.33, envMapIntensity: 0.8,
  });
  bottleGroup.add(new THREE.Mesh(waterGeo, waterMat));

  const capMat = new THREE.MeshStandardMaterial({ color: 0x2aa0d8, roughness: 0.35, metalness: 0.05 });
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.069, 0.066, 0.1, 32), capMat);
  cap.position.y = 0.85;
  bottleGroup.add(cap);
  for (let i = 0; i < 5; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.069, 0.0035, 6, 24), capMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.775 + i * 0.018;
    bottleGroup.add(ring);
  }

  function drawLabel(mode) {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 380;
    const ctx = c.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, c.height);
    grad.addColorStop(0, "#eaf7fc");
    grad.addColorStop(1, "#7fd4ef");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (mode === "brinda") {
      ctx.fillStyle = "#0d1b2a";
      ctx.font = "700 130px Sora, Arial, sans-serif";
      ctx.fillText("Brinda", c.width / 2, c.height / 2 + 10);
    } else {
      ctx.strokeStyle = "#0d1b2a";
      ctx.lineWidth = 4;
      ctx.setLineDash([14, 10]);
      ctx.strokeRect(c.width / 2 - 210, c.height / 2 - 100, 420, 200);
      ctx.fillStyle = "#0d1b2a";
      ctx.font = "700 58px Sora, Arial, sans-serif";
      ctx.fillText("TU MARCA", c.width / 2, c.height / 2 - 8);
      ctx.font = "600 30px Inter, Arial, sans-serif";
      ctx.fillText("ACÁ", c.width / 2, c.height / 2 + 58);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const labelMat = new THREE.MeshStandardMaterial({ map: drawLabel("brinda"), roughness: 0.5, side: THREE.DoubleSide, transparent: true });
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.158, 0.1565, 0.3, 64, 1, true), labelMat);
  label.position.y = 0.3;
  label.rotation.y = Math.PI;
  bottleGroup.add(label);

  scene.add(bottleGroup);

  /* ---- Encuadre: centra la botella y ubica la cámara a distancia fija ---- */
  const box = new THREE.Box3().setFromObject(bottleGroup);
  const center = box.getCenter(new THREE.Vector3());
  bottleGroup.position.sub(center);
  backdrop.position.y -= center.y;
  const size = box.getSize(new THREE.Vector3());
  const fitHeight = size.y * 1.4;

  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const dist = fitHeight / 2 / Math.tan((camera.fov * Math.PI) / 180 / 2);
    camera.position.set(0, 0, dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  /* ---- Estado de giro con inercia ---- */
  let targetRotY = 0;
  let running = false;
  let rafId = null;

  function frame() {
    bottleGroup.rotation.y += (targetRotY - bottleGroup.rotation.y) * 0.09;
    renderer.render(scene, camera);
    if (running) rafId = requestAnimationFrame(frame);
  }
  function start() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => (e.isIntersecting ? start() : stop()));
    },
    { threshold: 0.01 }
  );
  io.observe(canvas.closest(".stage") || canvas);

  return {
    setRotation(y) {
      targetRotY = y;
    },
    setLabelOpacity(v) {
      labelMat.opacity = v;
    },
    setLabelMode(mode) {
      const old = labelMat.map;
      labelMat.map = drawLabel(mode);
      labelMat.needsUpdate = true;
      if (old) old.dispose();
    },
    snapRotation(y) {
      targetRotY = y;
      bottleGroup.rotation.y = y;
    },
    renderOnce() {
      renderer.render(scene, camera);
    },
    resize,
    destroy() {
      stop();
      io.disconnect();
      window.removeEventListener("resize", resize);
    },
  };
}
