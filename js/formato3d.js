/* ============================================================
   Orquestador de la stage "hero + formato" en modo 3D.
   Solo corre si window.__use3D es true (ver <script> inline en
   index.html <head>). Cuando corre, es dueño exclusivo de todo lo
   que pasa dentro de #formato: main.js se queda afuera (ver el
   guard en su propio Stage 1).
   ============================================================ */

import { initBottle3D } from "./bottle3d.js";

if (window.__use3D) {
  window.addEventListener("DOMContentLoaded", boot);
  if (document.readyState !== "loading") boot();
}

function boot() {
  if (window.__formato3DBooted) return; // por si DOMContentLoaded + el chequeo de arriba disparan doble
  window.__formato3DBooted = true;

  var stage = document.getElementById("formato");
  if (!stage || typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") return;

  var sticky = stage.querySelector(".stage-sticky");
  var grid = stage.querySelector(".stage-grid");
  var pngBottleCol = stage.querySelector(".bottle-col");
  var pngCards = stage.querySelector(".float-cards");
  if (pngBottleCol) pngBottleCol.style.display = "none";
  if (pngCards) pngCards.style.display = "none";

  // Recorrido más largo: intro + 7 beneficios + despegue + cierre.
  stage.style.height = "820vh";

  /* ---- Construcción del DOM nuevo ---- */
  var bottleCol = document.createElement("div");
  bottleCol.className = "bottle-col-3d";
  bottleCol.innerHTML = '<canvas class="bottle-canvas" id="bottle-canvas" aria-hidden="true"></canvas>';
  grid.appendChild(bottleCol);

  var benefitPanel = document.createElement("div");
  benefitPanel.className = "benefit-panel side-left";
  benefitPanel.id = "benefit-panel";
  benefitPanel.innerHTML =
    '<div class="inner" id="benefit-inner">' +
    '<span class="num" id="benefit-num">01</span>' +
    "<h4 id=\"benefit-title\"></h4>" +
    '<p id="benefit-desc"></p>' +
    "</div>";
  grid.appendChild(benefitPanel);

  var peelCard = document.createElement("div");
  peelCard.className = "label-peel-card";
  peelCard.id = "label-peel-card";
  peelCard.innerHTML =
    '<div class="peel-inner" id="peel-inner">' +
    '<div class="peel-face peel-front"></div>' +
    '<div class="peel-face peel-back"><span>ACÁ VA</span><strong>TU MARCA</strong></div>' +
    "</div>";
  sticky.appendChild(peelCard);

  var closeBlock = document.createElement("div");
  closeBlock.className = "stage-close";
  closeBlock.id = "stage-close";
  closeBlock.innerHTML =
    '<h2 class="ink" id="stage-close-ink">Acá empieza a valer tu publicidad.</h2>' +
    '<a href="#cierre" class="btn btn-solid">Quiero mi publicidad que vale' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
    "</a>";
  sticky.appendChild(closeBlock);

  var dots = document.createElement("div");
  dots.className = "progress-dots";
  dots.id = "progress-dots";
  var dotsHtml = "";
  for (var d = 0; d < 7; d++) dotsHtml += '<span class="dot" data-i="' + d + '"></span>';
  dots.innerHTML = dotsHtml;
  sticky.appendChild(dots);

  /* ---- Contenido de los 7 beneficios (texto tal cual el pedido) ---- */
  var BENEFITS = [
    { title: "El medio es la persona.", desc: "Tu publicidad no está en una pantalla ni en un cartel: está en la mano de la gente." },
    { title: "30 a 40 minutos.", desc: "De exposición sostenida. No son 3 segundos de un cartel ni un anuncio que se saltea." },
    { title: "Toda la ciudad.", desc: "Cada persona que lleva la botella se mueve por la ciudad con tu marca en la mano." },
    { title: "Cero interrupción.", desc: "No se saltea, no se bloquea, no molesta. Llega como un regalo." },
    { title: "Te miran distinto.", desc: "Tu marca deja de ser la publicidad que aparece siempre y pasa a ser la marca que le dio algo de valor." },
    { title: "Medible.", desc: "Cada botella se entrega contra un escaneo de QR y un follow real en tu Instagram." },
    { title: "Llave en mano.", desc: "Producimos, repartimos en la calle y montamos banner y mobiliario de tu marca." }
  ];

  /* ---- Three.js ---- */
  var canvas = document.getElementById("bottle-canvas");
  var bottle = initBottle3D(canvas);

  /* ---- Elementos que ya existían (hero, blobs, palabra gigante) ---- */
  var heroCopy = document.getElementById("hero-copy");
  var heroInk = document.getElementById("hero-ink");
  var heroWord = document.getElementById("hero-word");
  var blob1 = document.getElementById("blob-1");
  var blob2 = document.getElementById("blob-2");
  var scrollHint = document.getElementById("scroll-hint");
  var benefitNum = document.getElementById("benefit-num");
  var benefitTitle = document.getElementById("benefit-title");
  var benefitDesc = document.getElementById("benefit-desc");
  var benefitInner = document.getElementById("benefit-inner");
  var closeInk = document.getElementById("stage-close-ink");
  var peelInner = document.getElementById("peel-inner");
  var dotEls = Array.prototype.slice.call(dots.querySelectorAll(".dot"));

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  var heroOp = gsap.quickSetter(heroCopy, "opacity");
  var heroY = gsap.quickSetter(heroCopy, "y", "px");
  var hintOp = gsap.quickSetter(scrollHint, "opacity");
  var wordY = heroWord ? gsap.quickSetter(heroWord, "y", "px") : function () {};
  var wordOp = heroWord ? gsap.quickSetter(heroWord, "opacity") : function () {};
  var blob1Y = blob1 ? gsap.quickSetter(blob1, "y", "px") : function () {};
  var blob2Y = blob2 ? gsap.quickSetter(blob2, "y", "px") : function () {};
  var panelOp = gsap.quickSetter(benefitPanel, "opacity");
  var dotsOp = gsap.quickSetter(dots, "opacity");
  var peelOp = gsap.quickSetter(peelCard, "opacity");
  var closeOp = gsap.quickSetter(closeBlock, "opacity");
  function setCloseTransform(closeP) {
    var y = 18 * (1 - closeP);
    var scale = 0.97 + 0.03 * closeP;
    closeBlock.style.transform = "translateY(" + y + "px) scale(" + scale + ")";
  }

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function mapRange(v, a, b) {
    if (a === b) return v >= b ? 1 : 0;
    return clamp01((v - a) / (b - a));
  }

  var TAU = Math.PI * 2;
  var TOTAL_TURNS = 3; // vueltas completas a lo largo de los 7 beneficios
  var INTRO_END = 0.05;
  var BEN_START = 0.06;
  var BEN_END = 0.80;
  var PEEL_START = 0.80;
  var PEEL_END = 0.90;
  var CLOSE_START = 0.91;
  var frozenRotation = TOTAL_TURNS * TAU;

  var lastIdx = -1;
  var lastSide = "";
  var peelLabelSwapped = false;

  function updateBenefit(idx, localP) {
    if (idx !== lastIdx) {
      var b = BENEFITS[idx];
      benefitNum.textContent = String(idx + 1).padStart(2, "0");
      benefitTitle.textContent = b.title;
      benefitDesc.textContent = b.desc;
      var side = idx % 2 === 0 ? "side-left" : "side-right";
      if (side !== lastSide) {
        benefitPanel.classList.remove("side-left", "side-right");
        benefitPanel.classList.add(side);
        lastSide = side;
      }
      lastIdx = idx;
      dotEls.forEach(function (el, i) { el.classList.toggle("is-active", i === idx); });
    }

    // Entra girando desde el canto -> queda de frente -> sale girando.
    var enter = mapRange(localP, 0, 0.28);
    var exit = 1 - mapRange(localP, 0.72, 1);
    var visibility = Math.min(enter, exit);
    var dir = idx % 2 === 0 ? -1 : 1;
    var angle;
    if (localP < 0.28) angle = (1 - enter) * 90 * dir;
    else if (localP > 0.72) angle = (1 - exit) * -90 * dir;
    else angle = 0;

    panelOp(visibility);
    benefitInner.style.transform = "rotateY(" + angle + "deg)";
    benefitInner.style.opacity = String(Math.max(visibility, 0));
  }

  ScrollTrigger.create({
    trigger: stage,
    start: "top top",
    end: "bottom bottom",
    scrub: 0.4,
    onUpdate: function (self) {
      var p = self.progress;

      // Intro (título, lead, CTA de arriba)
      var heroFade = 1 - mapRange(p, 0, INTRO_END * 2.8);
      heroOp(heroFade);
      heroY((1 - heroFade) * -30);
      if (heroInk) heroInk.style.setProperty("--fill", Math.round(mapRange(p, 0, INTRO_END * 3.2) * 100) + "%");
      wordY(p * -60);
      wordOp(0.6 * (1 - mapRange(p, 0.02, 0.09)));
      if (blob1) blob1Y(p * 90);
      if (blob2) blob2Y(p * -70);
      hintOp(1 - mapRange(p, 0, 0.03));

      // Beneficios + giro de la botella
      if (p <= BEN_END) {
        dotsOp(mapRange(p, BEN_START, BEN_START + 0.03) * (1 - mapRange(p, BEN_END - 0.02, BEN_END)));
        var bp = mapRange(p, BEN_START, BEN_END);
        bottle.setRotation(bp * TOTAL_TURNS * TAU);
        var idxFloat = bp * 7;
        var idx = Math.min(6, Math.floor(idxFloat));
        var localP = idxFloat - idx;
        if (p < BEN_START) { panelOp(0); dotsOp(0); }
        else updateBenefit(idx, localP);
      } else {
        panelOp(0);
        dotsOp(0);
        bottle.setRotation(frozenRotation);
      }

      // Despegue de etiqueta
      var peelP = mapRange(p, PEEL_START, PEEL_END);
      if (p >= PEEL_START && p < CLOSE_START) {
        peelOp(mapRange(peelP, 0, 0.15) * (1 - mapRange(peelP, 0.85, 1)));
        var flip = mapRange(peelP, 0.25, 0.65);
        var lift = mapRange(peelP, 0, 0.7);
        peelInner.style.transform = "translateY(" + (-lift * 26) + "px) translateZ(" + (lift * 40) + "px) rotateY(" + flip * 180 + "deg)";
        bottle.setLabelOpacity(1 - mapRange(peelP, 0, 0.3));
        if (peelP > 0.5 && !peelLabelSwapped) {
          bottle.setLabelMode("blank");
          peelLabelSwapped = true;
        }
        if (peelP >= 0.7) bottle.setLabelOpacity(mapRange(peelP, 0.7, 1));
      } else if (p < PEEL_START) {
        peelOp(0);
        bottle.setLabelOpacity(1);
        if (peelLabelSwapped) { bottle.setLabelMode("brinda"); peelLabelSwapped = false; }
      } else {
        peelOp(0);
        bottle.setLabelOpacity(1);
      }

      // Cierre
      var closeP = mapRange(p, CLOSE_START, 1);
      closeOp(closeP);
      setCloseTransform(closeP);
      if (closeInk) closeInk.style.setProperty("--fill", Math.round(mapRange(closeP, 0.15, 0.7) * 100) + "%");
    }
  });
}
