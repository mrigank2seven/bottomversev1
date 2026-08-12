const sharedPageStyles = document.createElement('link');
const isNestedPage = window.location.pathname.includes('/pages/');
const pageRoot = isNestedPage ? '' : 'pages/';
const assetRoot = isNestedPage ? '../' : '';
sharedPageStyles.rel = 'stylesheet';
sharedPageStyles.href = `${assetRoot}css/pages.css`;
document.head.append(sharedPageStyles);

function addFitGuideLink(selector, label) {
  const navigation = document.querySelector(selector);
  if (!navigation || navigation.querySelector('[href="fit-guide.html"]')) return;

  const link = document.createElement('a');
  link.href = `${pageRoot}fit-guide.html`;
  link.textContent = label;
  navigation.append(link);
}

addFitGuideLink('.nav-links', 'Size & Fit Guide');
addFitGuideLink('.mobile-nav', 'Size & Fit Guide');

function addStoryLink(selector) {
  const navigation = document.querySelector(selector);
  if (!navigation || navigation.querySelector('[href="story.html"]')) return;

  const link = document.createElement('a');
  link.href = `${pageRoot}story.html`;
  link.textContent = 'Our Story';
  if (window.location.pathname.endsWith('/story.html')) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
  navigation.append(link);
}

addStoryLink('.nav-links');
addStoryLink('.mobile-nav');

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
