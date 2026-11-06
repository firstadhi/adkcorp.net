// Panggung 3D di pembuka: ponsel 3D yang memutar reel, kartu feed melayang, dan partikel cahaya.
// Berputar mengikuti mouse dan guliran. Kalau WebGL/CDN gagal atau pengunjung memilih kurangi gerakan,
// halaman tetap memakai tampilan biasa (ponsel & feed versi CSS di .papan).
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js";

const kanvas = document.querySelector(".papan-3d");
const kurangiGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (kanvas && !kurangiGerak) {
  try { mulai(); } catch (e) { /* tetap tampilan biasa */ }
}

function kotak(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

// Bidang bersudut bulat dengan UV 0..1 supaya gambar menempel penuh
function bidang(w, h, r) {
  const g = new THREE.ShapeGeometry(kotak(w, h, r), 16);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5);
  return g;
}

function cahayaBulat() {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const k = c.getContext("2d"), g = k.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,120,80,.9)"); g.addColorStop(.45, "rgba(139,108,255,.35)"); g.addColorStop(1, "rgba(0,0,0,0)");
  k.fillStyle = g; k.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function mulai() {
  const renderer = new THREE.WebGLRenderer({ canvas: kanvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const kamera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  const muat = new THREE.TextureLoader();
  const gambar = (src) => { const t = muat.load(src); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };

  // cahaya
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const utama = new THREE.DirectionalLight(0xffffff, 2.2); utama.position.set(3, 4, 6); scene.add(utama);
  const oranye = new THREE.PointLight(0xff6a3d, 40); oranye.position.set(-4, -2, 3); scene.add(oranye);
  const ungu = new THREE.PointLight(0x8b6cff, 45); ungu.position.set(4, 3, 2); scene.add(ungu);

  const grup = new THREE.Group(); scene.add(grup);

  // cahaya bulat di belakang ponsel
  const pendar = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: cahayaBulat(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  pendar.position.z = -2.5; scene.add(pendar);

  // ponsel
  const ponsel = new THREE.Group(); grup.add(ponsel);
  const badan = new THREE.ExtrudeGeometry(kotak(2.1, 4.4, 0.34), { depth: 0.16, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 5, curveSegments: 24 });
  badan.center(); badan.computeBoundingBox();
  const depan = badan.boundingBox.max.z;
  ponsel.add(new THREE.Mesh(badan, new THREE.MeshPhysicalMaterial({ color: 0x1b1d26, metalness: 0.75, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15 })));

  const layarW = 1.94, layarH = 4.22;
  const sampul = gambar("aset/karya/reel-om-budi.jpg");
  const bahanLayar = new THREE.MeshBasicMaterial({ map: sampul, toneMapped: false });
  const potong = (t) => { // isi layar tanpa gepeng: video 9:16 dipotong kiri-kanan
    const r = (layarW / layarH) / (9 / 16); t.repeat.set(r, 1); t.offset.set((1 - r) / 2, 0);
  };
  potong(sampul);
  const layar = new THREE.Mesh(bidang(layarW, layarH, 0.26), bahanLayar);
  layar.position.z = depan + 0.002; ponsel.add(layar);
  const poni = new THREE.Mesh(bidang(0.62, 0.17, 0.085), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  poni.position.set(0, layarH / 2 - 0.2, depan + 0.004); ponsel.add(poni);
  // sisi belakang: kaca dengan logo gradasi samar
  const belakang = new THREE.Mesh(bidang(1.94, 4.22, 0.26), new THREE.MeshPhysicalMaterial({ color: 0x2a2440, metalness: 0.3, roughness: 0.2, clearcoat: 1 }));
  belakang.rotation.y = Math.PI; belakang.position.z = -depan - 0.002; ponsel.add(belakang);

  const video = document.createElement("video");
  Object.assign(video, { src: "aset/karya/reel-om-budi.mp4", muted: true, loop: true, playsInline: true, preload: "auto" });
  video.setAttribute("muted", ""); video.setAttribute("playsinline", "");
  video.addEventListener("playing", () => {
    const vt = new THREE.VideoTexture(video); vt.colorSpace = THREE.SRGBColorSpace; potong(vt);
    bahanLayar.map = vt; bahanLayar.needsUpdate = true;
  }, { once: true });

  // kartu feed & sampul yang melayang
  const kartu = [
    { src: "aset/karya/feed-es-campur.webp", w: 1.7, h: 2.125, pos: [-2.9, 0.7, -0.4], rot: [0.05, 0.42, -0.08] },
    { src: "aset/karya/feed-kucing.webp", w: 1.7, h: 2.125, pos: [2.95, -0.5, -0.3], rot: [-0.04, -0.42, 0.07] },
    { src: "aset/karya/f2-sampul-arsip.webp", w: 1.15, h: 2.04, pos: [-2.2, -1.9, -1.9], rot: [0.1, 0.3, 0.05] },
    { src: "aset/karya/feed-tipe-orang.webp", w: 1.4, h: 1.75, pos: [2.3, 1.95, -2.1], rot: [0.12, -0.3, -0.06] },
  ].map((k, i) => {
    const m = new THREE.Mesh(bidang(k.w, k.h, 0.12), new THREE.MeshBasicMaterial({ map: gambar(k.src), side: THREE.DoubleSide, toneMapped: false }));
    m.position.set(...k.pos); m.rotation.set(...k.rot);
    m.userData = { asal: new THREE.Vector3(...k.pos), fase: i * 1.7, ry: k.rot[1], rz: k.rot[2] };
    grup.add(m); return m;
  });

  // partikel cahaya
  const N = window.innerWidth < 700 ? 350 : 800;
  const posisi = new Float32Array(N * 3), warna = new Float32Array(N * 3);
  const palet = [new THREE.Color(0xff9a3d), new THREE.Color(0xff4d6d), new THREE.Color(0x8b6cff), new THREE.Color(0xffffff)];
  for (let i = 0; i < N; i++) {
    const r = 3 + Math.random() * 6, a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
    posisi.set([r * Math.sin(b) * Math.cos(a), r * Math.cos(b) * 0.7, r * Math.sin(b) * Math.sin(a) - 2], i * 3);
    const c = palet[i % palet.length]; warna.set([c.r, c.g, c.b], i * 3);
  }
  const geoTitik = new THREE.BufferGeometry();
  geoTitik.setAttribute("position", new THREE.BufferAttribute(posisi, 3));
  geoTitik.setAttribute("color", new THREE.BufferAttribute(warna, 3));
  const titik = new THREE.Points(geoTitik, new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  scene.add(titik);

  // ukuran
  let sempit = false;
  function ukur() {
    const w = kanvas.clientWidth, h = kanvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    kamera.aspect = w / h;
    sempit = w < 700;
    kamera.position.set(0, 0, sempit ? 11 : 10);
    kamera.updateProjectionMatrix();
  }
  ukur();
  window.addEventListener("resize", ukur);

  // masukan mouse
  let mx = 0, my = 0, adaMouse = false;
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    adaMouse = true; mx = (e.clientX / window.innerWidth) * 2 - 1; my = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  // hanya digambar saat terlihat, supaya hemat baterai
  let terlihat = true, jalan = false;
  new IntersectionObserver(([e]) => {
    terlihat = e.isIntersecting;
    if (terlihat) { video.play().catch(() => {}); if (!jalan) { jalan = true; putar(); } }
    else video.pause();
  }).observe(kanvas);

  const jam = new THREE.Clock();
  let rx = 0, ry = 0, pertama = true;
  function putar() {
    if (!terlihat) { jalan = false; return; }
    requestAnimationFrame(putar);
    const t = jam.getElapsedTime();
    const gulir = Math.min(window.scrollY / 700, 1);
    // gerak otomatis terus-menerus (ayunan kiri-kanan); mouse hanya menambah sedikit
    const auto = Math.sin(t * 0.5) * 0.32 + Math.sin(t * 0.23) * 0.1;
    const tx = auto + (adaMouse ? mx * 0.25 : 0);
    const ty = Math.cos(t * 0.4) * 0.22 + (adaMouse ? my * 0.2 : 0);
    ry += ((tx + gulir * 0.6) - ry) * 0.05;
    rx += ((ty + gulir * 0.25) - rx) * 0.05;
    grup.rotation.set(rx, ry, 0);
    grup.position.y = Math.sin(t * 0.8) * 0.12 + gulir * 1.2;
    ponsel.rotation.y = Math.sin(t * 0.35) * 0.12;
    ponsel.rotation.z = Math.sin(t * 0.6) * 0.04;

    // kartu melayang mengelilingi ponsel: naik-turun, maju-mundur, dan berputar pelan sendiri
    const lebar = sempit ? 0.52 : 1;
    kartu.forEach((k) => {
      const a = k.userData.asal, f = k.userData.fase;
      k.position.set(
        a.x * lebar * (1 + gulir * 0.35) + Math.sin(t * 0.4 + f) * 0.18,
        a.y + Math.sin(t * 0.9 + f) * 0.22,
        a.z + Math.cos(t * 0.6 + f) * 0.35
      );
      k.rotation.y = k.userData.ry * 0.7 + Math.sin(t * 0.5 + f) * 0.15;
      k.rotation.z = k.userData.rz + Math.sin(t * 0.7 + f) * 0.05;
    });
    titik.rotation.y = t * 0.03 + ry * 0.4;
    titik.rotation.x = rx * 0.4;
    pendar.material.opacity = 0.75 + Math.sin(t * 1.2) * 0.15;

    renderer.render(scene, kamera);
    if (pertama) { pertama = false; document.documentElement.classList.add("tiga-aktif"); }
  }
}
