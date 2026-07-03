/* ============================================================
   WIBE Digital Hub — Main JavaScript
   Premium Agency Website Interactions
   Modern ES6+ · Zero Dependencies · Production-Ready
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     1. MOBILE MENU TOGGLE
     Hamburger animation, overlay menu, close behaviors
  ---------------------------------------------------------- */
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu a');

  const openMenu = () => {
    mobileMenu?.classList.add('active');
    mobileToggle?.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    mobileMenu?.classList.remove('active');
    mobileToggle?.classList.remove('active');
    document.body.style.overflow = '';
  };

  const toggleMenu = () => {
    const isOpen = mobileMenu?.classList.contains('active');
    isOpen ? closeMenu() : openMenu();
  };

  mobileToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close menu when any nav link inside it is clicked
  mobileLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu when clicking outside of it
  document.addEventListener('click', (e) => {
    if (
      mobileMenu?.classList.contains('active') &&
      !mobileMenu.contains(e.target) &&
      !mobileToggle?.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu?.classList.contains('active')) {
      closeMenu();
    }
  });


  /* ----------------------------------------------------------
     2. SCROLL-BASED NAVBAR
     Adds .scrolled class after 50px for background/shadow shift
  ---------------------------------------------------------- */
  const navbar = document.querySelector('.navbar');
  let lastScrollState = false;

  const handleNavbarScroll = () => {
    const shouldBeScrolled = window.scrollY > 50;
    if (shouldBeScrolled !== lastScrollState) {
      lastScrollState = shouldBeScrolled;
      if (shouldBeScrolled) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    }
  };

  // Fire once on load to catch refreshes mid-page
  handleNavbarScroll();

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });


  /* ----------------------------------------------------------
     3. INTERSECTION OBSERVER — REVEAL ANIMATIONS
     Fade-in / slide-up for .reveal elements with stagger
  ---------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;

            // Stagger: find sibling .reveal elements within the same parent section
            const parent = el.closest('section') || el.parentElement;
            const siblings = parent
              ? Array.from(parent.querySelectorAll('.reveal'))
              : [];
            const index = siblings.indexOf(el);
            const staggerDelay = index >= 0 ? index * 0.1 : 0;

            el.style.transitionDelay = `${staggerDelay}s`;
            el.classList.add('active');

            // Animate only once
            revealObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }


  /* ----------------------------------------------------------
     4. ANIMATED COUNTERS
     Counts from 0 → data-target with easeOutQuad easing
     Handles + and % suffixes
  ---------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-target]');

  /**
   * easeOutQuad — decelerating curve for natural counting feel
   * @param {number} t — progress (0–1)
   * @returns {number}
   */
  const easeOutQuad = (t) => t * (2 - t);

  /**
   * Animate a counter element from 0 to its data-target value
   * @param {HTMLElement} el
   */
  const animateCounter = (el) => {
    const raw = el.getAttribute('data-target') || '0';

    // Handle special non-numeric targets like "24/7"
    if (!/\d/.test(raw) || raw === '24/7') {
      el.textContent = raw;
      return;
    }

    // Determine suffix (+, %, M+, etc.)
    let suffix = '';
    let numericStr = raw;

    if (raw.endsWith('M+')) {
      suffix = 'M+';
      numericStr = raw.replace('M+', '');
    } else if (raw.endsWith('+')) {
      suffix = '+';
      numericStr = raw.replace('+', '');
    } else if (raw.endsWith('%')) {
      suffix = '%';
      numericStr = raw.replace('%', '');
    }

    const target = parseInt(numericStr.replace(/[^0-9]/g, ''), 10);
    if (isNaN(target) || target === 0) {
      el.textContent = raw;
      return;
    }

    // Determine prefix ($ for revenue, etc.)
    let prefix = '';
    if (suffix === 'M+') prefix = '$';

    const duration = 2000; // ms
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuad(progress);
      const current = Math.round(easedProgress * target);

      el.textContent = prefix + current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  if (counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  }


  /* ----------------------------------------------------------
     5. SMOOTH SCROLLING
     All # anchor links scroll smoothly with navbar offset
  ---------------------------------------------------------- */
  const NAV_OFFSET = 80; // px — matches fixed navbar height

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const targetEl = document.querySelector(href);
      if (!targetEl) return;

      e.preventDefault();

      // Close mobile menu if open
      closeMenu();

      const targetPosition =
        targetEl.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });

      // Update URL hash without jumping
      if (history.pushState) {
        history.pushState(null, null, href);
      }
    });
  });


  /* ----------------------------------------------------------
     6. FORM VALIDATION & HANDLING
     Inline error messages with success state feedback
  ---------------------------------------------------------- */
  const contactForm = document.querySelector('.contact-form');

  /**
   * Validation rules for each field
   */
  const validators = {
    name: {
      validate: (value) => value.trim().length >= 2,
      message: 'Name must be at least 2 characters.',
    },
    email: {
      validate: (value) =>
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
          value.trim()
        ),
      message: 'Please enter a valid email address.',
    },
    phone: {
      validate: (value) => {
        if (!value.trim()) return true; // optional field
        return /^[\+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,}$/.test(value.trim());
      },
      message: 'Please enter a valid phone number.',
    },
    service: {
      validate: (value) => value.trim().length > 0 && value.trim() !== '',
      message: 'Please select a service.',
    },
    message: {
      validate: (value) => value.trim().length >= 10,
      message: 'Message must be at least 10 characters.',
    },
  };

  /**
   * Show an inline error for a form group
   * @param {HTMLElement} field
   * @param {string} message
   */
  const showError = (field, message) => {
    const group = field.closest('.form-group');
    if (!group) return;

    // Remove existing error message
    clearError(field);

    group.classList.add('error');

    const errorSpan = document.createElement('span');
    errorSpan.className = 'error-message';
    errorSpan.textContent = message;
    errorSpan.setAttribute('role', 'alert');
    group.appendChild(errorSpan);
  };

  /**
   * Clear the error state from a form group
   * @param {HTMLElement} field
   */
  const clearError = (field) => {
    const group = field.closest('.form-group');
    if (!group) return;

    group.classList.remove('error');
    const existing = group.querySelector('.error-message');
    if (existing) existing.remove();
  };

  /**
   * Validate a single field
   * @param {HTMLElement} field
   * @returns {boolean}
   */
  const validateField = (field) => {
    const fieldName = field.getAttribute('name') || field.getAttribute('id') || '';
    const rule = validators[fieldName];
    if (!rule) return true;

    const isValid = rule.validate(field.value);
    if (!isValid) {
      showError(field, rule.message);
    } else {
      clearError(field);
    }
    return isValid;
  };

  if (contactForm) {
    // Clear errors on field focus
    contactForm.querySelectorAll('input, select, textarea').forEach((field) => {
      field.addEventListener('focus', () => clearError(field));
      field.addEventListener('input', () => {
        // Live clear if previously had error
        if (field.closest('.form-group')?.classList.contains('error')) {
          clearError(field);
        }
      });
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fields = contactForm.querySelectorAll(
        'input, select, textarea'
      );
      let isFormValid = true;

      fields.forEach((field) => {
        const fieldValid = validateField(field);
        if (!fieldValid) isFormValid = false;
      });

      if (!isFormValid) {
        // Scroll first error into view
        const firstError = contactForm.querySelector('.form-group.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // ✓ Validation passed — show success state
      const submitBtn = contactForm.querySelector('.submit-btn');

      if (submitBtn) {
        const btnTextEl = submitBtn.querySelector('.btn-text');
        const btnIconEl = submitBtn.querySelector('.btn-icon');
        const originalBtnText = btnTextEl ? btnTextEl.textContent : '';
        const originalBtnIcon = btnIconEl ? btnIconEl.textContent : '';

        submitBtn.classList.add('success');
        submitBtn.disabled = true;

        if (btnTextEl) btnTextEl.textContent = 'Message Sent!';
        if (btnIconEl) btnIconEl.textContent = '✓';

        // Reset form after 3 seconds
        setTimeout(() => {
          contactForm.reset();
          submitBtn.classList.remove('success');
          submitBtn.disabled = false;

          if (btnTextEl) btnTextEl.textContent = originalBtnText;
          if (btnIconEl) btnIconEl.textContent = originalBtnIcon;
        }, 3000);
      } else {
        // No submit button found — just reset
        setTimeout(() => contactForm.reset(), 3000);
      }
    });
  }


  /* ----------------------------------------------------------
     7. PARALLAX FLOATING ELEMENTS
     Subtle mouse-driven movement on hero section
  ---------------------------------------------------------- */
  const hero = document.querySelector('.hero');
  const floatingElements = document.querySelectorAll('.floating-element');

  if (hero && floatingElements.length) {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;
    const PARALLAX_INTENSITY = 0.03; // subtle movement multiplier
    const LERP_FACTOR = 0.08; // smoothing speed (0–1)

    const updateParallax = () => {
      // Lerp towards target for buttery-smooth movement
      currentX += (mouseX - currentX) * LERP_FACTOR;
      currentY += (mouseY - currentY) * LERP_FACTOR;

      floatingElements.forEach((el, index) => {
        // Alternate direction & vary intensity per element
        const direction = index % 2 === 0 ? 1 : -1;
        const intensityMultiplier = 1 + index * 0.3;
        const tx = currentX * PARALLAX_INTENSITY * direction * intensityMultiplier;
        const ty = currentY * PARALLAX_INTENSITY * direction * intensityMultiplier;

        el.style.transform = `translate(${tx}px, ${ty}px)`;
      });

      rafId = requestAnimationFrame(updateParallax);
    };

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      // Normalize to center-relative coords (-1 to 1 range scaled by element size)
      mouseX = (e.clientX - rect.left - rect.width / 2);
      mouseY = (e.clientY - rect.top - rect.height / 2);
    });

    hero.addEventListener('mouseenter', () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateParallax);
      }
    });

    hero.addEventListener('mouseleave', () => {
      // Smoothly return to center
      mouseX = 0;
      mouseY = 0;
      // Let the animation loop run until elements settle back
      setTimeout(() => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        // Reset transforms smoothly via CSS transition
        floatingElements.forEach((el) => {
          el.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          el.style.transform = 'translate(0px, 0px)';
          // Remove inline transition after it completes
          setTimeout(() => {
            el.style.transition = '';
          }, 700);
        });
      }, 400);
    });
  }


  /* ----------------------------------------------------------
     8. ACTIVE NAV LINK HIGHLIGHTING
     IntersectionObserver on sections → updates nav link .active
  ---------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar a[href^="#"], .nav-links a[href^="#"]');

  if (sections.length && navLinks.length) {
    const setActiveLink = (sectionId) => {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: `-${NAV_OFFSET}px 0px -35% 0px`,
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }


  /* ----------------------------------------------------------
     BONUS: REDUCED MOTION SUPPORT
     Respects prefers-reduced-motion for accessibility
  ---------------------------------------------------------- */
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  if (prefersReducedMotion.matches) {
    // Instantly reveal all animated elements
    revealElements.forEach((el) => {
      el.style.transition = 'none';
      el.classList.add('active');
    });

    // Disable parallax
    if (hero) {
      hero.style.pointerEvents = 'none';
    }
  }

}); // end DOMContentLoaded
