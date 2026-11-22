// Objetos de costura en 3D (carretes, botones, agujas, alfileres, tijeras, dedal y cinta métrica)
// flotando en órbita alrededor de un carrete grande.
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gsap } from "gsap";

const MARINO = 0x0b1733;
const AZUL = 0x3a5f9a;
const VERDE = 0x7dd957;
const MOSTAZA = 0xe0a83a;
const CREMA = 0xf3ead8;
const ROJO = 0xd9483b;

// ---------- texturas hechas con código ----------
function texturaHilo(color) {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 512;
  const ctx = c.getContext("2d");
  const base = new THREE.Color(color);
  for (let y = 0; y < 512; y += 2) {
    const k = 0.82 + Math.random() * 0.3; // cada vuelta de hilo con su brillo
    ctx.fillStyle = `rgb(${(base.r * 255 * k) | 0},${(base.g * 255 * k) | 0},${(base.b * 255 * k) | 0})`;
    ctx.fillRect(0, y, 64, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 1);
  return t;
}

function texturaCinta() {
  const c = document.createElement("canvas");
  c.width = 4096;
  c.height = 200;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#f2c94c";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#1b1b1b";
  const cm = c.width / 150;
  for (let i = 0; i <= 150; i++) {
    const x = i * cm;
    const largo = i % 10 === 0 ? 70 : i % 5 === 0 ? 50 : 30;
    ctx.fillRect(x, 0, 3, largo);
    ctx.fillRect(x, c.height - largo, 3, largo);
    if (i % 10 === 0 && i > 0) {
      ctx.font = "bold 58px Inter Tight, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = i % 50 === 0 ? "#c0392b" : "#1b1b1b";
      ctx.fillText(String(i), x, 122);
      ctx.fillStyle = "#1b1b1b";
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function texturaDedal() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = "#202020";
  for (let y = 8; y < 256; y += 16) {
    for (let x = (y / 16) % 2 ? 8 : 16; x < 256; x += 16) {
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 1);
  return t;
}

// ---------- materiales ----------
const acero = () =>
  new THREE.MeshStandardMaterial({ color: 0xd5d9e0, metalness: 1, roughness: 0.2 });
const plastico = (color) =>
  new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.35,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
  });
let _vetas = null;
function texturaMadera() {
  if (_vetas) return _vetas;
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#d9b48a";
  ctx.fillRect(0, 0, 512, 512);
  for (let r = 4; r < 360; r += 3 + Math.random() * 5) {
    const rojo = 120 + Math.random() * 40;
    const verde = 80 + Math.random() * 30;
    ctx.strokeStyle = `rgba(${rojo},${verde},40,${0.12 + Math.random() * 0.18})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.ellipse(256 + Math.random() * 3, 256, r, r * 0.97, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  _vetas = new THREE.CanvasTexture(c);
  _vetas.colorSpace = THREE.SRGBColorSpace;
  return _vetas;
}
const madera = () =>
  new THREE.MeshStandardMaterial({ map: texturaMadera(), roughness: 0.5, metalness: 0 });

function sombras(obj) {
  obj.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  return obj;
}

// ---------- objetos ----------
function carrete(colorHilo, alto = 1.3) {
  const g = new THREE.Group();
  const r = alto * 0.42;
  const tapa = new THREE.CylinderGeometry(r, r, alto * 0.09, 48);
  const arriba = new THREE.Mesh(tapa, madera());
  arriba.position.y = alto / 2;
  const abajo = arriba.clone();
  abajo.position.y = -alto / 2;
  const hilo = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 0.86, r * 0.86, alto * 0.92, 96, 1),
    new THREE.MeshPhysicalMaterial({
      map: texturaHilo(colorHilo),
      bumpMap: texturaHilo(0xffffff),
      bumpScale: 1.5,
      roughness: 0.55,
      sheen: 1,
      sheenRoughness: 0.35,
      sheenColor: new THREE.Color(colorHilo).lerp(new THREE.Color(0xffffff), 0.5),
    }),
  );
  const hoyo = new THREE.Mesh(
    new THREE.CircleGeometry(r * 0.2, 24),
    new THREE.MeshBasicMaterial({ color: 0x3b2a1a }),
  );
  hoyo.rotation.x = -Math.PI / 2;
  hoyo.position.y = alto / 2 + alto * 0.046;
  g.add(arriba, abajo, hilo, hoyo);
  return sombras(g);
}

function boton(color, r = 0.42, hoyos = 4) {
  const forma = new THREE.Shape();
  forma.absarc(0, 0, r, 0, Math.PI * 2, false);
  const d = r * 0.26;
  const puntos =
    hoyos === 4
      ? [
          [-d, -d],
          [d, -d],
          [d, d],
          [-d, d],
        ]
      : [
          [-d * 1.1, 0],
          [d * 1.1, 0],
        ];
  for (const [x, y] of puntos) {
    const h = new THREE.Path();
    h.absarc(x, y, r * 0.11, 0, Math.PI * 2, true);
    forma.holes.push(h);
  }
  const geo = new THREE.ExtrudeGeometry(forma, {
    depth: r * 0.2,
    bevelEnabled: true,
    bevelThickness: r * 0.07,
    bevelSize: r * 0.07,
    bevelSegments: 4,
    curveSegments: 48,
  });
  geo.center();
  const mat = plastico(color);
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, mat));
  // orilla levantada
  const orilla = new THREE.Mesh(new THREE.TorusGeometry(r * 0.86, r * 0.09, 12, 48), mat);
  orilla.position.z = r * 0.14;
  g.add(orilla);
  return sombras(g);
}

function aguja(conHilo = true) {
  const g = new THREE.Group();
  const m = acero();
  const L = 1.5;
  const cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, L, 16), m);
  const punta = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.22, 16), m);
  punta.rotation.x = Math.PI;
  punta.position.y = -L / 2 - 0.11;
  const ojo = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.01, 8, 20), m);
  ojo.scale.set(0.7, 2.2, 1);
  ojo.position.y = L / 2 - 0.05;
  g.add(cuerpo, punta, ojo);
  if (conHilo) {
    const curva = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, L / 2 - 0.05, 0),
      new THREE.Vector3(0.15, L / 2 + 0.1, 0.05),
      new THREE.Vector3(0.35, L / 2 - 0.15, 0.1),
      new THREE.Vector3(0.3, 0, -0.1),
      new THREE.Vector3(0.55, -0.35, 0.05),
      new THREE.Vector3(0.45, -0.7, 0.15),
    ]);
    g.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(curva, 80, 0.016, 8),
        new THREE.MeshStandardMaterial({ color: VERDE, roughness: 0.6 }),
      ),
    );
  }
  return sombras(g);
}

function alfiler(colorCabeza) {
  const g = new THREE.Group();
  const m = acero();
  const L = 0.95;
  const cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, L, 12), m);
  const punta = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.1, 12), m);
  punta.rotation.x = Math.PI;
  punta.position.y = -L / 2 - 0.05;
  const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.085, 24, 16), plastico(colorCabeza));
  cabeza.position.y = L / 2 + 0.05;
  g.add(cuerpo, punta, cabeza);
  return sombras(g);
}

function tijeras() {
  const g = new THREE.Group();
  const m = acero();
  const hoja = new THREE.Shape();
  hoja.moveTo(0, -0.05);
  hoja.lineTo(1.15, -0.012);
  hoja.quadraticCurveTo(1.22, 0.01, 1.15, 0.03);
  hoja.lineTo(0, 0.08);
  hoja.closePath();
  const geoHoja = new THREE.ExtrudeGeometry(hoja, {
    depth: 0.025,
    bevelEnabled: true,
    bevelSize: 0.008,
    bevelThickness: 0.008,
    bevelSegments: 2,
  });
  const brazo = (color, lado) => {
    const b = new THREE.Group();
    const h = new THREE.Mesh(geoHoja, m);
    h.position.z = lado * 0.02;
    if (lado < 0) h.scale.y = -1;
    const mango = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.045, 14, 32), plastico(color));
    mango.scale.set(1.35, 1, 1);
    mango.position.set(-0.46, lado * 0.2, lado * 0.02);
    const union = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.04), plastico(color));
    union.position.set(-0.17, lado * 0.08, lado * 0.02);
    union.rotation.z = -lado * 0.5;
    b.add(h, mango, union);
    return b;
  };
  const a = brazo(VERDE, 1);
  const b = brazo(VERDE, -1);
  const tornillo = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 16), m);
  tornillo.rotation.x = Math.PI / 2;
  g.add(a, b, tornillo);
  g.userData.cortar = (t) => {
    const c = (t * 0.9) % 1; // un tijeretazo cada vuelta: abre despacio y cierra rápido
    const abre =
      0.05 +
      0.26 *
        (c < 0.7
          ? Math.sin(((c / 0.7) * Math.PI) / 2)
          : Math.cos((((c - 0.7) / 0.3) * Math.PI) / 2));
    a.rotation.z = abre;
    b.rotation.z = -abre;
  };
  return sombras(g);
}

function dedal() {
  const pts = [];
  for (let i = 0; i <= 20; i++) {
    const a = (i / 20) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.sin(a) * 0.3, 0.42 + Math.cos(a) * 0.16));
  }
  pts.push(
    new THREE.Vector2(0.33, 0),
    new THREE.Vector2(0.36, -0.02),
    new THREE.Vector2(0.36, -0.08),
    new THREE.Vector2(0.3, -0.08),
  );
  const geo = new THREE.LatheGeometry(pts, 48);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xe8c98a,
    metalness: 1,
    roughness: 0.3,
    bumpMap: texturaDedal(),
    bumpScale: 2,
  });
  const g = new THREE.Group();
  const d = new THREE.Mesh(geo, mat);
  d.position.y = -0.2;
  g.add(d);
  return sombras(g);
}

function cintaMetrica() {
  const geo = new THREE.PlaneGeometry(6, 0.2, 300, 1);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i);
    const s = (x + 3) / 6; // 0..1 a lo largo de la cinta
    const ang = s * Math.PI * 3.2;
    const r = 0.25 + s * 0.5; // espiral que se va abriendo
    p.setXYZ(i, Math.cos(ang) * r, y + (s - 0.5) * 0.5 + Math.sin(s * 9) * 0.04, Math.sin(ang) * r);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ map: texturaCinta(), roughness: 0.6, side: THREE.DoubleSide }),
  );
  const g = new THREE.Group();
  g.add(m);
  return sombras(g);
}

// ---------- escena ----------
export function iniciarCostura(contenedor, opciones = {}) {
  const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap; // sombras suaves
  contenedor.appendChild(renderer.domElement);

  const escena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  escena.environmentIntensity = 0.7;

  const camara = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  // Luz principal desde arriba (proyecta sombra al piso) y una de relleno
  const luz = new THREE.DirectionalLight(0xffffff, 2.4);
  luz.position.set(-2, 9, 4);
  luz.castShadow = true;
  luz.shadow.mapSize.set(2048, 2048);
  Object.assign(luz.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 24 });
  luz.shadow.radius = 14;
  luz.shadow.blurSamples = 24;
  const relleno = new THREE.DirectionalLight(0xdfe8ff, 0.8);
  relleno.position.set(5, 1, 3);
  escena.add(luz, relleno, new THREE.HemisphereLight(0xffffff, 0x9aa6c0, 0.55));

  // Piso invisible: solo se ve la sombra de los objetos
  const piso = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.ShadowMaterial({ opacity: 0.13 }),
  );
  piso.rotation.x = -Math.PI / 2;
  piso.position.y = -1.9;
  piso.receiveShadow = true;
  escena.add(piso);

  const todo = new THREE.Group();
  escena.add(todo);

  // Carrete grande al centro
  const centro = carrete(VERDE, 1.55);
  todo.add(centro);

  // Órbita con los demás objetos (cada uno a su radio y altura, para que no se vea en fila)
  const orbita = new THREE.Group();
  orbita.rotation.z = -0.08;
  todo.add(orbita);

  // giro: eje y velocidad de su vuelta propia; balanceo: cuánto se mece
  const piezas = [
    { o: boton(CREMA, 0.4), giro: [0, 0, 0.25], balanceo: 0.35 },
    { o: tijeras(), giro: [0, 0, 0.12], balanceo: 0.3 },
    { o: carrete(AZUL, 0.75), giro: [0, 0.6, 0], balanceo: 0.25, base: [0.25, 0, 0.35] },
    { o: boton(MOSTAZA, 0.3, 2), giro: [0, 0, -0.3], balanceo: 0.4 },
    { o: aguja(true), giro: [0, 0.35, 0], balanceo: 0.2, base: [0, 0, 0.5] },
    { o: dedal(), giro: [0, 0.5, 0], balanceo: 0.25, base: [0.35, 0, 0] },
    { o: boton(MARINO, 0.36), giro: [0, 0, 0.2], balanceo: 0.35 },
    { o: alfiler(ROJO), giro: [0, 0.4, 0], balanceo: 0.2, base: [0, 0, -0.6] },
    { o: cintaMetrica(), giro: [0, 0.3, 0], balanceo: 0.15, escala: 0.85 },
    { o: carrete(MOSTAZA, 0.6), giro: [0, 0.6, 0], balanceo: 0.25, base: [-0.3, 0, -0.25] },
    { o: boton(VERDE, 0.32), giro: [0, 0, -0.22], balanceo: 0.4 },
    { o: alfiler(AZUL), giro: [0, 0.4, 0], balanceo: 0.2, base: [0, 0, 0.7], escala: 0.9 },
  ];
  // Con la opción mini se usan menos objetos
  if (opciones.mini) piezas.splice(0, piezas.length, ...[0, 4, 3, 1, 6, 9].map((i) => piezas[i]));

  piezas.forEach((p, i) => {
    p.ang = (i / piezas.length) * Math.PI * 2;
    p.radio = 2.0 + (i % 3) * 0.18;
    p.alto = Math.sin(i * 2.4) * 0.45;
    p.fase = i * 1.7;
    p.salida = 0; // 0 = dentro del carrete, 1 = en su lugar
    p.hover = 0;
    p.soporte = new THREE.Group();
    p.soporte.add(p.o);
    p.soporte.scale.setScalar(0.001);
    p.giroAcum = new THREE.Euler(...(p.base || [0, 0, 0]));
    orbita.add(p.soporte);
  });

  // ---------- Entrada (GSAP): el carrete cae y los objetos salen en espiral ----------
  const entrada = gsap.timeline();
  entrada
    .from(centro.position, { y: 4, duration: 1.1, ease: "bounce.out" })
    .from(centro.rotation, { y: -Math.PI * 1.5, duration: 1.4, ease: "power3.out" }, 0)
    .from(centro.scale, { x: 0.6, y: 0.6, z: 0.6, duration: 0.9, ease: "back.out(2)" }, 0);
  piezas.forEach((p, i) => {
    entrada.to(p, { salida: 1, duration: 1.6, ease: "expo.out" }, 0.55 + i * 0.045);
    entrada.to(
      p.soporte.scale,
      {
        x: p.escala || 1,
        y: p.escala || 1,
        z: p.escala || 1,
        duration: 0.9,
        ease: "back.out(1.8)",
      },
      0.55 + i * 0.045,
    );
  });

  // ---------- Mouse: inclinar, arrastrar para girar, y objetos que reaccionan ----------
  const raton = { x: 0, y: 0, fx: 0, fy: 0 };
  const VEL_BASE = 0.14;
  let vel = VEL_BASE;
  let arrastre = null;
  const rayo = new THREE.Raycaster();
  const puntero = new THREE.Vector2(9, 9);
  const alMover = (e) => {
    raton.x = (e.clientX / window.innerWidth) * 2 - 1;
    raton.y = (e.clientY / window.innerHeight) * 2 - 1;
    const r = contenedor.getBoundingClientRect();
    puntero.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1,
    );
    if (arrastre !== null) {
      vel += (e.clientX - arrastre) * 0.003;
      arrastre = e.clientX;
    }
  };
  const alSoltar = () => {
    arrastre = null;
  };
  window.addEventListener("pointermove", alMover);
  contenedor.addEventListener("pointerdown", (e) => {
    arrastre = e.clientX;
  });
  window.addEventListener("pointerup", alSoltar);
  // Al picar un objeto da una vuelta completa
  contenedor.addEventListener("click", () => {
    const p = piezas.find((q) => q.hover > 0.5);
    if (p)
      gsap.to(p.o.rotation, { y: p.o.rotation.y + Math.PI * 2, duration: 1, ease: "power3.inOut" });
  });

  function medir() {
    const w = contenedor.clientWidth,
      h = contenedor.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camara.aspect = w / h;
    // que la órbita completa quepa, sea ancho o angosto el espacio
    const necesitaAlto = opciones.mini ? 4.3 : 5.6;
    const necesitaAncho = opciones.mini ? 5.6 : 6.2;
    const tan = Math.tan(THREE.MathUtils.degToRad(camara.fov / 2));
    const z = Math.max(necesitaAlto / 2 / tan, necesitaAncho / 2 / (tan * camara.aspect));
    camara.position.set(0, 0.35, z);
    escena.fog = new THREE.Fog(0xf0f0f0, z - 0.5, z + 6); // lo de atrás se ve más lejano
    camara.lookAt(0, 0, 0);
    camara.updateProjectionMatrix();
  }
  const vigia = new ResizeObserver(medir);
  vigia.observe(contenedor);
  medir();

  const reloj = new THREE.Timer();
  let t = 0;
  let vivo = true;
  function cuadro() {
    if (!vivo) return;
    reloj.update();
    const dt = quieto ? 0 : Math.min(reloj.getDelta(), 0.05);
    t += dt;
    vel += (VEL_BASE - vel) * (1 - Math.exp(-dt * 1.5)); // regresa suave a su velocidad
    orbita.rotation.y += vel * dt;
    centro.rotation.y += 0.25 * dt;

    // ¿sobre qué objeto está el mouse?
    rayo.setFromCamera(puntero, camara);
    const toco = rayo.intersectObjects(
      piezas.map((p) => p.o),
      true,
    )[0];
    let encima = null;
    if (toco)
      encima = piezas.find((p) => {
        let o = toco.object;
        while (o) {
          if (o === p.o) return true;
          o = o.parent;
        }
        return false;
      });
    contenedor.style.cursor = encima ? "pointer" : "";

    for (const p of piezas) {
      // posición: espiral desde el centro hasta su lugar en la órbita
      const ang = p.ang - (1 - p.salida) * Math.PI * 1.2;
      const rad = p.radio * p.salida;
      p.soporte.position.set(
        Math.cos(ang) * rad,
        p.alto * p.salida + Math.sin(t * 0.9 + p.fase) * 0.09,
        Math.sin(ang) * rad,
      );
      // vuelta propia + balanceo suave (de frente a la cámara la mayor parte del tiempo)
      p.giroAcum.x += p.giro[0] * dt;
      p.giroAcum.y += p.giro[1] * dt;
      p.giroAcum.z += p.giro[2] * dt;
      p.soporte.rotation.set(
        p.giroAcum.x + Math.sin(t * 0.7 + p.fase) * p.balanceo,
        p.giroAcum.y - orbita.rotation.y + Math.sin(t * 0.5 + p.fase) * p.balanceo,
        p.giroAcum.z,
      );
      // al pasar el mouse crece un poco
      p.hover += ((p === encima ? 1 : 0) - p.hover) * (1 - Math.exp(-dt * 10));
      p.o.scale.setScalar(1 + p.hover * 0.22);
      p.o.userData.cortar?.(t + p.fase);
    }
    const suave = 1 - Math.exp(-dt * 2.5);
    raton.fx += (raton.x - raton.fx) * suave;
    raton.fy += (raton.y - raton.fy) * suave;
    todo.rotation.y = raton.fx * 0.22;
    todo.rotation.x = 0.12 + raton.fy * 0.1;
    renderer.render(escena, camara);
    requestAnimationFrame(cuadro);
  }
  cuadro();
  // Limpieza: se llama cuando la entrada se cierra
  return () => {
    vivo = false;
    entrada.kill();
    vigia.disconnect();
    window.removeEventListener("pointermove", alMover);
    window.removeEventListener("pointerup", alSoltar);
    renderer.dispose();
    renderer.domElement.remove();
  };
}
