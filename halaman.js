// Nomor WhatsApp ADK Corp (format internasional, tanpa +)
const NOMOR_WA = "628112637786";

// Konversi "Contact" di Google Ads (send_to dari event snippet goal Contact). Setiap klik tombol WhatsApp
// dihitung satu konversi.
const KONVERSI_KONTAK = "AW-18494142619/TaSgCJmqpJMdEJvx2PJE";

// Setiap tautan bertanda data-wa dibuka ke WhatsApp dengan pesan pembuka yang sudah terisi
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = `https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(a.dataset.wa)}`;
  a.target = "_blank";
  a.rel = "noopener";
  a.addEventListener("click", () => {
    if (typeof gtag === "function") {
      gtag("event", "conversion", { send_to: KONVERSI_KONTAK, value: 1.0, currency: "IDR" });
    }
  });
});

// Tab: map layanan dan tab harga. Setiap [data-tab-grup] berdiri sendiri.
document.querySelectorAll("[data-tab-grup]").forEach((grup) => {
  const tab = [...grup.querySelector('[role="tablist"]').querySelectorAll('[role="tab"]')];
  function pilihTab(t) {
    tab.forEach((b) => {
      const aktif = b === t;
      b.setAttribute("aria-selected", aktif);
      b.tabIndex = aktif ? 0 : -1;
      document.getElementById(b.getAttribute("aria-controls")).hidden = !aktif;
    });
  }
  tab.forEach((b, i) => {
    b.tabIndex = b.getAttribute("aria-selected") === "true" ? 0 : -1;
    b.addEventListener("click", () => pilihTab(b));
    b.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const lain = tab[(i + (e.key === "ArrowRight" ? 1 : tab.length - 1)) % tab.length];
      pilihTab(lain);
      lain.focus();
    });
  });
});

// Hanya satu reel yang berbunyi pada satu waktu
const video = document.querySelectorAll(".reel video");
video.forEach((v) =>
  v.addEventListener("play", () => video.forEach((lain) => lain !== v && lain.pause()))
);

// Video bertanda data-putar-otomatis (tanpa suara) hanya diputar saat terlihat di layar, supaya hemat kuota
// data. Pengunjung yang memilih kurangi gerakan hanya melihat gambar sampulnya.
const putarOtomatis = document.querySelectorAll("video[data-putar-otomatis]");
if (putarOtomatis.length && "IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const pengamat = new IntersectionObserver((entri) => {
    entri.forEach((e) => {
      if (e.isIntersecting) e.target.play().catch(() => {});
      else e.target.pause();
    });
  }, { threshold: 0.35 });
  putarOtomatis.forEach((v) => pengamat.observe(v));
}

// Tombol kembali ke atas: tampil setelah pengunjung menggulir lebih dari satu setengah layar
const keAtas = document.querySelector(".ke-atas");
if (keAtas) {
  keAtas.hidden = false;
  const cek = () => keAtas.classList.toggle("tampil", window.scrollY > window.innerHeight * 1.5);
  window.addEventListener("scroll", cek, { passive: true });
  cek();
  keAtas.addEventListener("click", () => {
    const halus = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: halus ? "smooth" : "auto" });
  });
}

// Kartu: kilau mengikuti kursor dan miring 3D ke arah kursor. Tombol utama "tertarik" ke kursor.
// Hanya untuk mouse, dan tidak untuk pengunjung yang memilih kurangi gerakan.
if (window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll(".ubin, .layanan-kartu, .paket, .proyek, .langkah li, .janji li, .kartu-pasang").forEach((el) => {
    const miring = !el.matches(".proyek"); // kartu proyek bertumpuk, cukup kilau saja
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      if (miring) {
        const nx = x / r.width - 0.5, ny = y / r.height - 0.5;
        el.style.rotate = `${-ny} ${nx} 0 ${Math.hypot(nx, ny) * 14}deg`;
      }
    });
    el.addEventListener("pointerleave", () => { el.style.rotate = ""; });
  });
  const latar = document.querySelector(".latar-hidup");
  if (latar) window.addEventListener("pointermove", (e) => {
    latar.style.setProperty("--kx", `${e.clientX}px`);
    latar.style.setProperty("--ky", `${e.clientY}px`);
  }, { passive: true });
  document.querySelectorAll(".pembuka .tombol, .ajakan .tombol, .atas .tombol").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.25}px ${(e.clientY - r.top - r.height / 2) * 0.35}px`;
    });
    el.addEventListener("pointerleave", () => { el.style.translate = ""; });
  });
}
