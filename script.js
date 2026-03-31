/* =============================================
   THE URBAN ALCHEMIST — JavaScript
   Menu ordering UI, cart, scroll, nav
   ============================================= */

// ── Mobile Navigation ──
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileNav.classList.toggle('active');
  document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
});

function closeMobileNav() {
  hamburger.classList.remove('active');
  mobileNav.classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileNav.classList.contains('active')) closeMobileNav();
});


// ── Navbar scroll effect & Hero Parallax ──
const nav = document.getElementById('nav');
const heroImg = document.querySelector('.hero-bg img');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Nav styling
  if (scrollY > 50) {
    nav.style.background = 'rgba(10, 10, 10, 0.95)';
    nav.style.borderBottomColor = 'rgba(255,255,255,0.08)';
  } else {
    nav.style.background = 'rgba(10, 10, 10, 0.85)';
    nav.style.borderBottomColor = 'rgba(255,255,255,0.05)';
  }

  // Subtle Hero Parallax — 0.2 rate for cinematic feel
  if (heroImg && scrollY < window.innerHeight) {
    heroImg.style.transform = `translateY(${scrollY * 0.2}px)`;
  }
});


// ── Active nav link on scroll ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function updateActiveNav() {
  const scrollY = window.scrollY + 200;
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) link.classList.add('active');
      });
    }
  });
}

window.addEventListener('scroll', updateActiveNav);


// ── Menu Category Filtering ──
const categoryBtns = document.querySelectorAll('.menu-cat-btn');
const menuCards    = document.querySelectorAll('.menu-card');

categoryBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    categoryBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const category = btn.dataset.category;
    menuCards.forEach((card) => {
      if (category === 'all' || card.dataset.category === category) {
        card.style.display = '';
        setTimeout(() => card.classList.add('visible'), 50);
      } else {
        card.style.display = 'none';
        card.classList.remove('visible');
      }
    });
  });
});


// ══════════════════════════════════════════════
//  CART STATE
// ══════════════════════════════════════════════
const cart = {}; // { id: { name, price, qty } }

function getCartTotal() {
  return Object.values(cart).reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
  return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
}


// ── Cart UI elements ──
const cartFab     = document.getElementById('cartFab');
const cartFabCount    = document.getElementById('cartFabCount');
const cartFabSummary  = document.getElementById('cartFabSummary');
const cartDrawer  = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose   = document.getElementById('cartClose');
const cartItemsEl = document.getElementById('cartItems');
const cartFooter  = document.getElementById('cartFooter');
const cartTotalEl = document.getElementById('cartTotal');


// ── Open / Close Cart Drawer ──
function openCart() {
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  renderCartDrawer();
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

cartFab.addEventListener('click', openCart);
cartOverlay.addEventListener('click', closeCart);
cartClose.addEventListener('click', closeCart);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && cartDrawer.classList.contains('open')) closeCart();
});


// ── Update FAB ──
function updateFab() {
  const count = getCartCount();
  const total = getCartTotal();

  if (count === 0) {
    cartFab.style.display = 'none';
  } else {
    cartFab.style.display = 'flex';
    cartFabCount.textContent  = count;
    cartFabSummary.textContent = `₹${total.toLocaleString('en-IN')}`;
  }
}


