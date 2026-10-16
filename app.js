/**
 * Duotone Atelier — studio duotone local dans le navigateur
 * Aucune image n'est envoyée : tout tourne sur canvas.
 */
(function () {
  "use strict";

  /* —— i18n FR / EN / Taqbaylit (Latin) —— */
  const I18N = {
    fr: {
      title: "Duotone Atelier",
      langLabel: "Langue",
      sectionLoad: "Image",
      dropTitle: "Glisse une image ici",
      dropHint: "ou clique pour choisir un fichier",
      clear: "Effacer",
      sectionColors: "Couleurs",
      shadow: "Ombre",
      highlight: "Lumière",
      copyHex: "Copier HEX",
      swap: "Échanger",
      random: "Aléatoire",
      sectionPresets: "Préréglages",
      sectionAdjust: "Réglages",
      strength: "Force duotone",
      brightness: "Luminosité",
      contrast: "Contraste",
      export: "Exporter PNG",
      privacy: "Tout reste sur ton appareil. Aucun envoi.",
      emptyHint: "Charge une image pour commencer le duotone. Choisis ombre + lumière, ajuste, exporte.",
      footer: "Duotone Atelier · gratuit · MIT",
      toastCopied: "HEX copié",
      toastExported: "PNG exporté",
      toastCleared: "Image effacée",
      toastBadFile: "Fichier image non valide",
      toastLoaded: "Image chargée",
    },
    en: {
      title: "Duotone Atelier",
      langLabel: "Language",
      sectionLoad: "Image",
      dropTitle: "Drop an image here",
      dropHint: "or click to choose a file",
      clear: "Clear",
      sectionColors: "Colors",
      shadow: "Shadow",
      highlight: "Highlight",
      copyHex: "Copy HEX",
      swap: "Swap",
      random: "Random",
      sectionPresets: "Presets",
      sectionAdjust: "Adjust",
      strength: "Duotone strength",
      brightness: "Brightness",
      contrast: "Contrast",
      export: "Export PNG",
      privacy: "Everything stays on your device. No uploads.",
      emptyHint: "Load an image to start duotone. Pick shadow + highlight, tweak, export.",
      footer: "Duotone Atelier · free · MIT",
      toastCopied: "HEX copied",
      toastExported: "PNG exported",
      toastCleared: "Image cleared",
      toastBadFile: "Invalid image file",
      toastLoaded: "Image loaded",
    },
    kab: {
      title: "Duotone Atelier",
      langLabel: "Tutlayt",
      sectionLoad: "Tugna",
      dropTitle: "Sers tugna dagi",
      dropHint: "neɣ siti iwakken ad tferneḍ afaylu",
      clear: "Sfeḍ",
      sectionColors: "Initen",
      shadow: "Tili",
      highlight: "Tafat",
      copyHex: "Nɣel HEX",
      swap: "Beddel",
      random: "S wadda",
      sectionPresets: "Iɣewwaṛen",
      sectionAdjust: "Aseɣti",
      strength: "Tazmert n duotone",
      brightness: "Tafat",
      contrast: "Asemɣer",
      export: "Suffeɣ PNG",
      privacy: "Kra yellan yeqqim deg yibenk-ik. Ulac asuffeɣ.",
      emptyHint: "Sali tugna iwakken ad tebduḍ duotone. Fren tili + tafat, seɣti, suffeɣ.",
      footer: "Duotone Atelier · baṭel · MIT",
      toastCopied: "HEX yettwanɣel",
      toastExported: "PNG yettwasuffeɣ",
      toastCleared: "Tugna tettwasfeḍ",
      toastBadFile: "Afaylu n tugna mačči d ameɣtu",
      toastLoaded: "Tugna tettwali",
    },
  };

  /* Préréglages originaux — paires hex uniques */
  const PRESETS = [
    { id: "midnight", name: "Midnight Blue", shadow: "#0B1D36", highlight: "#7EB6D9" },
    { id: "sunset", name: "Sunset Print", shadow: "#2C1810", highlight: "#F4A261" },
    { id: "forest", name: "Forest Ink", shadow: "#0F2418", highlight: "#8FBF6A" },
    { id: "magenta", name: "Magenta Spotlight", shadow: "#1A0A1E", highlight: "#E85D9C" },
    { id: "sepia", name: "Sepia Press", shadow: "#2A1F14", highlight: "#D4B896" },
    { id: "arctic", name: "Arctic Neon", shadow: "#061820", highlight: "#5EEAD4" },
    { id: "ochre", name: "Ochre Poster", shadow: "#1C1408", highlight: "#E0A045" },
    { id: "mono", name: "Mono Soft", shadow: "#1E1E22", highlight: "#D0D0D6" },
  ];

  const MAX_DIM = 4096;

  /* —— DOM —— */
  const $ = (sel) => document.querySelector(sel);
  const canvas = $("#canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const emptyState = $("#emptyState");
  const dropzone = $("#dropzone");
  const fileInput = $("#fileInput");
  const btnClear = $("#btnClear");
  const btnExport = $("#btnExport");
  const shadowColor = $("#shadowColor");
  const highlightColor = $("#highlightColor");
  const shadowHex = $("#shadowHex");
  const highlightHex = $("#highlightHex");
  const strengthEl = $("#strength");
  const brightnessEl = $("#brightness");
  const contrastEl = $("#contrast");
  const strengthVal = $("#strengthVal");
  const brightnessVal = $("#brightnessVal");
  const contrastVal = $("#contrastVal");
  const presetsEl = $("#presets");
  const langEl = $("#lang");
  const toastEl = $("#toast");

  let sourceImg = null;
  let objectUrl = null;
  let sourceData = null; // ImageData source (après resize)
  let rafPending = false;
  let activePreset = null;
  let lang = "fr";

  /* —— Utilitaires —— */
  function t(key) {
    return (I18N[lang] && I18N[lang][key]) || I18N.fr[key] || key;
  }

  function applyI18n() {
    document.documentElement.lang = lang === "kab" ? "kab" : lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.title = t(el.getAttribute("data-i18n-title"));
    });
    dropzone.setAttribute("aria-label", t("dropTitle"));
    document.title = t("title");
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toast._tid);
    toast._tid = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  function normalizeHex(raw) {
    let s = String(raw || "").trim();
    if (!s.startsWith("#")) s = "#" + s;
    if (/^#[0-9a-fA-F]{3}$/.test(s)) {
      s = "#" + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(s)) return null;
    return s.toUpperCase();
  }

  function hexToRgb(hex) {
    const h = normalizeHex(hex);
    if (!h) return { r: 0, g: 0, b: 0 };
    return {
      r: parseInt(h.slice(1, 3), 16),
      g: parseInt(h.slice(3, 5), 16),
      b: parseInt(h.slice(5, 7), 16),
    };
  }

  function randomHex() {
    const n = Math.floor(Math.random() * 0xffffff);
    return "#" + n.toString(16).padStart(6, "0").toUpperCase();
  }

  function syncColorInputs(which, hex) {
    const h = normalizeHex(hex);
    if (!h) return;
    if (which === "shadow") {
      shadowColor.value = h.toLowerCase();
      shadowHex.value = h;
    } else {
      highlightColor.value = h.toLowerCase();
      highlightHex.value = h;
    }
    activePreset = null;
    markPresets();
  }

  /* —— Chargement image —— */
  function revokeUrl() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  }

  function loadFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      toast(t("toastBadFile"));
      return;
    }
    revokeUrl();
    objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      sourceImg = img;
      prepareSource();
      emptyState.hidden = true;
      canvas.hidden = false;
      btnClear.disabled = false;
      btnExport.disabled = false;
      scheduleRender();
      toast(t("toastLoaded"));
    };
    img.onerror = () => {
      revokeUrl();
      toast(t("toastBadFile"));
    };
    img.src = objectUrl;
  }

  function prepareSource() {
    if (!sourceImg) return;
    let w = sourceImg.naturalWidth || sourceImg.width;
    let h = sourceImg.naturalHeight || sourceImg.height;
    const maxSide = Math.max(w, h);
    if (maxSide > MAX_DIM) {
      const scale = MAX_DIM / maxSide;
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(sourceImg, 0, 0, w, h);
    sourceData = ctx.getImageData(0, 0, w, h);
  }

  function clearImage() {
    revokeUrl();
    sourceImg = null;
    sourceData = null;
    canvas.hidden = true;
    emptyState.hidden = false;
    btnClear.disabled = true;
    btnExport.disabled = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    toast(t("toastCleared"));
  }

  /* —— Rendu duotone —— */
  function scheduleRender() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      render();
    });
  }

  function render() {
    if (!sourceData) return;
    const w = sourceData.width;
    const h = sourceData.height;
    const src = sourceData.data;
    const out = ctx.createImageData(w, h);
    const dst = out.data;

    const sh = hexToRgb(shadowColor.value);
    const hi = hexToRgb(highlightColor.value);
    const strength = Number(strengthEl.value) / 100;
    const bright = Number(brightnessEl.value); // -100..100
    const contr = Number(contrastEl.value); // -100..100

    // Facteur contraste : 0 → 1, ±100 → ~0, +100 → ~2
    const cFactor = (259 * (contr + 255)) / (255 * (259 - contr));

    for (let i = 0; i < src.length; i += 4) {
      let r = src[i];
      let g = src[i + 1];
      let b = src[i + 2];
      const a = src[i + 3];

      // Luminosité / contraste avant mapping
      r = clamp(cFactor * (r - 128) + 128 + bright);
      g = clamp(cFactor * (g - 128) + 128 + bright);
      b = clamp(cFactor * (b - 128) + 128 + bright);

      // Luminance perceptuelle
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const dr = sh.r + (hi.r - sh.r) * lum;
      const dg = sh.g + (hi.g - sh.g) * lum;
      const db = sh.b + (hi.b - sh.b) * lum;

      // Mélange avec l'original selon la force
      dst[i] = clamp(r + (dr - r) * strength);
      dst[i + 1] = clamp(g + (dg - g) * strength);
      dst[i + 2] = clamp(b + (db - b) * strength);
      dst[i + 3] = a;
    }

    ctx.putImageData(out, 0, 0);
  }

  function clamp(v) {
    return v < 0 ? 0 : v > 255 ? 255 : v;
  }

  /* —— Export —— */
  function exportPng() {
    if (!sourceData) return;
    const link = document.createElement("a");
    link.download = "duotone-atelier.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast(t("toastExported"));
  }

  /* —— Presets UI —— */
  function buildPresets() {
    presetsEl.innerHTML = "";
    PRESETS.forEach((p) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "preset-btn";
      btn.setAttribute("role", "option");
      btn.dataset.id = p.id;
      const sw = document.createElement("span");
      sw.className = "preset-swatch";
      sw.style.background = `linear-gradient(135deg, ${p.shadow} 45%, ${p.highlight} 55%)`;
      const label = document.createElement("span");
      label.textContent = p.name;
      btn.appendChild(sw);
      btn.appendChild(label);
      btn.addEventListener("click", () => applyPreset(p));
      presetsEl.appendChild(btn);
    });
  }

  function applyPreset(p) {
    syncColorInputs("shadow", p.shadow);
    syncColorInputs("highlight", p.highlight);
    activePreset = p.id;
    markPresets();
    scheduleRender();
  }

  function markPresets() {
    presetsEl.querySelectorAll(".preset-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.id === activePreset);
    });
  }

  function updateSliderLabels() {
    strengthVal.textContent = strengthEl.value + "%";
    brightnessVal.textContent = String(Number(brightnessEl.value));
    contrastVal.textContent = String(Number(contrastEl.value));
  }

  /* —— Événements —— */
  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener("change", () => {
    const f = fileInput.files && fileInput.files[0];
    if (f) loadFile(f);
    fileInput.value = "";
  });

  ["dragenter", "dragover"].forEach((ev) => {
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("dragover");
    });
  });
  ["dragleave", "drop"].forEach((ev) => {
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("dragover");
    });
  });
  dropzone.addEventListener("drop", (e) => {
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) loadFile(f);
  });

  // Empêcher le drop global de naviguer ailleurs
  ["dragover", "drop"].forEach((ev) => {
    document.addEventListener(ev, (e) => {
      if (e.target === dropzone || dropzone.contains(e.target)) return;
      e.preventDefault();
    });
  });

  btnClear.addEventListener("click", clearImage);
  btnExport.addEventListener("click", exportPng);

  shadowColor.addEventListener("input", () => {
    shadowHex.value = shadowColor.value.toUpperCase();
    activePreset = null;
    markPresets();
    scheduleRender();
  });
  highlightColor.addEventListener("input", () => {
    highlightHex.value = highlightColor.value.toUpperCase();
    activePreset = null;
    markPresets();
    scheduleRender();
  });

  shadowHex.addEventListener("change", () => {
    const h = normalizeHex(shadowHex.value);
    if (h) {
      syncColorInputs("shadow", h);
      scheduleRender();
    } else {
      shadowHex.value = shadowColor.value.toUpperCase();
    }
  });
  highlightHex.addEventListener("change", () => {
    const h = normalizeHex(highlightHex.value);
    if (h) {
      syncColorInputs("highlight", h);
      scheduleRender();
    } else {
      highlightHex.value = highlightColor.value.toUpperCase();
    }
  });

  $("#btnSwap").addEventListener("click", () => {
    const a = shadowColor.value;
    const b = highlightColor.value;
    syncColorInputs("shadow", b);
    syncColorInputs("highlight", a);
    scheduleRender();
  });

  $("#btnRandom").addEventListener("click", () => {
    syncColorInputs("shadow", randomHex());
    syncColorInputs("highlight", randomHex());
    scheduleRender();
  });

  async function copyHex(hex) {
    try {
      await navigator.clipboard.writeText(normalizeHex(hex) || hex);
      toast(t("toastCopied"));
    } catch (_) {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = normalizeHex(hex) || hex;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast(t("toastCopied"));
    }
  }

  $("#copyShadow").addEventListener("click", () => copyHex(shadowColor.value));
  $("#copyHighlight").addEventListener("click", () => copyHex(highlightColor.value));

  [strengthEl, brightnessEl, contrastEl].forEach((el) => {
    el.addEventListener("input", () => {
      updateSliderLabels();
      scheduleRender();
    });
  });

  langEl.addEventListener("change", () => {
    lang = langEl.value;
    try {
      localStorage.setItem("duotone-atelier-lang", lang);
    } catch (_) {}
    applyI18n();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sourceImg) {
      clearImage();
    }
  });

  /* —— Init —— */
  buildPresets();
  updateSliderLabels();
  try {
    const saved = localStorage.getItem("duotone-atelier-lang");
    if (saved && I18N[saved]) {
      lang = saved;
      langEl.value = saved;
    }
  } catch (_) {}
  applyI18n();
  // Appliquer le premier preset par défaut (couleurs déjà dans le HTML)
  activePreset = "sunset";
  applyPreset(PRESETS[1]);
})();
