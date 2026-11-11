const menuButton = document.querySelector("[data-menu-button]");
const mobilePanel = document.querySelector("[data-mobile-panel]");
const POSTHOG_TOKEN = "phc_D7ebWUB7xYoD5fHPcWPg5gDWxja8mpY6Aygc6hKhV2f9";
const POSTHOG_HOST = "https://us.i.posthog.com";
const CONSENT_KEY = "lumistore-analytics-consent";
let cookieBanner = document.querySelector("[data-cookie-banner]");
let analyticsStarted = false;

const getConsent = () => {
  try { return window.localStorage.getItem(CONSENT_KEY); } catch { return null; }
};

const setConsent = (value) => {
  try { window.localStorage.setItem(CONSENT_KEY, value); } catch { /* localStorage pode estar bloqueado */ }
};

const ensureConsentBanner = () => {
  if (!cookieBanner) {
    cookieBanner = document.createElement("div");
    cookieBanner.className = "cookie-banner";
    cookieBanner.dataset.cookieBanner = "";
    document.body.appendChild(cookieBanner);
  }
  cookieBanner.innerHTML = '<h2>Privacidade e cookies</h2><p>Usamos dados anônimos para entender os acessos e melhorar a experiência na LumiStore. Você escolhe se quer permitir essa medição.</p><div class="cookie-actions"><button type="button" data-cookie-close>Aceitar cookies</button><button class="cookie-reject" type="button" data-cookie-reject>Continuar sem cookies</button></div>';
  return cookieBanner;
};

const hideConsentBanner = () => cookieBanner?.classList.add("is-hidden");

const track = (eventName, properties = {}) => {
  if (analyticsStarted && window.posthog?.capture) window.posthog.capture(eventName, properties);
};

const startAnalytics = () => {
  if (analyticsStarted || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") return;
  analyticsStarted = true;

  // Snippet oficial do PostHog, carregado somente depois do consentimento.
  !function (t, e) { var o, n, p, r; e.__SV || (window.posthog = e, e._i = [], e.init = function (i, s, a) { function g(t, e) { var o = e.split("."); 2 == o.length && (t = t[o[0]], e = o[1]), t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) }; } (p = t.createElement("script")).type = "text/javascript", p.crossOrigin = "anonymous", p.async = !0, p.src = s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js", (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r); var u = e; for (void 0 !== a ? u = e[a] = [] : a = "posthog", u.people = u.people || [], Object.defineProperty(u, "toString", { configurable: !0, enumerable: !1, writable: !0, value: function (t) { var e = "posthog"; return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e } }), Object.defineProperty(u.people, "toString", { configurable: !0, enumerable: !1, writable: !0, value: function () { return u.toString(1) + ".people (stub)" } }), o = "capture register register_once unregister unregister_for_session identify setPersonProperties group resetGroups reset opt_out_capturing opt_in_capturing has_opted_out_capturing get_explicit_consent_status".split(" "), n = 0; n < o.length; n++) g(u, o[n]); e._i.push([i, s, a]); }, e.__SV = 1); }(document, window.posthog || []);
  window.posthog.init(POSTHOG_TOKEN, {
    api_host: POSTHOG_HOST,
    defaults: "2026-08-30",
    capture_pageview: "history_change",
    capture_pageleave: "if_capture_pageview",
    autocapture: true,
    disable_session_recording: true,
    person_profiles: "identified_only"
  });
  track("page_viewed", { page_path: window.location.pathname, page_title: document.title });
  if (document.querySelector(".catalog-page")) track("catalog_viewed", { category: document.title.split("|")[0].trim(), page_path: window.location.pathname });
  if (document.querySelector(".compare-page")) track("compare_viewed", { page_path: window.location.pathname });
};

const consentBanner = ensureConsentBanner();
const cookieButton = consentBanner.querySelector("[data-cookie-close]");
const cookieRejectButton = consentBanner.querySelector("[data-cookie-reject]");

if (getConsent() === "granted") {
  hideConsentBanner();
  startAnalytics();
} else if (getConsent() === "denied") {
  hideConsentBanner();
}

if (!document.querySelector('link[rel="icon"]')) {
  const favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.type = "image/png";
  favicon.href = "assets/lumistore-app-icon-transparent.png";
  document.head.appendChild(favicon);
}

const reserveProductImage = document.querySelector(".reserve-product-image");
const revealReserveProduct = () => requestAnimationFrame(() => reserveProductImage?.classList.add("is-loaded"));
if (reserveProductImage) {
  if (reserveProductImage.complete && reserveProductImage.naturalWidth > 0) revealReserveProduct();
  else reserveProductImage.addEventListener("load", revealReserveProduct, { once: true });
}

menuButton?.addEventListener("click", () => {
  const open = mobilePanel.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(open));
});

mobilePanel?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  mobilePanel.classList.remove("is-open");
  menuButton?.setAttribute("aria-expanded", "false");
}));

