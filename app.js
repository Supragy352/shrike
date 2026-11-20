(() => {
  const OWNER = "Supragy352";
  const REPO = "shrike";
  const TRACKER_ISSUE_NUMBER = 26;
  const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;
  const REFRESH_INTERVAL_MS = 60_000;

  const STORAGE_KEYS = {
    theme: "shrike_kanban_theme",
    token: "shrike_kanban_gh_token",
    localMoves: "shrike_kanban_local_moves",
    cache: "shrike_kanban_cache_v1",
  };

  const COLUMNS = [
    {
      id: "high",
      title: "High Priority",
      desc: "Navigation, Look & UX, and Workflow",
      color: "#f85149",
    },
    {
      id: "in-progress",
      title: "In Progress",
      desc: "Active work & open PRs",
      color: "#58a6ff",
    },
    {
      id: "backlog",
      title: "Backlog",
      desc: "Technical fixes & post-restructure additions",
      color: "#d29922",
    },
    {
      id: "discrepancies",
      title: "Hardware Discrepancies",
      desc: "Logged for Vicharak maintainer confirmation",
      color: "#bc8cff",
    },
    {
      id: "done",
      title: "Done",
      desc: "Closed issues",
      color: "#3fb950",
    },
  ];

  let state = {
    issues: [],
    prs: [],
    linkedPrsByIssue: new Map(),
    areaFilter: "all",
    priorityFilter: "all",
    searchQuery: "",
    sortBy: "number-asc",
    lastSyncedAt: null,
    activeIssueNumber: null,
    localMoves: loadJson(STORAGE_KEYS.localMoves, {}),
  };

  // DOM helpers
  const $ = (id) => document.getElementById(id);

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function getToken() {
    return (localStorage.getItem(STORAGE_KEYS.token) || "").trim();
  }

  function authHeaders() {
    const h = { Accept: "application/vnd.github+json" };
    const token = getToken();
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function labelStyle(hex) {
    const clean = (hex || "6e7681").replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16) || 110;
    const g = parseInt(clean.slice(2, 4), 16) || 118;
    const b = parseInt(clean.slice(4, 6), 16) || 129;
    return `background: rgba(${r}, ${g}, ${b}, 0.16); color: #${clean}; border-color: rgba(${r}, ${g}, ${b}, 0.42);`;
  }

  function lightLabelStyle(hex) {
    const clean = (hex || "6e7681").replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16) || 110;
    const g = parseInt(clean.slice(2, 4), 16) || 118;
    const b = parseInt(clean.slice(4, 6), 16) || 129;
    const dr = Math.round(r * 0.65);
    const dg = Math.round(g * 0.65);
    const db = Math.round(b * 0.65);
    return `background: rgba(${r}, ${g}, ${b}, 0.14); color: rgb(${dr}, ${dg}, ${db}); border-color: rgba(${r}, ${g}, ${b}, 0.4);`;
  }

  function formatLabelStyle(hex) {
    const theme = document.documentElement.getAttribute("data-theme");
    return theme === "light" ? lightLabelStyle(hex) : labelStyle(hex);
  }

  function parseTitlePrefix(title) {
    const m = title.match(/^(\[Discrepancy\]|[a-z]+(?:\([^)]+\))?:)\s*(.*)$/i);
    if (!m) return { prefix: "", text: title };
    return { prefix: m[1].replace(/:$/, ""), text: m[2] };
  }

  function parseChecklist(body) {
    const text = body || "";
    const done = (text.match(/^\s*-\s+\[[xX]\]/gm) || []).length;
    const todo = (text.match(/^\s*-\s+\[ \]/gm) || []).length;
    return { done, total: done + todo };
  }

  function relativeTime(iso) {
    if (!iso) return "";
    const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (diffSec < 60) return "just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  }

  function showToast(message, type = "info") {
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = message;
    $("toast-container").appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }

  function renderMarkdownLite(md) {
    if (!md) return "<p class='muted'>No description.</p>";
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    let html = "";
    let inUl = false;
    let inOl = false;

    const closeLists = () => {
      if (inUl) { html += "</ul>"; inUl = false; }
      if (inOl) { html += "</ol>"; inOl = false; }
    };

    const inline = (s) => {
      let out = escapeHtml(s);
      out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
      out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
      out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      out = out.replace(/(^|\s)#(\d+)\b/g, `$1<a href="https://github.com/${OWNER}/${REPO}/issues/$2" target="_blank" rel="noopener">#$2</a>`);
      return out;
    };

    for (const raw of lines) {
      const line = raw.trimEnd();
      if (!line.trim()) {
        closeLists();
        continue;
      }
      if (line.startsWith("### ")) {
        closeLists();
        html += `<h3>${inline(line.slice(4))}</h3>`;
      } else if (line.startsWith("## ")) {
        closeLists();
        html += `<h3>${inline(line.slice(3))}</h3>`;
      } else if (line.startsWith("> ")) {
        closeLists();
        html += `<blockquote>${inline(line.slice(2))}</blockquote>`;
      } else if (/^\s*-\s+\[[xX ]\]\s+/.test(line)) {
        if (inOl) { html += "</ol>"; inOl = false; }
        if (!inUl) { html += "<ul>"; inUl = true; }
        const checked = /^\s*-\s+\[[xX]\]/.test(line);
        const text = line.replace(/^\s*-\s+\[[xX ]\]\s+/, "");
        html += `<li style="list-style:none;margin-left:-14px">${checked ? "&#9745;" : "&#9744;"} ${inline(text)}</li>`;
      } else if (/^\s*[-*]\s+/.test(line)) {
        if (inOl) { html += "</ol>"; inOl = false; }
        if (!inUl) { html += "<ul>"; inUl = true; }
        html += `<li>${inline(line.replace(/^\s*[-*]\s+/, ""))}</li>`;
      } else if (/^\s*\d+\.\s+/.test(line)) {
        if (inUl) { html += "</ul>"; inUl = false; }
        if (!inOl) { html += "<ol>"; inOl = true; }
        html += `<li>${inline(line.replace(/^\s*\d+\.\s+/, ""))}</li>`;
      } else {
        closeLists();
        html += `<p>${inline(line)}</p>`;
      }
    }
    closeLists();
    return html;
  }

  function hasLabel(issue, name) {
    return (issue.labels || []).some((l) => l.name.toLowerCase() === name.toLowerCase());
  }

  function getColumnForIssue(issue) {
    // Local override only applies in read-only mode
    if (!getToken() && state.localMoves[issue.number]) {
      return state.localMoves[issue.number];
    }
    if (issue.state === "closed") return "done";
    if (hasLabel(issue, "hardware-discrepancy")) return "discrepancies";
    const linkedOpenPr = (state.linkedPrsByIssue.get(issue.number) || []).some((p) => p.state === "open");
    if (hasLabel(issue, "in-progress") || linkedOpenPr) return "in-progress";
    if (hasLabel(issue, "priority: high")) return "high";
    return "backlog";
  }

  function buildPrMap(prs) {
    const map = new Map();
    for (const pr of prs) {
      const text = `${pr.title || ""}\n${pr.body || ""}`;
      const refs = new Set();
      const regex = /(?:resolves|fixes|closes|part of|issue)?\s*#(\d+)/gi;
      let m;
      while ((m = regex.exec(text)) !== null) {
        const num = Number(m[1]);
        if (num && num !== TRACKER_ISSUE_NUMBER && num !== pr.number) {
          refs.add(num);
        }
      }
      for (const num of refs) {
        if (!map.has(num)) map.set(num, []);
        map.get(num).push(pr);
      }
    }
    return map;
  }

  async function fetchLive(silent = false) {
    const btn = $("btn-refresh");
    btn.classList.add("spin");
    if (!silent) setSyncState("syncing", "Syncing…");

    try {
      const res = await fetch(`${API_BASE}/issues?state=all&per_page=100`, {
        headers: authHeaders(),
        cache: "no-store",
      });

      const remaining = res.headers.get("X-RateLimit-Remaining");
      const limit = res.headers.get("X-RateLimit-Limit");
      if (remaining !== null && limit !== null) {
        $("rate-limit-info").textContent = `API limit: ${remaining}/${limit} remaining`;
      }

      if (!res.ok) {
        throw new Error(`GitHub API ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      applyData(data);
      localStorage.setItem(STORAGE_KEYS.cache, JSON.stringify({ fetchedAt: Date.now(), data }));
      state.lastSyncedAt = new Date();
      setSyncState("live", "Live");
      hideAlert();
    } catch (err) {
      const cached = loadJson(STORAGE_KEYS.cache, null);
      if (cached && Array.isArray(cached.data)) {
        applyData(cached.data);
        setSyncState("error", "Cached");
        showAlert(`Could not reach GitHub API (${err.message}). Showing cached snapshot from ${new Date(cached.fetchedAt).toLocaleTimeString()}. Connect a GitHub token to raise the rate limit.`);
      } else {
        setSyncState("error", "Offline");
        showAlert(`Failed to load issues from GitHub API (${err.message}).`);
      }
    } finally {
      btn.classList.remove("spin");
    }
  }

  function applyData(items) {
    const prs = items.filter((i) => Boolean(i.pull_request));
    const issues = items.filter((i) => !i.pull_request && i.number !== TRACKER_ISSUE_NUMBER && !hasLabel(i, "tracking"));
    state.prs = prs;
    state.issues = issues;
    state.linkedPrsByIssue = buildPrMap(prs);

    const openPrCount = prs.filter((p) => p.state === "open").length;
    $("pr-summary").innerHTML = `Fork PRs: <a href="https://github.com/${OWNER}/${REPO}/pulls" target="_blank" rel="noopener">${openPrCount} open / ${prs.length} total</a>`;

    renderBoard();
    updateProgress();
    updateLocalResetVisibility();
  }

  function setSyncState(mode, label) {
    const dot = $("status-dot");
    dot.className = "status-dot";
    if (mode === "live") dot.classList.add("live");
    if (mode === "error") dot.classList.add("error");
    $("sync-text").textContent = label;
  }

  function showAlert(msg) {
    const el = $("alert-banner");
    el.textContent = msg;
    el.hidden = false;
  }

  function hideAlert() {
    $("alert-banner").hidden = true;
  }

  function updateProgress() {
    const total = state.issues.length;
    const done = state.issues.filter((i) => getColumnForIssue(i) === "done").length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    $("progress-label").textContent = `${done} of ${total} issues done`;
    $("progress-pct").textContent = `${pct}%`;
    $("progress-fill").style.width = `${pct}%`;
  }

  function updateLocalResetVisibility() {
    const hasMoves = !getToken() && Object.keys(state.localMoves).length > 0;
    $("btn-reset-local").hidden = !hasMoves;
  }

  function filterAndSort(issues) {
    const q = state.searchQuery.trim().toLowerCase();
    return issues
      .filter((issue) => {
        if (state.areaFilter !== "all" && !hasLabel(issue, state.areaFilter)) return false;
        if (state.priorityFilter !== "all" && !hasLabel(issue, state.priorityFilter)) return false;
        if (q) {
          const numStr = `#${issue.number}`;
          const labelsStr = (issue.labels || []).map((l) => l.name).join(" ").toLowerCase();
          const hay = `${numStr} ${issue.number} ${issue.title} ${labelsStr}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (state.sortBy === "number-desc") return b.number - a.number;
        if (state.sortBy === "updated-desc") return new Date(b.updated_at) - new Date(a.updated_at);
        return a.number - b.number;
      });
  }

  function renderBoard() {
    const board = $("kanban-board");
    board.innerHTML = "";
    const filtered = filterAndSort(state.issues);

    for (const col of COLUMNS) {
      const colIssues = filtered.filter((i) => getColumnForIssue(i) === col.id);

      const section = document.createElement("section");
      section.className = "column";
      section.dataset.col = col.id;

      section.addEventListener("dragover", (e) => {
        e.preventDefault();
        section.classList.add("drag-over");
      });
      section.addEventListener("dragleave", (e) => {
        if (!section.contains(e.relatedTarget)) section.classList.remove("drag-over");
      });
      section.addEventListener("drop", (e) => {
        e.preventDefault();
        section.classList.remove("drag-over");
        const num = Number(e.dataTransfer.getData("text/plain"));
        if (num) moveIssueToColumn(num, col.id);
      });

      section.innerHTML = `
        <div class="column-header">
          <div class="column-title-group">
            <span class="col-dot" style="background:${col.color}"></span>
            <h2>${col.title}</h2>
          </div>
          <span class="col-count">${colIssues.length}</span>
        </div>
        <div class="col-desc">${col.desc}</div>
        <div class="column-body"></div>
      `;

      const body = section.querySelector(".column-body");
      if (colIssues.length === 0) {
        body.innerHTML = `<div class="empty-col">No matching issues</div>`;
      } else {
        for (const issue of colIssues) {
          body.appendChild(createCard(issue));
        }
      }
      board.appendChild(section);
    }
  }

  function createCard(issue) {
    const card = document.createElement("article");
    card.className = "card";
    card.draggable = true;
    card.dataset.number = issue.number;

    card.addEventListener("dragstart", (e) => {
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(issue.number));
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      openIssueModal(issue.number);
    });

    const { prefix, text } = parseTitlePrefix(issue.title);
    const checklist = parseChecklist(issue.body);
    const linkedPrs = state.linkedPrsByIssue.get(issue.number) || [];
    const isLocalOverride = !getToken() && Boolean(state.localMoves[issue.number]);

    const visibleLabels = (issue.labels || []).filter((l) => l.name !== "documentation");
    const labelsHtml = visibleLabels
      .map((l) => `<span class="label-pill" style="${formatLabelStyle(l.color)}">${escapeHtml(l.name)}</span>`)
      .join("");

    const prHtml = linkedPrs
      .map((pr) => {
        const merged = pr.pull_request && pr.pull_request.merged_at;
        const cls = merged ? "pr-pill merged" : "pr-pill";
        const label = merged ? `PR #${pr.number} merged` : `PR #${pr.number} ${pr.state}`;
        return `<a class="${cls}" href="${pr.html_url}" target="_blank" rel="noopener">${label}</a>`;
      })
      .join("");

    const taskHtml = checklist.total
      ? `<span class="task-mini">
           <span>${checklist.done}/${checklist.total}</span>
           <span class="task-bar"><span class="task-bar-fill" style="width:${Math.round((checklist.done / checklist.total) * 100)}%"></span></span>
         </span>`
      : `<span>${relativeTime(issue.updated_at)}</span>`;

    card.innerHTML = `
      <div class="card-top">
        <div class="card-num-wrap">
          <span class="card-num">#${issue.number}</span>
          ${prefix ? `<span class="card-prefix">${escapeHtml(prefix)}</span>` : ""}
        </div>
        ${isLocalOverride ? `<span class="local-tag" title="Local browser move (read-only mode)">Local</span>` : ""}
      </div>
      <p class="card-title">${escapeHtml(text)}</p>
      ${labelsHtml ? `<div class="card-labels">${labelsHtml}</div>` : ""}
      <div class="card-footer">
        ${taskHtml}
        <div>${prHtml || `<span class="mono">${issue.state}</span>`}</div>
      </div>
    `;
    return card;
  }

  async function moveIssueToColumn(issueNumber, targetCol) {
    const issue = state.issues.find((i) => i.number === issueNumber);
    if (!issue) return;
    const currentCol = getColumnForIssue(issue);
    if (currentCol === targetCol) return;

    const colTitle = COLUMNS.find((c) => c.id === targetCol)?.title || targetCol;
    const token = getToken();

    if (!token) {
      state.localMoves[issueNumber] = targetCol;
      localStorage.setItem(STORAGE_KEYS.localMoves, JSON.stringify(state.localMoves));
      renderBoard();
      updateProgress();
      updateLocalResetVisibility();
      showToast(`Moved #${issueNumber} → ${colTitle} (local preview — connect GitHub token to sync)`, "warn");
      return;
    }

    // Build live GitHub PATCH payload
    const labels = new Set((issue.labels || []).map((l) => l.name));
    let nextState = "open";

    labels.delete("in-progress");
    if (targetCol === "done") {
      nextState = "closed";
    } else if (targetCol === "in-progress") {
      labels.add("in-progress");
    } else if (targetCol === "high") {
      labels.delete("priority: medium");
      labels.delete("priority: low");
      labels.delete("hardware-discrepancy");
      labels.add("priority: high");
    } else if (targetCol === "backlog") {
      labels.delete("priority: high");
      labels.delete("hardware-discrepancy");
      if (!labels.has("priority: medium") && !labels.has("priority: low")) {
        labels.add("priority: medium");
      }
    } else if (targetCol === "discrepancies") {
      labels.add("hardware-discrepancy");
    }

    try {
      showToast(`Syncing #${issueNumber} → ${colTitle} on GitHub…`, "info");
      const res = await fetch(`${API_BASE}/issues/${issueNumber}`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ state: nextState, labels: Array.from(labels) }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }
      const updated = await res.json();
      const idx = state.issues.findIndex((i) => i.number === issueNumber);
      if (idx !== -1) state.issues[idx] = updated;
      renderBoard();
      updateProgress();
      showToast(`Updated #${issueNumber} → ${colTitle} on GitHub`, "success");
    } catch (err) {
      showToast(`GitHub sync failed: ${err.message}`, "error");
    }
  }

  // Modal: Issue details
  function openIssueModal(issueNumber) {
    const issue = state.issues.find((i) => i.number === issueNumber);
    if (!issue) return;
    state.activeIssueNumber = issueNumber;

    $("modal-number").textContent = `#${issue.number}`;
    const stateBadge = $("modal-state");
    stateBadge.textContent = issue.state;
    stateBadge.className = `state-badge ${issue.state}`;
    $("modal-title").textContent = issue.title;

    $("modal-labels").innerHTML = (issue.labels || [])
      .map((l) => `<span class="label-pill" style="${formatLabelStyle(l.color)}">${escapeHtml(l.name)}</span>`)
      .join("");

    $("modal-column-select").value = getColumnForIssue(issue);

    const linkedPrs = state.linkedPrsByIssue.get(issue.number) || [];
    const prsEl = $("modal-prs");
    if (linkedPrs.length) {
      prsEl.hidden = false;
      prsEl.innerHTML = `<strong>Linked PRs:</strong> ` + linkedPrs
        .map((pr) => `<a class="pr-pill" href="${pr.html_url}" target="_blank" rel="noopener">PR #${pr.number}: ${escapeHtml(pr.title)} (${pr.state})</a>`)
        .join(" ");
    } else {
      prsEl.hidden = true;
    }

    $("modal-body").innerHTML = renderMarkdownLite(issue.body);
    $("modal-timestamps").textContent = `Updated ${relativeTime(issue.updated_at)} · Opened ${new Date(issue.created_at).toLocaleDateString()}`;
    $("modal-github-link").href = issue.html_url;
    $("issue-modal").hidden = false;
  }

  function closeIssueModal() {
    $("issue-modal").hidden = true;
    state.activeIssueNumber = null;
  }

  // Modal: Token settings
  function updateTokenButton() {
    const connected = Boolean(getToken());
    const btn = $("btn-token");
    btn.classList.toggle("connected", connected);
    $("token-btn-label").textContent = connected ? "Live Sync On" : "Read-only";
  }

  function openTokenModal() {
    $("token-input").value = getToken();
    $("token-modal").hidden = false;
    setTimeout(() => $("token-input").focus(), 40);
  }

  function closeTokenModal() {
    $("token-modal").hidden = true;
  }

  // Theme
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    $("icon-sun").hidden = theme === "light";
    $("icon-moon").hidden = theme !== "light";
    renderBoard();
  }

  // Event wiring
  function init() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || "dark";
    applyTheme(savedTheme);
    updateTokenButton();

    $("btn-theme").addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme");
      applyTheme(cur === "dark" ? "light" : "dark");
    });

    $("btn-refresh").addEventListener("click", () => fetchLive(false));

    $("search-input").addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      renderBoard();
    });

    $("area-filters").addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      $("area-filters").querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      state.areaFilter = btn.dataset.area;
      renderBoard();
    });

    $("priority-filter").addEventListener("change", (e) => {
      state.priorityFilter = e.target.value;
      renderBoard();
    });

    $("sort-select").addEventListener("change", (e) => {
      state.sortBy = e.target.value;
      renderBoard();
    });

    $("btn-reset-local").addEventListener("click", () => {
      state.localMoves = {};
      localStorage.removeItem(STORAGE_KEYS.localMoves);
      renderBoard();
      updateProgress();
      updateLocalResetVisibility();
      showToast("Cleared local column overrides", "info");
    });

    $("modal-close").addEventListener("click", closeIssueModal);
    $("issue-modal").addEventListener("click", (e) => {
      if (e.target === $("issue-modal")) closeIssueModal();
    });
    $("modal-column-select").addEventListener("change", async (e) => {
      if (state.activeIssueNumber) {
        await moveIssueToColumn(state.activeIssueNumber, e.target.value);
        openIssueModal(state.activeIssueNumber);
      }
    });

    $("btn-token").addEventListener("click", openTokenModal);
    $("token-modal-close").addEventListener("click", closeTokenModal);
    $("btn-cancel-token").addEventListener("click", closeTokenModal);
    $("token-modal").addEventListener("click", (e) => {
      if (e.target === $("token-modal")) closeTokenModal();
    });
    $("btn-save-token").addEventListener("click", () => {
      const val = $("token-input").value.trim();
      if (val) {
        localStorage.setItem(STORAGE_KEYS.token, val);
        showToast("GitHub token saved locally — live write sync enabled", "success");
      } else {
        localStorage.removeItem(STORAGE_KEYS.token);
      }
      updateTokenButton();
      closeTokenModal();
      fetchLive(false);
    });
    $("btn-clear-token").addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEYS.token);
      $("token-input").value = "";
      updateTokenButton();
      closeTokenModal();
      showToast("Disconnected GitHub token (back to read-only mode)", "info");
      fetchLive(false);
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeIssueModal();
        closeTokenModal();
      } else if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        $("search-input").focus();
      } else if (e.key.toLowerCase() === "r" && !e.metaKey && !e.ctrlKey && document.activeElement.tagName !== "INPUT") {
        fetchLive(false);
      }
    });

    // Periodic sync time updater & auto-refresh
    setInterval(() => {
      if (state.lastSyncedAt && $("status-dot").classList.contains("live")) {
        $("sync-text").textContent = `Synced ${relativeTime(state.lastSyncedAt.toISOString())}`;
      }
    }, 15_000);

    setInterval(() => fetchLive(true), REFRESH_INTERVAL_MS);

    fetchLive(false);
  }

  init();
})();
