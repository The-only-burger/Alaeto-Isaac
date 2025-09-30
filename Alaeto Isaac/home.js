/* home.js - shared by Home.html, about.html, projects.html, skills.html, contact.html
   - mobile menu toggle
   - highlight nav
   - typing effect (home)
   - project details modal
   - contact form: AJAX submit to contact_submit.php (with nice UX & error handling)
*/

document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, root = document) => (root || document).querySelector(s);
  const $$ = (s, root = document) => Array.from((root || document).querySelectorAll(s));

  // set copyright year
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  // ---------- mobile menu toggle ----------
  const menuToggle = $('#menuToggle');
  const mainNav = $('#mainNav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.style.display = expanded ? '' : 'flex';
    });

    // hide menu on nav item click (mobile)
    $$('.main-nav a').forEach(a => a.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        mainNav.style.display = '';
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    }));
  }

  // ---------- highlight current nav link (case-insensitive) ----------
  (function highlightNav(){
    const links = $$('.main-nav a');
    const raw = (location.pathname.split('/').pop() || '').toLowerCase();
    // treat empty or index-like as home
    const normalized = (raw === '' || raw === 'index.html' || raw === 'home.html' || raw === 'home' ) ? 'home.html' : raw;
    links.forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      // normalize common home variants so either Home.html or home.html will match
      const normHref = (href === '' || href === 'index.html' || href === 'home.html') ? 'home.html' : href;
      if (!href) return;
      if (normHref === normalized) a.classList.add('active-nav'); else a.classList.remove('active-nav');
    });
  })();

  // ---------- typing effect (only when #typing exists) ----------
  const typingEl = $('#typing');
  if (typingEl) {
    const phrases = [
      'I build responsive websites.',
      'I solve problems with code.',
      'Learning React & Node.js.',
      'Open to internships and gigs.'
    ];
    let pi = 0, ci = 0, forward = true;
    (function tick(){
      const txt = phrases[pi];
      if (forward) {
        ci++;
        if (ci > txt.length) { forward = false; setTimeout(tick, 900); return; }
      } else {
        ci--;
        if (ci < 0) { forward = true; pi = (pi + 1) % phrases.length; setTimeout(tick, 300); return; }
      }
      typingEl.textContent = txt.slice(0, ci);
      setTimeout(tick, forward ? 60 : 30);
    })();
  }

  // ---------- projects: details modal ----------
  const projectModal = $('#projectModal');
  if (projectModal) {
    const modalTitle = $('#modalTitle');
    const modalDesc = $('#modalDesc');
    const modalLinks = $('#modalLinks');
    const modalClose = $('.modal-close');

    $$('.details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.project-card');
        if (!card) return;
        const title = card.dataset.title || card.querySelector('.project-title')?.textContent || 'Project';
        const excerpt = card.querySelector('.project-excerpt')?.textContent || '';
        modalTitle.textContent = title;
        modalDesc.textContent = excerpt + ' — Add a longer description, screenshots, and repo links here.';
        modalLinks.innerHTML = `<p><a href="#" class="btn small" onclick="alert('Open repo'); return false;">Open repo</a> <a href="#" class="btn small ghost" onclick="alert('Live demo'); return false;">Live demo</a></p>`;
        projectModal.setAttribute('aria-hidden', 'false');
      });
    });

    if (modalClose) modalClose.addEventListener('click', () => projectModal.setAttribute('aria-hidden', 'true'));
    projectModal.addEventListener('click', (ev) => { if (ev.target === projectModal) projectModal.setAttribute('aria-hidden', 'true'); });
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') projectModal.setAttribute('aria-hidden', 'true'); });
  }

  // ---------- contact form: AJAX submit to contact_submit.php ----------
  const contactForm = $('#contactForm');
  const formStatus = $('#formStatus');

  if (contactForm) {
    // If the form already has a method/action (it does), we still intercept it and submit via fetch.
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!formStatus) return;
      formStatus.textContent = '';

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const fd = new FormData(contactForm);
      const name = (fd.get('name') || '').toString().trim();
      const email = (fd.get('email') || '').toString().trim();
      const message = (fd.get('message') || '').toString().trim();

      if (!name || !email || !message) {
        formStatus.textContent = 'Please fill all fields.';
        return;
      }

      // disable submit UI to prevent multiple sends
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.origText = submitBtn.textContent || '';
        submitBtn.textContent = 'Sending…';
      }
      formStatus.textContent = 'Sending…';

      try {
        // send as form-encoded multipart (FormData)
        const resp = await fetch('contact_submit.php', {
          method: 'POST',
          body: fd,
          credentials: 'same-origin'
        });

        // try JSON parse safely
        let data;
        try { data = await resp.json(); } catch (err) { data = null; }

        if (resp.ok && data && data.ok) {
          formStatus.textContent = data.message || 'Thanks! Message sent.';
          contactForm.reset();
        } else {
          // server returned an error or non-JSON response
          if (data && !data.ok) {
            formStatus.textContent = data.message || 'Server rejected the submission.';
          } else {
            // try to read text fallback
            let text = '';
            try { text = await resp.text(); } catch (err) { /* ignore */ }
            formStatus.textContent = text || 'Server error. Try again later.';
          }
        }
      } catch (err) {
        console.error('Contact submit failed:', err);
        formStatus.textContent = 'Network error. Please try again.';
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.origText || 'Send message';
        }
      }
    });
  }

  // ---------- small accessibility: Escape hides mobile nav on small screens ----------
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && mainNav && window.innerWidth <= 900) {
      mainNav.style.display = '';
      if (menuToggle) menuToggle.setAttribute('aria-expanded','false');
    }
  });

  // ensure smooth scroll
  document.documentElement.style.scrollBehavior = 'smooth';
});