cookieButton?.addEventListener("click", () => {
  setConsent("granted");
  hideConsentBanner();
  startAnalytics();
});

cookieRejectButton?.addEventListener("click", () => {
  setConsent("denied");
  hideConsentBanner();
  window.posthog?.opt_out_capturing?.();
});

document.querySelectorAll('a[href*="wa.me"]').forEach((link) => link.addEventListener("click", () => {
  const product = link.closest(".product-card, .compare-product")?.querySelector("h2, h3")?.textContent?.trim();
  track("whatsapp_click", {
    page_path: window.location.pathname,
    placement: link.className || "link",
    product: product || undefined
  });
}));

document.querySelectorAll(".main-nav a, .mobile-panel a").forEach((link) => link.addEventListener("click", () => {
  track("navigation_click", { label: link.textContent.trim(), destination: link.getAttribute("href") });
}));

document.querySelectorAll(".reserve-button, .hero-link, .contact-button, .compare-product-link").forEach((link) => link.addEventListener("click", () => {
  track("cta_click", { label: link.textContent.trim(), destination: link.getAttribute("href"), page_path: window.location.pathname });
}));

// Usa as mesmas fotos transparentes do catálogo original, sem depender dos URLs antigos.
const originalProductImages = {
  "iPhone Duo": "https://img1.wsimg.com/isteam/ip/11ec92be-7c40-48ce-94ae-4c496857b9e8/blob-8f771e2.png",
  "iPhone 18 Pro Max": "https://img1.wsimg.com/isteam/ip/11ec92be-7c40-48ce-94ae-4c496857b9e8/blob-73d6254.png",
  "iPhone 18 Pro": "https://img1.wsimg.com/isteam/ip/11ec92be-7c40-48ce-94ae-4c496857b9e8/blob-73d6254.png",
  "iPhone 17 Pro Max": "https://img1.wsimg.com/isteam/ip/7205eab8-9082-44bc-be08-564bd7b12763/blob-3d0309b.png/:/cr=t:0%25,l:12.59%25,w:74.81%25,h:100%25/rs=w:1164,h:875,cg:true",
  "iPhone 17 Pro": "https://img1.wsimg.com/isteam/ip/7205eab8-9082-44bc-be08-564bd7b12763/blob-3d0309b.png/:/cr=t:0%25,l:12.59%25,w:74.81%25,h:100%25/rs=w:1164,h:875,cg:true",
  "iPhone 17": "assets/iphone-17.png",
  "iPhone 17e": "assets/iphone-17e.png",
  "iPhone 16": "assets/iphone-16.png",
  "Apple Watch SE 3": "https://img1.wsimg.com/isteam/ip/11ec92be-7c40-48ce-94ae-4c496857b9e8/blob-bf43837.png",
  "Apple Watch S12": "https://img1.wsimg.com/isteam/ip/11ec92be-7c40-48ce-94ae-4c496857b9e8/blob-bf43837.png",
  "Apple Watch Ultra 3": "https://img1.wsimg.com/isteam/ip/7205eab8-9082-44bc-be08-564bd7b12763/blob-76bd64d.png/:/cr=t:0%25,l:7.4%25,w:85.2%25,h:100%25/rs=w:360,h:270.6766917293233,cg:true",
  "Apple Watch Ultra 4": "https://img1.wsimg.com/isteam/ip/7205eab8-9082-44bc-be08-564bd7b12763/blob-ff5ee7c.png/:/rs=w:360,h:270.6766917293233,cg:true,m/cr=w:360,h:270.6766917293233",
  "iPad 11": "https://img1.wsimg.com/isteam/ip/7205eab8-9082-44bc-be08-564bd7b12763/blob-7a52e6b.png/:/cr=t:12.41%25,l:0%25,w:100%25,h:75.19%25/rs=w:360,h:270.6766917293233,cg:true",
  "iPad Air M4": "https://img1.wsimg.com/isteam/ip/7205eab8-9082-44bc-be08-564bd7b12763/blob-7a52e6b.png/:/cr=t:12.41%25,l:0%25,w:100%25,h:75.19%25/rs=w:360,h:270.6766917293233,cg:true",
  "iPad Pro M5": "https://img1.wsimg.com/isteam/ip/7205eab8-9082-44bc-be08-564bd7b12763/blob-7a52e6b.png/:/cr=t:12.41%25,l:0%25,w:100%25,h:75.19%25/rs=w:360,h:270.6766917293233,cg:true",
  "MacBook Air Neo": "https://img1.wsimg.com/isteam/ip/11ec92be-7c40-48ce-94ae-4c496857b9e8/blob-30034fb.png",
  "MacBook Air M5": "https://img1.wsimg.com/isteam/ip/11ec92be-7c40-48ce-94ae-4c496857b9e8/blob-39bbe58.png",
  "MacBook Pro M5": "https://img1.wsimg.com/isteam/ip/11ec92be-7c40-48ce-94ae-4c496857b9e8/blob-b316adc.png",
  "AirPods 4": "https://img1.wsimg.com/isteam/ip/11ec92be-7c40-48ce-94ae-4c496857b9e8/blob-b6b8014.png",
  "AirPods 5": "https://img1.wsimg.com/isteam/ip/7205eab8-9082-44bc-be08-564bd7b12763/blob-0e724a2.png/:/rs=w:360,h:270.6766917293233,cg:true,m/cr=w:360,h:270.6766917293233",
  "AirPods Pro 3": "https://img1.wsimg.com/isteam/ip/11ec92be-7c40-48ce-94ae-4c496857b9e8/blob-b6b8014.png",
  "AirPods Max 2": "https://img1.wsimg.com/isteam/ip/7205eab8-9082-44bc-be08-564bd7b12763/blob-0e724a2.png/:/rs=w:360,h:270.6766917293233,cg:true,m/cr=w:360,h:270.6766917293233",
};

