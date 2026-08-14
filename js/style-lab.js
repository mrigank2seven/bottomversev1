(() => {
  const root = document.querySelector('[data-style-lab]');
  if (!root) return;

  const coreColours = {
    Black: { hex: '#0A0A0A', tone: 'cool', depth: 'deep', moods: ['dark', 'lowkey', 'bold'], roles: ['tee', 'bottom', 'accent'] },
    Charcoal: { hex: '#292927', tone: 'neutral', depth: 'deep', moods: ['clean', 'dark', 'lowkey'], roles: ['tee', 'bottom', 'accent'] },
    Bone: { hex: '#E5DED0', tone: 'warm', depth: 'light', moods: ['clean', 'earth', 'bold'], roles: ['tee', 'bottom', 'accent'], product: 'Bone' },
    Stone: { hex: '#AAA397', tone: 'neutral', depth: 'light', moods: ['clean', 'earth', 'lowkey'], roles: ['tee', 'bottom', 'accent'] },
    Moss: { hex: '#53634D', tone: 'warm', depth: 'mid', moods: ['earth', 'lowkey'], roles: ['tee', 'bottom', 'accent'], product: 'Moss' },
    Olive: { hex: '#4C5138', tone: 'warm', depth: 'mid', moods: ['earth', 'lowkey', 'bold'], roles: ['bottom', 'accent'] },
    Espresso: { hex: '#3B2821', tone: 'warm', depth: 'deep', moods: ['earth'], roles: ['bottom', 'accent'] },
    'Deep Navy': { hex: '#172335', tone: 'cool', depth: 'deep', moods: ['dark', 'bold'], roles: ['tee', 'bottom', 'accent'] },
    Burgundy: { hex: '#5A2930', tone: 'warm', depth: 'deep', moods: ['bold'], roles: ['tee', 'accent'] },
    'Deep Teal': { hex: '#244A4A', tone: 'cool', depth: 'deep', moods: ['bold'], roles: ['tee', 'accent'] },
    'Washed Black': { hex: '#3D3D3A', tone: 'neutral', depth: 'deep', moods: ['dark', 'lowkey'], roles: ['tee', 'bottom'], product: 'Blackout' },
    'Faded Denim': { hex: '#626B72', tone: 'cool', depth: 'mid', moods: ['clean', 'lowkey'], roles: ['bottom'] },
  };

  const moodPalettes = {
    clean: ['Bone', 'Stone', 'Charcoal', 'Black', 'Faded Denim'],
    dark: ['Black', 'Washed Black', 'Charcoal', 'Deep Navy', 'Faded Denim'],
    earth: ['Moss', 'Olive', 'Bone', 'Espresso', 'Stone'],
    lowkey: ['Charcoal', 'Washed Black', 'Moss', 'Stone', 'Black'],
    bold: ['Burgundy', 'Deep Teal', 'Deep Navy', 'Olive', 'Bone'],
  };

  const bottomColours = ['Olive', 'Faded Denim', 'Washed Black', 'Stone', 'Deep Navy', 'Black', 'Espresso', 'Charcoal'];
  const accentColours = ['Bone', 'Stone', 'Moss', 'Olive', 'Espresso', 'Deep Navy', 'Burgundy', 'Deep Teal', 'Charcoal'];
  const undertoneAffinities = {
    warm: ['warm', 'neutral'],
    cool: ['cool', 'neutral'],
    neutral: ['neutral', 'warm', 'cool'],
    'not-sure': ['neutral', 'warm', 'cool'],
  };
  const productLinks = { Blackout: 'drop.html', Bone: 'drop.html', Moss: 'drop.html' };
  const defaults = {
    skinDepth: 'medium',
    undertone: 'not-sure',
    height: 'balanced-height',
    frame: 'not-sure',
    contrast: 'lowkey',
    mood: 'lowkey',
  };
  const state = { ...defaults };

  const depthScore = {
    light: { light: 2, mid: 1, deep: 1 },
    'light-medium': { light: 1, mid: 2, deep: 1 },
    medium: { light: 1, mid: 2, deep: 2 },
    'medium-deep': { light: 1, mid: 2, deep: 2 },
    deep: { light: 1, mid: 2, deep: 3 },
    'not-sure': { light: 1, mid: 1, deep: 1 },
  };

  function colourData(name) { return coreColours[name]; }

  function rankColours(names, role) {
    const affinities = undertoneAffinities[state.undertone];
    return [...new Set(names)]
      .filter((name) => colourData(name) && colourData(name).roles.includes(role))
      .sort((a, b) => scoreColour(b, role, affinities) - scoreColour(a, role, affinities));
  }

  function scoreColour(name, role, affinities) {
    const colour = colourData(name);
    let score = colour.moods.includes(state.mood) ? 5 : 0;
    score += affinities.indexOf(colour.tone) >= 0 ? 3 - Math.max(affinities.indexOf(colour.tone), 0) : 0;
    score += depthScore[state.skinDepth][colour.depth] || 0;
    score += colour.roles.includes(role) ? 1 : 0;

    if (state.contrast === 'lowkey' && colour.depth === 'mid') score += 2;
    if (state.contrast === 'balanced' && colour.depth !== 'deep') score += 1;
    if (state.contrast === 'high' && (colour.depth === 'light' || colour.depth === 'deep')) score += 2;
    if (role === 'tee' && state.frame === 'broad' && colour.depth === 'deep') score += 2;
    if (role === 'tee' && state.frame === 'lean' && colour.depth !== 'deep') score += 2;
    if (role === 'bottom' && state.frame === 'broad' && colour.depth === 'light') score += 2;
    if (state.height === 'under-165' && colour.depth === 'mid') score += 1;
    if (state.height === '184-plus' && colour.depth !== 'mid') score += 1;
    return score;
  }

  function getPalette() {
    const moodNames = moodPalettes[state.mood];
    const tee = rankColours(moodNames, 'tee')[0] || 'Black';
    const bottom = rankColours(bottomColours, 'bottom').find((name) => name !== tee) || 'Olive';
    const accent = rankColours([...moodNames, ...accentColours], 'accent').find((name) => name !== tee && name !== bottom) || 'Bone';
    return { tee, bottom, accent };
  }

  function getOutfits() {
    const moodNames = moodPalettes[state.mood];
    const teeColours = rankColours(moodNames, 'tee');
    const rankedBottoms = rankColours(bottomColours, 'bottom');
    const palette = getPalette();
    const safeTee = palette.tee;
    const safeBottom = palette.bottom;
    const signatureTee = teeColours.find((name) => name !== safeTee) || safeTee;
    const signatureBottom = rankedBottoms.find((name) => name !== safeBottom && name !== signatureTee) || safeBottom;
    const darkTee = rankColours(['Black', 'Charcoal', 'Deep Navy', 'Washed Black'], 'tee')[0] || 'Black';
    const darkBottom = rankColours(['Deep Navy', 'Washed Black', 'Black', 'Faded Denim'], 'bottom')[0] || 'Washed Black';

    return [
      { number: '01', title: 'THE SAFE PLAY', tee: safeTee, bottom: safeBottom, shoes: state.contrast === 'high' ? 'Off-white sneakers' : 'Clean sneakers', type: 'safe' },
      { number: '02', title: 'THE SIGNATURE', tee: signatureTee, bottom: signatureBottom, shoes: state.mood === 'earth' ? 'Beat-up canvas' : 'Black sneakers', type: 'signature' },
      { number: '03', title: 'THE AFTER DARK', tee: darkTee, bottom: darkBottom, shoes: 'Silver hardware / black sneakers', type: 'after-dark' },
    ];
  }

  function toneReason() {
    if (state.undertone === 'warm') return 'Earth-leaning and warm-muted tones';
    if (state.undertone === 'cool') return 'Cooler deep neutrals and blue-green tones';
    if (state.undertone === 'neutral') return 'Balanced neutrals with room for both temperature directions';
    return 'Balanced, low-noise neutrals that stay easy to build around';
  }

  function contrastReason() {
    if (state.contrast === 'high') return 'The darker/lighter split gives the eye a clear point of focus.';
    if (state.contrast === 'balanced') return 'One controlled contrast gives the outfit energy without making it feel busy.';
    return 'Adjacent tones keep the palette quiet and let the oversized shape do the talking.';
  }

  function silhouetteReason() {
    const heightText = {
      'under-165': 'A closer colour relationship helps keep the line continuous.',
      '165-173': 'A clean transition between top and bottom keeps the silhouette intentional.',
      '174-183': 'You can move between tonal and contrasting combinations with ease.',
      '184-plus': 'More visual volume and stronger colour blocking can sit comfortably on the frame.',
      'balanced-height': 'A clean transition between top and bottom keeps the silhouette intentional.',
    }[state.height];
    const frameText = {
      lean: 'Layered tones or a mid-depth tee add visual texture around a narrow upper frame.',
      broad: 'Keeping the upper half controlled and giving the lower half some weight balances the silhouette.',
      fuller: 'Controlled contrast and structured volume keep the fit considered rather than simply larger.',
      balanced: 'You have flexibility to play with contrast, texture and proportion.',
      'not-sure': 'The volume stays intentional: relaxed below, clean through the tee line.',
    }[state.frame];
    return `${heightText} ${frameText}`;
  }

  function lookWhy(look) {
    if (look.type === 'after-dark') return `Deep charcoal and black create controlled contrast without overpowering the face. ${silhouetteReason()}`;
    if (look.type === 'signature') return `${look.tee} gives the palette its point of view; ${look.bottom} keeps it grounded. ${contrastReason()}`;
    return `${toneReason()} make ${look.tee} + ${look.bottom} an easy starting point. ${silhouetteReason()}`;
  }

  function shopLink(name) {
    const productColour = colourData(name).product;
    if (!productColour || !productLinks[productColour]) return '';
    return `<a class="look-shop" href="${productLinks[productColour]}">SHOP ${productColour.toUpperCase()} ↗</a>`;
  }

  function swatch(name) {
    const colour = colourData(name);
    const isLight = colour.depth === 'light';
    return `<div class="palette-swatch ${isLight ? 'is-light' : 'is-dark'}" style="background:${colour.hex}"><small>${colour.depth.toUpperCase()} / ${colour.tone.toUpperCase()}</small><strong>${name}</strong>${shopLink(name)}</div>`;
  }

  function renderLook(look) {
    const tee = colourData(look.tee);
    const bottom = colourData(look.bottom);
    return `<article class="generated-look"><span>${look.number} / ${look.type.replace('-', ' ').toUpperCase()}</span><h4>${look.title}</h4><div class="look-items"><p><span>TEE</span><span>${look.tee}</span></p><p><span>BOTTOM</span><span>${look.bottom}</span></p><p><span>SHOES</span><span>${look.shoes}</span></p><p class="look-why"><span>WHY IT WORKS</span><span>${lookWhy(look)}</span></p>${(tee.product || bottom.product) ? shopLink(tee.product ? look.tee : look.bottom) : ''}</div></article>`;
  }

  function render() {
    const palette = getPalette();
    const outfits = getOutfits();
    const resultMood = root.querySelector('[data-result-mood]');
    const resultSwatches = root.querySelector('[data-palette-swatches]');
    const resultLooks = root.querySelector('[data-look-grid]');
    const profileNote = root.querySelector('[data-profile-note]');
    if (!resultSwatches || !resultLooks) return;

    resultSwatches.innerHTML = swatch(palette.tee) + swatch(palette.bottom) + swatch(palette.accent);
    resultLooks.innerHTML = outfits.map(renderLook).join('');
    if (resultMood) resultMood.textContent = `${state.mood.toUpperCase()} / ${state.contrast.toUpperCase()} CONTRAST`;
    if (profileNote) {
      profileNote.textContent = state.undertone === 'not-sure' || state.frame === 'not-sure'
        ? 'A broad-compatibility edit, with room to make it yours.'
        : 'A starting point shaped around your selections, never a set of rules.';
    }
  }

  function updateButtons(field) {
    root.querySelectorAll(`[data-field="${field}"]`).forEach((button) => {
      const selected = button.dataset.value === state[field];
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  root.querySelectorAll('[data-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      const field = button.dataset.field;
      state[field] = button.dataset.value;
      updateButtons(field);
      render();
    });
  });

  root.querySelector('[data-reset]')?.addEventListener('click', () => {
    Object.assign(state, defaults);
    Object.keys(defaults).forEach(updateButtons);
    render();
  });

  root.querySelector('[data-universal]')?.addEventListener('click', () => {
    Object.assign(state, defaults);
    Object.keys(defaults).forEach(updateButtons);
    render();
    root.querySelector('#style-tool')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });

  root.querySelector('.style-lab-start')?.addEventListener('click', (event) => {
    event.preventDefault();
    root.querySelector('#style-tool')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });

  Object.keys(defaults).forEach(updateButtons);
  render();
})();