// ── Render Cart Drawer ──
function renderCartDrawer() {
  const items = Object.values(cart);

  if (items.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty-msg">Your cart is empty.<br>Add something delicious! ☕</p>';
    cartFooter.style.display = 'none';
    return;
  }

  cartFooter.style.display = 'flex';
  cartTotalEl.textContent = `₹${getCartTotal().toLocaleString('en-IN')}`;

  cartItemsEl.innerHTML = items.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-name">${item.name}</div>
      <div class="cart-item-qty">
        <button class="ci-btn ci-minus" data-id="${item.id}" aria-label="Decrease">−</button>
        <span class="ci-count">${item.qty}</span>
        <button class="ci-btn ci-plus"  data-id="${item.id}" aria-label="Increase">+</button>
      </div>
      <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
      <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">✕</button>
    </div>
  `).join('');

  // Bind drawer qty controls
  cartItemsEl.querySelectorAll('.ci-minus').forEach(btn => {
    btn.addEventListener('click', () => changeCartQty(btn.dataset.id, -1));
  });
  cartItemsEl.querySelectorAll('.ci-plus').forEach(btn => {
    btn.addEventListener('click', () => changeCartQty(btn.dataset.id, +1));
  });
  cartItemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });
}


// ── Cart mutations ──
function addToCart(id, name, price) {
  if (cart[id]) {
    cart[id].qty += 1;
  } else {
    cart[id] = { id, name, price: parseInt(price), qty: 1 };
  }
  syncCardQty(id);
  updateFab();
  bumpFab();  // micro-bounce on FAB
  if (cartDrawer.classList.contains('open')) renderCartDrawer();
}

function changeCartQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) {
    delete cart[id];
    syncCardQty(id, true);
  } else {
    syncCardQty(id);
  }
  updateFab();
  bumpFab();
  renderCartDrawer();
}

function removeFromCart(id) {
  delete cart[id];
  syncCardQty(id, true);
  updateFab();
  renderCartDrawer();
}

// Cart FAB micro-bounce — 120ms in, 100ms out
function bumpFab() {
  cartFab.classList.remove('fab-bump');
  // Force reflow so animation restarts if called repeatedly
  void cartFab.offsetWidth;
  cartFab.classList.add('fab-bump');
  cartFab.addEventListener('animationend', () => {
    cartFab.classList.remove('fab-bump');
  }, { once: true });
}


// ── Sync card qty widget with cart state ──
function syncCardQty(id, removed = false) {
  const qtyEl   = document.getElementById(`qty-${id}`);
  const addBtn  = document.querySelector(`.btn-add-to-cart[data-id="${id}"]`);
  if (!qtyEl || !addBtn) return;

  if (removed || !cart[id]) {
    qtyEl.style.display = 'none';
    addBtn.style.display = '';
    addBtn.classList.remove('added');
  } else {
    qtyEl.style.display = 'flex';
    addBtn.style.display = 'none';
    const countEl = qtyEl.querySelector('.qty-count');
    countEl.textContent = cart[id].qty;
    // Micro-pop on the number — instant confirmation
    countEl.classList.remove('popping');
    void countEl.offsetWidth;
    countEl.classList.add('popping');
    countEl.addEventListener('animationend', () => countEl.classList.remove('popping'), { once: true });
  }
}


// ── Bind card-level Add buttons ──
document.querySelectorAll('.btn-add-to-cart').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card  = btn.closest('.menu-card');
    const id    = btn.dataset.id;
    const name  = card.dataset.name;
    const price = card.dataset.price;

    addToCart(id, name, price);
    // The qty selector appears immediately via syncCardQty;
    // no long flash needed — the UI state change IS the feedback
  });
});


// ── Bind card-level qty widget buttons ──
document.querySelectorAll('.qty-selector').forEach((widget) => {
  const id = widget.id.replace('qty-', '');
  const countEl = widget.querySelector('.qty-count');

  widget.querySelector('.qty-minus').addEventListener('click', () => {
    changeCartQty(id, -1);
    if (cart[id]) countEl.textContent = cart[id].qty;
  });

  widget.querySelector('.qty-plus').addEventListener('click', () => {
    changeCartQty(id, +1);
    if (cart[id]) countEl.textContent = cart[id].qty;
  });
});


// ══════════════════════════════════════════════
//  TESTIMONIAL CAROUSEL
// ══════════════════════════════════════════════
const testimonials = [
  {
    quote: '"The only place in the city where midnight feels like mid-afternoon. The <span class="highlight">Nitro Cold Brew is life-changing.</span>"',
    author: 'Aadhav K.',
    role: 'Verified regular · Software Engineer'
  },
  {
    quote: '"I practically live here during deadline weeks. <span class="highlight">Gigabit WiFi, unlimited power,</span> and the chai never disappoints. Best workspace in Madhapur."',
    author: 'Priya S.',
    role: 'Verified regular · UX Designer'
  },
  {
    quote: '"We come here for team brainstorms every Friday. The <span class="highlight">Paneer Tikka Melt</span> is genuinely the best sandwich in Hyderabad."',
    author: 'Rahul M.',
    role: 'Verified regular · Startup Founder'
  },
  {
    quote: '"As a student pulling all-nighters, this place is a godsend. <span class="highlight">24x7, affordable,</span> and the coffee is actually great — not just serviceable."',
    author: 'Meghana R.',
    role: 'Verified regular · Engineering Student'
  }
];

let currentTestimonial = 0;
const quoteEl  = document.getElementById('testimonialQuote');
const authorEl = document.getElementById('testimonialAuthor');
const roleEl   = document.getElementById('testimonialRole');
const dots     = document.querySelectorAll('.testimonial-dot');

function updateTestimonial(index) {
  currentTestimonial = index;
  const t = testimonials[index];

  quoteEl.style.opacity = '0';
  quoteEl.style.transform = 'translateY(10px)';

  setTimeout(() => {
    quoteEl.innerHTML = t.quote;
    authorEl.textContent = t.author;
    roleEl.textContent = t.role;
    quoteEl.style.opacity = '1';
    quoteEl.style.transform = 'translateY(0)';
  }, 250);

  dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
}

if (quoteEl) quoteEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

dots.forEach((dot) => {
  dot.addEventListener('click', () => updateTestimonial(parseInt(dot.dataset.index)));
});

let testimonialInterval = setInterval(() => {
  updateTestimonial((currentTestimonial + 1) % testimonials.length);
}, 5000);

const testimonialCard = document.getElementById('testimonialCard');
if (testimonialCard) {
  testimonialCard.addEventListener('mouseenter', () => clearInterval(testimonialInterval));
  testimonialCard.addEventListener('mouseleave', () => {
    testimonialInterval = setInterval(() => {
      updateTestimonial((currentTestimonial + 1) % testimonials.length);
    }, 5000);
  });
}


// ── Scroll Reveal Animation ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Check if it's the menu grid for staggered reveal
      if (entry.target.classList.contains('menu-grid')) {
        const cards = entry.target.querySelectorAll('.menu-card');
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('visible');
          }, index * 100); // 100ms stagger
        });
      } else {
        entry.target.classList.add('visible');
      }
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

// Observe sections and the menu grid itself for staggering
document.querySelectorAll('.reveal, .menu-grid').forEach((el) => revealObserver.observe(el));


// ── Smooth Scroll for anchor links ──
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      const offset = 100;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  });
});
