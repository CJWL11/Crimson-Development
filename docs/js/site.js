// Renders the team, blog and project content from content.js into whichever page is open.
(function () {
  const content = window.CRIMSON || {};
  const team = content.team || [];
  const posts = content.posts || [];
  const projects = content.projects || [];

  // ---------- helpers (shared with trades.js via window.CrimsonUI) ----------

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function paragraphs(text) {
    const frag = document.createDocumentFragment();
    (text || "").split(/\n\s*\n/).forEach((para) => {
      if (para.trim()) frag.appendChild(el("p", "", para.trim()));
    });
    return frag;
  }

  function prose(text, extraClass) {
    const div = el("div", "prose" + (extraClass ? " " + extraClass : ""));
    div.appendChild(paragraphs(text));
    return div;
  }

  // Cover image, or a placeholder tile showing the project's initial.
  function cover(project, className, eager) {
    if (project.cover) {
      const img = el("img", className);
      img.src = project.cover;
      img.alt = project.name;
      if (!eager) img.loading = "lazy";
      return img;
    }
    const ph = el("div", className + " placeholder", project.name.charAt(0));
    ph.setAttribute("aria-hidden", "true");
    return ph;
  }

  // images: [{ src, caption }]. Each image is a button so it works from the keyboard too.
  function gallery(images) {
    const wrap = el("div", "gallery");
    (images || []).forEach((image, i) => {
      const fig = el("figure");
      const open = el("button", "gallery-item");
      open.type = "button";
      open.setAttribute("aria-label", "View image" + (image.caption ? ": " + image.caption : " " + (i + 1)));
      const img = el("img");
      img.src = image.src;
      img.alt = image.caption || "";
      img.loading = "lazy";
      open.appendChild(img);
      open.addEventListener("click", () => openLightbox(image));
      fig.appendChild(open);
      if (image.caption) fig.appendChild(el("figcaption", "", image.caption));
      wrap.appendChild(fig);
    });
    return wrap;
  }

  function countLabel(n, word) {
    return n ? n + " " + word + (n === 1 ? "" : "s") : "";
  }

  // ---------- lightbox ----------
  // A <dialog> so it opens above other dialogs (e.g. a trade post) and handles Escape + focus.

  let lightbox;
  function openLightbox(image) {
    if (!lightbox) {
      lightbox = el("dialog", "lightbox");
      lightbox.setAttribute("aria-label", "Image viewer");
      const close = el("button", "lightbox-close", "×");
      close.type = "button";
      close.setAttribute("aria-label", "Close image");
      lightbox.append(close, el("img"), el("p"));
      lightbox.addEventListener("click", () => lightbox.close());
      document.body.appendChild(lightbox);
    }
    const img = lightbox.querySelector("img");
    img.src = image.src;
    img.alt = image.caption || "";
    lightbox.querySelector("p").textContent = image.caption || "";
    lightbox.showModal();
  }

  window.CrimsonUI = { el, paragraphs, prose, gallery, countLabel, openLightbox };

  // ---------- sound effects ----------
  // Short robotic blips made with the Web Audio API (no sound files). Visitors can turn them off.

  const SFX_KEY = "crimsonSfx";
  let sfxOn = true;
  try {
    sfxOn = localStorage.getItem(SFX_KEY) !== "off";
  } catch (e) {}
  let audio;

  // Quick volume envelope: instant attack, fast decay.
  function envelope(start, peak, length) {
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    gain.connect(audio.destination);
    return gain;
  }

  // Mechanical "tk": a few milliseconds of band-passed noise, like a relay or switch.
  let noise;
  function tick(start, pitch, peak) {
    if (!noise) {
      noise = audio.createBuffer(1, Math.floor(audio.sampleRate * 0.03), audio.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const src = audio.createBufferSource();
    src.buffer = noise;
    const band = audio.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = pitch;
    band.Q.value = 2;
    src.connect(band).connect(envelope(start, peak, 0.012));
    src.start(start);
    src.stop(start + 0.03);
  }

  // Classic robot tone: a steady square wave, ring-modulated for a metallic buzz.
  function beep(freq, start, length) {
    const osc = audio.createOscillator();
    osc.type = "square";
    osc.frequency.value = freq;
    const ring = audio.createGain();
    ring.gain.value = 0;
    const lfo = audio.createOscillator();
    lfo.frequency.value = 70;
    lfo.connect(ring.gain);
    const lowpass = audio.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 1800;
    osc.connect(ring).connect(lowpass).connect(envelope(start, 0.06, length));
    [osc, lfo].forEach((o) => {
      o.start(start);
      o.stop(start + length + 0.02);
    });
  }

  const sounds = {
    click: () => {
      const now = audio.currentTime;
      tick(now, 3200, 0.35);
      tick(now + 0.018, 1400, 0.18); // second, lower tick gives a "click-clack"
    },
    // Stepped notes (no slides): beep-boop up when opening, down when closing.
    open: () => {
      const now = audio.currentTime + 0.03;
      beep(330, now, 0.05);
      beep(495, now + 0.06, 0.07);
    },
    close: () => {
      const now = audio.currentTime + 0.03;
      beep(495, now, 0.05);
      beep(330, now + 0.06, 0.07);
    }
  };

  function play(name) {
    if (!sfxOn) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
      sounds[name]();
    } catch (e) {
      // No audio support: stay silent.
    }
  }

  const CLICKABLE = "a[href], button, input[type='file'], [role='button']";

  // pointerdown (not click) so the sound starts before a link navigates away.
  document.addEventListener("pointerdown", (e) => {
    const target = e.button === 0 && e.target.closest(CLICKABLE);
    if (target && !target.disabled) play("click");
  });

  document.addEventListener("keydown", (e) => {
    const target = e.target.closest && e.target.closest(CLICKABLE);
    if (target && !target.disabled && (e.key === "Enter" || (e.key === " " && target.matches("button")))) play("click");
  });

  // Every pop-up (trade posts, the trade form, the image viewer) chirps when it opens and closes.
  if (window.HTMLDialogElement) {
    const showModal = HTMLDialogElement.prototype.showModal;
    HTMLDialogElement.prototype.showModal = function () {
      showModal.call(this);
      play("open");
    };
    document.addEventListener("close", (e) => {
      if (e.target instanceof HTMLDialogElement) play("close");
    }, true);
  }

  // SFX on/off switch, added to the right-hand side of the nav on every page.
  const nav = document.querySelector("nav");
  if (nav) {
    const actions = el("div", "nav-actions");
    const toggle = el("button", "small-button sfx-toggle");
    toggle.type = "button";
    toggle.title = "Turn click sounds on or off";
    const label = () => {
      toggle.textContent = sfxOn ? "SFX: ON" : "SFX: OFF";
      toggle.setAttribute("aria-pressed", String(sfxOn));
    };
    label();
    toggle.addEventListener("click", () => {
      sfxOn = !sfxOn;
      try {
        localStorage.setItem(SFX_KEY, sfxOn ? "on" : "off");
      } catch (e) {}
      label();
      if (sfxOn) play("open");
    });
    actions.appendChild(toggle);
    const manage = nav.querySelector(":scope > .small-button");
    if (manage) actions.appendChild(manage);
    nav.appendChild(actions);
  }

  // ---------- team (home page carousel + Team page) ----------

  function profileCard(member, full) {
    const card = el("article", "profile-card");
    const img = el("img", "avatar");
    img.src = member.photo || "images/logo.svg";
    img.alt = member.name + " profile picture";
    img.width = 96;
    img.height = 96;
    card.append(img, el("h3", "", member.name), el("p", "role", member.role));
    if (full && (member.bio || member.summary)) {
      card.appendChild(prose(member.bio || member.summary, "bio"));
    } else if (member.summary || member.bio) {
      card.appendChild(el("p", "bio", member.summary || member.bio));
    }
    return card;
  }

  const teamScroll = document.getElementById("teamScroll");
  if (teamScroll) team.forEach((m) => teamScroll.appendChild(profileCard(m, false)));

  const teamList = document.getElementById("teamList");
  if (teamList) team.forEach((m) => teamList.appendChild(profileCard(m, true)));

  // ---------- home page ----------

  const latestPosts = document.getElementById("latestPosts");
  if (latestPosts) {
    posts.slice(0, 3).forEach((post) => {
      const card = el("a", "post post-link");
      card.href = "blog.html#post-" + post.id;
      card.append(el("p", "date", post.date), el("h3", "", post.title), el("p", "", post.summary));
      latestPosts.appendChild(card);
    });
  }

  const latestProjects = document.getElementById("latestProjects");
  if (latestProjects) {
    projects.slice(0, 3).forEach((project) => {
      const card = el("a", "card project-tile");
      card.href = "project.html?id=" + encodeURIComponent(project.id);
      const body = el("div", "project-tile-body");
      body.append(el("span", "status", project.status), el("h3", "", project.name), el("p", "", project.summary));
      card.append(cover(project, "project-cover"), body);
      latestProjects.appendChild(card);
    });
  }

  // ---------- blog page: forum list, click to expand ----------

  const blogList = document.getElementById("blogList");
  if (blogList) {
    posts.forEach((post) => {
      const item = el("article", "thread");
      item.id = "post-" + post.id;

      const heading = el("h3", "thread-heading");
      const head = el("button", "thread-head");
      head.type = "button";
      head.setAttribute("aria-expanded", "false");
      const main = el("span", "thread-main");
      main.append(el("span", "thread-title", post.title), el("span", "thread-summary", post.summary));
      const meta = el("span", "thread-meta");
      meta.append(el("span", "date", post.date), el("span", "", countLabel((post.images || []).length, "image")));
      head.append(main, meta, el("span", "chevron", "▸"));
      heading.appendChild(head);

      const full = el("div", "thread-body");
      full.hidden = true;
      full.append(paragraphs(post.body), gallery(post.images));

      head.addEventListener("click", () => {
        const open = full.hidden;
        full.hidden = !open;
        item.classList.toggle("open", open);
        head.setAttribute("aria-expanded", String(open));
        history.replaceState(null, "", open ? "#" + item.id : location.pathname);
      });

      item.append(heading, full);
      blogList.appendChild(item);
    });

    // Opening blog.html#post-<id> (e.g. from the home page) expands that post.
    const target = location.hash.startsWith("#post-") && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) {
      target.querySelector(".thread-head").click();
      target.scrollIntoView({ block: "start" });
    }
  }

  // ---------- projects page: forum list ----------

  const projectList = document.getElementById("projectList");
  if (projectList) {
    projects.forEach((project) => {
      const row = el("a", "thread thread-head project-row");
      row.href = "project.html?id=" + encodeURIComponent(project.id);

      const main = el("div", "thread-main");
      main.append(el("span", "status", project.status), el("h3", "thread-title", project.name), el("p", "thread-summary", project.summary));

      const meta = el("div", "thread-meta");
      const updates = project.updates || [];
      if (updates.length) {
        meta.append(el("span", "", countLabel(updates.length, "update")), el("span", "date", "Last: " + updates[0].date));
      }

      row.append(cover(project, "row-cover"), main, meta, el("span", "chevron", "▸"));
      projectList.appendChild(row);
    });
  }

  // ---------- single project page ----------

  const projectPage = document.getElementById("projectPage");
  if (projectPage) {
    const id = new URLSearchParams(location.search).get("id");
    const project = projects.find((p) => p.id === id);

    if (!project) {
      document.title = "Project not found — Crimson Development";
      projectPage.append(
        el("h2", "", "Project not found"),
        el("p", "section-note", "That project doesn't exist or has been moved.")
      );
    } else {
      document.title = project.name + " — Crimson Development";

      const hero = el("header", "project-hero");
      const heroText = el("div", "project-hero-text");
      heroText.append(el("span", "status", project.status), el("h1", "", project.name), el("p", "intro", project.summary));
      hero.append(cover(project, "project-hero-cover", true), heroText);
      projectPage.appendChild(hero);

      function section(title, ...children) {
        const s = el("section", "project-section");
        s.append(el("h2", "", title), ...children);
        projectPage.appendChild(s);
      }

      if (project.description) section("Overview", prose(project.description));
      if (project.lore) section("Lore", prose(project.lore, "lore"));
      if (project.images && project.images.length) section("Gallery", gallery(project.images));

      // Progress Updates only appear when a project has some in content.js.
      if (project.updates && project.updates.length) {
        const timeline = el("div", "timeline");
        project.updates.forEach((update) => {
          const entry = el("article", "timeline-entry");
          entry.append(el("p", "date", update.date), el("h3", "", update.title), prose(update.body), gallery(update.images));
          timeline.appendChild(entry);
        });
        section("Progress Updates", timeline);
      }
    }
  }
})();