document.querySelectorAll(".product-media img[alt]").forEach((image) => {
  const originalImage = originalProductImages[image.alt];
  if (originalImage) image.src = originalImage;
});

document.querySelectorAll(".brand > span:last-child:not(.brand-wordmark)").forEach((wordmark) => {
  if (wordmark.textContent.trim() === "LumiStore") {
    wordmark.className = "brand-wordmark";
    wordmark.innerHTML = "<strong>Lumi</strong><span>Store</span>";
  }
});

const compareProducts = {
  "duo": {
    name: "iPhone Duo",
    eyebrow: "Dobrável · novo",
    image: "https://img1.wsimg.com/isteam/ip/11ec92be-7c40-48ce-94ae-4c496857b9e8/blob-8f771e2.png",
    description: "Duas telas, novas possibilidades e uma experiência dobrável.",
    price: "Em breve",
    specs: { tela: "7,6\" interna · 5,4\" externa", chip: "A20 Pro", camera: "Dupla Fusion · 48 MP", bateria: "Até 31h interna · 44h externa", armazenamento: "256 GB · 512 GB · 1 TB" }
  },
  "18-pro-max": {
    name: "iPhone 18 Pro Max",
    eyebrow: "Pro · máximo",
    image: "https://img1.wsimg.com/isteam/ip/11ec92be-7c40-48ce-94ae-4c496857b9e8/blob-73d6254.png",
    description: "A experiência Pro em sua versão mais completa.",
    price: "A partir de R$ 9.399",
    specs: { tela: "6,9\" Super Retina XDR", chip: "A20 Pro", camera: "Fusion Pro · 48 MP", bateria: "Até 43 horas de vídeo", armazenamento: "256 GB · 512 GB · 1 TB" }
  },
  "18-pro": {
    name: "iPhone 18 Pro",
    eyebrow: "Pro · preciso",
    image: "https://img1.wsimg.com/isteam/ip/11ec92be-7c40-48ce-94ae-4c496857b9e8/blob-73d6254.png",
    description: "Potência Pro em um formato mais equilibrado.",
    price: "A partir de R$ 8.299",
    specs: { tela: "6,3\" Super Retina XDR", chip: "A20 Pro", camera: "Fusion Pro · 48 MP", bateria: "Até 34 horas de vídeo", armazenamento: "256 GB · 512 GB" }
  },
  "17-pro-max": {
    name: "iPhone 17 Pro Max",
    eyebrow: "Pro · autonomia",
    image: "https://img1.wsimg.com/isteam/ip/7205eab8-9082-44bc-be08-564bd7b12763/blob-3d0309b.png/:/cr=t:0%25,l:12.59%25,w:74.81%25,h:100%25/rs=w:1164,h:875,cg:true",
    description: "Tela grande, câmeras Pro e a maior autonomia da geração.",
    price: "A partir de R$ 7.699",
    specs: { tela: "6,9\" Super Retina XDR", chip: "A19 Pro", camera: "Fusion Pro · 48 MP", bateria: "Até 37 horas de vídeo", armazenamento: "256 GB" }
  },
  "17-pro": {
    name: "iPhone 17 Pro",
    eyebrow: "Pro · compacto",
    image: "https://img1.wsimg.com/isteam/ip/7205eab8-9082-44bc-be08-564bd7b12763/blob-3d0309b.png/:/cr=t:0%25,l:12.59%25,w:74.81%25,h:100%25/rs=w:1164,h:875,cg:true",
    description: "Recursos Pro em um tamanho confortável para o dia a dia.",
    price: "A partir de R$ 7.299",
    specs: { tela: "6,3\" Super Retina XDR", chip: "A19 Pro", camera: "Fusion Pro · 48 MP", bateria: "Até 31 horas de vídeo", armazenamento: "256 GB" }
  },
  "17": {
    name: "iPhone 17",
    eyebrow: "Essencial · atual",
    image: "assets/iphone-17.png",
    description: "Desempenho, câmera e cores para todos os dias.",
    price: "Consulte a LumiStore",
    specs: { tela: "6,3\" Super Retina XDR", chip: "A19", camera: "Fusion · 48 MP", bateria: "Até 30 horas de vídeo", armazenamento: "256 GB" }
  },
  "17e": {
    name: "iPhone 17e",
    eyebrow: "Leve · direto",
    image: "assets/iphone-17e.png",
    description: "A forma mais simples de entrar na nova geração.",
    price: "Consulte a LumiStore",
    specs: { tela: "6,1\" Super Retina XDR", chip: "A19", camera: "Dupla Fusion · 48 MP", bateria: "Até 26 horas de vídeo", armazenamento: "256 GB" }
  },
  "16": {
    name: "iPhone 16",
    eyebrow: "Clássico · completo",
    image: "assets/iphone-16.png",
    description: "Um iPhone equilibrado, colorido e pronto para durar.",
    price: "Consulte a LumiStore",
    specs: { tela: "6,1\" Super Retina XDR", chip: "A18", camera: "Dupla · 48 MP + 12 MP", bateria: "Até 22 horas de vídeo", armazenamento: "128 GB" }
  }
};

