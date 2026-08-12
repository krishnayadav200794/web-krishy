(() => {
  'use strict';

  const { API_BASE_URL, RESTAURANT_WHATSAPP_NUMBER, RESTAURANT_PHONE_DISPLAY } = window.SITE_CONFIG;

  const waLink = (message) => `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  // ---------------------------------------------------------------------
  // Header scroll state + mobile nav
  // ---------------------------------------------------------------------
  const header = document.getElementById('siteHeader');
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');

  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  });

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => navLinks.classList.remove('is-open'))
  );

  // ---------------------------------------------------------------------
  // Scroll reveal animations
  // ---------------------------------------------------------------------
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // ---------------------------------------------------------------------
  // WhatsApp links (hero, contact, footer, floating button)
  // ---------------------------------------------------------------------
  const genericWaMessage = "Hi Shree Balaji Pure Veg, I'd like to know more.";
  ['heroWaBtn', 'contactWaLink', 'footerWaLink', 'fabWaLink'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = waLink(genericWaMessage);
  });
  const callLink = document.getElementById('contactCallLink');
  if (callLink) callLink.textContent = RESTAURANT_PHONE_DISPLAY;

  // ---------------------------------------------------------------------
  // Toast helper
  // ---------------------------------------------------------------------
  const toastEl = document.getElementById('toast');
  let toastTimer;
  const showToast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 3200);
  };

  // ---------------------------------------------------------------------
  // Menu + cart
  // ---------------------------------------------------------------------
  const FALLBACK_MENU = [
    { _id: 'f1', name: 'Paneer Butter Masala', category: 'North Indian', price: 260, description: 'Cottage cheese in a rich tomato-butter gravy', isTodaysSpecial: true },
    { _id: 'f2', name: 'Dal Makhani', category: 'North Indian', price: 220, description: 'Slow-cooked black lentils finished with cream' },
    { _id: 'f3', name: 'Masala Dosa', category: 'South Indian', price: 140, description: 'Crisp rice crepe, spiced potato filling' },
    { _id: 'f4', name: 'Idli Sambar', category: 'South Indian', price: 110, description: '4 pieces, served with coconut chutney' },
    { _id: 'f5', name: 'Veg Manchurian', category: 'Chinese', price: 210, description: 'Crispy vegetable balls tossed in a tangy sauce' },
    { _id: 'f6', name: 'Veg Hakka Noodles', category: 'Chinese', price: 190, description: 'Wok-tossed noodles with fresh vegetables' },
    { _id: 'f7', name: 'Amritsari Chole', category: 'Punjabi', price: 210, description: 'Spiced chickpeas, Punjabi-style' },
    { _id: 'f8', name: 'Samosa (2 pcs)', category: 'Snacks', price: 60, description: 'Crisp pastry, spiced potato filling' },
    { _id: 'f9', name: 'Masala Chaas', category: 'Beverages', price: 50, description: 'Spiced buttermilk' },
    { _id: 'f10', name: 'Shree Balaji Special Thali', category: 'Thali', price: 320, description: 'Unlimited thali, seasonal preparations', isTodaysSpecial: true },
  ];

  const menuTabsEl = document.getElementById('menuTabs');
  const menuGridEl = document.getElementById('menuGrid');
  const cartListEl = document.getElementById('cartList');
  const cartTotalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const orderForm = document.getElementById('orderForm');

  let menuData = [];
  let activeCategory = 'All';
  const cart = new Map(); // menuItemId -> { name, price, quantity }

  const renderTabs = () => {
    const categories = ['All', ...new Set(menuData.map((m) => m.category))];
    menuTabsEl.innerHTML = categories
      .map(
        (cat) =>
          `<button type="button" class="menu-tab${cat === activeCategory ? ' is-active' : ''}" data-cat="${cat}">${cat}</button>`
      )
      .join('');

    menuTabsEl.querySelectorAll('.menu-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.cat;
        renderTabs();
        renderMenu();
      });
    });
  };

  const renderMenu = () => {
    const items = activeCategory === 'All' ? menuData : menuData.filter((m) => m.category === activeCategory);

    menuGridEl.style.setProperty('--i', 0);
    menuGridEl.innerHTML = items
      .map((item, i) => {
        const qty = cart.get(item._id)?.quantity || 0;
        return `
        <article class="menu-card" style="--i:${i}">
          <div class="menu-card-top">
            <div class="veg-mark" aria-label="Vegetarian"></div>
            ${item.isTodaysSpecial ? '<span class="special-pill">Today\'s Special</span>' : ''}
          </div>
          <h3 class="menu-card-name">${item.name}</h3>
          <p class="menu-card-desc">${item.description || ''}</p>
          <div class="menu-card-actions">
            <span class="menu-card-price">₹${item.price}</span>
            <div class="qty-stepper" data-id="${item._id}">
              <button type="button" data-action="dec" aria-label="Decrease quantity">−</button>
              <span data-qty>${qty}</span>
              <button type="button" data-action="inc" aria-label="Increase quantity">+</button>
            </div>
          </div>
        </article>`;
      })
      .join('');

    menuGridEl.querySelectorAll('.qty-stepper').forEach((stepper) => {
      const id = stepper.dataset.id;
      const item = menuData.find((m) => m._id === id);
      stepper.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
          const current = cart.get(id)?.quantity || 0;
          const next = btn.dataset.action === 'inc' ? current + 1 : Math.max(0, current - 1);
          if (next === 0) cart.delete(id);
          else cart.set(id, { name: item.name, price: item.price, quantity: next });
          stepper.querySelector('[data-qty]').textContent = next;
          renderCart();
        });
      });
    });
  };

  const renderCart = () => {
    if (cart.size === 0) {
      cartListEl.innerHTML = '<p class="cart-empty">Your cart is empty. Add a dish to get started.</p>';
      checkoutBtn.disabled = true;
      cartTotalEl.textContent = '₹0';
      orderForm.style.display = 'none';
      return;
    }

    let total = 0;
    cartListEl.innerHTML = [...cart.entries()]
      .map(([id, line]) => {
        total += line.price * line.quantity;
        return `<div class="cart-line"><span class="cart-line-name">${line.quantity} × ${line.name}</span><span>₹${line.price * line.quantity}</span></div>`;
      })
      .join('');
    cartTotalEl.textContent = `₹${total}`;
    checkoutBtn.disabled = false;
  };

  checkoutBtn.addEventListener('click', () => {
    orderForm.style.display = orderForm.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('orderType').addEventListener('change', (e) => {
    document.getElementById('addressRow').style.display = e.target.value === 'pickup' ? 'none' : 'flex';
    document.getElementById('orderAddress').required = e.target.value !== 'pickup';
  });

  const loadMenu = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/menu`);
      if (!res.ok) throw new Error('menu fetch failed');
      const json = await res.json();
      menuData = json.data && json.data.length ? json.data : FALLBACK_MENU;
    } catch (err) {
      menuData = FALLBACK_MENU; // backend not reachable yet - keep the page fully usable
    }
    renderTabs();
    renderMenu();
  };
  loadMenu();

  // ---------------------------------------------------------------------
  // Generic form feedback renderer
  // ---------------------------------------------------------------------
  const setFeedback = (el, type, html) => {
    el.className = `form-feedback is-${type}`;
    el.innerHTML = html;
  };

  // ---------------------------------------------------------------------
  // Food order submit
  // ---------------------------------------------------------------------
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const feedback = document.getElementById('orderFeedback');
    const submitBtn = orderForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    const payload = {
      customerName: document.getElementById('orderName').value.trim(),
      phone: document.getElementById('orderPhone').value.trim(),
      orderType: document.getElementById('orderType').value,
      deliveryAddress: document.getElementById('orderAddress').value.trim() || 'Self pickup',
      items: [...cart.entries()].map(([menuItemId, line]) => ({ menuItemId, quantity: line.quantity })),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Could not place order');

      setFeedback(
        feedback,
        'success',
        `Order placed! Estimated prep time: ~${json.data.estimatedPrepMinutes} mins.<br/>
         <a class="wa-link" href="${json.whatsappLinks.notifyRestaurant}" target="_blank" rel="noopener">Tap to notify us on WhatsApp →</a>`
      );
      cart.clear();
      renderCart();
      renderMenu();
      orderForm.reset();
      showToast('Order placed successfully!');
    } catch (err) {
      setFeedback(feedback, 'error', err.message || 'Something went wrong. Please try again or call us directly.');
    } finally {
      submitBtn.disabled = false;
    }
  });

  // ---------------------------------------------------------------------
  // Booking tabs (Table vs Party)
  // ---------------------------------------------------------------------
  const tablePanel = document.getElementById('tableBookingPanel');
  const partyPanel = document.getElementById('partyBookingPanel');
  document.querySelectorAll('[data-booktab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-booktab]').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const isTable = btn.dataset.booktab === 'table';
      tablePanel.style.display = isTable ? 'block' : 'none';
      partyPanel.style.display = isTable ? 'none' : 'block';
    });
  });

  // ---------------------------------------------------------------------
  // Table booking submit
  // ---------------------------------------------------------------------
  document.getElementById('tableBookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const feedback = document.getElementById('tbFeedback');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    const payload = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      guests: Number(form.guests.value),
      date: form.date.value,
      time: form.time.value,
      specialRequest: form.specialRequest.value.trim(),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Could not complete booking');

      const rescheduleNote = json.wasRescheduled
        ? `<br/>Your requested time (${json.requestedTime}) was full — we've booked you for <strong>${json.data.time}</strong> instead.`
        : '';

      setFeedback(
        feedback,
        json.wasRescheduled ? 'info' : 'success',
        `Booking received for ${json.data.date} at ${json.data.time}, ${json.data.guests} guest(s).${rescheduleNote}<br/>
         <a class="wa-link" href="${json.whatsappLinks.notifyRestaurant}" target="_blank" rel="noopener">Tap to notify the restaurant on WhatsApp →</a>`
      );
      form.reset();
      showToast('Table booking submitted!');
    } catch (err) {
      setFeedback(feedback, 'error', err.message || 'Something went wrong. Please try again or call us directly.');
    } finally {
      submitBtn.disabled = false;
    }
  });

  // ---------------------------------------------------------------------
  // Party hall booking submit
  // ---------------------------------------------------------------------
  document.getElementById('partyBookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const feedback = document.getElementById('pbFeedback');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    const payload = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      date: form.date.value,
      guests: Number(form.guests.value),
      eventType: form.eventType.value,
      budget: form.budget.value.trim(),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/party-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Could not send enquiry');

      setFeedback(
        feedback,
        'success',
        `Enquiry sent! Our team will confirm availability for ${json.data.date}.<br/>
         <a class="wa-link" href="${json.whatsappLinks.notifyRestaurant}" target="_blank" rel="noopener">Tap to notify the restaurant on WhatsApp →</a>`
      );
      form.reset();
      showToast('Party hall enquiry sent!');
    } catch (err) {
      setFeedback(feedback, 'error', err.message || 'Something went wrong. Please try again or call us directly.');
    } finally {
      submitBtn.disabled = false;
    }
  });

  // ---------------------------------------------------------------------
  // Misc
  // ---------------------------------------------------------------------
  document.getElementById('year').textContent = new Date().getFullYear();
})();
