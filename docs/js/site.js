// Renders the blog and project content from content.js into whichever page is open.
(function () {
  const content = window.CRIMSON || { posts: [], projects: [] };

  // ---------- helpers ----------

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

  // Cover image, or a placeholder tile showing the project's initial.
  function cover(project, className) {
    if (project.cover) {
      const img = el("img", className);
      img.src = project.cover;
      img.alt = project.name;
      img.loading = "lazy";
      return img;
    }
    const ph = el("div", className + " placeholder", project.name.charAt(0));
    ph.setAttribute("aria-hidden", "true");
    return ph;
  }

  function gallery(images) {
    const wrap = el("div", "gallery");
    (images || []).forEach((image) => {
      const fig = el("figure");
      const img = el("img");
      img.src = image.src;
      img.alt = image.caption || "";
      img.loading = "lazy";
      img.addEventListener("click", () => openLightbox(image));
      fig.appendChild(img);
      if (image.caption) fig.appendChild(el("figcaption", "", image.caption));
      wrap.appendChild(fig);
    });
    return wrap;
  }

  function imageCount(images) {
    const n = (images || []).length;
    return n ? n + (n === 1 ? " image" : " images") : "";
  }

  // ---------- lightbox ----------

  let lightbox;
  function openLightbox(image) {
    if (!lightbox) {
      lightbox = el("div", "lightbox");
      lightbox.innerHTML = '<img alt=""><p></p>';
      lightbox.addEventListener("click", () => lightbox.classList.remove("open"));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") lightbox.classList.remove("open");
      });
      document.body.appendChild(lightbox);
    }
    lightbox.querySelector("img").src = image.src;
    lightbox.querySelector("p").textContent = image.caption || "";
    lightbox.classList.add("open");
  }

  // ---------- home page ----------

  const latestPosts = document.getElementById("latestPosts");
  if (latestPosts) {
    latestPosts.innerHTML = "";
    content.posts.slice(0, 3).forEach((post) => {
      const card = el("a", "post post-link");
      card.href = "blog.html#" + post.id;
      card.append(el("p", "date", post.date), el("h3", "", post.title), el("p", "", post.summary));
      latestPosts.appendChild(card);
    });
  }

  const latestProjects = document.getElementById("latestProjects");
  if (latestProjects) {
    latestProjects.innerHTML = "";
    content.projects.slice(0, 3).forEach((project) => {
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
    content.posts.forEach((post) => {
      const item = el("article", "thread");
      item.id = post.id;

      const head = el("button", "thread-head");
      head.type = "button";
      head.setAttribute("aria-expanded", "false");
      const main = el("div", "thread-main");
      main.append(el("h3", "", post.title), el("p", "thread-summary", post.summary));
      const meta = el("div", "thread-meta");
      meta.append(el("span", "date", post.date), el("span", "", imageCount(post.images)));
      head.append(main, meta, el("span", "chevron", "▸"));

      const full = el("div", "thread-body");
      full.hidden = true;
      full.append(paragraphs(post.body), gallery(post.images));

      head.addEventListener("click", () => {
        const open = full.hidden;
        full.hidden = !open;
        item.classList.toggle("open", open);
        head.setAttribute("aria-expanded", String(open));
        history.replaceState(null, "", open ? "#" + post.id : location.pathname);
      });

      item.append(head, full);
      blogList.appendChild(item);
    });

    // Opening blog.html#post-id (e.g. from the home page) expands that post.
    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target && target.classList.contains("thread")) {
      target.querySelector(".thread-head").click();
      target.scrollIntoView({ block: "start" });
    }
  }

  // ---------- projects page: forum list ----------

  const projectList = document.getElementById("projectList");
  if (projectList) {
    content.projects.forEach((project) => {
      const row = el("a", "thread thread-head project-row");
      row.href = "project.html?id=" + encodeURIComponent(project.id);

      const main = el("div", "thread-main");
      main.append(el("span", "status", project.status), el("h3", "", project.name), el("p", "thread-summary", project.summary));

      const updates = project.updates || [];
      const meta = el("div", "thread-meta");
      meta.append(
        el("span", "", updates.length + (updates.length === 1 ? " update" : " updates")),
        el("span", "date", updates.length ? "Last: " + updates[0].date : "")
      );

      row.append(cover(project, "row-cover"), main, meta, el("span", "chevron", "▸"));
      projectList.appendChild(row);
    });
  }

  // ---------- single project page ----------

  const projectPage = document.getElementById("projectPage");
  if (projectPage) {
    const id = new URLSearchParams(location.search).get("id");
    const project = content.projects.find((p) => p.id === id);

    if (!project) {
      projectPage.append(
        el("h2", "", "Project not found"),
        el("p", "section-note", "That project doesn't exist or has been moved.")
      );
    } else {
      document.title = project.name + " — Crimson Development";

      const hero = el("header", "project-hero");
      const heroText = el("div", "project-hero-text");
      heroText.append(el("span", "status", project.status), el("h1", "", project.name), el("p", "intro", project.summary));
      hero.append(cover(project, "project-hero-cover"), heroText);
      projectPage.appendChild(hero);

      function section(title, ...children) {
        const s = el("section", "project-section");
        s.append(el("h2", "", title), ...children);
        projectPage.appendChild(s);
      }

      function prose(text, extraClass) {
        const div = el("div", "prose" + (extraClass ? " " + extraClass : ""));
        div.appendChild(paragraphs(text));
        return div;
      }

      if (project.description) section("Overview", prose(project.description));
      if (project.lore) section("Lore", prose(project.lore, "lore"));
      if (project.images && project.images.length) section("Gallery", gallery(project.images));

      const timeline = el("div", "timeline");
      (project.updates || []).forEach((update) => {
        const entry = el("article", "timeline-entry");
        entry.append(el("p", "date", update.date), el("h3", "", update.title), prose(update.body), gallery(update.images));
        timeline.appendChild(entry);
      });
      if (!timeline.children.length) timeline.appendChild(el("p", "section-note", "No updates yet."));
      section("Progress Updates", timeline);
    }
  }
})();