const detailedCompareSpecs = {
  "duo": {
    tela: "7,6\" interna · 5,4\" externa", resolucao: "Super Retina XDR dobrável", promocao: "ProMotion", sempreAtiva: "Sim", ilha: "Dynamic Island",
    material: "Estrutura e dobradiça em titânio", resistencia: "IP68 · até 6 m por 30 min", dimensoes: "117,8 mm fechado · 164,6 mm aberto", peso: "254 g", cores: "Branco-estrela · Céu noturno",
    camera: "Dupla Fusion · principal e ultra-angular de 48 MP", frontal: "Center Stage de 12 MP", video: "4K Dolby Vision · até 120 qps", recursosCamera: "Captura Dupla · Palco Central",
    chip: "A20 Pro", cpu: "CPU de 6 núcleos", gpu: "GPU de 7 núcleos", inteligencia: "Apple Intelligence",
    bateria: "Até 31h na tela interna · 44h na externa", porta: "USB-C", conectividade: "5G · Wi-Fi 7 · Bluetooth 6", seguranca: "Face ID", carregamento: "MagSafe · Qi2",
    armazenamento: "256 GB · 512 GB · 1 TB", caixa: "iPhone · cabo USB-C · documentação"
  },
  "18-pro-max": {
    tela: "6,9\" Super Retina XDR", resolucao: "OLED · 120 Hz ProMotion", promocao: "Até 120 Hz", sempreAtiva: "Sim", ilha: "Dynamic Island",
    material: "Estrutura unibody de alumínio", resistencia: "IP68 · até 6 m por 30 min", dimensoes: "163,4 × 78 × 8,75 mm", peso: "249 g", cores: "Bordô · Glacial · Prateado · Preto",
    camera: "Fusion Pro · principal, ultra-angular e teleobjetiva de 48 MP", frontal: "Center Stage de 18 MP", video: "4K Dolby Vision · até 120 qps", recursosCamera: "Controle da Câmera · Captura Dupla",
    chip: "A20 Pro", cpu: "CPU de 6 núcleos", gpu: "GPU de 7 núcleos", inteligencia: "Apple Intelligence",
    bateria: "Até 43 horas de reprodução de vídeo", porta: "USB-C", conectividade: "5G · Wi-Fi 7 · Bluetooth 6", seguranca: "Face ID", carregamento: "MagSafe · Qi2",
    armazenamento: "256 GB · 512 GB · 1 TB", caixa: "iPhone · cabo USB-C · documentação"
  },
  "18-pro": {
    tela: "6,3\" Super Retina XDR", resolucao: "OLED · 120 Hz ProMotion", promocao: "Até 120 Hz", sempreAtiva: "Sim", ilha: "Dynamic Island",
    material: "Estrutura unibody de alumínio", resistencia: "IP68 · até 6 m por 30 min", dimensoes: "150 × 71,9 × 8,75 mm", peso: "211 g", cores: "Bordô · Glacial · Prateado · Preto",
    camera: "Fusion Pro · principal, ultra-angular e teleobjetiva de 48 MP", frontal: "Center Stage de 18 MP", video: "4K Dolby Vision · até 120 qps", recursosCamera: "Controle da Câmera · Captura Dupla",
    chip: "A20 Pro", cpu: "CPU de 6 núcleos", gpu: "GPU de 7 núcleos", inteligencia: "Apple Intelligence",
    bateria: "Até 34 horas de reprodução de vídeo", porta: "USB-C", conectividade: "5G · Wi-Fi 7 · Bluetooth 6", seguranca: "Face ID", carregamento: "MagSafe · Qi2",
    armazenamento: "256 GB · 512 GB", caixa: "iPhone · cabo USB-C · documentação"
  },
  "17-pro-max": {
    tela: "6,9\" Super Retina XDR", resolucao: "OLED · 120 Hz ProMotion", promocao: "Até 120 Hz", sempreAtiva: "Sim", ilha: "Dynamic Island",
    material: "Estrutura em titânio", resistencia: "IP68 · até 6 m por 30 min", dimensoes: "163,4 × 78 × 8,75 mm", peso: "231 g", cores: "Azul-céu · Dourado-claro · Branco-nuvem · Preto-espacial",
    camera: "Fusion Pro · principal, ultra-angular e teleobjetiva de 48 MP", frontal: "Center Stage de 18 MP", video: "4K Dolby Vision · até 120 qps", recursosCamera: "Controle da Câmera · Captura Dupla",
    chip: "A19 Pro", cpu: "CPU de 6 núcleos", gpu: "GPU de 6 núcleos", inteligencia: "Apple Intelligence",
    bateria: "Até 37 horas de reprodução de vídeo", porta: "USB-C", conectividade: "5G · Wi-Fi 7 · Bluetooth 6", seguranca: "Face ID", carregamento: "MagSafe · Qi2",
    armazenamento: "256 GB", caixa: "iPhone · cabo USB-C · documentação"
  },
  "17-pro": {
    tela: "6,3\" Super Retina XDR", resolucao: "OLED · 120 Hz ProMotion", promocao: "Até 120 Hz", sempreAtiva: "Sim", ilha: "Dynamic Island",
    material: "Estrutura em titânio", resistencia: "IP68 · até 6 m por 30 min", dimensoes: "150 × 71,9 × 8,75 mm", peso: "204 g", cores: "Azul-céu · Dourado-claro · Branco-nuvem · Preto-espacial",
    camera: "Fusion Pro · principal, ultra-angular e teleobjetiva de 48 MP", frontal: "Center Stage de 18 MP", video: "4K Dolby Vision · até 120 qps", recursosCamera: "Controle da Câmera · Captura Dupla",
    chip: "A19 Pro", cpu: "CPU de 6 núcleos", gpu: "GPU de 6 núcleos", inteligencia: "Apple Intelligence",
    bateria: "Até 31 horas de reprodução de vídeo", porta: "USB-C", conectividade: "5G · Wi-Fi 7 · Bluetooth 6", seguranca: "Face ID", carregamento: "MagSafe · Qi2",
    armazenamento: "256 GB", caixa: "iPhone · cabo USB-C · documentação"
  },
  "17": {
    tela: "6,3\" Super Retina XDR", resolucao: "OLED · 120 Hz ProMotion", promocao: "Até 120 Hz", sempreAtiva: "Sim", ilha: "Dynamic Island",
    material: "Estrutura em alumínio", resistencia: "IP68 · até 6 m por 30 min", dimensoes: "149,6 × 71,5 × 7,95 mm", peso: "177 g", cores: "Preto · Branco · Rosa · Azul · Verde-acinzentado",
    camera: "Sistema de câmera dupla Fusion · 48 MP", frontal: "Center Stage de 18 MP", video: "4K Dolby Vision · até 60 qps", recursosCamera: "Controle da Câmera · Captura Dupla",
    chip: "A19", cpu: "CPU de 6 núcleos", gpu: "GPU de 5 núcleos", inteligencia: "Apple Intelligence",
    bateria: "Até 30 horas de reprodução de vídeo", porta: "USB-C", conectividade: "5G · Wi-Fi 7 · Bluetooth 6", seguranca: "Face ID", carregamento: "MagSafe · Qi2",
    armazenamento: "256 GB", caixa: "iPhone · cabo USB-C · documentação"
  },
  "17e": {
    tela: "6,1\" Super Retina XDR", resolucao: "OLED", promocao: "60 Hz", sempreAtiva: "Não", ilha: "Dynamic Island",
    material: "Estrutura em alumínio", resistencia: "IP68 · até 6 m por 30 min", dimensoes: "146,7 × 71,5 × 7,8 mm", peso: "170 g", cores: "Preto · Branco · Rosa-pálido",
    camera: "Sistema de câmera 2 em 1 · Fusion de 48 MP", frontal: "TrueDepth de 12 MP", video: "4K Dolby Vision · até 60 qps", recursosCamera: "Modo Noite · HDR inteligente",
    chip: "A19", cpu: "CPU de 6 núcleos", gpu: "GPU de 4 núcleos", inteligencia: "Apple Intelligence",
    bateria: "Até 26 horas de reprodução de vídeo", porta: "USB-C", conectividade: "5G · Wi-Fi 6E · Bluetooth 6", seguranca: "Face ID", carregamento: "MagSafe · Qi2",
    armazenamento: "256 GB", caixa: "iPhone · cabo USB-C · documentação"
  },
  "16": {
    tela: "6,1\" Super Retina XDR", resolucao: "OLED", promocao: "60 Hz", sempreAtiva: "Não", ilha: "Dynamic Island",
    material: "Estrutura em alumínio", resistencia: "IP68 · até 6 m por 30 min", dimensoes: "147,6 × 71,6 × 7,8 mm", peso: "170 g", cores: "Ultramarino · Verde-acinzentado · Rosa · Branco · Preto",
    camera: "Sistema avançado de câmera dupla · Fusion 48 MP + ultra-angular 12 MP", frontal: "TrueDepth de 12 MP", video: "4K Dolby Vision · até 60 qps", recursosCamera: "Controle da Câmera · Modo Ação",
    chip: "A18", cpu: "CPU de 6 núcleos", gpu: "GPU de 5 núcleos", inteligencia: "Apple Intelligence",
    bateria: "Até 22 horas de reprodução de vídeo", porta: "USB-C", conectividade: "5G · Wi-Fi 7 · Bluetooth 5.3", seguranca: "Face ID", carregamento: "MagSafe · Qi2",
    armazenamento: "128 GB", caixa: "iPhone · cabo USB-C · documentação"
  }
};

