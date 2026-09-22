(function () {
  "use strict";

  /* ---------- Header scroll shadow ---------- */
  var header = document.getElementById("site-header");
  function onScroll() {
    if (window.scrollY > 8) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  function closeMobileNav() {
    mobileNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
  navToggle.addEventListener("click", function () {
    var open = mobileNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  mobileNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMobileNav);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMobileNav();
  });

  /* ---------- Scrollspy ---------- */
  var navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  var navSections = Array.prototype.map.call(navLinks, function (a) {
    return document.querySelector(a.getAttribute("href"));
  }).filter(Boolean);

  function updateActiveLink() {
    var scrollPos = window.scrollY + 160;
    var current = null;
    navSections.forEach(function (sec) {
      if (sec.offsetTop <= scrollPos) current = sec;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle("is-active", !!current && a.getAttribute("href") === "#" + current.id);
    });
  }
  updateActiveLink();
  window.addEventListener("scroll", updateActiveLink, { passive: true });

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Reveal-on-scroll (static sections) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Scroll-driven stages (GSAP) ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function mapRange(v, a, b) {
    if (a === b) return v >= b ? 1 : 0;
    return clamp01((v - a) / (b - a));
  }

  if (hasGsap && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);

    /* ---- Stage 1: Hero + Formato ---- */
    var stage1 = document.getElementById("formato");
    if (stage1) {
      var heroCopy = document.getElementById("hero-copy");
      var scrollHint = document.getElementById("scroll-hint");
      var rig1 = document.getElementById("bottle-rig");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".float-card"));
      var branded = document.getElementById("bottle-branded");
      var blank = document.getElementById("bottle-blank-layer");
      var labelOverlay = document.getElementById("label-overlay");

      var setRig1RotY = gsap.quickSetter(rig1, "rotationY", "deg");
      var setRig1Scale = gsap.quickSetter(rig1, "scale");
      var cardSetters = cards.map(function (card) {
        return {
          op: gsap.quickSetter(card, "opacity"),
          y: gsap.quickSetter(card, "y", "px")
        };
      });
      var heroOp = gsap.quickSetter(heroCopy, "opacity");
      var heroY = gsap.quickSetter(heroCopy, "y", "px");
      var hintOp = gsap.quickSetter(scrollHint, "opacity");
      var brandedOp = gsap.quickSetter(branded, "opacity");
      var blankOp = gsap.quickSetter(blank, "opacity");
      var labelOp = gsap.quickSetter(labelOverlay, "opacity");

      ScrollTrigger.create({
        trigger: stage1,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.4,
        onUpdate: function (self) {
          var p = self.progress;

          var heroFade = 1 - mapRange(p, 0, 0.14);
          heroOp(heroFade);
          heroY((1 - heroFade) * -30);

          hintOp(1 - mapRange(p, 0, 0.06));

          setRig1RotY(-6 + p * 16);
          setRig1Scale(1 - mapRange(p, 0.85, 1) * 0.08);

          var starts = [0.16, 0.3, 0.46, 0.6];
          cardSetters.forEach(function (s, i) {
            var inP = mapRange(p, starts[i], starts[i] + 0.1);
            var outP = 1 - mapRange(p, 0.92, 1);
            var v = Math.min(inP, outP);
            s.op(v);
            s.y(24 * (1 - inP));
          });

          // La etiqueta pasa de "Brinda" a "Tu marca acá" a medida que se leen las tarjetas.
          var morph = mapRange(p, 0.5, 0.85);
          brandedOp(1 - morph);
          blankOp(morph);
          labelOp(morph);
        }
      });
    }

    /* ---- Stage 2: Persona ---- */
    var stage2 = document.getElementById("persona");
    if (stage2) {
      var phrases = Array.prototype.slice.call(document.querySelectorAll(".phrase"));
      var closeEl = document.getElementById("persona-close");

      var phraseSetters = phrases.map(function (p) {
        return { op: gsap.quickSetter(p, "opacity"), y: gsap.quickSetter(p, "y", "px") };
      });
      var closeOp = gsap.quickSetter(closeEl, "opacity");
      var closeY = gsap.quickSetter(closeEl, "y", "px");

      ScrollTrigger.create({
        trigger: stage2,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.4,
        onUpdate: function (self) {
          var p = self.progress;

          var starts = [0.06, 0.16, 0.55, 0.65];
          phraseSetters.forEach(function (s, i) {
            var inP = mapRange(p, starts[i], starts[i] + 0.1);
            var outP = 1 - mapRange(p, 0.8, 0.9);
            var v = Math.min(inP, outP);
            s.op(v);
            s.y(18 * (1 - inP));
          });

          var closeIn = mapRange(p, 0.85, 0.98);
          closeOp(closeIn);
          closeY(16 * (1 - closeIn));
        }
      });
    }
  } else {
    /* No motion (prefers-reduced-motion, or GSAP failed to load): drop the
       pinned scrollytelling and lay the same content out as a plain,
       linear, fully readable flow. See .no-motion rules in style.css. */
    document.documentElement.classList.add("no-motion");
  }

  /* ---------- Idle bottle bob (independent of scroll) ---------- */
  var floats = document.querySelectorAll(".bottle-float");
  floats.forEach(function (el, i) {
    if (reduceMotion) return;
    if (hasGsap) {
      gsap.to(el, { y: -12, duration: 3 + i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }
  });

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");
  var closeVisual = document.getElementById("close-visual");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = new FormData(form);
      var nombre = data.get("nombre");
      var marca = data.get("marca");
      var rubro = data.get("rubro");
      var email = data.get("email");
      var whatsapp = data.get("whatsapp") || "sin especificar";
      var ciudad = data.get("ciudad") || "sin especificar";
      var volumen = data.get("volumen") || "sin especificar";
      var mensaje = data.get("mensaje") || "sin comentarios";

      var lineas = [
        "Hola Brinda, quiero una propuesta para mi marca.",
        "",
        "Nombre: " + nombre,
        "Marca: " + marca,
        "Rubro: " + rubro,
        "Email: " + email,
        "WhatsApp: " + whatsapp,
        "Ciudad: " + ciudad,
        "Volumen estimado: " + volumen,
        "Mensaje: " + mensaje
      ];
      var texto = lineas.join("\n");

      // Sin backend: abrimos WhatsApp con el mensaje precargado.
      // TODO: reemplazar el número por el de WhatsApp real de Brinda.
      var whatsappUrl = "https://wa.me/5491100000000?text=" + encodeURIComponent(texto);
      var mailtoUrl = "mailto:hola@brindapublicidadqueregala.com" +
        "?subject=" + encodeURIComponent("Quiero una propuesta — " + marca) +
        "&body=" + encodeURIComponent(texto);

      window.open(whatsappUrl, "_blank", "noopener");

      if (closeVisual) closeVisual.classList.add("is-filled");

      status.innerHTML = "¡Gracias, " + nombre.split(" ")[0] + "! Te abrimos WhatsApp con tus datos cargados. " +
        '<a href="' + mailtoUrl + '">Escribir por mail en su lugar</a>';
      status.classList.add("is-visible");

      form.reset();
    });
  }
})();
