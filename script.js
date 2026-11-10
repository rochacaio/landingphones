const catalog = {
  iphone: {
    label: "iPhone",
    intro: "iPhones novos, lacrados e com garantia Apple. Consulte a capacidade e a condição disponível.",
    products: [
      { name: "iPhone Duo", detail: "256GB · Em breve", price: "Em breve", status: "novo", theme: "white" },
      { name: "iPhone 18 Pro Max", detail: "256GB · Novo lacrado", price: "R$ 9.399", status: "novo", theme: "black" },
      { name: "iPhone 18 Pro Max", detail: "512GB · Novo lacrado", price: "R$ 12.499", status: "novo", theme: "sand" },
      { name: "iPhone 18 Pro Max", detail: "1TB · Novo lacrado", price: "R$ 13.999", status: "novo", theme: "purple" },
      { name: "iPhone 18 Pro", detail: "256GB · Novo lacrado", price: "R$ 8.299", status: "novo", theme: "blue" },
      { name: "iPhone 18 Pro", detail: "512GB · Novo lacrado", price: "R$ 10.999", status: "novo", theme: "black" },
      { name: "iPhone 17 Pro Max", detail: "256GB · Novo lacrado", price: "R$ 7.699", status: "novo", theme: "sand" },
      { name: "iPhone 17 Pro", detail: "256GB · Novo lacrado", price: "R$ 7.299", status: "novo", theme: "white" },
      { name: "iPhone 17", detail: "256GB · Sob consulta", price: "Sob consulta", status: "novo", theme: "blue" },
      { name: "iPhone 17e", detail: "256GB · Sob consulta", price: "Sob consulta", status: "novo", theme: "black" },
      { name: "iPhone 16", detail: "128GB · Sob consulta", price: "Sob consulta", status: "novo", theme: "sand" },
    ],
  },
  watch: {
    label: "Apple Watch",
    intro: "Modelos GPS novos, lacrados e com garantia Apple para acompanhar sua rotina.",
    products: [
      { name: "Apple Watch SE 3", detail: "40mm · Estelar/Preto", price: "R$ 2.299", status: "novo", theme: "white" },
      { name: "Apple Watch SE 3", detail: "44mm · Estelar/Preto", price: "R$ 2.499", status: "novo", theme: "black" },
      { name: "Apple Watch S12", detail: "42mm GPS · Várias cores", price: "R$ 2.999", status: "novo", theme: "sand" },
      { name: "Apple Watch S12", detail: "46mm GPS · Várias cores", price: "R$ 3.199", status: "novo", theme: "blue" },
      { name: "Apple Watch Ultra 3", detail: "49mm · Titânio natural/preto", price: "R$ 5.199", status: "novo", theme: "black" },
      { name: "Apple Watch Ultra 4", detail: "49mm · Titânio natural/preto", price: "R$ 5.699", status: "novo", theme: "white" },
    ],
  },
  ipad: {
    label: "iPad",
    intro: "Modelos Wi-Fi novos, lacrados e com garantia Apple para estudar, criar e trabalhar.",
    products: [
      { name: "iPad 11", detail: "128GB · Rosa/Azul", price: "R$ 2.999", status: "novo", theme: "blue" },
      { name: "iPad 11", detail: "128GB · Prata/Amarelo", price: "R$ 3.199", status: "novo", theme: "sand" },
      { name: "iPad Air M4", detail: "128GB · 11\"", price: "Sob consulta", status: "novo", theme: "white" },
      { name: "iPad Air M4", detail: "256GB · 13\"", price: "Sob consulta", status: "novo", theme: "black" },
      { name: "iPad Pro M5", detail: "256GB · 11\"", price: "Sob consulta", status: "novo", theme: "blue" },
      { name: "Apple Pencil Pro", detail: "Compatível com iPad Air M2 e Pro M4", price: "R$ 1.199", status: "novo", theme: "white" },
    ],
  },
  mac: {
    label: "MacBook",
    intro: "MacBooks novos, lacrados e com garantia Apple. Consulte a configuração disponível.",
    products: [
      { name: "MacBook Air Neo", detail: "Configuração sob consulta", price: "Sob consulta", status: "novo", theme: "white" },
      { name: "MacBook Air M5", detail: "Configuração sob consulta", price: "Sob consulta", status: "novo", theme: "black" },
      { name: "MacBook Pro M5", detail: "M5 Pro & M5 Max", price: "Sob consulta", status: "novo", theme: "sand" },
    ],
  },
  airpods: {
    label: "AirPods",
    intro: "Fones novos, lacrados e com garantia Apple para deixar seu som mais simples.",
    products: [
      { name: "AirPods 4", detail: "Sem cancelamento de ruído", price: "R$ 1.249", status: "novo", theme: "white" },
      { name: "AirPods 4", detail: "Com cancelamento de ruído", price: "R$ 1.499", status: "novo", theme: "blue" },
      { name: "AirPods 5", detail: "Estojo normal", price: "R$ 949", status: "novo", theme: "sand" },
      { name: "AirPods 5", detail: "Estojo com carregamento sem fio", price: "R$ 1.449", status: "novo", theme: "black" },
      { name: "AirPods Pro 3", detail: "Cancelamento ativo de ruído", price: "R$ 1.649", status: "novo", theme: "white" },
      { name: "AirPods Max 2", detail: "USB-C · Meia-noite", price: "R$ 4.199", status: "novo", theme: "black" },
    ],
  },
};

