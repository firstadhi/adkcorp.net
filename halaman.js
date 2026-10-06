// Nomor WhatsApp ADK Corp (format internasional, tanpa +)
const NOMOR_WA = "628112637786";

// Konversi "Contact" di Google Ads. Label diisi dari event snippet Google Ads (bagian setelah garis miring
// pada send_to). Selama masih kosong, klik WhatsApp belum dikirim sebagai konversi.
const KONVERSI_KONTAK = "AW-18494142619/";

// Setiap tautan bertanda data-wa dibuka ke WhatsApp dengan pesan pembuka yang sudah terisi
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = `https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(a.dataset.wa)}`;
  a.target = "_blank";
  a.rel = "noopener";
  a.addEventListener("click", () => {
    if (typeof gtag === "function" && !KONVERSI_KONTAK.endsWith("/")) {
      gtag("event", "conversion", { send_to: KONVERSI_KONTAK });
    }
  });
});

// Tab harga: Media Sosial / Website & Aplikasi
const tab = [...document.querySelectorAll('[role="tab"]')];
function pilihTab(t) {
  tab.forEach((b) => {
    const aktif = b === t;
    b.setAttribute("aria-selected", aktif);
    b.tabIndex = aktif ? 0 : -1;
    document.getElementById(b.getAttribute("aria-controls")).hidden = !aktif;
  });
}
tab.forEach((b, i) => {
  b.addEventListener("click", () => pilihTab(b));
  b.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const lain = tab[(i + (e.key === "ArrowRight" ? 1 : tab.length - 1)) % tab.length];
    pilihTab(lain);
    lain.focus();
  });
});

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
