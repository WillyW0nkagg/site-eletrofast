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

// Loja: filtro de categoria
const categoryFilter = document.querySelector('.category-filter');
if (categoryFilter) {
  const filterButtons = categoryFilter.querySelectorAll('button[data-filter]');
  const allToggleButtons = categoryFilter.querySelectorAll('button');
  const productCards = document.querySelectorAll('.product-card');
  const filterDropdown = categoryFilter.querySelector('.filter-dropdown');
  const filterDropdownTrigger = categoryFilter.querySelector('.filter-dropdown-trigger');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      allToggleButtons.forEach((b) => b.classList.remove('is-active'));
      button.classList.add('is-active');
      if (filterDropdownTrigger && button.closest('.filter-dropdown-menu')) {
        filterDropdownTrigger.classList.add('is-active');
      }
      filterDropdown?.classList.remove('is-open');
      const filter = button.dataset.filter;
      productCards.forEach((card) => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  filterDropdownTrigger?.addEventListener('click', (e) => {
    e.preventDefault();
    filterDropdown.classList.toggle('is-open');
  });
  document.addEventListener('click', (e) => {
    if (filterDropdown && !e.target.closest('.filter-dropdown')) {
      filterDropdown.classList.remove('is-open');
    }
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
