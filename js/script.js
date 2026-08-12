const sharedPageStyles = document.createElement('link');
const isNestedPage = window.location.pathname.includes('/pages/');
const pageRoot = isNestedPage ? '' : 'pages/';
const assetRoot = isNestedPage ? '../' : '';
sharedPageStyles.rel = 'stylesheet';
sharedPageStyles.href = `${assetRoot}css/pages.css`;
document.head.append(sharedPageStyles);

const homeRoot = isNestedPage ? '../index.html' : 'index.html';
const shoppingRoot = `${pageRoot}coming-soon.html?tab=shopping`;
const primaryLinks = [
  { label: 'Home', href: homeRoot, page: 'index.html' },
  // Temporarily hidden from the primary navigation.
  // { label: 'Drop 001', href: `${pageRoot}drop.html`, page: 'drop.html', collection: true },
  // { label: 'Oversized Fit', href: `${pageRoot}fit.html`, page: 'fit.html' },
  { label: 'Style Lab', href: `${pageRoot}style.html`, page: 'style.html' },
  { label: 'Size & Fit Guide', href: `${pageRoot}fit-guide.html`, page: 'fit-guide.html' },
  { label: 'Our Story', href: `${pageRoot}story.html`, page: 'story.html' },
];
const selectedTab = new URLSearchParams(window.location.search).get('tab');

function isCurrentPage(page) {
  return window.location.pathname.endsWith(`/${page}`)
    || (page === 'index.html' && (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html')));
}

function createNavigationLink({ label, href, page, collection = false }) {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = label;

  if (collection) link.dataset.primary = 'collection';
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

  if (selector !== '.mobile-nav') return;

  const contactLink = document.createElement('a');
  contactLink.href = `${pageRoot}contact.html`;
  contactLink.textContent = 'Contact us';
  if (isCurrentPage('contact.html')) {
    contactLink.classList.add('active');
    contactLink.setAttribute('aria-current', 'page');
  }
  navigation.append(contactLink);

  const shopLink = document.createElement('a');
  shopLink.href = shoppingRoot;
  shopLink.textContent = 'Shop';
  shopLink.dataset.mobileAction = 'shop';
  navigation.append(shopLink);
}

renderPrimaryNavigation('.nav-links');
renderPrimaryNavigation('.mobile-nav');

function renderNavActions() {
  const existingAction = document.querySelector('.nav-cta');
  if (!existingAction) return;

  const actions = document.createElement('div');
  actions.className = 'nav-actions';

  const shopLink = document.createElement('a');
  shopLink.className = 'nav-shop';
  shopLink.href = shoppingRoot;
  shopLink.textContent = 'Shop';
  if (isCurrentPage('drop.html')) shopLink.classList.add('active');

  const cartLink = document.createElement('a');
  cartLink.className = 'cart-link';
  cartLink.href = shoppingRoot;
  cartLink.setAttribute('aria-label', 'Cart, 0 items');
  cartLink.innerHTML = '<svg class="cart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg><span class="cart-label">Cart</span><span class="cart-count">0</span>';

  actions.append(shopLink, cartLink);
  existingAction.replaceWith(actions);
}

renderNavActions();

const comingSoonCopy = {
  shopping: {
    label: 'SHOPPING',
    message: 'The shopping page will be live soon. We are getting the next layer ready.',
  },
  checkout: {
    label: 'CHECKOUT',
    message: 'The checkout page will be live soon. Your cart is getting its final fit.',
  },
  orders: {
    label: 'ORDERS',
    message: 'The orders page will be live soon. We are building a better way to track your pieces.',
  },
};

const comingSoonPage = document.querySelector('.coming-soon');
if (comingSoonPage) {
  const selectedCopy = comingSoonCopy[selectedTab] || comingSoonCopy.shopping;
  const label = comingSoonPage.querySelector('[data-coming-label]');
  const message = comingSoonPage.querySelector('[data-coming-message]');

  label.textContent = selectedCopy.label;
  message.textContent = selectedCopy.message;
  document.title = `${selectedCopy.label} — BOTTOMVERSE`;
}

const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');

menuButton.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

document.querySelectorAll('.mobile-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

const swatches = document.querySelectorAll('.swatch');
const colourLabel = document.querySelector('.swatches span');

swatches.forEach((swatch) => {
  swatch.addEventListener('click', () => {
    swatches.forEach((item) => item.classList.remove('selected'));
    swatch.classList.add('selected');
    colourLabel.textContent = swatch.dataset.colour;
  });
});