Object.entries(detailedCompareSpecs).forEach(([id, specs]) => Object.assign(compareProducts[id].specs, specs));

const compareOptions = document.querySelector("[data-compare-options]");
const compareBoard = document.querySelector("[data-compare-board]");
const compareCounter = document.querySelector("[data-compare-counter]");

if (compareOptions && compareBoard) {
  const requestedModels = new URLSearchParams(window.location.search).get("modelList");
  const requestedSelection = requestedModels?.split(",").map((model) => model.replace(/^iphone-/, "")).filter((model) => compareProducts[model]).slice(0, 3);
  const selectedModels = requestedSelection?.length ? requestedSelection : ["18-pro", "17-pro", "17-pro-max"];
  const compareSections = [
    { title: "Resumo", rows: [["tela", "Tela"], ["resolucao", "Tecnologia"], ["chip", "Chip"], ["camera", "Câmeras traseiras"], ["bateria", "Bateria"], ["armazenamento", "Armazenamento"]] },
    { title: "Tela e design", rows: [["promocao", "ProMotion"], ["sempreAtiva", "Tela Sempre Ativa"], ["ilha", "Dynamic Island"], ["material", "Material"], ["dimensoes", "Formato"], ["peso", "Peso"], ["cores", "Cores"]] },
    { title: "Câmera e vídeo", rows: [["frontal", "Câmera frontal"], ["video", "Gravação de vídeo"], ["recursosCamera", "Recursos de câmera"]] },
    { title: "Desempenho", rows: [["cpu", "CPU"], ["gpu", "GPU"], ["inteligencia", "Apple Intelligence"]] },
    { title: "Conectividade e segurança", rows: [["porta", "Conector"], ["conectividade", "Rede e conexão"], ["seguranca", "Segurança"], ["carregamento", "Carregamento"]] },
    { title: "Na caixa", rows: [["caixa", "Conteúdo"]] }
  ];

  const renderCompareOptions = () => {
    compareOptions.innerHTML = Object.entries(compareProducts).map(([id, product]) => `
      <button class="compare-option${selectedModels.includes(id) ? " is-selected" : ""}" type="button" data-compare-model="${id}" aria-pressed="${selectedModels.includes(id)}">
        <small>${product.eyebrow}</small><strong>${product.name}</strong>
      </button>`).join("");
    compareCounter.textContent = `${selectedModels.length} selecionado${selectedModels.length === 1 ? "" : "s"}`;
  };

  const renderCompareBoard = () => {
    if (!selectedModels.length) {
      compareBoard.innerHTML = '<p class="compare-empty">Selecione pelo menos um modelo para começar a comparação.</p>';
      return;
    }
    const products = selectedModels.map((id) => compareProducts[id]);
    const emptyColumns = Array.from({ length: 3 - products.length }, () => '<div class="compare-product compare-product-empty" aria-hidden="true"></div>').join("");
    const productColumns = products.map((product) => `
      <article class="compare-product">
        <div class="compare-product-media"><img src="${product.image}" alt="${product.name}" /></div>
        <h3>${product.name}</h3><p>${product.description}</p><strong class="compare-product-price">${product.price}</strong><a class="compare-product-link" href="/iphone">Ver produto ↗</a>
      </article>`).join("");
    const specGroups = compareSections.map((section) => `<div class="compare-spec-group"><div class="compare-spec-title">${section.title}</div>${section.rows.map(([key, label]) => `
      <div class="compare-spec-row"><div>${label}</div>${products.map((product) => `<div>${product.specs[key]}</div>`).join("")}${Array.from({ length: 3 - products.length }, () => "<div></div>").join("")}</div>`).join("")}</div>`).join("");
    compareBoard.innerHTML = `
      <div class="compare-product-row"><div class="compare-product-label">Modelos</div>${productColumns}${emptyColumns}</div>
      ${specGroups}`;
  };

  compareOptions.addEventListener("click", (event) => {
    const option = event.target.closest("[data-compare-model]");
    if (!option) return;
    const id = option.dataset.compareModel;
    const index = selectedModels.indexOf(id);
    if (index >= 0) {
      if (selectedModels.length === 1) return;
      selectedModels.splice(index, 1);
    } else {
      if (selectedModels.length >= 3) selectedModels.shift();
      selectedModels.push(id);
    }
    renderCompareOptions();
    renderCompareBoard();
    track("compare_model_selected", { model: compareProducts[id].name, selected_models: selectedModels.map((model) => compareProducts[model].name) });
    const url = new URL(window.location.href);
    url.searchParams.set("modelList", selectedModels.map((model) => `iphone-${model}`).join(","));
    window.history.replaceState({}, "", url);
  });

  renderCompareOptions();
  renderCompareBoard();
}
