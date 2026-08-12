const sharedPageStyles = document.createElement('link');
sharedPageStyles.rel = 'stylesheet';
sharedPageStyles.href = 'css/pages.css';
document.head.append(sharedPageStyles);

function addFitGuideLink(selector, label) {
  const navigation = document.querySelector(selector);
  if (!navigation || navigation.querySelector('[href="fit-guide.html"]')) return;

  const link = document.createElement('a');
  link.href = 'fit-guide.html';
  link.textContent = label;
  navigation.append(link);
}

addFitGuideLink('.nav-links', 'Size & Fit Guide');
addFitGuideLink('.mobile-nav', 'Size & Fit Guide');

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
