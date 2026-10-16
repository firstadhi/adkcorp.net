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

// Stiker & polaroid di pembuka bisa digeser dengan mouse. Di layar sentuh tidak diaktifkan,
// supaya jari yang menggulir halaman tidak malah menyeret stiker.
if (window.matchMedia("(pointer: fine)").matches) {
  let z = 10;
  document.querySelectorAll(".stiker-geser").forEach((el) => {
    let awalX, awalY, dx = 0, dy = 0;
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      awalX = e.clientX - dx;
      awalY = e.clientY - dy;
      el.style.zIndex = ++z;
      el.classList.add("diseret");
    });
    el.addEventListener("pointermove", (e) => {
      if (!el.hasPointerCapture(e.pointerId)) return;
      dx = e.clientX - awalX;
      dy = e.clientY - awalY;
      el.style.translate = `${dx}px ${dy}px`;
    });
    const lepas = () => el.classList.remove("diseret");
    el.addEventListener("pointerup", lepas);
    el.addEventListener("pointercancel", lepas);
  });
}

// Hanya satu reel yang berbunyi pada satu waktu
const video = document.querySelectorAll(".reel video");
video.forEach((v) =>
  v.addEventListener("play", () => video.forEach((lain) => lain !== v && lain.pause()))
);

// Kuota promo 20 klien pertama — ubah angka TERPAKAI setiap ada klien baru yang memakai promo
const KUOTA_PROMO = 20;
const TERPAKAI = 0;
document.querySelectorAll("[data-kuota]").forEach((el) => {
  const sisa = Math.max(KUOTA_PROMO - TERPAKAI, 0);
  el.querySelector(".kuota-teks").textContent = `Sisa ${sisa} dari ${KUOTA_PROMO} klien`;
  el.querySelector(".kuota-isi").style.width = `${(sisa / KUOTA_PROMO) * 100}%`;
});
document.querySelectorAll("[data-kuota-sisa]").forEach((el) => {
  const sisa = Math.max(KUOTA_PROMO - TERPAKAI, 0);
  el.textContent = sisa > 0 ? `sisa ${sisa} dari ${KUOTA_PROMO} klien` : "kuota sudah habis";
});

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
