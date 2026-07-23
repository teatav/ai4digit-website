/* ============================================================
   AI4DigiT — Visual enhancements (LOCAL PREVIEW, additive only)
   All decoration is injected here; removing the <script> reverts it.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* --- 1. Scroll progress bar + back-to-top --- */
  var bar = el("div", "scroll-progress");
  document.body.appendChild(bar);

  var toTop = el("button", "to-top",
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>');
  toTop.setAttribute("aria-label", "Kthehu lart");
  document.body.appendChild(toTop);
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max * 100) : 0) + "%";
    toTop.classList.toggle("show", h.scrollTop > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* --- 2. Hero decorations --- */
  var hero = document.querySelector(".hero");
  if (hero) {
    var blobs = el("div", "deco-blobs");
    ["b1", "b2", "b3"].forEach(function (b) { blobs.appendChild(el("span", "blob " + b)); });
    hero.insertBefore(blobs, hero.firstChild);
  }
  var ring = document.querySelector(".hero-art .ring");
  if (ring) {
    ring.insertBefore(el("span", "ring-glow"), ring.firstChild);
    ring.insertBefore(el("span", "orbit"), ring.firstChild);
    ["p1", "p2", "p3", "p4"].forEach(function (p) { ring.appendChild(el("span", "petal-dot " + p)); });
  }

  /* --- 3. Eyebrow accent line --- */
  document.querySelectorAll(".eyebrow").forEach(function (e) { e.classList.add("enh"); });

  /* --- 6. Curved divider into the footer --- */
  var footer = document.querySelector("footer.site");
  if (footer) {
    var wrap = el("div", "footer-wave-wrap");
    wrap.innerHTML =
      '<svg class="footer-wave" viewBox="0 0 1440 56" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="M0,34 C240,6 480,0 720,12 C960,24 1200,52 1440,26 L1440,56 L0,56 Z"></path></svg>';
    footer.parentNode.insertBefore(wrap, footer);
  }

  /* --- 4. Scroll reveal --- */
  if (!reduce && "IntersectionObserver" in window) {
    var targets = document.querySelectorAll(
      "section:not(.hero) h2, section:not(.hero) .lead, .pillar, .card, .phase, .htl-item, .chips, .cta-band, .contact-info"
    );
    targets.forEach(function (t) { t.classList.add("reveal"); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (t) { io.observe(t); });

    // gentle stagger for cards within a row
    document.querySelectorAll(".grid-4 > *, .grid-3 > *, .htimeline > .htl-item").forEach(function (c, i) {
      c.style.transitionDelay = ((i % 4) * 70) + "ms";
    });
  }

  /* --- 5. Count-up statistics --- */
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function countUp(node) {
    var m = node.textContent.trim().match(/^(\d+)(\D*)$/);
    if (!m) return;
    var target = +m[1], suffix = m[2] || "";
    if (reduce) { node.textContent = target + suffix; return; }
    var dur = 1100, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      node.textContent = Math.round(target * easeOut(p)) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else node.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }
  var stats = document.querySelectorAll(".stat b");
  if (stats.length && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); so.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    stats.forEach(function (s) { so.observe(s); });
  }
})();

/* ============================================================
   VERSION 2 — additional graphics (additive)
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* V2.2 — ghost numbers on the four pillars */
  document.querySelectorAll("#services .grid-4 .pillar").forEach(function (p, i) {
    p.setAttribute("data-num", "0" + (i + 1));
  });

  /* V2.1 — cursor-follow spotlight on cards & pillars */
  if (!reduce) {
    document.querySelectorAll(".pillar, .card").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--mx", (e.clientX - r.left) + "px");
        c.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* V2.6 — network constellation decoration */
  var net = document.querySelector("#network");
  if (net) {
    var svg =
      '<svg class="constellation" viewBox="0 0 360 420" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<g stroke="#87C0E0" stroke-width="1.2" opacity=".6">' +
      '<line x1="70" y1="70" x2="200" y2="120"/><line x1="200" y1="120" x2="300" y2="70"/>' +
      '<line x1="200" y1="120" x2="150" y2="250"/><line x1="150" y1="250" x2="290" y2="230"/>' +
      '<line x1="150" y1="250" x2="90" y2="350"/><line x1="290" y1="230" x2="300" y2="70"/>' +
      '<line x1="90" y1="350" x2="250" y2="340"/>' +
      '</g>' +
      '<circle class="node" cx="70"  cy="70"  r="6" fill="#F4796A"/>' +
      '<circle class="node" cx="200" cy="120" r="8" fill="#1A3A6B"/>' +
      '<circle class="node" cx="300" cy="70"  r="5" fill="#F5A57A"/>' +
      '<circle class="node" cx="150" cy="250" r="7" fill="#4EC28A"/>' +
      '<circle class="node" cx="290" cy="230" r="5" fill="#87C0E0"/>' +
      '<circle class="node" cx="90"  cy="350" r="6" fill="#F4796A"/>' +
      '<circle class="node" cx="250" cy="340" r="5" fill="#4EC28A"/>' +
      '</svg>';
    var holder = document.createElement("div");
    holder.innerHTML = svg;
    net.insertBefore(holder.firstChild, net.firstChild);
  }

  /* "How we share knowledge" — interactive tabs */
  (function () {
    var tabs = document.querySelectorAll(".ksh-tab");
    var panels = document.querySelectorAll(".ksh-panel");
    var stage = document.querySelector(".ksh-stage");
    if (!tabs.length) return;

    function activate(i) {
      var color = null;
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-ksh") === i;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        if (on) color = t.style.getPropertyValue("--c");
      });
      panels.forEach(function (p) {
        p.classList.toggle("active", p.getAttribute("data-ksh") === i);
      });
      // theme the stage border + glow to match the active item
      if (stage && color) {
        stage.style.setProperty("--c", color.trim());
        stage.style.borderColor = color.trim();
      }
    }

    tabs.forEach(function (t) {
      var i = t.getAttribute("data-ksh");
      t.addEventListener("click", function () { activate(i); });
      t.addEventListener("mouseenter", function () { activate(i); });
    });
  })();

  /* Newsletter badge — animated envelope with broadcast rings */
  var cta = document.querySelector(".cta-band");
  if (cta) {
    var badge = document.createElement("div");
    badge.className = "news-badge";
    badge.innerHTML =
      '<span class="nb-ring" aria-hidden="true"></span>' +
      '<span class="nb-ring r2" aria-hidden="true"></span>' +
      '<span class="nb-circle" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>' +
      '</span>';
    cta.insertBefore(badge, cta.firstChild);
  }

  /* V2.8 — subtle parallax drift of the hero blobs on mouse move */
  var hero = document.querySelector(".hero");
  var blobs = hero && hero.querySelector(".deco-blobs");
  if (hero && blobs && !reduce) {
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      blobs.style.transform = "translate(" + (x * 20).toFixed(1) + "px," + (y * 20).toFixed(1) + "px)";
    });
    hero.addEventListener("mouseleave", function () { blobs.style.transform = "translate(0,0)"; });
  }
})();
