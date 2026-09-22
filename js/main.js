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

  /* ---------- Mobile nav toggle ---------- */
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

  /* ---------- Scrollspy: highlight active nav link ---------- */
  var navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  var sections = Array.prototype.map.call(navLinks, function (a) {
    return document.querySelector(a.getAttribute("href"));
  }).filter(Boolean);

  function updateActiveLink() {
    var scrollPos = window.scrollY + 140;
    var current = null;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollPos) current = sec;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle("is-active", !!current && a.getAttribute("href") === "#" + current.id);
    });
  }
  updateActiveLink();
  window.addEventListener("scroll", updateActiveLink, { passive: true });

  /* ---------- Reveal on scroll ---------- */
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

  /* ---------- Comparison bars animation ---------- */
  var compareRows = document.querySelectorAll(".compare-row");
  if (compareRows.length && "IntersectionObserver" in window) {
    var ioBars = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          ioBars.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    compareRows.forEach(function (row) { ioBars.observe(row); });
  } else {
    compareRows.forEach(function (row) { row.classList.add("is-visible"); });
  }

  /* ---------- Hero bottle: static fallback on very slow connections ---------- */
  var bottleImg = document.getElementById("bottle-img");
  if (bottleImg) {
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var slow = conn && (conn.saveData || /2g/.test(conn.effectiveType || ""));
    if (slow) bottleImg.classList.add("static-fallback");
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Contact survey form ---------- */
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = new FormData(form);
      var nombre = data.get("nombre");
      var empresa = data.get("empresa");
      var rubro = data.get("rubro");
      var mail = data.get("mail");
      var volumen = data.get("volumen") || "sin especificar";
      var comentario = data.get("comentario") || "sin comentarios";

      var lineas = [
        "Hola Brinda, quiero coordinar una entrevista para sumar mi marca.",
        "",
        "Nombre: " + nombre,
        "Empresa: " + empresa,
        "Rubro: " + rubro,
        "Mail: " + mail,
        "Volumen estimado: " + volumen,
        "Objetivo: " + comentario
      ];
      var mensaje = lineas.join("\n");

      // Sin backend: abrimos WhatsApp con el mensaje precargado.
      // TODO: reemplazar el número por el de WhatsApp real de Brinda.
      var whatsappUrl = "https://wa.me/5491100000000?text=" + encodeURIComponent(mensaje);

      // Fallback por mail, por si el usuario no tiene WhatsApp Web/App a mano.
      var mailtoUrl = "mailto:hola@brindapublicidadqueregala.com" +
        "?subject=" + encodeURIComponent("Quiero sumar mi marca a Brinda — " + empresa) +
        "&body=" + encodeURIComponent(mensaje);

      window.open(whatsappUrl, "_blank", "noopener");

      status.textContent = "¡Gracias, " + nombre.split(" ")[0] + "! Te abrimos WhatsApp con tus datos cargados. Si preferís, también podés escribirnos por mail.";
      status.classList.remove("err");
      status.classList.add("ok", "is-visible");

      form.reset();

      // Deja un link de mail accesible por si el usuario cerró WhatsApp sin enviar.
      status.innerHTML += ' <a href="' + mailtoUrl + '" style="text-decoration:underline">Escribir por mail en su lugar</a>';
    });
  }
})();
