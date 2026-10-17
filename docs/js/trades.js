// Trading Hub: the forum, the "Open a Trading Page" form, and the manager approval queue.
// Needs site.js loaded first (for window.CrimsonUI).
(function () {
  const { el, prose, gallery, countLabel } = window.CrimsonUI;

  // SHA-256 of the manager password, so the password itself isn't in the page source.
  // This is still only a check in the visitor's browser: see README.md before relying on it.
  const MANAGER_HASH = "bd9d4f7154c2e86051c078b617c8f93bf8074c06c6d69e342915c7b90e3cb02d";
  const MAX_IMAGES = 4;
  const MAX_IMAGE_SIDE = 1280; // px; larger uploads are shrunk before saving

  // ---------- storage ----------
  // PREVIEW STORAGE: trades are kept in this browser's localStorage, so a submission is only
  // visible on the device it was made on. To make the forum shared, replace this object with
  // one backed by a database that has the same async methods (see README.md).
  const KEY = "crimsonTrades";
  const store = {
    preview: true,

    read() {
      try {
        const trades = JSON.parse(localStorage.getItem(KEY));
        return Array.isArray(trades) ? trades : [];
      } catch (e) {
        return [];
      }
    },

    write(trades) {
      localStorage.setItem(KEY, JSON.stringify(trades)); // throws QuotaExceededError when full
    },

    async list(status) {
      const sortKey = (t) => t.approvedAt || t.submittedAt || "";
      return this.read()
        .filter((t) => t.status === status)
        .sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
    },

    async get(id) {
      return this.read().find((t) => t.id === id) || null;
    },

    async submit(fields) {
      const trades = this.read();
      const trade = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        ...fields,
        status: "pending",
        submittedAt: new Date().toISOString()
      };
      trades.push(trade);
      this.write(trades);
      return trade;
    },

    async approve(id) {
      const trades = this.read();
      const trade = trades.find((t) => t.id === id);
      if (trade) {
        trade.status = "approved";
        trade.approvedAt = new Date().toISOString();
        this.write(trades);
      }
    },

    // Used for both "reject" (pending) and "remove from forum" (approved).
    async remove(id) {
      this.write(this.read().filter((t) => t.id !== id));
    }
  };

  // ---------- shared rendering ----------

  function formatDate(iso) {
    const d = new Date(iso);
    return isNaN(d) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  // Only show images we created (data URLs) or https links: never anything else from storage.
  function safeImages(trade) {
    return (Array.isArray(trade.images) ? trade.images : []).filter(
      (src) => typeof src === "string" && (src.startsWith("data:image/") || src.startsWith("https://"))
    );
  }

  function thumb(trade) {
    const src = safeImages(trade)[0];
    if (src) {
      const img = el("img", "trade-thumb");
      img.src = src;
      img.alt = "";
      img.loading = "lazy";
      return img;
    }
    const ph = el("div", "trade-thumb placeholder", (trade.title || "?").charAt(0).toUpperCase());
    ph.setAttribute("aria-hidden", "true");
    return ph;
  }

  // Forum list entry, styled like a Discord forum post: text on the left, thumbnail on the right.
  function tradeCard(trade, onOpen) {
    const card = el("button", "trade-card");
    card.type = "button";
    const body = el("span", "trade-card-body");
    body.append(
      el("span", "trade-title", trade.title),
      el("span", "trade-author", trade.name + " · @" + trade.discord),
      el("span", "trade-preview", trade.description),
      el("span", "trade-meta", [countLabel(safeImages(trade).length, "image"), formatDate(trade.approvedAt || trade.submittedAt)].filter(Boolean).join(" · "))
    );
    card.append(body, thumb(trade));
    card.addEventListener("click", onOpen);
    return card;
  }

  // Full post: used in the forum pop-up and on the manager review cards.
  function tradeDetail(trade, headingTag) {
    const wrap = el("div", "trade-detail");
    wrap.appendChild(el(headingTag, "trade-detail-title", trade.title));

    const who = el("p", "trade-seller");
    who.append(el("span", "", "Posted by " + trade.name + " · Discord: "), el("strong", "", "@" + trade.discord));

    const copy = el("button", "small-button", "Copy username");
    copy.type = "button";
    copy.addEventListener("click", () => {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(trade.discord).then(() => {
        copy.textContent = "Copied!";
        setTimeout(() => (copy.textContent = "Copy username"), 1500);
      });
    });
    who.appendChild(copy);

    const when = trade.status === "approved" ? "Posted " + formatDate(trade.approvedAt) : "Submitted " + formatDate(trade.submittedAt);
    wrap.append(who, el("p", "date", when), prose(trade.description), gallery(safeImages(trade).map((src) => ({ src }))));
    return wrap;
  }

  // Click on the dark area around a dialog closes it.
  function closeOnBackdrop(dialog) {
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
  }

  function previewNotice() {
    return el(
      "p",
      "notice",
      "Preview mode: trading pages are currently saved in this browser only, so other visitors and managers can't see them yet. This changes once the site is connected to a database."
    );
  }

  // Shrinks an uploaded image and returns it as a JPEG data URL.
  function shrinkImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#120407"; // background for transparent PNGs
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Unreadable image"));
      };
      img.src = url;
    });
  }

  // ---------- Trading Hub page: forum + submission form ----------

  const tradeList = document.getElementById("tradeList");
  if (tradeList) {
    if (store.preview) tradeList.before(previewNotice());

    const view = document.getElementById("tradeView");
    const viewBody = document.getElementById("tradeViewBody");
    closeOnBackdrop(view);
    view.addEventListener("close", () => {
      if (location.hash.startsWith("#trade-")) history.replaceState(null, "", location.pathname);
    });

    function openTrade(trade) {
      viewBody.replaceChildren(tradeDetail(trade, "h2"));
      view.showModal();
      history.replaceState(null, "", "#trade-" + trade.id);
    }

    async function renderForum() {
      const trades = await store.list("approved");
      tradeList.replaceChildren();
      if (!trades.length) {
        tradeList.appendChild(el("p", "empty-state", "No trades are open yet. Be the first: open a trading page above."));
      }
      trades.forEach((t) => tradeList.appendChild(tradeCard(t, () => openTrade(t))));
    }

    renderForum().then(async () => {
      // trading.html#trade-<id> links straight to a post.
      if (location.hash.startsWith("#trade-")) {
        const trade = await store.get(location.hash.slice(7));
        if (trade && trade.status === "approved") openTrade(trade);
      }
    });

    // --- "Open a Trading Page" form ---
    const formDialog = document.getElementById("tradeDialog");
    const form = document.getElementById("tradeForm");
    const done = document.getElementById("tradeDone");
    const fileInput = document.getElementById("tradeImages");
    const previews = document.getElementById("tradePreviews");
    const formError = document.getElementById("tradeError");
    const submitButton = form.querySelector('button[type="submit"]');
    let images = [];

    closeOnBackdrop(formDialog);
    if (store.preview) form.prepend(previewNotice());

    document.getElementById("openTradeForm").addEventListener("click", () => {
      form.hidden = false;
      done.hidden = true;
      formError.textContent = "";
      formDialog.showModal();
    });

    formDialog.querySelectorAll("[data-close]").forEach((button) =>
      button.addEventListener("click", () => formDialog.close())
    );

    function renderPreviews() {
      previews.replaceChildren(
        ...images.map((src, i) => {
          const item = el("div", "upload-preview");
          const img = el("img");
          img.src = src;
          img.alt = "Upload " + (i + 1);
          const remove = el("button", "upload-remove", "×");
          remove.type = "button";
          remove.setAttribute("aria-label", "Remove image " + (i + 1));
          remove.addEventListener("click", () => {
            images.splice(i, 1);
            renderPreviews();
          });
          item.append(img, remove);
          return item;
        })
      );
      fileInput.disabled = images.length >= MAX_IMAGES;
    }

    fileInput.addEventListener("change", async () => {
      const files = Array.from(fileInput.files);
      fileInput.value = "";
      formError.textContent = "";
      for (const file of files) {
        if (images.length >= MAX_IMAGES) {
          formError.textContent = "You can add up to " + MAX_IMAGES + " images.";
          break;
        }
        if (!file.type.startsWith("image/")) {
          formError.textContent = file.name + " isn't an image.";
          continue;
        }
        try {
          images.push(await shrinkImage(file));
        } catch (e) {
          formError.textContent = "Couldn't read " + file.name + ".";
        }
      }
      renderPreviews();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const value = (id) => document.getElementById(id).value.trim();
      const fields = {
        name: value("tradeName"),
        discord: value("tradeDiscord").replace(/^@/, ""),
        title: value("tradeTitle"),
        description: value("tradeDescription"),
        images: images.slice()
      };
      if (!fields.name || !fields.discord || !fields.title || !fields.description) {
        formError.textContent = "Please fill in every field (images are optional).";
        return;
      }

      submitButton.disabled = true;
      try {
        await store.submit(fields);
        form.reset();
        images = [];
        renderPreviews();
        form.hidden = true;
        done.hidden = false;
      } catch (err) {
        formError.textContent =
          err && err.name === "QuotaExceededError"
            ? "Those images are too large to save in preview mode. Try fewer or smaller images."
            : "Something went wrong sending your trading page. Please try again.";
      } finally {
        submitButton.disabled = false;
      }
    });
  }

  // ---------- Management page: login + approval queue ----------

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    const dashboard = document.getElementById("dashboard");
    const codeInput = document.getElementById("accessCode");
    const loginError = document.getElementById("loginError");
    const SESSION_KEY = "crimsonManager";

    function session(value) {
      try {
        if (value === undefined) return sessionStorage.getItem(SESSION_KEY) === "1";
        if (value) sessionStorage.setItem(SESSION_KEY, "1");
        else sessionStorage.removeItem(SESSION_KEY);
      } catch (e) {
        return false;
      }
    }

    async function sha256(text) {
      const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
    }

    function showDashboard(on) {
      loginForm.hidden = on;
      dashboard.hidden = !on;
      if (on) renderQueue();
    }

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      loginError.hidden = true;
      if (!window.crypto || !crypto.subtle) {
        loginError.textContent = "This browser can't check the access code here. Open the site over https.";
        loginError.hidden = false;
        return;
      }
      if ((await sha256(codeInput.value)) === MANAGER_HASH) {
        session(true);
        codeInput.value = "";
        showDashboard(true);
      } else {
        loginError.textContent = "Incorrect access code.";
        loginError.hidden = false;
        codeInput.select();
      }
    });

    document.getElementById("logoutButton").addEventListener("click", () => {
      session(false);
      showDashboard(false);
      codeInput.focus();
    });

    // Asks for a second click before doing something that can't be undone.
    function confirmButton(label, action) {
      const button = el("button", "small-button danger", label);
      button.type = "button";
      let armed = false;
      button.addEventListener("click", async () => {
        if (!armed) {
          armed = true;
          button.textContent = "Click again to confirm";
          setTimeout(() => {
            armed = false;
            button.textContent = label;
          }, 4000);
          return;
        }
        await action();
        renderQueue();
      });
      return button;
    }

    function reviewCard(trade, actions) {
      const card = el("article", "review-card");
      const bar = el("div", "review-actions");
      bar.append(...actions);
      card.append(tradeDetail(trade, "h3"), bar);
      return card;
    }

    async function renderQueue() {
      const pending = await store.list("pending");
      const live = await store.list("approved");

      document.getElementById("pendingCount").textContent = pending.length;
      document.getElementById("liveCount").textContent = live.length;

      const pendingList = document.getElementById("pendingList");
      pendingList.replaceChildren(
        ...pending.map((t) => {
          const approve = el("button", "button", "Approve");
          approve.type = "button";
          approve.addEventListener("click", async () => {
            await store.approve(t.id);
            renderQueue();
          });
          return reviewCard(t, [approve, confirmButton("Reject", () => store.remove(t.id))]);
        })
      );
      if (!pending.length) pendingList.appendChild(el("p", "empty-state", "Nothing waiting for approval."));

      const liveList = document.getElementById("liveList");
      liveList.replaceChildren(
        ...live.map((t) => reviewCard(t, [confirmButton("Remove from forum", () => store.remove(t.id))]))
      );
      if (!live.length) liveList.appendChild(el("p", "empty-state", "No trades are live on the forum."));
    }

    if (store.preview) dashboard.prepend(previewNotice());
    showDashboard(session());
  }
})();