const filterButtons = document.querySelectorAll("[data-filter]");
const categoryButtons = document.querySelectorAll("[data-category-nav]");
const productGrid = document.querySelector("[data-product-grid]");
const catalogCount = document.querySelector("[data-catalog-count]");
const catalogEmpty = document.querySelector("[data-catalog-empty]");
const catalogTitle = document.querySelector("[data-category-title]");
const categoryIntro = document.querySelector("[data-category-intro]");
const filterTabGroup = document.querySelector(".filter-tabs");
const toast = document.querySelector("[data-toast]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const header = document.querySelector("[data-header]");
let currentCategory = "iphone";
let currentFilter = "todos";

function productMarkup(product, index, total) {
  const tag = product.status === "seminovo" ? "Seminovo" : "Novo";
  const tagClass = product.status === "seminovo" ? " product-tag-warm" : "";
  const phoneClass = product.theme === "white" ? "white" : product.theme;

  return `<article class="product-card" data-category="${product.status}">
    <div class="product-image product-image-${product.theme}">
      <span class="product-tag${tagClass}">${tag}</span>
      <div class="mini-phone mini-phone-${phoneClass}"><div class="mini-screen"></div><div class="mini-camera"></div></div>
      <span class="product-index">${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span>
    </div>
    <div class="product-info"><div><h3>${product.name}</h3><p>${product.detail}</p></div><strong>${product.price}</strong></div>
    <button class="product-link" type="button" data-product="${product.name}">Tenho interesse <span>↗</span></button>
  </article>`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("is-visible"), 3600);
}

function updateCatalog() {
  const products = catalog[currentCategory].products;
  const visibleProducts = products.filter((product) => currentFilter === "todos" || product.status === currentFilter);

  productGrid.innerHTML = visibleProducts.map((product, index) => productMarkup(product, index, visibleProducts.length)).join("");
  catalogCount.textContent = `${String(visibleProducts.length).padStart(2, "0")} modelos`;
  catalogEmpty.classList.toggle("is-visible", visibleProducts.length === 0);

  productGrid.querySelectorAll("[data-product]").forEach((button) => {
    button.addEventListener("click", () => showToast(`Anotado: ${button.dataset.product}. Fale com a Lume para confirmar disponibilidade.`));
  });
}

function setCategory(category) {
  if (!catalog[category]) return;
  currentCategory = category;
  currentFilter = "todos";
  const { label, intro } = catalog[category];
  catalogTitle.innerHTML = `Escolha seu<br /><em>${label} em foco.</em>`;
  categoryIntro.textContent = intro;
  filterTabGroup.classList.toggle("is-category-only", category !== "iphone");
  categoryButtons.forEach((button) => {
    const active = button.dataset.categoryNav === category;
    if (button.tagName === "BUTTON") {
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    }
  });
  filterButtons.forEach((button) => {
    const active = button.dataset.filter === "todos";
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });
  updateCatalog();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", active ? "true" : "false");
    });
    updateCatalog();
  });
});

categoryButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    setCategory(button.dataset.categoryNav);
    document.querySelector("#catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    header.classList.remove("is-menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

menuToggle?.addEventListener("click", () => {
  const isOpen = header.classList.toggle("is-menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll('a[href^="#"]:not([data-category-nav])').forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("is-menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

setCategory("iphone");
