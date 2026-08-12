const sharedPageStyles = document.createElement('link');
const isNestedPage = window.location.pathname.includes('/pages/');
const pageRoot = isNestedPage ? '' : 'pages/';
const assetRoot = isNestedPage ? '../' : '';
const homeRoot = isNestedPage ? '../index.html' : 'index.html';
const shopRoot = `${pageRoot}shop.html`;
const cartRoot = `${pageRoot}cart.html`;
const accountRoot = `${pageRoot}account.html`;
const supportRoot = `${pageRoot}support.html`;
const cartStorageKey = 'bottomverse-cart';

sharedPageStyles.rel = 'stylesheet';
sharedPageStyles.href = `${assetRoot}css/pages.css`;
document.head.append(sharedPageStyles);

const products = [
  {
    id: 'drop-001-tee',
    name: 'Drop 001 / Heavyweight Tee',
    price: 1799,
    collection: 'Drop 001',
    description: '240 GSM combed cotton. Boxy body. Dropped shoulder.',
    colours: ['Blackout', 'Bone', 'Moss'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
];

const primaryLinks = [
  { label: 'Home', href: homeRoot, page: 'index.html' },
  { label: 'Drop 001', href: `${pageRoot}drop.html`, page: 'drop.html' },
  { label: 'Oversized Fit', href: `${pageRoot}fit.html`, page: 'fit.html' },
  { label: 'Style Lab', href: `${pageRoot}style.html`, page: 'style.html' },
  { label: 'Size & Fit Guide', href: `${pageRoot}fit-guide.html`, page: 'fit-guide.html' },
  { label: 'Our Story', href: `${pageRoot}story.html`, page: 'story.html' },
];

function isCurrentPage(page) {
  return window.location.pathname.endsWith(`/${page}`)
    || (page === 'index.html' && (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html')));
}

function createNavigationLink({ label, href, page }) {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = label;

  if (isCurrentPage(page)) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }

  return link;
}

function renderPrimaryNavigation(selector) {
  const navigation = document.querySelector(selector);
  if (!navigation) return;

  navigation.replaceChildren(...primaryLinks.map(createNavigationLink));

  if (selector !== '.mobile-nav') {
    return;
  }

  const divider = document.createElement('span');
  divider.className = 'mobile-nav-divider';
  divider.setAttribute('aria-hidden', 'true');

  const shopLink = document.createElement('a');
  shopLink.href = shopRoot;
  shopLink.textContent = 'Shop';
  shopLink.className = 'mobile-nav-shop';

  const secondary = document.createElement('div');
  secondary.className = 'mobile-nav-secondary';
  secondary.innerHTML = `<a href="${accountRoot}#orders">Orders</a><a href="${accountRoot}">Account</a><a href="${supportRoot}">Support</a>`;

  navigation.append(divider, shopLink, secondary);
}

renderPrimaryNavigation('.nav-links');
renderPrimaryNavigation('.mobile-nav');

function readCart() {
  try {
    const storedCart = JSON.parse(localStorage.getItem(cartStorageKey) || '[]');
    return Array.isArray(storedCart) ? storedCart.filter((item) => item && item.productId && item.size) : [];
  } catch {
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  updateCartCount();
  renderCartPage();
}

function cartQuantity(cart = readCart()) {
  return cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function updateCartCount() {
  const quantity = cartQuantity();
  document.querySelectorAll('.cart-count').forEach((count) => {
    count.textContent = quantity;
    count.hidden = quantity === 0;
  });
  document.querySelectorAll('.cart-link').forEach((link) => {
    link.setAttribute('aria-label', `Cart, ${quantity} ${quantity === 1 ? 'item' : 'items'}`);
  });
}

function renderNavActions() {
  const existingAction = document.querySelector('.nav-cta');
  if (!existingAction) return;

  const actions = document.createElement('div');
  actions.className = 'nav-actions';

  const shopLink = document.createElement('a');
  shopLink.className = 'nav-shop';
  shopLink.href = shopRoot;
  shopLink.textContent = 'Shop';
  if (isCurrentPage('shop.html') || isCurrentPage('drop.html')) shopLink.classList.add('active');

  const cartLink = document.createElement('a');
  cartLink.className = 'cart-link';
  cartLink.href = cartRoot;
  cartLink.innerHTML = '<svg class="cart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg><span class="cart-label">Cart</span><span class="cart-count" hidden>0</span>';

  actions.append(shopLink, cartLink);
  existingAction.replaceWith(actions);
  updateCartCount();
}

renderNavActions();

function renderFooter() {
  const footer = document.querySelector('footer');
  if (!footer) return;

  footer.innerHTML = `<div class="footer-grid">
    <div class="footer-brand-block"><a class="brand" href="${homeRoot}">BOTTOM<br><span>VERSE®</span></a><p>MADE WITH TOO MUCH SPACE.</p></div>
    <div class="footer-column"><p>SHOP</p><a href="${shopRoot}">Shop</a><a href="${pageRoot}drop.html">Drop 001</a><a href="${pageRoot}fit.html">Oversized Fit</a><a href="${pageRoot}fit-guide.html">Size &amp; Fit Guide</a></div>
    <div class="footer-column"><p>EXPLORE</p><a href="${pageRoot}style.html">Style Lab</a><a href="${pageRoot}story.html">Our Story</a></div>
    <div class="footer-column"><p>SUPPORT</p><a href="${pageRoot}contact.html">Contact</a><a href="${supportRoot}#shipping">Shipping</a><a href="${supportRoot}#returns">Returns</a><a href="${supportRoot}#faq">FAQ</a></div>
    <div class="footer-column"><p>ACCOUNT</p><a href="${accountRoot}#orders">Orders</a><a href="${accountRoot}">Account</a></div>
  </div><div class="footer-bottom"><span>© 2026 BOTTOMVERSE</span><span>INDIA-WIDE SHIPPING / DROP 001 LIVE</span></div>`;
}

renderFooter();

function showToast(message) {
  let toast = document.querySelector('.site-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'site-toast';
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('visible'), 2400);
}

function addToCart(productId, size, colour, trigger) {
  const product = products.find((item) => item.id === productId);
  if (!product || !size) return;

  const cart = readCart();
  const existingItem = cart.find((item) => item.productId === productId && item.size === size && item.colour === colour);
  if (existingItem) {
    existingItem.quantity = Number(existingItem.quantity || 0) + 1;
  } else {
    cart.push({ productId, name: product.name, price: product.price, size, colour, quantity: 1 });
  }

  writeCart(cart);
  showToast(`${product.name} / ${size} added to cart`);
  if (trigger) {
    const originalLabel = trigger.innerHTML;
    trigger.innerHTML = 'ADDED TO CART <span>✓</span>';
    window.setTimeout(() => { trigger.innerHTML = originalLabel; }, 1600);
  }
}

function productVisual(label = 'DROP<br>001') {
  return `<div class="tee tee-product shop-tee"><span>bottom<br>verse</span><b>${label}</b><i>01</i></div>`;
}

function productForm(product, compact = false) {
  const colourOptions = product.colours.map((colour) => `<option value="${colour}">${colour}</option>`).join('');
  const sizeOptions = product.sizes.map((size) => `<option value="${size}">${size}</option>`).join('');
  return `<form class="product-form${compact ? ' compact-product-form' : ''}" data-add-to-cart="${product.id}">
    <label>COLOUR<select name="colour">${colourOptions}</select></label>
    <label>SIZE<select name="size" required><option value="">SELECT</option>${sizeOptions}</select></label>
    <button class="block-button" type="submit">ADD TO CART <span>↗</span></button>
  </form>`;
}

function renderShopPage() {
  const grid = document.querySelector('#shop-product-grid');
  if (!grid) return;

  grid.innerHTML = products.map((product) => `<article class="shop-product-card">
    <a class="shop-product-media" href="${pageRoot}drop.html" aria-label="View ${product.name}">${productVisual('DROP<br>001')}<span class="product-index">01 / 03</span></a>
    <div class="shop-product-info"><div><p class="micro-label">${product.collection}</p><h2>${product.name}</h2><p>${product.description}</p></div><strong>${formatPrice(product.price)}</strong></div>
    <div class="shop-product-meta"><span>AVAILABLE SIZES / ${product.sizes.join(' · ')}</span><a href="${pageRoot}drop.html">QUICK VIEW ↗</a></div>
    ${productForm(product, true)}
  </article>`).join('');
}

function renderDropProductForm() {
  const product = products[0];
  const existingButton = document.querySelector('.product-page .block-button');
  if (!existingButton) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'drop-purchase';
  wrapper.innerHTML = `<div class="product-price-row"><strong>${formatPrice(product.price)}</strong><span>INCL. TAX / INDIA-WIDE SHIPPING</span></div><p class="available-sizes">S · M · L · XL · XXL / TRUE TO SIZE FOR THE INTENDED OVERSIZED FIT</p>${productForm(product)}`;
  existingButton.replaceWith(wrapper);
}

function renderCartPage() {
  const root = document.querySelector('#cart-root');
  if (!root) return;

  const cart = readCart();
  if (!cart.length) {
    root.innerHTML = `<section class="store-empty"><p class="micro-label">YOUR CART / 00 ITEMS</p><h1>NOTHING<br><em>HERE YET.</em></h1><p>Start with Drop 001 and build your everyday uniform from there.</p><a class="button dark" href="${shopRoot}">SHOP DROP 001 <b>↗</b></a></section>`;
    return;
  }

  const rows = cart.map((item, index) => {
    const product = products.find((entry) => entry.id === item.productId) || products[0];
    return `<article class="cart-row" data-cart-index="${index}"><div class="cart-product-visual">${productVisual('BV')}</div><div class="cart-product-copy"><p class="micro-label">${product.collection}</p><h2>${item.name}</h2><p>Colour / ${item.colour || 'Blackout'}<br>Size / ${item.size}</p><button class="text-action remove-item" type="button" data-cart-action="remove" data-cart-index="${index}">REMOVE ↗</button></div><div class="cart-quantity"><span>QTY</span><button type="button" data-cart-action="decrease" data-cart-index="${index}" aria-label="Decrease quantity">−</button><strong>${item.quantity}</strong><button type="button" data-cart-action="increase" data-cart-index="${index}" aria-label="Increase quantity">+</button></div><strong class="cart-row-price">${formatPrice(item.price * item.quantity)}</strong></article>`;
  }).join('');
  const subtotal = cart.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);

  root.innerHTML = `<section class="cart-page"><div class="store-heading"><p class="micro-label">SHOP / YOUR SELECTION</p><h1>THE<br><em>CART.</em></h1><span>${cartQuantity(cart)} ${cartQuantity(cart) === 1 ? 'ITEM' : 'ITEMS'}</span></div><div class="cart-layout"><div class="cart-items">${rows}</div><aside class="cart-summary"><p class="micro-label">SUMMARY</p><div><span>SUBTOTAL</span><strong>${formatPrice(subtotal)}</strong></div><p>Shipping calculated at checkout. Returns accepted within 14 days on unworn pieces.</p><a class="button dark checkout-link" href="${pageRoot}checkout.html">CHECKOUT <b>↗</b></a><a class="continue-link" href="${shopRoot}">← CONTINUE SHOPPING</a></aside></div></section>`;
}

function renderCheckoutPage() {
  const root = document.querySelector('#checkout-root');
  if (!root) return;

  const cart = readCart();
  if (!cart.length) {
    window.location.replace(cartRoot);
    return;
  }

  const subtotal = cart.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);
  root.innerHTML = `<section class="checkout-page"><div class="checkout-intro"><p class="micro-label">DROP 001 / SECURE CHECKOUT</p><h1>MAKE IT<br><em>YOURS.</em></h1><p>Almost there. A few details and your first layer is on its way.</p></div><div class="checkout-layout"><form class="checkout-form" id="checkout-form"><fieldset><legend>01 / CONTACT</legend><label>Email address<input type="email" required placeholder="you@example.com"></label></fieldset><fieldset><legend>02 / SHIPPING</legend><label>Full name<input required placeholder="Your name"></label><label>Address<input required placeholder="House, street, locality"></label><div class="checkout-two-up"><label>City<input required placeholder="City"></label><label>PIN code<input required pattern="[0-9]{6}" placeholder="000000"></label></div><label>State<input required placeholder="State"></label></fieldset><button class="button dark" type="submit">PLACE ORDER <b>↗</b></button></form><aside class="checkout-summary"><p class="micro-label">YOUR SELECTION</p>${cart.map((item) => `<div class="checkout-item"><span>${item.name}<small>${item.colour} / ${item.size} / QTY ${item.quantity}</small></span><strong>${formatPrice(item.price * item.quantity)}</strong></div>`).join('')}<div class="checkout-total"><span>TOTAL</span><strong>${formatPrice(subtotal)}</strong></div><p class="checkout-note">This demo checkout keeps the experience ready for a payment integration without exposing checkout in the brand navigation.</p></aside></div></section>`;
}

function renderStorePages() {
  renderShopPage();
  renderDropProductForm();
  renderCartPage();
  renderCheckoutPage();
}

renderStorePages();

document.addEventListener('submit', (event) => {
  const productFormElement = event.target.closest('[data-add-to-cart]');
  if (productFormElement) {
    event.preventDefault();
    const formData = new FormData(productFormElement);
    const size = formData.get('size');
    if (!size) {
      productFormElement.classList.add('has-error');
      showToast('Choose a size first');
      return;
    }
    productFormElement.classList.remove('has-error');
    addToCart(productFormElement.dataset.addToCart, size, formData.get('colour'), productFormElement.querySelector('button'));
    return;
  }

  if (event.target.id === 'checkout-form') {
    event.preventDefault();
    const orderCode = `BV-${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.removeItem(cartStorageKey);
    updateCartCount();
    event.target.closest('.checkout-page').innerHTML = `<div class="order-success"><p class="micro-label">ORDER CONFIRMED / ${orderCode}</p><h1>SEE YOU<br><em>OUT THERE.</em></h1><p>Your first layer is locked in. We’ll send the next update to your inbox.</p><a class="button dark" href="${homeRoot}">BACK TO HOME <b>↗</b></a></div>`;
  }
});

document.addEventListener('click', (event) => {
  const actionButton = event.target.closest('[data-cart-action]');
  if (!actionButton) return;

  const index = Number(actionButton.dataset.cartIndex);
  const cart = readCart();
  const item = cart[index];
  if (!item) return;

  if (actionButton.dataset.cartAction === 'remove') cart.splice(index, 1);
  if (actionButton.dataset.cartAction === 'increase') item.quantity = Number(item.quantity) + 1;
  if (actionButton.dataset.cartAction === 'decrease') {
    item.quantity = Number(item.quantity) - 1;
    if (item.quantity <= 0) cart.splice(index, 1);
  }
  writeCart(cart);
});

const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });

  mobileNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      mobileNav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
    }
  });
}

const swatches = document.querySelectorAll('.swatch');
const colourLabel = document.querySelector('.swatches span');

swatches.forEach((swatch) => {
  swatch.addEventListener('click', () => {
    swatches.forEach((item) => item.classList.remove('selected'));
    swatch.classList.add('selected');
    if (colourLabel) colourLabel.textContent = swatch.dataset.colour;
    document.querySelectorAll('select[name="colour"]').forEach((select) => { select.value = swatch.dataset.colour[0] + swatch.dataset.colour.slice(1).toLowerCase(); });
  });
});
