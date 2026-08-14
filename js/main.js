// Background videos: respect reduced-motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('video[autoplay]').forEach((video) => {
    video.removeAttribute('autoplay');
    video.pause();
  });
}

// Header scroll shadow + hide on scroll down, reveal on scroll up
const header = document.querySelector('.site-header');
let lastScrollY = window.scrollY;
const onScroll = () => {
  if (!header) return;
  const y = window.scrollY;
  header.classList.toggle('is-scrolled', y > 8);

  const menuIsOpen = header.querySelector('.menu-toggle')?.classList.contains('is-open');
  if (menuIsOpen || y <= parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h'))) {
    header.classList.remove('is-hidden');
  } else if (y > lastScrollY) {
    header.classList.add('is-hidden');
  } else if (y < lastScrollY) {
    header.classList.remove('is-hidden');
  }
  lastScrollY = y;
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile nav toggle
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.classList.toggle('is-open');
    mobileNav.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('is-open');
      mobileNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// WhatsApp CTA submenu (eletroportáteis x linha premium): tap-to-toggle for touch devices
document.querySelectorAll('.wa-dropdown').forEach((dropdown) => {
  const trigger = dropdown.querySelector('.wa-dropdown-trigger');
  trigger?.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = dropdown.classList.contains('is-open');
    document.querySelectorAll('.wa-dropdown.is-open').forEach((d) => d.classList.remove('is-open'));
    if (!isOpen) dropdown.classList.add('is-open');
  });
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.wa-dropdown')) {
    document.querySelectorAll('.wa-dropdown.is-open').forEach((d) => d.classList.remove('is-open'));
  }
});

// FAQ accordion
document.querySelectorAll('.faq-item').forEach((item) => {
  const question = item.querySelector('.faq-question');
  question?.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');
    item.parentElement?.querySelectorAll('.faq-item').forEach((other) => {
      other.classList.remove('is-open');
      other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('is-open');
      question.setAttribute('aria-expanded', 'true');
    }
  });
});

// Reveal on scroll
const revealTargets = document.querySelectorAll('.reveal, .reveal-stagger');
if ('IntersectionObserver' in window && revealTargets.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px -60px 0px' }
  );
  revealTargets.forEach((el) => observer.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('is-visible'));
}

// Loja: filtro master (Peças / Equipamentos) + subcategoria
const masterFilter = document.querySelector('.master-filter');
if (masterFilter) {
  const masterButtons = masterFilter.querySelectorAll('.master-filter-btn');
  const subFilterGroups = document.querySelectorAll('.category-filter[data-master-group]');
  const productCards = document.querySelectorAll('.product-card');
  const pecaCategories = [
    'pecas-para-air-fryer',
    'pecas-para-ar-condicionado',
    'pecas-para-aspirador',
    'pecas-para-cooktop',
    'correiaparapanificadora',
    'pecas-para-purificador-de-agua',
    'peca-par-ventilador',
  ];

  const applyFilter = (filter, master) => {
    productCards.forEach((card) => {
      const cat = card.dataset.category;
      let show;
      if (filter && filter !== 'all') {
        show = cat === filter;
      } else if (master === 'pecas') {
        show = pecaCategories.includes(cat);
      } else if (master === 'equipamentos') {
        show = !pecaCategories.includes(cat);
      } else {
        show = true;
      }
      card.style.display = show ? '' : 'none';
    });
  };

  masterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      masterButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const master = btn.dataset.master;
      subFilterGroups.forEach((group) => {
        const isMatch = group.dataset.masterGroup === master;
        group.hidden = !isMatch;
        if (isMatch) {
          group.querySelectorAll('button').forEach((b) => b.classList.remove('is-active'));
          group.querySelector('button[data-filter="all"]')?.classList.add('is-active');
        }
      });
      applyFilter('all', master);
    });
  });

  subFilterGroups.forEach((group) => {
    group.querySelectorAll('button[data-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        group.querySelectorAll('button').forEach((b) => b.classList.remove('is-active'));
        button.classList.add('is-active');
        applyFilter(button.dataset.filter, group.dataset.masterGroup);
      });
    });
  });
}

// Footer year
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

// Contact form -> opens WhatsApp with the filled details (no backend available yet)
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = (data.get('nome') || '').toString().trim();
    const unit = (data.get('unidade') || '').toString().trim();
    const message = (data.get('mensagem') || '').toString().trim();
    const lines = [
      'Olá! Vim pelo formulário do site da Eletro Fast.',
      name && `Nome: ${name}`,
      unit && `Unidade de preferência: ${unit}`,
      message && `Mensagem: ${message}`,
    ].filter(Boolean);
    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/554133624152?text=${text}`, '_blank', 'noopener');
  });
}

// Mapa das unidades (Leaflet)
const unitsMapEl = document.getElementById('units-map');
if (unitsMapEl && typeof L !== 'undefined') {
  const units = [
    {
      slug: 'unidade-cabral',
      name: 'Eletro Fast Cabral',
      lat: -25.4049148,
      lng: -49.2464298,
      address: 'Av. Munhoz da Rocha, 1509 — Curitiba/PR',
      hours: 'Seg. a sex.: 09h–18h · Sáb.: 09h–13h',
      mapsQuery: 'Av.+Munhoz+da+Rocha,+1509,+Curitiba',
      waText: 'Ol%C3%A1!%20Quero%20falar%20com%20a%20unidade%20Cabral.',
    },
    {
      slug: 'unidade-alto-da-xv',
      name: 'Eletro Fast Alto da XV',
      lat: -25.427369083789582,
      lng: -49.25044208498587,
      address: 'Rua XV de Novembro, 2676 — ao lado do Banco do Brasil — Curitiba/PR',
      hours: 'Seg. a sex.: 09h–18h · Sáb.: 09h–13h · Estacionamento próprio',
      mapsQuery: 'Rua+XV+de+Novembro,+2676,+Curitiba',
      waText: 'Ol%C3%A1!%20Quero%20falar%20com%20a%20unidade%20Alto%20da%20XV.',
    },
    {
      slug: 'unidade-reboucas',
      name: 'Eletro Fast Rebouças',
      lat: -25.45103798377873,
      lng: -49.26891978585548,
      address: 'Rua Alferes Poli, 1712 — esquina com Rua Chile — Curitiba/PR',
      hours: 'Seg. a sex.: 09h–18h · Sáb.: 09h–13h',
      mapsQuery: 'Rua+Alferes+Poli,+1712,+Curitiba',
      waText: 'Ol%C3%A1!%20Quero%20falar%20com%20a%20unidade%20Rebou%C3%A7as.',
    },
    {
      slug: 'unidade-sao-braz',
      name: 'Eletro Fast São Braz',
      lat: -25.414711983795474,
      lng: -49.34295768498619,
      address: 'Rua Antônio Escorsin, 1086 — em frente à Tintas Vergínia — Curitiba/PR',
      hours: 'Seg. a sex.: 09h–18h · Sáb.: 09h–13h',
      mapsQuery: 'Rua+Ant%C3%B4nio+Escorsin,+1086,+Curitiba',
      waText: 'Ol%C3%A1!%20Quero%20falar%20com%20a%20unidade%20S%C3%A3o%20Braz.',
    },
    {
      slug: 'unidade-sitio-cercado',
      name: 'Eletro Fast Sítio Cercado',
      lat: -25.544929243698046,
      lng: -49.26085028492555,
      address: 'Rua São José dos Pinhais, 1653 — Curitiba/PR',
      hours: 'Seg. a sex.: 09h–18h · Sáb.: 09h–13h · Estacionamento próprio',
      mapsQuery: 'Rua+S%C3%A3o+Jos%C3%A9+dos+Pinhais,+1653,+Curitiba',
      waText: 'Ol%C3%A1!%20Quero%20falar%20com%20a%20unidade%20S%C3%ADtio%20Cercado.',
    },
  ];

  const iconBase = unitsMapEl.dataset.iconBase || 'img/logo-icone.png';

  const unitIcon = L.divIcon({
    className: 'unit-pin-icon',
    html: `<div class="unit-pin"><div class="unit-pin__badge"><img src="${iconBase}" alt=""></div><div class="unit-pin__tail"></div></div>`,
    iconSize: [40, 52],
    iconAnchor: [20, 52],
    popupAnchor: [0, -50],
    tooltipAnchor: [0, -30],
  });

  const map = L.map(unitsMapEl, { scrollWheelZoom: false }).setView([-25.457, -49.283], 11.3);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  const markersBySlug = {};
  units.forEach((unit) => {
    const marker = L.marker([unit.lat, unit.lng], { icon: unitIcon, title: unit.name }).addTo(map);
    marker.bindTooltip(
      `<span class="unit-pin-tooltip">${unit.name.replace('Eletro Fast ', '')}<span class="tooltip-address">${unit.address}</span></span>`,
      { direction: 'top', offset: [0, -6] }
    );
    marker.bindPopup(`
      <div class="unit-popup">
        <h3>${unit.name}</h3>
        <address>${unit.address}</address>
        <p class="unit-popup-hours">${unit.hours}</p>
        <div class="store-actions">
          <a class="btn btn-sm btn-outline-dark" href="https://www.google.com/maps/search/?api=1&query=${unit.mapsQuery}" target="_blank" rel="noopener">Como chegar</a>
          <a class="btn btn-sm btn-ghost" href="https://wa.me/5541984811513?text=${unit.waText}" target="_blank" rel="noopener">Falar com esta unidade</a>
        </div>
      </div>
    `);
    markersBySlug[unit.slug] = marker;
  });

  const hashSlug = window.location.hash.replace('#', '');
  if (markersBySlug[hashSlug]) {
    const target = markersBySlug[hashSlug];
    map.setView(target.getLatLng(), 14);
    target.openPopup();
  }
}
